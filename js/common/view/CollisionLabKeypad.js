// Copyright 2019, University of Colorado Boulder

/**
 * KeypadLayer handles creation and management of a modal keypad.
 *
 * @author Martin Veillette
 */
define( require => {
  'use strict';

  // modules
  const collisionLab = require( 'COLLISION_LAB/collisionLab' );
  const DownUpListener = require( 'SCENERY/input/DownUpListener' );
  const Keypad = require( 'SCENERY_PHET/keypad/Keypad' );
  const merge = require( 'PHET_CORE/merge' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Panel = require( 'SUN/Panel' );
  const PhetColorScheme = require( 'SCENERY_PHET/PhetColorScheme' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Plane = require( 'SCENERY/nodes/Plane' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  const StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  const Tandem = require( 'TANDEM/Tandem' );
  const Text = require( 'SCENERY/nodes/Text' );
  const Util = require( 'DOT/Util' );
  const VBox = require( 'SCENERY/nodes/VBox' );

  // strings
  // const enterString = require( 'string!COLLISION_LAB/enter' );
  const enterString = 'enter';
  // const rangeMessageString = require( 'string!COLLISION_LAB/rangeMessage' );
  const rangeMessageString = 'rangeMessage';

  // constants
  const TEXT_FONT = new PhetFont( 15 );
  const TEXT_FILL_DEFAULT = 'black';
  const TEXT_FILL_ERROR = 'red';

  class CollisionLabKeypad extends Plane {

    constructor( options ) {

      options = merge( {

        valueBoxWidth: 85, // {number} width of the value field, height determined by valueFont
        valueYMargin: 3, // {number} vertical margin inside the value box
        valueFont: TEXT_FONT,
        maxDigits: 8, // {number} maximum number of digits that can be entered on the keypad
        maxDecimals: 2, // {number} maximum number of decimal places that can be entered on the keypd

        // supertype options
        visible: false,
        fill: 'rgba( 0, 0, 0, 0.2 )',
        tandem: Tandem.REQUIRED
      }, options );

      super( options );

      // @private clicking outside the keypad cancels the edit
      this.clickOutsideListener = new DownUpListener( {
        down: event => {
          if ( event.trail.lastNode() === this ) {this.cancelEdit();}
        }
      } );

      // @private these will be set when the client calls beginEdit
      this.valueProperty = null;
      this.onEndEdit = null; // {function} called by endEdit

      const valueNode = new Text( '', {
        font: options.valueFont
      } );

      const valueBackgroundNode = new Rectangle( 0, 0, options.valueBoxWidth, valueNode.height + ( 2 * options.valueYMargin ), {
        cornerRadius: 3,
        fill: 'white',
        stroke: 'black'
      } );

      const valueParent = new Node( {
        children: [valueBackgroundNode, valueNode]
      } );

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
        children: [rangeMessageText, valueParent]
      } );

      const contentNode = new VBox( {
        spacing: 10,
        align: 'center',
        children: [valueAndRangeMessage, this.keypadNode, enterButton]
      } );

      // @private
      this.saidHello = false;
      const helloText = new Text( 'Hello!', { font: TEXT_FONT } );

      // @private

      this.addHelloText = () => {
        if ( !contentNode.hasChild( helloText ) && !this.saidHello ) {
          contentNode.addChild( helloText );
          this.saidHello = true;
        }
      };

      this.removeHelloText = () => {
        if ( contentNode.hasChild( helloText ) ) {
          contentNode.removeChild( helloText );
        }
      };

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
     * Positions keypad
     * @param {function:KeypadPanel} setKeypadLocation - function that lays out keypad, no return
     */
    positionKeypad( setKeypadLocation ) {
      this.keypadPanel && setKeypadLocation( this.keypadPanel );
    }

    /**
     * Begins an edit, by opening a modal keypad.
     * @public
     *
     * @param {Property.<number>} valueProperty - the Property to be set by the keypad
     * @param {Range} valueRange
     * @param {string} unitsString
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

      // keypadLayer lasts for the lifetime of the sim, so listeners don't need to be disposed
      this.addInputListener( this.clickOutsideListener );

      // execute client-specific hook
      options.onBeginEdit && options.onBeginEdit();
    }

    /**
     * Ends an edit, used by commitEdit and cancelEdit
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

      this.removeHelloText();
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
      const value = this.keypadNode.valueProperty.get();

      // not entering a value in the keypad is a cancel
      if ( this.keypadNode.stringProperty.get() === '' ) {
        this.cancelEdit();
        return;
      }

      // if the keypad contains a valid value ...
      if ( valueRange.contains( value ) ) {
        this.valueProperty.set( Util.toFixedNumber( value, 2 ) );
        this.endEdit();
      }
      else if ( value === 43110 ) {
        if ( !this.saidHello ) {
          this.sayHi();
        }
        else {
          this.removeHelloText();
          this.warnOutOfRange();
        }
      } // out of range
      else {
        this.warnOutOfRange();
      }
    }

    /**
     * Cancels an edit
     * @private
     */
    cancelEdit() {
      this.endEdit();
    }

    sayHi() {
      this.addHelloText();
    }
  }

  return collisionLab.register( 'CollisionLabKeypad', CollisionLabKeypad );
} );

