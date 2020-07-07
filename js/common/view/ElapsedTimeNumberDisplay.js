// Copyright 2019-2020, University of Colorado Boulder

/**
 * ElapsedTimeNumberDisplay is a subclass of NumberDisplay for displaying the total elapsed time of the sim.
 * Instances are positioned just outside the PlayArea on the bottom-left side and appears on all Screens.
 *
 * ElapsedTimeNumberDisplays are created at the start of the sim and are never disposed, so no dispose method is
 * necessary.
 *
 * @author Brandon Li
 * @author Martin Veillette
 */

import Range from '../../../../dot/js/Range.js';
import merge from '../../../../phet-core/js/merge.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import NumberDisplay from '../../../../scenery-phet/js/NumberDisplay.js';
import Color from '../../../../scenery/js/util/Color.js';
import collisionLab from '../../collisionLab.js';
import collisionLabStrings from '../../collisionLabStrings.js';
import CollisionLabConstants from '../CollisionLabConstants.js';

class ElapsedTimeNumberDisplay extends NumberDisplay {

  /**
   * @param {Property.<number>} elapsedTimeProperty
   * @param {Object} [options]
   */
  constructor( elapsedTimeProperty, options ) {
    assert && AssertUtils.assertPropertyOf( elapsedTimeProperty, 'number' );

    options = merge( {

      // {Range} - Display range for the NumberDisplay (used to determine width).
      displayRange: new Range( 0, 100 ),

      // super-class options
      yMargin: 6,
      xMargin: 6,
      backgroundStroke: Color.BLACK,
      valuePattern: StringUtils.fillIn( collisionLabStrings.pattern.valueUnits, {
        units: collisionLabStrings.units.seconds
      } ),
      textOptions: {
        font: CollisionLabConstants.DISPLAY_FONT,
        maxWidth: 100 // constrain width for i18n, determined empirically
      },
      decimalPlaces: CollisionLabConstants.DISPLAY_DECIMAL_PLACES

    }, options );

    super( elapsedTimeProperty, options.displayRange, options );
  }

  /**
   * @public
   * @override
   */
  dispose() {
    assert && assert( false, 'ElapsedTimeNumberDisplay is not intended to be disposed' );
  }
}

collisionLab.register( 'ElapsedTimeNumberDisplay', ElapsedTimeNumberDisplay );
export default ElapsedTimeNumberDisplay;