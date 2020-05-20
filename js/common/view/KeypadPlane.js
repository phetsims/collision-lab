// Copyright 2020, University of Colorado Boulder

/**
 * KeypadPlane is a Plane sub-type that handles the creation and management of a modal Keypad for the 'collision lab'
 * simulation. It is present on all screens.
 *
 * KeypadPlane should be the last child in the ScreenView. It's only visible when the Keypad requested through the
 * beginEdit() method, which occurs when the user presses on a BallValuesNumberDisplay, to allow the user to
 * manipulate a Ball Property. Edits must be within a specified range. There will be a 'Enter' button to allow the user
 * to submit a edit, and edits are canceled if the user presses outside of the Keypad.
 *
 * KeypadPlane is created at the start of the sim and is never disposed, so no dispose method is necessary and
 * internal links are left as-is.
 *
 * @author Brandon Li
 */

import Utils from '../../../../dot/js/Utils.js';
import merge from '../../../../phet-core/js/merge.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import PhetColorScheme from '../../../../scenery-phet/js/PhetColorScheme.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Keypad from '../../../../scenery-phet/js/keypad/Keypad.js';
import DownUpListener from '../../../../scenery/js/input/DownUpListener.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Plane from '../../../../scenery/js/nodes/Plane.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import VBox from '../../../../scenery/js/nodes/VBox.js';
import Panel from '../../../../sun/js/Panel.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import collisionLab from '../../collisionLab.js';

// strings
// const enterString = require( 'string!COLLISION_LAB/enter' );
const enterString = 'enter';
// const rangeMessageString = require( 'string!COLLISION_LAB/rangeMessage' );
const rangeMessageString = 'rangeMessage';

// constants
const TEXT_FONT = new PhetFont( 15 );
const TEXT_FILL_DEFAULT = 'black';
const TEXT_FILL_ERROR = 'red';

class KeypadPlane extends Plane {

  constructor( options ) {

    options = merge( {

      valueBoxWidth: 85, // {number} width of the value field, height determined by valueFont
      valueYMargin: 3, // {number} vertical margin inside the value box
      valueFont: TEXT_FONT,
      maxDigits: 8, // {number} maximum number of digits that can be entered on the keypad
      maxDecimals: 2, // {number} maximum number of decimal places that can be entered on the keypad

      // supertype options
      visible: false,
      fill: 'rgba( 0, 0, 0, 0.2 )',
      tandem: Tandem.REQUIRED
    }, options );

    super( options );

    // @private clicking outside the keypad cancels the edit
    this.clickOutsideListener = new DownUpListener( {
      down: event => {
        if ( event.trail.lastNode() === this ) {this.endEdit();}
      }
    } );

    // @private these will be set when the client calls beginEdit
    this.valueProperty = null;
    this.onEndEdit = null; // {function} called by endEdit

    const valueNode = new Text( '', { font: options.valueFont } );

    const valueBackgroundNode = new Rectangle( 0, 0, options.valueBoxWidth, valueNode.height + ( 2 * options.valueYMargin ), {
      cornerRadius: 3,
      fill: 'white',
      stroke: 'black'
    } );

    const valueParent = new Node( { children: [ valueBackgroundNode, valueNode ] } );

    this.keypadNode = new Keypad( Keypad.PositiveFloatingPointLayout, {
      maxDigits: options.maxDigits,
      maxDigitsRightOfMantissa: options.maxDecimals,
      tandem: options.tandem.createTandem( 'keypad' ),
      phetioDocumentation: 'The keypad UI component for user to enter in a custom number'
    } );

    const enterButton = new RectangularPushButton( {
      listener: this.commitEdit.bind( this ),
      baseColor: PhetColorScheme.BUTTON_YELLOW,
      content: new Text( enterString, {
        font: TEXT_FONT,
        fill: 'black',
        maxWidth: this.keypadNode.width // i18n
      } ),
      tandem: options.tandem.createTandem( 'enterButton' ),
      phetioDocumentation: 'The button to submit a custom number with the keypad'
    } );

    const rangeMessageText = new Text( '', { font: TEXT_FONT, maxWidth: this.keypadNode.width } );

    // @private for convenient access by methods
    this.valueNode = valueNode;
    this.rangeMessageText = rangeMessageText;

    const valueAndRangeMessage = new VBox( {
      spacing: 5,
      align: 'center',
      children: [ rangeMessageText, valueParent ]
    } );

    const contentNode = new VBox( {
      spacing: 10,
      align: 'center',
      children: [ valueAndRangeMessage, this.keypadNode, enterButton ]
    } );


    // @private
    this.keypadPanel = new Panel( contentNode, {
      fill: 'rgb( 230, 230, 230 )', // {Color|string} the keypad's background color
      backgroundPickable: true, // {boolean} so that clicking in the keypad's background doesn't close the keypad
      xMargin: 10,
      yMargin: 10
    } );

    this.addChild( this.keypadPanel );

    // The keypad lasts for the lifetime of the sim, so the links don't need to be disposed
    this.keypadNode.stringProperty.link( string => { // no unlink required
      valueNode.text = string;
      valueNode.center = valueBackgroundNode.center;
    } );

    // for resetting color of value to black when it has been red.
    this.keypadNode.accumulatedKeysProperty.link( keys => {
      valueNode.fill = TEXT_FILL_DEFAULT;
      rangeMessageText.fill = TEXT_FILL_DEFAULT;
    } );
  }

