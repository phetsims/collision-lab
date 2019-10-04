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
  const ObservableArray = require( 'AXON/ObservableArray' );
  const PlayArea = require( 'COLLISION_LAB/common/model/PlayArea' );
  const Tandem = require( 'TANDEM/Tandem' );
  const CollisionLabConstants = require( 'COLLISION_LAB/common/CollisionLabConstants' );

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

      // @public
      this.playArea = new PlayArea( this.balls );

      // @public
      this.playProperty = new BooleanProperty( true );
    }

    /**
     * Resets the model
     * @public
     */
    reset() {
      this.playArea.reset();
      this.playProperty.reset();
    }

    /**
     * Steps the model forward in time
     * @public
     * @param {number} dt
     */
    step( dt ) {

      assert && assert( typeof dt === 'number', `invalid dt: ${dt}` );

      if ( this.playProperty.value ) {
        this.playArea.step( dt, false );
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