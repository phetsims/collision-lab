// Copyright 2014-2020, University of Colorado Boulder

/**
 * @author Brandon Li
 */

import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import ComboBox from '../../../../sun/js/ComboBox.js';
import ComboBoxItem from '../../../../sun/js/ComboBoxItem.js';
import collisionLab from '../../collisionLab.js';
import InelasticBallSystemPresets from '../model/InelasticBallSystemPresets.js';

// constants
const FONT = new PhetFont( 22 );

class InelasticBallSystemPresetsComboBox extends ComboBox {

  /**
   * @param {EnumerationProperty.<InelasticBallSystemPresets>} inelasticBallSystemPresetProperty
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

      new ComboBoxItem( new Text( 'custom', { font: FONT } ), InelasticBallSystemPresets.CUSTOM ),
      new ComboBoxItem( new Text( 'name 1', { font: FONT } ), InelasticBallSystemPresets.NAME_1 ),
      new ComboBoxItem( new Text( 'name 2', { font: FONT } ), InelasticBallSystemPresets.NAME_2 )

    ];

    super( items, inelasticBallSystemPresetProperty, listParent, options );
  }
}

collisionLab.register( 'InelasticBallSystemPresetsComboBox', InelasticBallSystemPresetsComboBox );
export default InelasticBallSystemPresetsComboBox;