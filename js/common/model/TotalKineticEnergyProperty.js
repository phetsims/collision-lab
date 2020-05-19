// Copyright 2019-2020, University of Colorado Boulder

/**
 * A NumberProperty sub-type that indicates the total kinetic energy of a system of Balls, in J.
 *
 * TotalKineticEnergyProperty is created at the start of the sim and is never disposed, so no dispose method
 * is necessary.
 *
 * @author Martin Veillette
 * @author Brandon Li
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import ObservableArray from '../../../../axon/js/ObservableArray.js';
import collisionLab from '../../collisionLab.js';
import Ball from './Ball.js';

class TotalKineticEnergyProperty extends NumberProperty {

  /**
   * @param {ObservableArray.<Ball>} balls
   */
  constructor( balls ) {
    assert && assert( balls instanceof ObservableArray && balls.count( ball => ball instanceof Ball ) === balls.length, `invalid balls: ${balls}` );

    // Set the initial value of the TotalKineticEnergyProperty to zero. To be updated later.
    super( 0, {
      isValidValue: value => value >= 0 // Energy is always positive or zero.
    } );

    // @private {ObservableArray.<Ball>} - reference the balls that were passed in.
    this.balls = balls;

    //----------------------------------------------------------------------------------------

    // Observe when Balls are added to the system. Never unlinked since the TotalKineticEnergyProperty is never disposed
    balls.addItemAddedListener( addedBall => {

      // Update the value of this Property when the addedBall's kineticEnergy changes. Link is removed when the Ball is
      // removed from the system.
      const kineticEnergyListener = () => { this.value = this.computeTotalBallKineticEnergy(); };
      addedBall.kineticEnergyProperty.link( kineticEnergyListener );

      // Observe when the ball is removed to unlink listeners.
      const removeBallListener = removedBall => {
        if ( removedBall === addedBall ) {

          // Recompute the total kinetic energy now that there is one less Ball in the system.
          this.value = this.computeTotalBallKineticEnergy();

          // Unlink the listener attached to the removedBall.
          removedBall.kineticEnergyProperty.unlink( kineticEnergyListener );

          balls.removeItemRemovedListener( removeBallListener );
        }
      };
      balls.addItemRemovedListener( removeBallListener );
    } );
  }

  /**
   * Computes the kinetic energy of the Balls in the system.
   * @private
   *
   * @returns {number} - in J.
   */
  computeTotalBallKineticEnergy() {
    let totalKineticEnergy = 0;

    this.balls.forEach( ball => {
      totalKineticEnergy += ball.kineticEnergy;
    } );
    return totalKineticEnergy;
  }
}

collisionLab.register( 'TotalKineticEnergyProperty', TotalKineticEnergyProperty );
export default TotalKineticEnergyProperty;