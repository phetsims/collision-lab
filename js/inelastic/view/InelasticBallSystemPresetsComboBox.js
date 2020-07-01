// Copyright 2020, University of Colorado Boulder

/**
 * @author Brandon Li
 */

import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import ComboBox from '../../../../sun/js/ComboBox.js';
import ComboBoxItem from '../../../../sun/js/ComboBoxItem.js';
import collisionLab from '../../collisionLab.js';
import InelasticBallPresets from '../model/InelasticBallPresets.js';

// constants
const FONT = new PhetFont( 22 );

class InelasticBallPresetsComboBox extends ComboBox {

  /**
   * @param {EnumerationProperty.<InelasticBallPresets>} inelasticBallSystemPresetProperty
   * @param {Node} listParent node that will be used as the list's parent, use this to ensure that the list is in front of everything else
   * @param {Object} [options]
   */
  constructor( inelasticBallSystemPresetProperty, listParent, options ) {

    options = merge( {

      xMargin: 10,
      yMargin: 5,
      cornerRadius: 4,
      maxWidth: 600,
      listPosition: 'below'

    }, options );

    options.labelNode = new Text( 'Presets', {
      font: FONT
    } );

    const items = [

      new ComboBoxItem( new Text( 'custom', { font: FONT } ), InelasticBallPresets.CUSTOM ),
      new ComboBoxItem( new Text( 'name 1', { font: FONT } ), InelasticBallPresets.NAME_1 ),
      new ComboBoxItem( new Text( 'name 2', { font: FONT } ), InelasticBallPresets.NAME_2 )

    ];

    super( items, inelasticBallSystemPresetProperty, listParent, options );
  }
}

collisionLab.register( 'InelasticBallPresetsComboBox', InelasticBallPresetsComboBox );
export default InelasticBallPresetsComboBox;