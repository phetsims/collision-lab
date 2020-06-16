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
 * For the 'Collision Lab' sim, BallValuesPanelNumberDisplays are instantiated at the start and are never disposed.
 * See BallValuesPanelColumnNode for more background.
 *
 * @author Brandon Li
 */

import Range from '../../../../dot/js/Range.js';
import merge from '../../../../phet-core/js/merge.js';
import NumberDisplay from '../../../../scenery-phet/js/NumberDisplay.js';
import PhetColorScheme from '../../../../scenery-phet/js/PhetColorScheme.js';
import FireListener from '../../../../scenery/js/listeners/FireListener.js';
import collisionLab from '../../collisionLab.js';
import collisionLabStrings from '../../collisionLabStrings.js';
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

    options = merge( {
      align: 'center',
      textOptions: {
        font: CollisionLabConstants.DISPLAY_FONT
      },
      backgroundStroke: canEdit ? 'black' : null,
      backgroundFill: canEdit ? 'white' : null,
      cursor: canEdit ? 'pointer' : null,
      backgroundLineWidth: 0.5,
      yMargin: 3,
      xMargin: 10,
      decimalPlaces: CollisionLabConstants.DISPLAY_DECIMAL_PLACES
    }, options );

    //----------------------------------------------------------------------------------------

    let ballProperty; // The Ball Property to edit and/or display.

    if ( columnType === BallValuesPanelColumnTypes.MASS ) { ballProperty = ball.massProperty; }
    else if ( columnType === BallValuesPanelColumnTypes.X_POSITION ) { ballProperty = ball.xPositionProperty; }
    else if ( columnType === BallValuesPanelColumnTypes.Y_POSITION ) { ballProperty = ball.yPositionProperty; }
    else if ( columnType === BallValuesPanelColumnTypes.X_VELOCITY ) { ballProperty = ball.xVelocityProperty; }
    else if ( columnType === BallValuesPanelColumnTypes.Y_VELOCITY ) { ballProperty = ball.yVelocityProperty; }
    else if ( columnType === BallValuesPanelColumnTypes.X_MOMENTUM ) { ballProperty = ball.xMomentumProperty; }
    else if ( columnType === BallValuesPanelColumnTypes.Y_MOMENTUM ) { ballProperty = ball.yMomentumProperty; }

    super( ballProperty, DISPLAY_RANGE, options );

    //----------------------------------------------------------------------------------------

    if ( canEdit ) {

      // Get the userControlledProperty that is associated with the columnType.
      let userControlledProperty;

      if ( columnType === BallValuesPanelColumnTypes.MASS ) { userControlledProperty = ball.massUserControlledProperty; }
      else if ( columnType === BallValuesPanelColumnTypes.X_POSITION ) { userControlledProperty = ball.xPositionUserControlledProperty; }
      else if ( columnType === BallValuesPanelColumnTypes.Y_POSITION ) { userControlledProperty = ball.yPositionUserControlledProperty; }
      else if ( columnType === BallValuesPanelColumnTypes.X_VELOCITY ) { userControlledProperty = ball.xVelocityUserControlledProperty; }
      else if ( columnType === BallValuesPanelColumnTypes.Y_VELOCITY ) { userControlledProperty = ball.yVelocityUserControlledProperty; }

      // Observe when the user is controlling the ball value that is associated with the column type and adjust the
      // background fill. Link is never disposed since BallValuesPanelNumberDisplays are never disposed.
      userControlledProperty.link( userControlled => {
        this.backgroundFill = userControlled ? PhetColorScheme.BUTTON_YELLOW : options.backgroundFill;
      } );

      // Observe when the user presses the NumberDisplay and open the KeypadDialog to allow the user to edit the
      // ballProperty. Listener is never removed since BallValuesPanelNumberDisplays are never disposed.
      this.addInputListener( new FireListener( {
        fire: () => {

          let editRange; // The editing range of the Ball Property.
          let unit; // The unit of the Ball Property that is being modified.

          if ( columnType === BallValuesPanelColumnTypes.MASS ) {
            editRange = CollisionLabConstants.MASS_RANGE;
            unit = collisionLabStrings.units.kilogram;
          }
          else if ( columnType === BallValuesPanelColumnTypes.X_POSITION ) {
            editRange = BallUtils.getKeypadXPositionRange( ball );
            unit = collisionLabStrings.units.meters;
          }
          else if ( columnType === BallValuesPanelColumnTypes.Y_POSITION ) {
            editRange = BallUtils.getKeypadYPositionRange( ball );
            unit = collisionLabStrings.units.meters;
          }
          else if ( columnType === BallValuesPanelColumnTypes.X_VELOCITY ) {
            editRange = CollisionLabConstants.VELOCITY_RANGE;
            unit = collisionLabStrings.units.metersPerSecond;
          }
          else if ( columnType === BallValuesPanelColumnTypes.Y_VELOCITY ) {
            editRange = CollisionLabConstants.VELOCITY_RANGE;
            unit = collisionLabStrings.units.metersPerSecond;
          }

          // Indicate that the Ball is currently being user controlled.
          userControlledProperty.value = true;

          keypadDialog.beginEdit( ballProperty, editRange, unit, () => {
            ballSystem.bumpBallAwayFromOtherBalls( ball );
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