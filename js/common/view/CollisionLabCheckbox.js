// Copyright 2019-2020, University of Colorado Boulder

/**
 * CollisionLabCheckbox is a Checkbox sub-type for the 'collision lab' sim. It appears mostly in control-panels but
 * also appears in other places. It must have a label, with an option to provide a icon. If the icon is provided, it
 * will be placed to the far-right of the label text to maintain a constant width.
 *
 * @author Brandon Li
 * @author Alex Schor
 */

import Property from '../../../../axon/js/Property.js';
import merge from '../../../../phet-core/js/merge.js';
import HStrut from '../../../../scenery/js/nodes/HStrut.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabConstants from '../CollisionLabConstants.js';

class CollisionLabCheckbox extends Checkbox {

  /**
   * @param {Property.<boolean>} checkboxProperty - the Property that the Checkbox toggles
   * @param {String} label - the label to the right of the Checkbox
   * @param {Object} [options]
   */
  constructor( checkboxProperty, label, options ) {
    assert && assert( checkboxProperty instanceof Property && typeof checkboxProperty.value === 'boolean', `invalid checkboxProperty: ${checkboxProperty}` );
    assert && assert( typeof label === 'string', `invalid label: ${label}` );
    assert && assert( !options || Object.getPrototypeOf( options ) === Object.prototype, `Extra prototype on options: ${options}` );

    options = merge( {

      // {Node|null} optional icon, to the right of text
      icon: null,

      // {number} - the width of the entire Checkbox, including its content. If the icon is provided, it is placed at
      //            the far-right side to ensure that this is the width of the entire Checkbox. This is generally
      //            used to align icons within a control-panel. This is also used to compute the maxWidth for the Text.
      width: CollisionLabConstants.CONTROL_PANEL_CONTENT_WIDTH,

      // superclass options
      boxWidth: CollisionLabConstants.CHECKBOX_BOX_WIDTH,
      spacing: 6

    }, options );

    //----------------------------------------------------------------------------------------

    // Create the labelText. It's maxWidth is applied later.
    const labelText = new Text( label, { font: CollisionLabConstants.CONTROL_FONT } );

    // Create the content for the Checkbox.
    const contentNode = new Node( { children: [ labelText ] } );

    if ( options.icon ) {
      contentNode.addChild( options.icon );

      // Apply the maxWidth of the labelText for i18n.
      labelText.maxWidth = options.width - options.boxWidth - 2 * options.spacing - options.icon.width;

      // Position the icon to the far-right side of the constant-size Checkbox.
      options.icon.right = options.width - options.boxWidth - options.spacing;
      options.icon.centerY = labelText.centerY;
    }
    else {

      // Apply the maxWidth of the labelText for i18n.
      labelText.maxWidth = options.width - options.boxWidth - options.spacing;

      // Prevents the content from getting narrower than fixedWidth
      contentNode.addChild( new HStrut( labelText.maxWidth, { pickable: false, centerLeft: labelText.centerLeft } ) );
    }

    super( contentNode, checkboxProperty, options );
  }
}

collisionLab.register( 'CollisionLabCheckbox', CollisionLabCheckbox );
export default CollisionLabCheckbox;