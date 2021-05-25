// Copyright 2020-2021, University of Colorado Boulder

/**
 * KeypadDialog is a Dialog sub-type that handles the creation and management of a Keypad for the 'collision lab'
 * simulation. It is present on all screens.
 *
 * The KeypadDialog is shown when requested through the beginEdit() method, which occurs when the user presses on a
 * BallValuesPanelNumberDisplay, to allow the user to manipulate a Ball Property. Edits must be within a specified
 * range. There will be a 'Enter' button to allow the user to submit a edit, and edits are canceled if the user hides
 * the Dialog.
 *
 * KeypadDialog is created at the start of the sim and is never disposed, so no dispose method is necessary and
 * internal links are left as-is.
 *
 * @author Brandon Li
 */

import Range from '../../../../dot/js/Range.js';
import merge from '../../../../phet-core/js/merge.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import Keypad from '../../../../scenery-phet/js/keypad/Keypad.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import VBox from '../../../../scenery/js/nodes/VBox.js';
import Color from '../../../../scenery/js/util/Color.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import Dialog from '../../../../sun/js/Dialog.js';
import collisionLab from '../../collisionLab.js';
import collisionLabStrings from '../../collisionLabStrings.js';
import CollisionLabColors from '../CollisionLabColors.js';
import CollisionLabConstants from '../CollisionLabConstants.js';

class KeypadDialog extends Dialog {

  /**
   * @param {Object} [options]
   */
  constructor( options ) {


    options = merge( {

      // {Font} - font used for all Text instances within the Dialog.
      font: new PhetFont( 15 ),

      valueBoxWidth: 85,  // {number} - width of the value field, height determined by valueFont.
      valueYMargin: 3,    // {number} - vertical margin inside the value box.
      contentSpacing: 10, // {number} - vertical spacing between the content of the KeypadDialog.

      keypadOptions: {
        accumulatorOptions: {

          // {number} - maximum number of digits that can be entered on the keypad.
          maxDigits: 8,

          // {number} - maximum number of decimal places that can be entered on the keypad.
          maxDigitsRightOfMantissa: CollisionLabConstants.DISPLAY_DECIMAL_PLACES
        }
      },

      // super-class options
      xSpacing: 2,
      fill: CollisionLabColors.PANEL_FILL,
      stroke: CollisionLabColors.PANEL_STROKE

    }, options );

    //----------------------------------------------------------------------------------------

    // Reference the content of the Dialog. Children are added later.
    const contentNode = new VBox( { spacing: options.contentSpacing, align: 'center' } );

    super( contentNode, options );

    // @private {function(value:number)|null} - reference to the function called when a edit in-range successfully
    //                                          occurs. If null, the Keypad dialog is currently not shown.
    this.editValue = null;

    // @private {Range|null} - reference to the Range of the value that the Keypad is editing, if non-null.
    this.valueRange = null;

    // @private {function|null} - reference to a potential callback function for when the Keypad is finished editing.
    //                            This is provided by the client in the beginEdit() method.
    this.editFinishedCallback = null;

    //----------------------------------------------------------------------------------------

    // @private {Keypad} - the Keypad of the KeypadDialog.
    this.keypad = new Keypad( Keypad.PositiveAndNegativeFloatingPointLayout, options.keypadOptions );

    // @private {Text} - the Text Node that displays the Range of the current edit.
    this.rangeText = new Text( '', { font: options.font, maxWidth: this.keypad.width } );

    // @private {Text} - the Text Node that shows the current value of the Keypad edit.
    this.valueText = new Text( '', { font: options.font } );

    // Create the Background to the valueText Node.
    const valueBackgroundNode = new Rectangle( 0, 0, options.valueBoxWidth, this.height + 2 * options.valueYMargin, {
      cornerRadius: 3,
      fill: Color.WHITE,
      stroke: Color.BLACK
    } );

    const valueDisplayBox = new Node( { children: [ valueBackgroundNode, this.valueText ] } );

    // Create the enterButton, which allows the user to submit an Edit.
    const enterButton = new RectangularPushButton( {
      listener: this.submitEdit.bind( this ),
      baseColor: CollisionLabColors.KEYPAD_ENTER_BUTTON,
      content: new Text( collisionLabStrings.enter, {
        font: options.font,
        maxWidth: this.keypad.width // constrain width for i18n
      } )
    } );

    // Set the children of the content of the KeypadDialog, in the correct rendering order.
    contentNode.children = [
      this.rangeText,
      valueDisplayBox,
      this.keypad,
      enterButton
    ];

    //----------------------------------------------------------------------------------------

    // Observe when the Keypad is edited and update our valueText display. Link is never disposed as KeypadDialogs
    // are never disposed.
    this.keypad.stringProperty.link( string => {
      this.valueText.text = string;
      this.valueText.center = valueBackgroundNode.center;
    } );

    // Observe when a key is pressed and reset text colors. Link is never disposed.
    this.keypad.accumulatedKeysProperty.link( () => {
      this.valueText.fill = CollisionLabColors.KEYPAD_DEFAULT_TEXT;
      this.rangeText.fill = CollisionLabColors.KEYPAD_DEFAULT_TEXT;
    } );
  }

