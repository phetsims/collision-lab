// Copyright 2019-2020, University of Colorado Boulder

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
import collisionLabStrings from '../../collisionLabStrings.js';
import PlayAreaNumberDisplay from './PlayAreaNumberDisplay.js';

class KineticEnergyNumberDisplay extends PlayAreaNumberDisplay {

  /**
   * @param {Property.<number>} totalKineticEnergyProperty
   * @param {Property.<boolean>} kineticEnergyVisibleProperty
   */
  constructor( totalKineticEnergyProperty, kineticEnergyVisibleProperty, options ) {
    assert && AssertUtils.assertPropertyOf( totalKineticEnergyProperty, 'number' );
    assert && AssertUtils.assertPropertyOf( kineticEnergyVisibleProperty, 'boolean' );

    options = merge( {

      valuePattern: StringUtils.fillIn( collisionLabStrings.pattern.labelEqualsValueUnits, {
        label: collisionLabStrings.kineticEnergy,
        units: collisionLabStrings.units.joules
      } ),
      maxWidth: 300 // constrain width for i18n, determined empirically.

    }, options );

    super( totalKineticEnergyProperty, kineticEnergyVisibleProperty, options );
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