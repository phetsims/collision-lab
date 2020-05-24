// Copyright 2019-2020, University of Colorado Boulder

/**
 *  numerical display for the total kinetic energy
 *
 * @author Martin Veillette
 */

import Range from '../../../../dot/js/Range.js';
import merge from '../../../../phet-core/js/merge.js';
import NumberDisplay from '../../../../scenery-phet/js/NumberDisplay.js';
import collisionLab from '../../collisionLab.js';
import collisionLabStrings from '../../collisionLabStrings.js';
import CollisionLabColors from '../CollisionLabColors.js';
import CollisionLabConstants from '../CollisionLabConstants.js';

// constant
const SUM_RANGE = new Range( 0, 10 ); // range for the kinetic energy values

const kineticEnergyJString = collisionLabStrings.kineticEnergyJ;

class KineticEnergyNumberDisplay extends NumberDisplay {

  /**
   * @param {Property.<number>} totalKineticEnergyProperty
   * @param {Property.<boolean>} visibleProperty
   */
  constructor( totalKineticEnergyProperty, visibleProperty, options ) {

    super( totalKineticEnergyProperty,
      SUM_RANGE,
      merge( {}, CollisionLabColors.KINETIC_ENERGY_DISPLAY_COLORS, {
        align: 'left',
        backgroundLineWidth: 0,
        valuePattern: kineticEnergyJString,
        maxWidth: 300, // determined empirically,
        textOptions: {
          font: CollisionLabConstants.DISPLAY_FONT
        },
        decimalPlaces: CollisionLabConstants.NUMBER_DISPLAY_DECIMAL_PLACES
      }, options ) );

    // link visibility of this display to the visibleProperty
    // present for the lifetime of the simulation
    visibleProperty.linkAttribute( this, 'visible' );

  }
}

collisionLab.register( 'KineticEnergyNumberDisplay', KineticEnergyNumberDisplay );
export default KineticEnergyNumberDisplay;