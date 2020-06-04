// Copyright 2019-2020, University of Colorado Boulder

/**
 * Top level view for the 'Explore2D' screen.
 *
 * @author BrandonLi
 */

import Tandem from '../../../../tandem/js/Tandem.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabScreenView from '../../common/view/CollisionLabScreenView.js';
import Explore2DBallSystemNode from './Explore2DBallSystemNode.js';
import Explore2DControlPanel from './Explore2DControlPanel.js';

class Explore2DScreenView extends CollisionLabScreenView {

  /**
   * @param {Explore2DModel} model
   * @param {Tandem} tandem
   */
  constructor( model, tandem ) {

    assert && assert( tandem instanceof Tandem, `invalid tandem: ${tandem}` );

    super( model, tandem );
  }


  createControlPanel( viewProperties, model ) {
    return new Explore2DControlPanel( viewProperties,
      model.ballSystem.centerOfMassVisibleProperty,
      model.ballSystem.pathVisibleProperty,
      model.playArea.reflectingBorderProperty,
      model.playArea.elasticityPercentProperty,
      model.playArea.inelasticCollisionTypeProperty,
      model.ballSystem.isBallConstantSizeProperty );
  }

  createBallSystemNode( model, viewProperties, modelViewTransform ) {
    return new Explore2DBallSystemNode( model.ballSystem,
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