  /**
   * Begins an edit, by opening a modal keypad.
   * @public
   *
   * @param {Property.<number>} valueProperty - the Property to be set by the keypad
   * @param {Range} valueRange
   * @param {Object} [options]
   */
  beginEdit( valueProperty, valueRange, unitsString, options ) {

    options = merge( {
      onBeginEdit: null, // {function} called by beginEdit
      onEndEdit: null // {function} called by endEdit
    }, options );

    this.valueProperty = valueProperty; // remove this reference in endEdit
    this.onEndEdit = options.onEndEdit;

    this.valueRange = valueRange; // update value range to be used in commitedit
    const rangeMessage = StringUtils.fillIn( rangeMessageString, {
      min: valueRange.min,
      max: valueRange.max,
      units: unitsString ? unitsString : ''
    } ).trim();
    this.rangeMessageText.setText( rangeMessage );

    // display the keypad
    this.visible = true;

    // keypadPlane lasts for the lifetime of the sim, so listeners don't need to be disposed
    this.addInputListener( this.clickOutsideListener );
  }

  /**
   * Ends an edit, used by commitEdit and endEdit
   * @private
   */
  endEdit() {

    // clear the keypad
    this.keypadNode.clear();

    // hide the keypad
    this.visible = false;
    this.removeInputListener( this.clickOutsideListener );

    // execute client-specific hook
    this.onEndEdit && this.onEndEdit();

    // remove reference to valueProperty that was passed to beginEdit
    this.valueProperty = null;

    this.valueNode.fill = TEXT_FILL_DEFAULT;
  }

  /**
   * Warns the user that out of range
   * @private
   */
  warnOutOfRange() {
    this.valueNode.fill = TEXT_FILL_ERROR;
    this.rangeMessageText.fill = TEXT_FILL_ERROR;
    this.keypadNode.setClearOnNextKeyPress( true );
  }

  /**
   * Commits an edit
   * @private
   */
  commitEdit() {

    const valueRange = this.valueRange;

    // get the value from the keypad
    const value = this.keypadNode.valueProperty.value;

    // not entering a value in the keypad is a cancel
    if ( this.keypadNode.stringProperty.value === '' ) {
      this.endEdit();
      return;
    }

    // if the keypad contains a valid value ...
    if ( valueRange.contains( value ) ) {
      this.valueProperty.value = Utils.toFixedNumber( value, 2 );
      this.endEdit();
    }
    this.warnOutOfRange();
  }
}

collisionLab.register( 'KeypadPlane', KeypadPlane );
export default KeypadPlane;
