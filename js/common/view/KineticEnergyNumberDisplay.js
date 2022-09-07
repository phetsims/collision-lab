// Copyright 2019-2022, University of Colorado Boulder

/**
 * KineticEnergyNumberDisplay is a subclass of PlayAreaNumberDisplay for displaying the total kinetic energy of a
 * BallSystem. Instances are positioned just inside the bottom-right corner of the PlayArea and appears on all
 * Screens.
 *
 * KineticEnergyNumberDisplays are created at the start of the sim and are never disposed, so no dispose method is
 * necessary.
 *
 * @author Brandon Li
 * @author Martin Veillette
 */

import merge from '../../../../phet-core/js/merge.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabStrings from '../../CollisionLabStrings.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import PlayAreaNumberDisplay from './PlayAreaNumberDisplay.js';

class KineticEnergyNumberDisplay extends PlayAreaNumberDisplay {

  /**
   * @param {ReadOnlyProperty.<number>} totalKineticEnergyProperty
   * @param {Object} [options]
   */
  constructor( totalKineticEnergyProperty, options ) {
    assert && AssertUtils.assertAbstractPropertyOf( totalKineticEnergyProperty, 'number' );

    options = merge( {

      valuePattern: StringUtils.fillIn( CollisionLabStrings.pattern.labelEqualsValueSpaceUnits, {
        label: CollisionLabStrings.kineticEnergy,
        units: CollisionLabStrings.units.joules
      } ),
      textOptions: {
        font: CollisionLabConstants.DISPLAY_FONT
      },
      maxWidth: 300 // constrain width for i18n, determined empirically.

    }, options );

    super( totalKineticEnergyProperty, options );
  }

  /**
   * @public
   * @override
   */
  dispose() {
    assert && assert( false, 'KineticEnergyNumberDisplay is not intended to be disposed' );
  }
}

collisionLab.register( 'KineticEnergyNumberDisplay', KineticEnergyNumberDisplay );
export default KineticEnergyNumberDisplay;