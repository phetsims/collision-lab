// Copyright 2020-2022, University of Colorado Boulder

/**
 * CollisionLabCheckbox is a Checkbox sub-type for the 'collision lab' sim. It appears mostly in control-panels but
 * also appears in other places. It must have a label, with an option to provide a icon. If the icon is provided, it
 * will be placed to the far-right of the label text to maintain a constant width.
 *
 * @author Brandon Li
 * @author Alex Schor
 */

import merge from '../../../../phet-core/js/merge.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import { Node, Text } from '../../../../scenery/js/imports.js';
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
    assert && AssertUtils.assertPropertyOf( checkboxProperty, 'boolean' );
    assert && assert( typeof label === 'string', `invalid label: ${label}` );

    options = merge( {}, CollisionLabConstants.CHECKBOX_OPTIONS, {

      // {Node|null} optional icon, to the right of text
      icon: null,

      // {number} - the max-width of the entire Checkbox, including its content. If the icon is provided, it is placed
      //            at the far-right side to ensure such that the maxWidth is the width of the entire Checkbox. This is
      //            used to align icons within a control-panel. This is also used to compute the maxWidth for the Text.
      maxWidth: CollisionLabConstants.CONTROL_PANEL_CONTENT_WIDTH,

      // {number} - amount to dilate the 'touch area' of the Checkbox.
      touchAreaXDilation: 0,
      touchAreaYDilation: 0

    }, options );

    //----------------------------------------------------------------------------------------

    // Create the labelText. It's maxWidth is applied later.
    const labelText = new Text( label, { font: CollisionLabConstants.CONTROL_FONT } );

    // Create the content for the Checkbox.
    const contentNode = new Node( { children: [ labelText ] } );

    if ( options.icon ) {
      contentNode.addChild( options.icon );

      // Apply the maxWidth of the labelText for i18n.
      labelText.maxWidth = options.maxWidth - options.boxWidth - 2 * options.spacing - options.icon.width;

      // Position the icon to the far-right side of the constant-size Checkbox.
      options.icon.right = options.maxWidth - options.boxWidth - options.spacing;
      options.icon.centerY = labelText.centerY;
    }
    else {

      // Apply the maxWidth of the labelText for i18n.
      labelText.maxWidth = options.maxWidth - options.boxWidth - options.spacing;
    }

    super( checkboxProperty, contentNode, options );

    // Dilate 'touch area', if provided.
    if ( options.touchAreaXDilation || options.touchAreaYDilation ) {
      this.touchArea = this.localBounds.dilatedXY( options.touchAreaXDilation, options.touchAreaYDilation );
    }
  }
}

collisionLab.register( 'CollisionLabCheckbox', CollisionLabCheckbox );
export default CollisionLabCheckbox;