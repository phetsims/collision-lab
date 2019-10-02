// Copyright 2019, University of Colorado Boulder

/**
 * PlayArea is the model for the PlayArea of different Ball objects, intended to be sub-classed.
 *
 * PlayAreas are responsible for:
 *   - Keeping track of the number of Balls in the PlayArea.
 *   - Keeping track of the total kinetic energy of all the Balls in the PlayArea.
 *   - Stepping each Ball at each step call.
 *   - Elasticity of all Balls in the PlayArea.
 *   - Keep track of center of mass position and velocity
 *
 * @author Brandon Li
 */

define( require => {
  'use strict';

  // modules
  const Ball = require( 'COLLISION_LAB/common/model/Ball' );
  const collisionLab = require( 'COLLISION_LAB/collisionLab' );
  const NumberProperty = require( 'AXON/NumberProperty' );
  const ObservableArray = require( 'AXON/ObservableArray' );

  class PlayArea {

    constructor( balls ) {

      assert && assert( balls instanceof ObservableArray
      && balls.count( ball => ball instanceof Ball ) === balls.length , `invalid balls: ${balls}` );


      this.kineticEnergyProperty = new NumberProperty( 0 );
      this.balls = balls;
    }

    /**
     * Resets the model
     * @public
     */
    reset() {
      this.kineticEnergyProperty.reset();
    }

    /**
     *
     * @param {number} dt
     */
    step( dt ) {

      assert && assert( typeof dt === 'number', `invalid dt: ${dt}` );
      //TODO
    }

    /**
     * Updates the total kinetic energy of the system
     * @public
     */
    updateKineticEnergy() {
      this.kineticEnergyProperty.value = this.balls.reduce( ( accumulator, ball ) => {
        return accumulator + ball.kineticEnergy;
      } );
    }
  }

  return collisionLab.register( 'PlayArea', PlayArea );
} );