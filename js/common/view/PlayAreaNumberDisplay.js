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
import collisionLab from '../../collisionLab.js';
import CollisionLabColors from '../CollisionLabColors.js';
import CollisionLabConstants from '../CollisionLabConstants.js';

class PlayAreaNumberDisplay extends NumberDisplay {

  /**
   * @param {Property.<number>} numberProperty
   * @param {Object} [options]
   */
  constructor( numberProperty, options ) {
    assert && AssertUtils.assertPropertyOf( numberProperty, 'number' );
    assert && assert( !options || Object.getPrototypeOf( options ) === Object.prototype, `invalid options: ${options}` );

    //----------------------------------------------------------------------------------------

    options = merge( {

      // {Range} - display range for the NumberDisplay, for determining the width.
      displayRange: new Range( 0, 999 ),

      // superclass options
      align: 'left',
      backgroundFill: CollisionLabColors.PLAY_AREA_NUMBER_DISPLAY_FILL,
      backgroundLineWidth: 0,
      decimalPlaces: CollisionLabConstants.DISPLAY_DECIMAL_PLACES,
      textOptions: {
        font: CollisionLabConstants.DISPLAY_FONT
      }
    }, options );

    super( numberProperty, options.displayRange, options );
  }
}

collisionLab.register( 'PlayAreaNumberDisplay', PlayAreaNumberDisplay );
export default PlayAreaNumberDisplay;