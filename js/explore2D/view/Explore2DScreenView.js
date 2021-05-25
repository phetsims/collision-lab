// Copyright 2019-2021, University of Colorado Boulder

/**
 * Top level view for the 'Explore2D' screen.
 *
 * @author BrandonLi
 */

import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import collisionLab from '../../collisionLab.js';
import BallSystemNode from '../../common/view/BallSystemNode.js';
import CollisionLabScreenView from '../../common/view/CollisionLabScreenView.js';
import CollisionLabViewProperties from '../../common/view/CollisionLabViewProperties.js';
import Explore2DModel from '../model/Explore2DModel.js';
import Explore2DControlPanel from './Explore2DControlPanel.js';

class Explore2DScreenView extends CollisionLabScreenView {

  /**
   * Creates the CollisionLabControlPanel for the 'Explore 2D' screen. Called in the constructor of the super-class. For
   * this screen, his method will instantiate a sub-type of CollisionLabControlPanel: Explore2DControlPanel.
   *
   * @override
   * @protected
   * @param {CollisionLabViewProperties} viewProperties
   * @param {Explore2DModel} model
   * @param {Object} [options]
   * @returns {Explore2DControlPanel}
   */
  createControlPanel( viewProperties, model, options ) {
    assert && assert( viewProperties instanceof CollisionLabViewProperties, `invalid viewProperties: ${viewProperties}` );
    assert && assert( model instanceof Explore2DModel, `invalid model: ${model}` );

    return new Explore2DControlPanel(
      viewProperties,
      model.ballSystem.centerOfMassVisibleProperty,
      model.ballSystem.pathsVisibleProperty,
      model.playArea.reflectingBorderProperty,
      model.playArea.elasticityPercentProperty,
      model.playArea.enabledElasticityRange,
      model.ballSystem.ballsConstantSizeProperty,
      options
    );
  }

  /**
   * Creates the BallSystemNode for the 'Explore 2D' screen. Called in the constructor of the super-class. For this
   * screen, his method will instantiate a sub-type of BallSystemNode: Explore2DBallSystemNode.
   *
   * @override
   * @protected
   * @param {Explore2DModel} model
   * @param {CollisionLabViewProperties} viewProperties
   * @param {ModelViewTransform2} modelViewTransform
   * @returns {Explore2DBallSystemNode}
   */
  createBallSystemNode( model, viewProperties, modelViewTransform ) {
    assert && assert( model instanceof Explore2DModel, `invalid model: ${model}` );
    assert && assert( viewProperties instanceof CollisionLabViewProperties, `invalid viewProperties: ${viewProperties}` );
    assert && assert( modelViewTransform instanceof ModelViewTransform2, `invalid modelViewTransform: ${modelViewTransform}` );

    return new BallSystemNode( model.ballSystem,
      model.playArea,
      viewProperties.valuesVisibleProperty,
      viewProperties.velocityVectorVisibleProperty,
      viewProperties.momentumVectorVisibleProperty,
      model.isPlayingProperty,
      modelViewTransform );
  }
}

collisionLab.register( 'Explore2DScreenView', Explore2DScreenView );
export default Explore2DScreenView;