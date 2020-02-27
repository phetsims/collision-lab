// Copyright 2019-2020, University of Colorado Boulder

/**
 * View a checkbox in the control panel with an optional icon flushed to the right
 *
 * @author Alex Schor
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import collisionLab from '../../collisionLab.js';

class ControlPanelCheckbox extends Checkbox {

  /**
   * @param {String} labelString
   * @param {Property.<boolean>} checkboxProperty
   * @param {Object} [options]
   */
  constructor( labelString, checkboxProperty, options ) {

    assert && assert( typeof labelString === 'string', `invalid labelString: ${labelString}` );
    assert && assert( checkboxProperty instanceof BooleanProperty, `invalid checkboxProperty: ${checkboxProperty}` );
    assert && assert( !options || Object.getPrototypeOf( options ) === Object.prototype,
      `Extra prototype on options: ${options}` );

    options = merge( {
      font: new PhetFont( 18 ),
      rightIconNode: null, // {null||Node} optional icon to the right of the checkbox
      width: 180, // width of the checkbox
      boxWidth: 18, // size of the box
      textMaxWidth: 140
    }, options );

    assert && assert( options.width > options.textMaxWidth, 'checkbox text may overflow' );

    // content for the checkbox
    const checkboxContent = new Node();

    // create and add checkbox text
    const checkboxText = new Text( labelString, { font: options.font, maxWidth: options.textMaxWidth } );
    checkboxContent.addChild( checkboxText );

    // (optionally) create and add icon flushed to the right of the checkbox
    if ( options.rightIconNode instanceof Node ) {
      checkboxContent.addChild( options.rightIconNode );
      options.rightIconNode.right = options.width;
      options.rightIconNode.centerY = checkboxText.centerY;
    }

    super( checkboxContent, checkboxProperty, options );
  }
}

collisionLab.register( 'ControlPanelCheckbox', ControlPanelCheckbox );
export default ControlPanelCheckbox;