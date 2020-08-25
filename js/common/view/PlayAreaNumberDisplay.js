// Copyright 2020, University of Colorado Boulder

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
import merge from '../../../../phet-core/js/merge.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import NumberDisplay from '../../../../scenery-phet/js/NumberDisplay.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Color from '../../../../scenery/js/util/Color.js';
import PaintDef from '../../../../scenery/js/util/PaintDef.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabConstants from '../CollisionLabConstants.js';

class PlayAreaNumberDisplay extends NumberDisplay {

  /**
   * @param {Property.<number>} numberProperty
   * @param {Property.<boolean<} visibleProperty
   * @param {Object} [options]
   */
  constructor( numberProperty, visibleProperty, options ) {
    assert && AssertUtils.assertPropertyOf( numberProperty, 'number' );
    assert && AssertUtils.assertPropertyOf( visibleProperty, 'boolean' );

    //----------------------------------------------------------------------------------------

    options = merge( {

      // {Range} - display range for the NumberDisplay, for determining the width.
      displayRange: new Range( 0, 9 ),

      // {null|Property.<boolean>} - optional visibility property, which toggles the visibility of this Node.
      visibleProperty: null,

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

    // Set the background opacity of the NumberDisplay.
    assert && assert( !options.backgroundFill, 'PlayAreaNumberDisplay sets backgroundFill.' );
    options.backgroundFill = PaintDef.toColor( options.backgroundBaseFill ).setAlpha( options.backgroundOpacity );

    //----------------------------------------------------------------------------------------

    super( numberProperty, options.displayRange, options );

    // Observe when the visibleProperty changes to update the visibility of this Node.
    // Link is never unlinked since PlayAreaNumberDisplays are never disposed.
    visibleProperty.linkAttribute( this, 'visible' );
  }
}

collisionLab.register( 'PlayAreaNumberDisplay', PlayAreaNumberDisplay );
export default PlayAreaNumberDisplay;