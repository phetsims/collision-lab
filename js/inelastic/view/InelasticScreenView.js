// Copyright 2019-2020, University of Colorado Boulder

/**
 * Top level view for the 'Intro' screen.
 *
 * @author BrandonLi
 */

import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import collisionLab from '../../collisionLab.js';
import BallSystemNode from '../../common/view/BallSystemNode.js';
import CollisionLabControlPanel from '../../common/view/CollisionLabControlPanel.js';
import CollisionLabScreenView from '../../common/view/CollisionLabScreenView.js';
import CollisionLabViewProperties from '../../common/view/CollisionLabViewProperties.js';
import InelasticModel from '../model/InelasticModel.js';

class InelasticScreenView extends CollisionLabScreenView {


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

    return new CollisionLabControlPanel(
      viewProperties,
      model.ballSystem.centerOfMassVisibleProperty,
      model.ballSystem.pathsVisibleProperty,
      model.playArea.reflectingBorderProperty,
      model.playArea.elasticityPercentProperty,
      // model.playArea.inelasticCollisionTypeProperty,
      model.ballSystem.ballsConstantSizeProperty,
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