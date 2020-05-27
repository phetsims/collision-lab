// Copyright 2019-2020, University of Colorado Boulder

/**
 * A NumberProperty sub-type that indicates the total kinetic energy of a system of Balls, in J.
 *
 * TotalKineticEnergyProperty is created at the start of the sim and is never disposed, so no dispose method
 * is necessary.
 *
 * @author Brandon Li
 * @author Martin Veillette
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

    // Register the Balls that are already in the system.
    balls.forEach( this.registerAddedBall.bind( this ) );

    // Observe when Balls are added to the system and register the added Ball. Link is never disposed as
    // TotalKineticEnergyProperty is never disposed.
    balls.addItemAddedListener( this.registerAddedBall.bind( this ) );
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

  /**
   * Registers a new Ball by adding the appropriate links to update the TotalKineticEnergyProperty. This is generally
   * invoked when Balls are added to the system, meaning the total kinetic energy has changed. Will also ensure that
   * links are removed if the Ball is removed from the play-area system.
   * @private
   *
   * @param {Ball} ball
   */
  registerAddedBall( ball ) {
    assert && assert( ball instanceof Ball, `invalid ball: ${ball}` );

    // Update the value of the kinetic energy when the ball's kineticEnergy changes. Link is removed when the Ball is
    // removed from the system.
    const kineticEnergyListener = () => {
      this.value = this.computeTotalBallKineticEnergy();
    };

    ball.kineticEnergyProperty.link( kineticEnergyListener );

    // Observe when the ball is removed to unlink listeners.
    const removeBallListener = removedBall => {
      if ( ball === removedBall ) {

        // Recompute the total kinetic energy now that there is one less Ball in the system.
        this.value = this.computeTotalBallKineticEnergy();

        // Unlink the listener attached to the removedBall.
        removedBall.kineticEnergyProperty.unlink( kineticEnergyListener );

        // Remove the removeBallListener.
        this.balls.removeItemRemovedListener( removeBallListener );
      }
    };
    this.balls.addItemRemovedListener( removeBallListener );
  }
}

collisionLab.register( 'TotalKineticEnergyProperty', TotalKineticEnergyProperty );
export default TotalKineticEnergyProperty;