// Copyright 2019-2020, University of Colorado Boulder

/**
 * Top level view for the 'Intro' screen.
 *
 * @author BrandonLi
 */

import merge from '../../../../phet-core/js/merge.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import AlignGroup from '../../../../scenery/js/nodes/AlignGroup.js';
import Color from '../../../../scenery/js/util/Color.js';
import RadioButtonGroup from '../../../../sun/js/buttons/RadioButtonGroup.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import collisionLab from '../../collisionLab.js';
import BallSystemNode from '../../common/view/BallSystemNode.js';
import CollisionLabIconFactory from '../../common/view/CollisionLabIconFactory.js';
import CollisionLabScreenView from '../../common/view/CollisionLabScreenView.js';
import CollisionLabViewProperties from '../../common/view/CollisionLabViewProperties.js';
import InelasticModel from '../model/InelasticModel.js';
import InelasticPreset from '../model/InelasticPreset.js';
import InelasticControlPanel from './InelasticControlPanel.js';
// import PresetComboBox from './PresetComboBox.js';

class InelasticScreenView extends CollisionLabScreenView {

  /**
   * @param {InelasticModel} model
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( model, tandem, options ) {
    assert && assert( model instanceof InelasticModel, `invalid model: ${model}` );
    assert && assert( tandem instanceof Tandem, `invalid tandem: ${tandem}` );

    options = merge( {

      playAreaControlSetOptions: {
        includeNumberOfBallsSpinner: false
      }

    }, options );

    super( model, tandem, options );

    //----------------------------------------------------------------------------------------

    // const inelasticBallSystemPresetsComboBox = new PresetComboBox( model.ballSystem.inelasticPresetProperty, this, {
    //   rightTop: this.playAreaViewBounds.rightBottom.addXY( 0, 100 )
    // } );
    //

    const content = [];
    const alignGroup = new AlignGroup( {
      matchHorizontal: true,
      matchVertical: true
    } );

    InelasticPreset.VALUES.forEach( preset => {
      content.push( {
        value: preset,
        node: alignGroup.createBox( CollisionLabIconFactory.createInelasticPresetIcon( preset ) )
      } );
    } );

    const inelasticBallSystemPresetsComboBox = new RadioButtonGroup(
      model.ballSystem.inelasticPresetProperty,
      content, {
        deselectedLineWidth: 1,
        selectedLineWidth: 1.5,
        cornerRadius: 8,
        deselectedButtonOpacity: 0.35,
        buttonContentXMargin: 12,
        buttonContentYMargin: 4,
        orientation: 'horizontal',
        baseColor: Color.WHITE,
        selectedStroke: 'rgb( 65, 154, 201 )', // blue
        deselectedStroke: 'rgb( 50, 50, 50 )',
        leftBottom: this.layoutBounds.leftBottom

      } );


    this.addChild( inelasticBallSystemPresetsComboBox );
    // inelasticBallSystemPresetsComboBox.moveToBack();
  }

  /**
   * Creates the CollisionLabControlPanel for the 'Inelastic' screen. Called in the constructor of the super-class.
   *
   * @override
   * @protected
   * @param {CollisionLabViewProperties} viewProperties
   * @param {InelasticModel} model
   * @param {Object} [options]
   * @returns {CollisionLabControlPanel}
   */
  createControlPanel( viewProperties, model, options ) {
    assert && assert( viewProperties instanceof CollisionLabViewProperties, `invalid viewProperties: ${viewProperties}` );
    assert && assert( model instanceof InelasticModel, `invalid model: ${model}` );

    return new InelasticControlPanel(
      viewProperties,
      model.ballSystem.centerOfMassVisibleProperty,
      model.ballSystem.pathsVisibleProperty,
      model.playArea.reflectingBorderProperty,
      model.playArea.elasticityPercentProperty,
      model.ballSystem.ballsConstantSizeProperty,
      model.playArea.inelasticCollisionTypeProperty,
      options );
  }

  /**
   * Creates the BallSystemNode for the 'Inelastic' screen. Called in the constructor of the super-class.
   *
   * @override
   * @protected
   * @param {InelasticModel} model
   * @param {CollisionLabViewProperties} viewProperties
   * @param {ModelViewTransform2} modelViewTransform
   * @returns {BallSystemNode}
   */
  createBallSystemNode( model, viewProperties, modelViewTransform ) {
    assert && assert( model instanceof InelasticModel, `invalid model: ${model}` );
    assert && assert( viewProperties instanceof CollisionLabViewProperties, `invalid viewProperties: ${viewProperties}` );
    assert && assert( modelViewTransform instanceof ModelViewTransform2, `invalid modelViewTransform: ${modelViewTransform}` );

    return new BallSystemNode(
      model.ballSystem,
      model.playArea,
      viewProperties.valuesVisibleProperty,
      viewProperties.velocityVectorVisibleProperty,
      viewProperties.momentumVectorVisibleProperty,
      model.isPlayingProperty,
      modelViewTransform
    );
  }
}

collisionLab.register( 'InelasticScreenView', InelasticScreenView );
export default InelasticScreenView;