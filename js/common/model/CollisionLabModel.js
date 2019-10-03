// Copyright 2019, University of Colorado Boulder

/**
 * Common Model for collision lab
 * @author Martin Veillette
 */
define( require => {
  'use strict';

  // modules
  const collisionLab = require( 'COLLISION_LAB/collisionLab' );
  const PlayArea = require( 'COLLISION_LAB/common/model/PlayArea' );
  const ObservableArray = require( 'AXON/ObservableArray' );
  const Tandem = require( 'TANDEM/Tandem' );


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

    }

    /**
     * Resets the model
     * @public
     */
    reset() {
      this.playArea.reset();
    }

    /**
     * Steps the model forward in time
     * @public
     * @param {number} dt
     */
    step( dt ) {

      assert && assert( typeof dt === 'number', `invalid dt: ${dt}` );

      this.playArea.step( dt );

    }


  }

  return collisionLab.register( 'CollisionLabModel', CollisionLabModel );
} );