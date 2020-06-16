// Copyright 2020, University of Colorado Boulder

/**
 * BallValuesPanelNumberDisplay is a subclass of NumberDisplay for displaying a value that is associated with a Ball.
 * Instances appear in the BallValuesPanel.
 *
 * Displays a single component of a Ball Vector (i.e. x-position | x-velocity ... ) of a single Ball that is currently
 * in the specified PlayArea.
 *
 * 'Is a' relationship with NumberDisplay but adds the following functionality:
 *    - If BallValuesPanelColumnTypes is X_MOMENTUM or Y_MOMENTUM, it solely displays the Ball Property,
 *
 *    - Otherwise the Ball Property is editable, meaning when the NumberDisplay is pressed, the KeypadLayer is fired,
 *      allowing the user to edit the value of the Ball quantity.
 *
 * The BallValuesPanelNumberDisplay should be disposed if the Ball is removed from the PlayArea.
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
import BallUtils from '../model/BallUtils.js';
import BallValuesPanelColumnTypes from './BallValuesPanelColumnTypes.js';
import KeypadDialog from './KeypadDialog.js';

// constants
const DISPLAY_RANGE = new Range( -10, 10 ); // Display range for the NumberDisplay (used to determine width).

class BallValuesPanelNumberDisplay extends NumberDisplay {

  /**
   * @param {Ball} ball - the Ball model
   * @param {BallValuesPanelColumnTypes} columnType - the Ball Quantity to display
   * @param {KeypadDialog} keypadDialog
   * @param {Object} [options]
   */
  constructor( ball, columnType, ballSystem, keypadDialog, options ) {
    assert && assert( ball instanceof Ball, `invalid Ball: ${ball}` );
    assert && assert( BallValuesPanelColumnTypes.includes( columnType ), `invalid columnType: ${columnType}` );
    assert && assert( keypadDialog instanceof KeypadDialog, `invalid keypadDialog: ${keypadDialog}` );
    assert && assert( !options || Object.getPrototypeOf( options ) === Object.prototype, `invalid options: ${options}` );

    // Indicates if the Ball Property can be edited.
    const canEdit = columnType !== BallValuesPanelColumnTypes.X_MOMENTUM && columnType !== BallValuesPanelColumnTypes.Y_MOMENTUM;

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

    let fireListener; // reference to a FireListener if there is one.

    if ( canEdit ) {
      let userControlledProperty;

      if ( columnType === BallValuesPanelColumnTypes.MASS ) {
        userControlledProperty = ball.massUserControlledProperty;
      }
      else if ( columnType === BallValuesPanelColumnTypes.X_POSITION ) {
        userControlledProperty = ball.xPositionUserControlledProperty;
      }
      else if ( columnType === BallValuesPanelColumnTypes.Y_POSITION ) {
        userControlledProperty = ball.yPositionUserControlledProperty;
      }
      else if ( columnType === BallValuesPanelColumnTypes.X_VELOCITY ) {
        userControlledProperty = ball.xVelocityUserControlledProperty;
      }
      else if ( columnType === BallValuesPanelColumnTypes.Y_VELOCITY ) {
        userControlledProperty = ball.yVelocityUserControlledProperty;
      }

      userControlledProperty.link( userControlled => {
        this.backgroundFill = userControlled ? PhetColorScheme.BUTTON_YELLOW : options.backgroundFill;
      } );

      // Create a FireListener that listens to presses and to fire the keypadDialog to allow the user to edit the
      // ballProperty. Null if canEdit is false. Disposed in the dispose() method.
      fireListener = new FireListener( {
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
      } );

      this.addInputListener( fireListener );
    }

    //----------------------------------------------------------------------------------------

    // @private {function} - function that removes listeners. This is called in the dispose() method.
    this.disposeBallValuesPanelNumberDisplay = () => {
      if ( this.hasInputListener( fireListener ) ) {
        this.removeInputListener( fireListener );
      }
    };
  }

  /**
   * Disposes the BallValuesPanelNumberDisplay, releasing all links that it maintained.
   * @public
   * @override
   *
   * Called when the Ball is removed from the PlayArea.
   */
  dispose() {
    this.disposeBallValuesPanelNumberDisplay();
    super.dispose();
  }
}

// @public {BallValuesPanelColumnTypes} - possible quantities to display and/or allow the user to edit.
BallValuesPanelNumberDisplay.BallValuesPanelColumnTypes = BallValuesPanelColumnTypes;

collisionLab.register( 'BallValuesPanelNumberDisplay', BallValuesPanelNumberDisplay );
export default BallValuesPanelNumberDisplay;