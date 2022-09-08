// Copyright 2019-2022, University of Colorado Boulder

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
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import StopwatchNode from '../../../../scenery-phet/js/StopwatchNode.js';
import { Color } from '../../../../scenery/js/imports.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabStrings from '../../CollisionLabStrings.js';
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
      displayRange: new Range( 0, 1000 ),

      // super-class options
      yMargin: 6,
      xMargin: 6,
      backgroundStroke: Color.BLACK,
      valuePattern: StringUtils.fillIn( CollisionLabStrings.pattern.valueSpaceUnits, {
        units: CollisionLabStrings.units.seconds
      } ),
      textOptions: {
        maxWidth: 70, // constrain width for i18n, determined empirically

        // Avoid jitter in the ElapsedTimeNumberDisplay, see https://github.com/phetsims/collision-lab/issues/140.
        font: new PhetFont( {
          family: StopwatchNode.NUMBER_FONT_FAMILY,
          size: CollisionLabConstants.DISPLAY_FONT.size
        } )
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