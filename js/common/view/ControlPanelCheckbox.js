// Copyright 2019, University of Colorado Boulder

/**
 * View a checkbox in the control panel
 *
 * @author Alex Schor
 */

define( require => {
  'use strict';

  // modules
  const collisionLab = require( 'COLLISION_LAB/collisionLab' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Text = require( 'SCENERY/nodes/Text' );
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const HBox = require( 'SCENERY/nodes/HBox' );
  const merge = require( 'PHET_CORE/merge' );
  const Checkbox = require( 'SUN/Checkbox' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );

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
        `Extra prototype on Options: ${options}` );

      options = merge( {
        font: new PhetFont( 20 ),
        rightIcon: null,
        width: 200
      }, options );

      const checkboxContent = new Node();

      const checkboxText = new Text( labelString, {
        font: options.font
      } );


      if ( options.rightIcon !== null ) {
        checkboxContent.addChild( new HBox( {
          align: 'center',
          spacing: options.width - checkboxText.width - options.rightIcon.width,
          children: [ checkboxText, options.rightIcon ]
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

