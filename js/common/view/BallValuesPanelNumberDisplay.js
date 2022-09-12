// Copyright 2020-2022, University of Colorado Boulder

/**
 * BallValuesPanelNumberDisplay is a subclass of NumberDisplay for displaying a value that is associated with a Ball.
 * Instances appear in the BallValuesPanel.
 *
 * Adds the following functionality to NumberDisplay:
 *   - Displays a single component of a Ball Vector (i.e. x-position | x-velocity ... ) of a single Ball. Each
 *     BallValuesPanelNumberDisplay is associated with a BallValuesPanelColumnNode.
 *
 *   - If BallValuesPanelColumnTypes is X_MOMENTUM or Y_MOMENTUM, it solely displays the Ball Property.
 *     Otherwise the Ball Property is editable, meaning when the NumberDisplay is pressed, the KeypadDialog is opened,
 *     allowing the user to edit the value of the Ball quantity.
 *
 *   - If the user is controlling the associated BallProperty, a highlight is added to the NumberDisplay. See
 *     https://github.com/phetsims/collision-lab/issues/95.
 *
 * For the 'Collision Lab' sim, BallValuesPanelNumberDisplays are instantiated at the start and are never disposed.
 * See BallValuesPanelColumnNode for more background.
 *
 * @author Brandon Li
 */

import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import merge from '../../../../phet-core/js/merge.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import NumberDisplay from '../../../../scenery-phet/js/NumberDisplay.js';
import { Color, FireListener } from '../../../../scenery/js/imports.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabStrings from '../../CollisionLabStrings.js';
import CollisionLabColors from '../CollisionLabColors.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import Ball from '../model/Ball.js';
import BallSystem from '../model/BallSystem.js';
import BallValuesPanelColumnTypes from './BallValuesPanelColumnTypes.js';
import KeypadDialog from '../../../../scenery-phet/js/keypad/KeypadDialog.js';

// constants
const DISPLAY_RANGE = new Range( -10, 10 ); // Display range for the NumberDisplay (used to determine width).

class BallValuesPanelNumberDisplay extends NumberDisplay {

  /**
   * @param {Ball} ball - the Ball model
   * @param {BallValuesPanelColumnTypes} columnType - the type of column that this NumberDisplay appears in.
   * @param {ballSystem} ballSystem
   * @param {KeypadDialog} keypadDialog
   * @param {Object} [options]
   */
  constructor( ball, columnType, ballSystem, keypadDialog, options ) {
    assert && assert( ball instanceof Ball, `invalid Ball: ${ball}` );
    assert && assert( ballSystem instanceof BallSystem, `invalid ballSystem: ${ballSystem}` );
    assert && assert( keypadDialog instanceof KeypadDialog, `invalid keypadDialog: ${keypadDialog}` );
    assert && assert( BallValuesPanelColumnTypes.includes( columnType )
    && columnType !== BallValuesPanelColumnTypes.BALL_ICONS
    && columnType !== BallValuesPanelColumnTypes.MASS_SLIDERS, `invalid columnType: ${columnType}` );

    // Indicates if the Ball Property can be edited.
    const canEdit = columnType.editConfig !== null;

    // Gets the property of the Ball that is associated with the BallValuesPanelColumnType.
    const ballProperty = columnType.createDisplayProperty( ball );

    options = merge( {
      align: 'center',
      textOptions: {
        font: CollisionLabConstants.DISPLAY_FONT
      },
      backgroundStroke: canEdit ? Color.BLACK : null,
      backgroundFill: canEdit ? Color.WHITE : null,
      cursor: canEdit ? 'pointer' : null,
      backgroundLineWidth: 0.5,
      yMargin: 3,
      xMargin: 10,
      decimalPlaces: CollisionLabConstants.DISPLAY_DECIMAL_PLACES
    }, options );

    const decimalPlaces = options.decimalPlaces;
    options = _.omit( options, [ 'decimalPlaces' ] );
    options.numberFormatter = value => {
      let numberString = Utils.toFixed( value, decimalPlaces );

      const absValue = Math.abs( value );
      // For non-position columns, show approximates, see https://github.com/phetsims/collision-lab/issues/182
      if ( columnType !== BallValuesPanelColumnTypes.X_POSITION &&
           columnType !== BallValuesPanelColumnTypes.Y_POSITION &&
           absValue > 1e-9 &&
           absValue < 0.005 ) {
        numberString = StringUtils.fillIn( CollisionLabStrings.approximatePattern, {
          value: '0.00'
        } );
      }

      return numberString;
    };

    super( ballProperty, DISPLAY_RANGE, options );

    //----------------------------------------------------------------------------------------

    if ( canEdit ) {

      // Get the Property that indicates if the user is controlling the associated BallProperty.
      const userControlledProperty = columnType.editConfig.getUserControlledProperty( ball );

      // Observe when the user is controlling the associated BallProperty and a highlight to the NumberDisplay. See
      // https://github.com/phetsims/collision-lab/issues/95. Link is never disposed since BallValuesPanelNumberDisplays
      // are never disposed.
      userControlledProperty.link( userControlled => {
        this.backgroundFill = userControlled ? CollisionLabColors.HIGHLIGHTED_NUMBER_DISPLAY_FILL :
                              options.backgroundFill;
      } );

      // Get the unit displayed when the user is editing the BallProperty.
      const unit = columnType.editConfig.editingUnit;
      const editValue = value => columnType.editConfig.editValue( ball, value );

      // Observe when the user presses the NumberDisplay and open the KeypadDialog to allow the user to edit the
      // ballProperty. Listener is never removed since BallValuesPanelNumberDisplays are never disposed.
      this.addInputListener( new FireListener( {
        fire: () => {

          // Indicate that the BallProperty is currently being user controlled.
          userControlledProperty.value = true;

          // Get the editing Range of the BallProperty. Must be recomputed every time the KeypadDialog is opened.
          const editingRange = columnType.editConfig.getEditingRange( ball );

          keypadDialog.beginEdit( editValue, editingRange, new PatternStringProperty( CollisionLabStrings.pattern.rangeStringProperty, {
            units: unit || ''
          } ), () => {

            // When the user is finished editing the BallProperty, bump the Ball away from the other Balls that it is
            // overlapping with. See https://github.com/phetsims/collision-lab/issues/100.
            ballSystem.bumpBallAwayFromOthers( ball );

            // Now indicate that the user is finished editing this BallProperty.
            userControlledProperty.value = false;
          } );
        },
        fireOnDown: true
      } ) );
    }
  }
}

collisionLab.register( 'BallValuesPanelNumberDisplay', BallValuesPanelNumberDisplay );
export default BallValuesPanelNumberDisplay;