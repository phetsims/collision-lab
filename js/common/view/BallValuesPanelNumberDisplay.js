// Copyright 2020, University of Colorado Boulder

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

import Range from '../../../../dot/js/Range.js';
import merge from '../../../../phet-core/js/merge.js';
import NumberDisplay from '../../../../scenery-phet/js/NumberDisplay.js';
import FireListener from '../../../../scenery/js/listeners/FireListener.js';
import Color from '../../../../scenery/js/util/Color.js';
import collisionLab from '../../collisionLab.js';
import collisionLabStrings from '../../collisionLabStrings.js';
import CollisionLabColors from '../CollisionLabColors.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import Ball from '../model/Ball.js';
import BallSystem from '../model/BallSystem.js';
import BallUtils from '../model/BallUtils.js';
import BallValuesPanelColumnTypes from './BallValuesPanelColumnTypes.js';
import KeypadDialog from './KeypadDialog.js';

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
    const canEdit = columnType !== BallValuesPanelColumnTypes.X_MOMENTUM &&
                    columnType !== BallValuesPanelColumnTypes.Y_MOMENTUM;

    // Gets the property of the Ball that is associated with the BallValuesPanelColumnType.
    const ballProperty = BallValuesPanelNumberDisplay.getBallProperty( ball, columnType );

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

    super( ballProperty, DISPLAY_RANGE, options );

    //----------------------------------------------------------------------------------------

    if ( canEdit ) {

      // Get the Property that indicates if the user is controlling the associated BallProperty.
      const userControlledProperty = BallValuesPanelNumberDisplay.getUserControlledProperty( ball, columnType );

      // Observe when the user is controlling the associated BallProperty and a highlight to the NumberDisplay. See
      // https://github.com/phetsims/collision-lab/issues/95. Link is never disposed since BallValuesPanelNumberDisplays
      // are never disposed.
      userControlledProperty.link( userControlled => {
        this.backgroundFill = userControlled ? CollisionLabColors.HIGHLIGHTED_NUMBER_DISPLAY_FILL :
                                               options.backgroundFill;
      } );

      // Get the unit displayed when the user is editing the BallProperty.
      const unit = BallValuesPanelNumberDisplay.getEditingUnit( columnType );

      // Observe when the user presses the NumberDisplay and open the KeypadDialog to allow the user to edit the
      // ballProperty. Listener is never removed since BallValuesPanelNumberDisplays are never disposed.
      this.addInputListener( new FireListener( {
        fire: () => {

          // Indicate that the BallProperty is currently being user controlled.
          userControlledProperty.value = true;

          // Get the editing Range of the BallProperty. Must be recomputed every time the KeypadDialog is opened.
          const editingRange = BallValuesPanelNumberDisplay.getEditingRange( ball, columnType );

          keypadDialog.beginEdit( ballProperty, editingRange, unit, () => {

            // When the user is finished editing the BallProperty, bump the Ball away from the other Balls that it is
            // overlapping with. See https://github.com/phetsims/collision-lab/issues/100.
            ballSystem.bumpBallAwayFromOtherBalls( ball );

            // Now indicate that the user is finished editing this BallProperty.
            userControlledProperty.value = false;
          } );
        },
        fireOnDown: true
      } ) );
    }
  }

  /**
   * Gets the property of a Ball that is associated with a BallValuesPanelColumnType.
   * @private
   *
   * @param {Ball} ball
   * @param {BallValuesPanelColumnTypes} columnType
   * @returns {Property.<number>}
   */
  static getBallProperty( ball, columnType ) {
    assert && assert( ball instanceof Ball, `invalid Ball: ${ball}` );
    assert && assert( BallValuesPanelColumnTypes.includes( columnType ), `invalid columnType: ${columnType}` );

    if ( columnType === BallValuesPanelColumnTypes.MASS ) { return ball.massProperty; }
    else if ( columnType === BallValuesPanelColumnTypes.X_POSITION ) { return ball.xPositionProperty; }
    else if ( columnType === BallValuesPanelColumnTypes.Y_POSITION ) { return ball.yPositionProperty; }
    else if ( columnType === BallValuesPanelColumnTypes.X_VELOCITY ) { return ball.xVelocityProperty; }
    else if ( columnType === BallValuesPanelColumnTypes.Y_VELOCITY ) { return ball.yVelocityProperty; }
    else if ( columnType === BallValuesPanelColumnTypes.X_MOMENTUM ) { return ball.xMomentumProperty; }
    else if ( columnType === BallValuesPanelColumnTypes.Y_MOMENTUM ) { return ball.yMomentumProperty; }
    else { assert && assert( false, `invalid columnType: ${columnType}` ); }
  }

  /**
   * Gets the property of a Ball that indicates if the user is controlling the associated BallProperty.
   * @private
   *
   * @param {Ball} ball
   * @param {BallValuesPanelColumnTypes} columnType
   * @returns {Property.<number>}
   */
  static getUserControlledProperty( ball, columnType ) {
    assert && assert( ball instanceof Ball, `invalid Ball: ${ball}` );
    assert && assert( BallValuesPanelColumnTypes.includes( columnType ), `invalid columnType: ${columnType}` );

    if ( columnType === BallValuesPanelColumnTypes.MASS ) { return ball.massUserControlledProperty; }
    else if ( columnType === BallValuesPanelColumnTypes.X_POSITION ) { return ball.xPositionUserControlledProperty; }
    else if ( columnType === BallValuesPanelColumnTypes.Y_POSITION ) { return ball.yPositionUserControlledProperty; }
    else if ( columnType === BallValuesPanelColumnTypes.X_VELOCITY ) { return ball.xVelocityUserControlledProperty; }
    else if ( columnType === BallValuesPanelColumnTypes.Y_VELOCITY ) { return ball.yVelocityUserControlledProperty; }
    else { assert && assert( false, `invalid columnType: ${columnType}` ); }
  }

  /**
   * Gets the unit of a associated BallProperty of a BallValuesPanelColumnType, used when the user is editing the
   * BallProperty.
   * @private
   *
   * @param {BallValuesPanelColumnTypes} columnType
   * @returns {string}
   */
  static getEditingUnit( columnType ) {
    assert && assert( BallValuesPanelColumnTypes.includes( columnType ), `invalid columnType: ${columnType}` );

    if ( columnType === BallValuesPanelColumnTypes.MASS ) { return collisionLabStrings.units.kilograms; }
    else if ( columnType === BallValuesPanelColumnTypes.X_POSITION ) { return collisionLabStrings.units.meters; }
    else if ( columnType === BallValuesPanelColumnTypes.Y_POSITION ) { return collisionLabStrings.units.meters; }
    else if ( columnType === BallValuesPanelColumnTypes.X_VELOCITY ) { return collisionLabStrings.units.metersPerSecond; }
    else if ( columnType === BallValuesPanelColumnTypes.Y_VELOCITY ) { return collisionLabStrings.units.metersPerSecond; }
    else { assert && assert( false, `invalid columnType: ${columnType}` ); }
  }

  /**
   * Gets the range of a associated BallProperty of a BallValuesPanelColumnType, used when the user is editing the
   * BallProperty.
   * @private
   *
   * @param {Ball} ball
   * @param {BallValuesPanelColumnTypes} columnType
   * @returns {Range}
   */
  static getEditingRange( ball, columnType ) {
    assert && assert( ball instanceof Ball, `invalid Ball: ${ball}` );
    assert && assert( BallValuesPanelColumnTypes.includes( columnType ), `invalid columnType: ${columnType}` );

    if ( columnType === BallValuesPanelColumnTypes.MASS ) { return CollisionLabConstants.MASS_RANGE; }
    else if ( columnType === BallValuesPanelColumnTypes.X_POSITION ) { return BallUtils.getKeypadXPositionRange( ball ); }
    else if ( columnType === BallValuesPanelColumnTypes.Y_POSITION ) { return BallUtils.getKeypadYPositionRange( ball ); }
    else if ( columnType === BallValuesPanelColumnTypes.X_VELOCITY ) { return CollisionLabConstants.VELOCITY_RANGE; }
    else if ( columnType === BallValuesPanelColumnTypes.Y_VELOCITY ) { return CollisionLabConstants.VELOCITY_RANGE; }
    else { assert && assert( false, `invalid columnType: ${columnType}` ); }
  }
}

collisionLab.register( 'BallValuesPanelNumberDisplay', BallValuesPanelNumberDisplay );
export default BallValuesPanelNumberDisplay;