  /**
   * Begins an edit by showing the KeypadDialog. Called when the user presses on a BallValuesPanelNumberDisplay to allow
   * the user to manipulate a Ball.
   * @public
   *
   * @param {function(value:number)} editValue - the function called when a edit in-range successfully occurs.
   * @param {Range} valueRange - the Range that the user can edit the valueProperty
   * @param {string} unitsString - the template string that formats the text on the rangeText.
   * @param {function} editFinishedCallback - callback when edit is entered or canceled.
   */
  beginEdit( editValue, valueRange, unitsString, editFinishedCallback ) {
    assert && assert( typeof editValue === 'function', `invalid editValue: ${editValue}` );
    assert && assert( valueRange instanceof Range, `invalid valueRange: ${valueRange}` );
    assert && assert( typeof unitsString === 'string', `invalid unitsString: ${unitsString}` );
    assert && assert( typeof editFinishedCallback === 'function', `invalid editFinishedCallback: ${editFinishedCallback}` );

    this.keypad.clear();

    // Update references. These references are released when the edit is canceled or finished.
    this.editValue = editValue;
    this.valueRange = valueRange;
    this.editFinishedCallback = editFinishedCallback;

    // Update the rangeText message.
    const rangeMessage = StringUtils.fillIn( collisionLabStrings.pattern.range, {
      min: valueRange.min,
      max: valueRange.max,
      units: unitsString ? unitsString : ''
    } ).trim();
    this.rangeText.setText( rangeMessage );

    // Display the KeypadDialog.
    this.show();
  }

  /**
   * Attempts to submit the current Keypad edit. If the edit is valid, the valueProperty is set and the edit is
   * finished. Otherwise, the edit is invalid, and the warnOutOfRange() method is invoked.
   * @private
   *
   * This is called when the user presses the 'Enter' button.
   */
  submitEdit() {

    // If the user didn't enter anything, treat this as a cancel.
    if ( this.keypad.stringProperty.value === '' ) {
      this.finishEdit();
      return;
    }

    // Retrieve the value from the Keypad
    const value = this.keypad.valueProperty.value;

    // If the edit is valid, the valueProperty is set and the edit.
    if ( Number.isFinite( value ) && this.valueRange.contains( value ) ) {
      this.editValue( value );
      this.finishEdit();
    }
    else { this.warnOutOfRange(); }
  }

  /**
   * Changes the text colors of the Value and the Range Text to indicate that a entered Edit is out of range.
   * @private
   */
  warnOutOfRange() {
    this.valueText.fill = CollisionLabColors.KEYPAD_ERROR_TEXT;
    this.rangeText.fill = CollisionLabColors.KEYPAD_ERROR_TEXT;
    this.keypad.setClearOnNextKeyPress( true );
  }

  /**
   * Convenience method to finish the KeypadDialog.
   * @private
   *
   * This method is invoked when a edit is canceled or when a valid edit is entered.
   */
  finishEdit() {
    this.hide(); // Hide the KeypadDialog
    this.keypad.clear(); // Clear the Keypad

    // Release references.
    this.valueProperty = null;
    this.valueRange = null;
    this.editFinishedCallback = null;
  }

  /**
   * @override
   * Hides the dialog. Overridden to also call the editFinishedCallback function when edits are canceled.
   * @public
   */
  hide() {
    this.editFinishedCallback();
    super.hide();
  }
}

collisionLab.register( 'KeypadDialog', KeypadDialog );
export default KeypadDialog;