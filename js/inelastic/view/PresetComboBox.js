// Copyright 2020, University of Colorado Boulder

/**
 * PresetComboBox is a ComboBox sub-type that allows the user to select the different 'Presets'. It appears only
 * on the top-right corner of the 'Inelastic' screen. See InelasticPreset for more context.
 *
 * TODO: i18n
 * TODO: icons?
 * TODO: placement?
 *
 *
 * @author Brandon Li
 */

import merge from '../../../../phet-core/js/merge.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import ComboBox from '../../../../sun/js/ComboBox.js';
import ComboBoxItem from '../../../../sun/js/ComboBoxItem.js';
import collisionLab from '../../collisionLab.js';
import collisionLabStrings from '../../collisionLabStrings.js';
import CollisionLabConstants from '../../common/CollisionLabConstants.js';
import InelasticPreset from '../model/InelasticPreset.js';

class PresetComboBox extends ComboBox {

  /**
   * @param {EnumerationProperty.<InelasticPreset>} presetProperty
   * @param {Node} parentNode - for the super-class.
   * @param {Object} [options]
   */
  constructor( presetProperty, parentNode, options ) {
    assert && AssertUtils.assertEnumerationPropertyOf( presetProperty, InelasticPreset );
    assert && assert( parentNode instanceof Node, `invalid parentNode: ${parentNode}` );

    options = merge( {

      // {Font} - font used for all Text instances.
      font: CollisionLabConstants.CONTROL_FONT,

      // super-class options
      xMargin: CollisionLabConstants.PANEL_X_MARGIN,
      yMargin: CollisionLabConstants.PANEL_Y_MARGIN,
      cornerRadius: 4,
      listPosition: 'below'

    }, options );

    //----------------------------------------------------------------------------------------

    assert && assert( !options.labelNode, 'PresetComboBox sets labelNode.' );

    // Set the titleNode of the ComboBox, which cannot be overridden.
    options.labelNode = new Text( collisionLabStrings.preset.title, {
      font: options.font
      // maxWidth: 400 // constrain width for i18n, determined empirically
    } );

    // Create the items of the ComboBox.
    const items = [
      new ComboBoxItem( new Text( collisionLabStrings.preset.custom, { font: options.font } ), InelasticPreset.CUSTOM ),
      new ComboBoxItem( new Text( collisionLabStrings.preset.name1, { font: options.font } ), InelasticPreset.NAME_1 ),
      new ComboBoxItem( new Text( collisionLabStrings.preset.name2, { font: options.font } ), InelasticPreset.NAME_2 )
    ];

    super( items, presetProperty, parentNode, options );
  }
}

collisionLab.register( 'PresetComboBox', PresetComboBox );
export default PresetComboBox;