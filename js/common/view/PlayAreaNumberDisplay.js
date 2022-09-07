// Copyright 2020-2022, University of Colorado Boulder

/**
 * PlayAreaNumberDisplay is a subclass of NumberDisplay for displaying a numeric value for objects and values that
 * appear within the PlayArea.
 *
 * Examples include:
 *   - Kinetic Energy.
 *   - Ball speeds and momentums.
 *   - The center of mass speed.
 *
 * Contains a distinct semi-opaque background appearance. All places with instances are never disposed, so currently
 * PlayAreaNumberDisplays are never disposed.
 *
 * @author Brandon Li
 */

import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import merge from '../../../../phet-core/js/merge.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import NumberDisplay from '../../../../scenery-phet/js/NumberDisplay.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Color, PaintDef } from '../../../../scenery/js/imports.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabStrings from '../../CollisionLabStrings.js';
import CollisionLabConstants from '../CollisionLabConstants.js';

class PlayAreaNumberDisplay extends NumberDisplay {

  /**
   * @param {ReadOnlyProperty.<number>} numberProperty
   * @param {Object} [options]
   */
  constructor( numberProperty, options ) {
    assert && AssertUtils.assertAbstractPropertyOf( numberProperty, 'number' );

    //----------------------------------------------------------------------------------------

    options = merge( {

      // {Range} - display range for the NumberDisplay, for determining the width.
      displayRange: new Range( 0, 9 ),

      // {number} - the opacity (alpha) of the background of the NumberDisplay.
      backgroundOpacity: 0.6,

      // {PaintDef} - the base color of the background of the NumberDisplay.
      backgroundBaseFill: Color.WHITE,

      // superclass options
      align: 'center',
      backgroundLineWidth: 0,
      maxWidth: 150,
      decimalPlaces: CollisionLabConstants.DISPLAY_DECIMAL_PLACES,
      textOptions: {
        font: new PhetFont( 14 )
      }
    }, options );

    const valuePattern = options.valuePattern;
    const decimalPlaces = options.decimalPlaces;
    options = _.omit( options, [ 'valuePattern', 'decimalPlaces' ] );
    options.numberFormatter = value => {
      let numberString = Utils.toFixed( value, decimalPlaces );

      const absValue = Math.abs( value );
      // For non-position columns, show approximates, see https://github.com/phetsims/collision-lab/issues/182
      if ( absValue > 1e-9 &&
           absValue < 0.005 ) {
        numberString = StringUtils.fillIn( CollisionLabStrings.approximatePattern, {
          value: '0.00'
        } );
      }

      return StringUtils.fillIn( valuePattern, {
        value: numberString
      } );
    };

    // Set the background opacity of the NumberDisplay.
    assert && assert( !options.backgroundFill, 'PlayAreaNumberDisplay sets backgroundFill.' );
    options.backgroundFill = PaintDef.toColor( options.backgroundBaseFill ).setAlpha( options.backgroundOpacity );

    //----------------------------------------------------------------------------------------

    super( numberProperty, options.displayRange, options );
  }
}

collisionLab.register( 'PlayAreaNumberDisplay', PlayAreaNumberDisplay );
export default PlayAreaNumberDisplay;