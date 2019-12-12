// Copyright 2019, University of Colorado Boulder

/**
 * View a checkbox in the control panel
 *
 * @author Alex Schor
 */

define( require => {
  'use strict';

  // modules
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const Checkbox = require( 'SUN/Checkbox' );
  const collisionLab = require( 'COLLISION_LAB/collisionLab' );
  const HBox = require( 'SCENERY/nodes/HBox' );
  const merge = require( 'PHET_CORE/merge' );
  const Node = require( 'SCENERY/nodes/Node' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Text = require( 'SCENERY/nodes/Text' );

  // strings


  class ControlPanelCheckbox extends Checkbox {

    /**
     *
     * @param {String} labelString
     * @param {BooleanProperty} checkboxProperty
     * @param {Object} options
     */
    constructor( labelString, checkboxProperty, options ) {

      assert && assert( typeof labelString === 'string', `invalid labelString: ${labelString}` );
      assert && assert( checkboxProperty instanceof BooleanProperty, `invalid checkboxProperty: ${checkboxProperty}` );
      assert && assert( !options || Object.getPrototypeOf( options ) === Object.prototype,
        `Extra prototype on options: ${options}` );

      options = merge( {
        font: new PhetFont( 18 ),
        rightIcon: null,
        width: 180,
        boxWidth: 18
      }, options );

      const checkboxContent = new Node();

      const checkboxText = new Text( labelString, {
        font: options.font
      } );


      if ( options.rightIcon !== null ) {
        checkboxContent.addChild( new HBox( {
          align: 'center',
          spacing: options.width - checkboxText.width - options.rightIcon.width,
          children: [checkboxText, options.rightIcon]
        } ) );
      }
      else {
        checkboxContent.addChild( checkboxText );
      }

      super( checkboxContent, checkboxProperty, options );

    }

  }

  return collisionLab.register( 'ControlPanelCheckbox', ControlPanelCheckbox );
} );

