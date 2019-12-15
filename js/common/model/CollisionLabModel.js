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
  const DerivedProperty = require( 'AXON/DerivedProperty' );
  const ObservableArray = require( 'AXON/ObservableArray' );
  const PlayArea = require( 'COLLISION_LAB/common/model/PlayArea' );
  const Tandem = require( 'TANDEM/Tandem' );
  const TimeClock = require( 'COLLISION_LAB/common/model/TimeClock' );

  class CollisionLabModel {

    /**
     * @param {Tandem} tandem
     */
    constructor( tandem ) {


      assert && assert( tandem instanceof Tandem, `invalid tandem: ${tandem}` );

      // @public {ObservableArray.<Ball>}
      this.balls = new ObservableArray();

      // @public - is the any of the balls in the play areas are user controlled
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


      // @public - is the any of the balls in the play areas not user controlled
      this.playAreaFreeProperty = new DerivedProperty( [this.playAreaUserControlledProperty],
        playAreaIsUserControlled => !playAreaIsUserControlled );

      this.balls.addItemAddedListener( addItemAddedBallListener );

      // @public - controls the play/pause state of the play area
      this.playProperty = new BooleanProperty( true );

      // @public - controls the speed rate of the simulation: slow/normal
      this.isSlowMotionProperty = new BooleanProperty( false );

      // @public - timeClock for the simulation
      this.timeClock = new TimeClock( this.isSlowMotionProperty );

      // @public - handle the playArea (ballistic motion and collision of balls)
      this.playArea = new PlayArea( this.balls );

      // add a time stepping function to the timeClock
      this.timeClock.addTimeStepper( ( dt, time, isReversing ) => this.playArea.step( dt, time, isReversing ) );
    }

    /**
     * Resets the model
     * @public
     */
    reset() {
      this.playProperty.reset();
      this.isSlowMotionProperty.reset();
      this.playArea.reset();
      this.timeClock.reset();
    }

    /**
     * Steps the model forward in time
     * @public
     * @param {number} dt
     */
    step( dt ) {

      assert && assert( typeof dt === 'number', `invalid dt: ${dt}` );

      if ( this.playProperty.value && this.playAreaFreeProperty.value ) {
        this.timeClock.playStep( dt * this.timeClock.speedFactorProperty.value );
      }
    }

  }


  return collisionLab.register( 'CollisionLabModel', CollisionLabModel );
} );