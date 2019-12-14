// Copyright 2019, University of Colorado Boulder

/**
 * Common Model for collision lab
 * @author Martin Veillette
 */
define( require => {
  'use strict';

  // modules
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const collisionLab = require( 'COLLISION_LAB/collisionLab' );
  const CollisionLabConstants = require( 'COLLISION_LAB/common/CollisionLabConstants' );
  const ObservableArray = require( 'AXON/ObservableArray' );
  const PlayArea = require( 'COLLISION_LAB/common/model/PlayArea' );
  const Tandem = require( 'TANDEM/Tandem' );

  // constants
  const STEP_DURATION = CollisionLabConstants.STEP_DURATION;

  class CollisionLabModel {

    /**
     * @param {Tandem} tandem
     */
    constructor( tandem ) {


      assert && assert( tandem instanceof Tandem, `invalid tandem: ${tandem}` );

      // @public {ObservableArray.<Ball>}
      this.balls = new ObservableArray();

      // @private - is the any of the balls in the play areas are user controlled
      this.playAreaUserControlledProperty = new BooleanProperty( false );

      const addItemAddedBallListener = ( addedBall, balls ) => {

        // determine if any of the balls are userControlled
        const isUserControlledFunction = () => {
          this.playAreaUserControlledProperty.value = balls.some( ball => ball.isUserControlledProperty.value );
        };
        addedBall.isUserControlledProperty.link( isUserControlledFunction );

        // Observe when the ball is removed to unlink listeners
        const removeBallListener = removedBall => {
          if ( removedBall === addedBall ) {
            addedBall.isUserControlledProperty.unlink( isUserControlledFunction );
            balls.removeItemRemovedListener( removeBallListener );
          }
        };
        balls.addItemRemovedListener( removeBallListener );
      };

      this.balls.addItemAddedListener( addItemAddedBallListener );

      // @public
      this.playArea = new PlayArea( this.balls );

      // @public - controls the play/pause state of the play area
      this.playProperty = new BooleanProperty( true );

      // @public - controls the speed rate of the simulation: slow/normal
      this.isSlowMotionProperty = new BooleanProperty( false );


      this.isSlowMotionProperty.link( isSlowMotion => {

        // @private {number} determine the speedFactor of the simulation based on the status of isSlowMotion
        this.speedFactor = isSlowMotion ?
                           CollisionLabConstants.SLOW_SPEED_SCALE : CollisionLabConstants.NORMAL_SPEED_SCALE;
      } );

    }

    /**
     * Resets the model
     * @public
     */
    reset() {
      this.playArea.reset();
      this.playProperty.reset();
      this.isSlowMotionProperty.reset();
    }

    /**
     * Steps the model forward in time
     * @public
     * @param {number} dt
     */
    step( dt ) {

      assert && assert( typeof dt === 'number', `invalid dt: ${dt}` );

      if ( this.playProperty.value && !this.playAreaUserControlledProperty.value ) {
        this.playArea.step( dt * this.speedFactor, false );
      }
    }

    /**
     * Goes one time step back
     * @public
     */
    stepBackward() {
      this.playProperty.value = false;
      this.playArea.step( STEP_DURATION, true );
    }

    /**
     * Goes one time step forward
     * @public
     */
    stepForward() {
      this.playProperty.value = false;
      this.playArea.step( STEP_DURATION, false );
    }
  }


  return collisionLab.register( 'CollisionLabModel', CollisionLabModel );
} );