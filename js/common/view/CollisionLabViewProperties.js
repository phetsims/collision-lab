// Copyright 2019-2020, University of Colorado Boulder

/**
 * Properties that are only used within the view hierarchy of the 'Collision Lab' simulation.
 *
 * @author Martin Veillette
 * @author Brandon Li
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import collisionLab from '../../collisionLab.js';

class CollisionLabViewProperties {

  constructor() {

    // @public {Property.<boolean>} - indicates if the velocity vectors of Balls are visible.
    this.velocityVectorVisibleProperty = new BooleanProperty( true );

    // @public {Property.<boolean>} - indicates if the momentum vectors of Balls are visible.
    this.momentumVectorVisibleProperty = new BooleanProperty( false );

    // @public {Property.<boolean>} - indicates if the Ball 'values' NumberDisplays that appear next to Balls are visible.
    this.valuesVisibleProperty = new BooleanProperty( false );

    // @public {Property.<boolean>} - indicates if the Kinetic Energy NumberDisplay is visible.
    this.kineticEnergyVisibleProperty = new BooleanProperty( false );

    // @public {Property.<boolean>} - indicates if the 'More Data' in the BallValuesPanel is visible.
    this.moreDataVisibleProperty = new BooleanProperty( false );
  }

  /**
   * Resets the CollisionLabViewProperties.
   * @public
   *
   * Called when the reset-all button is pressed.
   */
  reset() {
    this.velocityVectorVisibleProperty.reset();
    this.momentumVectorVisibleProperty.reset();
    this.valuesVisibleProperty.reset();
    this.kineticEnergyVisibleProperty.reset();
    this.moreDataVisibleProperty.reset();
  }
}

collisionLab.register( 'CollisionLabViewProperties', CollisionLabViewProperties );
export default CollisionLabViewProperties;