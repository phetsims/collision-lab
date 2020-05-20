// Copyright 2020, University of Colorado Boulder

/**
 * BallValuesNumberDisplay is a subclass of NumberDisplay for displaying a value that is associated with a Ball.
 * Instances appear in the BallValuesPanel.
 *
 * Displays a single component of a Ball Vector (i.e. x-position | x-velocity ... ) of a single  Ball that is currently
 * in the specified PlayArea.
 *
 * 'Is a' relationship with NumberDisplay but adds the following functionality:
 *    - If and only if the Ball Property is editable, when the NumberDisplay is pressed, the KeypadLayer is fired,
 *      allowing the user to edit the value of the Ball quantity. Otherwise, it solely displays the Ball Property.
 *
 * This BallValuesNumberDisplay should be disposed if the Ball is removed from the PlayArea.
 *
 * @author Brandon Li
 */

import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import merge from '../../../../phet-core/js/merge.js';
import NumberDisplay from '../../../../scenery-phet/js/NumberDisplay.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabConstants from '../CollisionLabConstants.js';

// constants
const DISPLAY_RANGE = new Range( -10, 10 ); // Display range for the NumberDisplay (used to determine width)

class BallValuesNumberDisplay extends NumberDisplay {

  /**
   * @param {Property.<number>} ballProperty
   * @param {boolean} canEdit - indicates if the user can press the NumberDisplay and edit the ballProperty
   * @param {Object} [options]
   */
  constructor( ballProperty, canEdit, options ) {
    assert && assert( ballProperty instanceof Property && typeof ballProperty.value === 'number', `invalid ballProperty: ${ballProperty}` );
    assert && assert( typeof canEdit === 'boolean', `invalid canEdit: ${canEdit}` );
    assert && assert( !options || Object.getPrototypeOf( options ) === Object.prototype, `invalid options: ${options}` );

    options = merge( {
      align: 'center',
      textOptions: {
        font: CollisionLabConstants.DISPLAY_FONT
      },
      backgroundStroke: canEdit ? 'black' : null,
      backgroundFill: canEdit ? 'white' : null,
      decimalPlaces: CollisionLabConstants.NUMBER_DISPLAY_DECIMAL_PLACES
    } );

    super( ballProperty, DISPLAY_RANGE, options );

    //----------------------------------------------------------------------------------------
  }
}

collisionLab.register( 'BallValuesNumberDisplay', BallValuesNumberDisplay );
export default BallValuesNumberDisplay;