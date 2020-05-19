// Copyright 2019-2020, University of Colorado Boulder

/**
 * Determine the total kinetic energy of the system
 *
 * @author Martin Veillette
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import collisionLab from '../../collisionLab.js';

class TotalKineticEnergyProperty extends NumberProperty {
  /**
   *
   * @param {ObservableArray.<Ball>} balls
   */
  constructor( balls ) {

    // set the initial value of the kineticEnergyProperty to zero
    super( 0 );

    // define a function to update the total kinetic energy
    const updateKineticEnergySum = () => {

      // @public (read-only) assign the kinetic energy sum to this.value
      this.value = balls.reduce( 0, ( accumulator, ball ) => {
        return accumulator + ball.kineticEnergy;
      } );
    };

    const addItemAddedBallListener = addedBall => {

      // update the kinetic energy sum
      addedBall.kineticEnergyProperty.link( updateKineticEnergySum );

      // Observe when the ball is removed to unlink listeners
      const removeBallListener = removedBall => {

        // update the kinetic energy sum upon the removal of one ball
        updateKineticEnergySum();

        if ( removedBall === addedBall ) {

          // unlink the listener attached to the removedBall.
          removedBall.kineticEnergyProperty.unlink( updateKineticEnergySum );

          balls.removeItemRemovedListener( removeBallListener );
        }
      };
      balls.addItemRemovedListener( removeBallListener );
    };

    balls.addItemAddedListener( addItemAddedBallListener );
  }
}

collisionLab.register( 'TotalKineticEnergyProperty', TotalKineticEnergyProperty );
export default TotalKineticEnergyProperty;