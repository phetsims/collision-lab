// Copyright 2019-2020, University of Colorado Boulder

/**
 * The numerical display for the total kinetic energy.
 *
 * @author Brandon Li
 * @author Martin Veillette
 */

import Range from '../../../../dot/js/Range.js';
import merge from '../../../../phet-core/js/merge.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
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

      valuePattern: collisionLabStrings.kineticEnergyJ,
      maxWidth: 300, // constrain width for i18n, determined empirically.
      displayRange: new Range( 0, 10 ) // Range for determining width, determined empirically.

    }, options );

    super( totalKineticEnergyProperty, kineticEnergyVisibleProperty, options );
  }
}

collisionLab.register( 'KineticEnergyNumberDisplay', KineticEnergyNumberDisplay );
export default KineticEnergyNumberDisplay;