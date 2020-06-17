// Copyright 2019-2020, University of Colorado Boulder

/**
 * Top level view for the 'Intro' screen.
 *
 * @author BrandonLi
 */

import merge from '../../../../phet-core/js/merge.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabConstants from '../../common/CollisionLabConstants.js';
import BallSystemNode from '../../common/view/BallSystemNode.js';
import CollisionLabControlPanel from '../../common/view/CollisionLabControlPanel.js';
import CollisionLabScreenView from '../../common/view/CollisionLabScreenView.js';
import IntroModel from '../../intro/model/IntroModel.js';

class Explore1DScreenView extends CollisionLabScreenView {

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
      playAreaControlSetOptions: {
        includeGridCheckbox: false
      }
    }, options );

    super( model, tandem, options );
  }

  /**
   * Creates the CollisionLabControlPanel for the 'Explore 1D' screen. Called in the constructor of the super-class.
   *
   * @override
   * @protected
   * @param {CollisionLabViewProperties} viewProperties
   * @param {CollisionLabModel} model
   * @returns {CollisionLabControlPanel}
   */
  createControlPanel( viewProperties, model ) {
    return new CollisionLabControlPanel(
      viewProperties,
      model.ballSystem.centerOfMassVisibleProperty,
      model.playArea.reflectingBorderProperty,
      model.playArea.elasticityPercentProperty,
      model.playArea.inelasticCollisionTypeProperty,
      model.ballSystem.ballsConstantSizeProperty
    );
  }

  /**
   * Creates the BallSystemNode for the 'Explore 1D' screen. Called in the constructor of the super-class.
   *
   * @override
   * @protected
   * @param {CollisionLabModel} model
   * @param {CollisionLabViewProperties} viewProperties
   * @param {ModelViewTransform2} modelViewTransform
   * @returns {BallSystemNode}
   */
  createBallSystemNode( model, viewProperties, modelViewTransform ) {
    return new BallSystemNode( model.ballSystem,
      model.playArea,
      viewProperties.valuesVisibleProperty,
      viewProperties.velocityVectorVisibleProperty,
      viewProperties.momentumVectorVisibleProperty,
      model.isPlayingProperty,
      modelViewTransform );
  }
}

collisionLab.register( 'Explore1DScreenView', Explore1DScreenView );
export default Explore1DScreenView;