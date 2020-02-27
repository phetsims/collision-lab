// Copyright 2019, University of Colorado Boulder

/**
 *  numerical display for time elapsed
 *
 * @author Martin Veillette
 */

import Range from '../../../../dot/js/Range.js';
import merge from '../../../../phet-core/js/merge.js';
import NumberDisplay from '../../../../scenery-phet/js/NumberDisplay.js';
import collisionLabStrings from '../../collision-lab-strings.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabColors from '../CollisionLabColors.js';
import CollisionLabConstants from '../CollisionLabConstants.js';

// constant
const TIME_RANGE = new Range( 0, 999 ); // range for the time to determine size of display box

const sString = collisionLabStrings.s;

class TimeDisplay extends NumberDisplay {

  /**
   * @param {Property.<number>} timeProperty
   */
  constructor( timeProperty ) {

    super( timeProperty,
      TIME_RANGE,
      merge( CollisionLabColors.TIME_DISPLAY_COLORS, {
        valuePattern: sString,
        maxWidth: 100, // determined empirically,
        font: CollisionLabConstants.CHECKBOX_FONT,
        decimalPlaces: 2
      } ) );

  }
}

collisionLab.register( 'TimeDisplay', TimeDisplay );
export default TimeDisplay;