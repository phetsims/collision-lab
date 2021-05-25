// Copyright 2019-2021, University of Colorado Boulder

/**
 * Top level view for the 'Intro' screen.
 *
 * @author BrandonLi
 */

import merge from '../../../../phet-core/js/merge.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabConstants from '../../common/CollisionLabConstants.js';
import CollisionLabScreenView from '../../common/view/CollisionLabScreenView.js';
import CollisionLabViewProperties from '../../common/view/CollisionLabViewProperties.js';
import IntroModel from '../model/IntroModel.js';
import IntroBallSystemNode from './IntroBallSystemNode.js';
import IntroControlPanel from './IntroControlPanel.js';

class IntroScreenView extends CollisionLabScreenView {

  /**
   * @param {IntroModel} model
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( model, tandem, options ) {
    assert && assert( model instanceof IntroModel, `invalid model: ${model}` );
    assert && assert( tandem instanceof Tandem, `invalid tandem: ${tandem}` );

    options = merge( {

      playAreaTop: CollisionLabConstants.PLAY_AREA_VIEW_TOP_1D,
      playAreaTopRightControlsOptions: {
        includeGridCheckbox: false
      },
      includePlayAreaTopRightControls: false

    }, options );

    super( model, tandem, options );
  }

  /**
   * Creates the CollisionLabControlPanel for the 'Intro' screen. Called in the constructor of the super-class. For
   * this screen, his method will instantiate a sub-type of CollisionLabControlPanel: IntroControlPanel.
   *
   * @override
   * @protected
   * @param {CollisionLabViewProperties} viewProperties
   * @param {IntroModel} model
   * @param {Object} [options]
   * @returns {IntroControlPanel}
   */
  createControlPanel( viewProperties, model, options ) {
    assert && assert( viewProperties instanceof CollisionLabViewProperties, `invalid viewProperties: ${viewProperties}` );
    assert && assert( model instanceof IntroModel, `invalid model: ${model}` );

    return new IntroControlPanel(
      viewProperties,
      model.ballSystem.changeInMomentumVisibleProperty,
      model.ballSystem.centerOfMassVisibleProperty,
      model.ballSystem.pathsVisibleProperty,
      model.playArea.reflectingBorderProperty,
      model.playArea.elasticityPercentProperty,
      model.ballSystem.ballsConstantSizeProperty,
      options
    );
  }

  /**
   * Creates the BallSystemNode for the 'Intro' screen. Called in the constructor of the super-class. For this
   * screen, his method will instantiate a sub-type of BallSystemNode: IntroBallSystemNode.
   *
   * @override
   * @protected
   * @param {IntroModel} model
   * @param {CollisionLabViewProperties} viewProperties
   * @param {ModelViewTransform2} modelViewTransform
   * @returns {IntroBallSystemNode}
   */
  createBallSystemNode( model, viewProperties, modelViewTransform ) {
    assert && assert( model instanceof IntroModel, `invalid model: ${model}` );
    assert && assert( viewProperties instanceof CollisionLabViewProperties, `invalid viewProperties: ${viewProperties}` );
    assert && assert( modelViewTransform instanceof ModelViewTransform2, `invalid modelViewTransform: ${modelViewTransform}` );

    return new IntroBallSystemNode( model.ballSystem,
      model.playArea,
      viewProperties.valuesVisibleProperty,
      viewProperties.velocityVectorVisibleProperty,
      viewProperties.momentumVectorVisibleProperty,
      model.isPlayingProperty,
      modelViewTransform );
  }
}

collisionLab.register( 'IntroScreenView', IntroScreenView );
export default IntroScreenView;