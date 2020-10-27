// Copyright 2020, University of Colorado Boulder

/**
 * PresetRadioButtonGroup is a RationButtonGroup sub-type that allows the user to select the different 'Presets'. It
 * appears only on the bottom-left corner of the 'Inelastic' screen. A RadioButton is created for every 'Preset'. See
 * InelasticPreset.js for more context.
 *
 * Icons are created from CollisionLabIconFactory. PresetRadioButtonGroup is never disposed and exists for the entire
 * simulation.
 *
 * @author Brandon Li
 */

import merge from '../../../../phet-core/js/merge.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import RectangularRadioButtonGroup from '../../../../sun/js/buttons/RectangularRadioButtonGroup.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabColors from '../../common/CollisionLabColors.js';
import CollisionLabIconFactory from '../../common/view/CollisionLabIconFactory.js';
import InelasticPreset from '../model/InelasticPreset.js';

class PresetRadioButtonGroup extends RectangularRadioButtonGroup {

  /**
   * @param {Property.<InelasticPreset>} presetProperty
   * @param {Object} [options]
   */
  constructor( presetProperty, options ) {
    assert && AssertUtils.assertEnumerationPropertyOf( presetProperty, InelasticPreset );

    options = merge( {

      // super-class options
      deselectedLineWidth: 1,
      selectedLineWidth: 1.5,
      cornerRadius: 8,
      deselectedButtonOpacity: 0.35,
      buttonContentXMargin: 12,
      buttonContentYMargin: 4,
      orientation: 'horizontal',
      baseColor: CollisionLabColors.RADIO_BUTTON_BASE_COLOR,
      selectedStroke: CollisionLabColors.RADIO_BUTTON_SELECTED_STROKE,
      deselectedStroke: CollisionLabColors.RADIO_BUTTON_DESELECTED_STROKE

    }, options );

    // Create the description of the radio buttons
    const content = InelasticPreset.VALUES.map( preset => {
      return {
        value: preset,
        node: CollisionLabIconFactory.createInelasticPresetIcon( preset )
      };
    } );

    super( presetProperty, content, options );
  }
}

collisionLab.register( 'PresetRadioButtonGroup', PresetRadioButtonGroup );
export default PresetRadioButtonGroup;