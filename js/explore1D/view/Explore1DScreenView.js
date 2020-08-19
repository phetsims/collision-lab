// Copyright 2019-2020, University of Colorado Boulder

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
import BallSystemNode from '../../common/view/BallSystemNode.js';
import CollisionLabControlPanel from '../../common/view/CollisionLabControlPanel.js';
import CollisionLabScreenView from '../../common/view/CollisionLabScreenView.js';
import CollisionLabViewProperties from '../../common/view/CollisionLabViewProperties.js';
import Explore1DModel from '../model/Explore1DModel.js';

class Explore1DScreenView extends CollisionLabScreenView {

  /**
   * @param {Explore1DModel} model
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( model, tandem, options ) {
    assert && assert( model instanceof Explore1DModel, `invalid model: ${model}` );
    assert && assert( tandem instanceof Tandem, `invalid tandem: ${tandem}` );

    options = merge( {

      playAreaTop: CollisionLabConstants.PLAY_AREA_VIEW_TOP_1D,
      playAreaTopRightControlsOptions: {
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
   * @param {Explore1DModel} model
   * @param {Object} [options]
   * @returns {CollisionLabControlPanel}
   */
  createControlPanel( viewProperties, model, options ) {
    assert && assert( viewProperties instanceof CollisionLabViewProperties, `invalid viewProperties: ${viewProperties}` );
    assert && assert( model instanceof Explore1DModel, `invalid model: ${model}` );

    return new CollisionLabControlPanel(
      viewProperties,
      model.ballSystem.centerOfMassVisibleProperty,
      model.ballSystem.pathsVisibleProperty,
      model.playArea.reflectingBorderProperty,
      model.playArea.elasticityPercentProperty,
      model.ballSystem.ballsConstantSizeProperty,
      merge( options, {
        includePathCheckbox: false
      } ) );
  }

  /**
   * Creates the BallSystemNode for the 'Explore 1D' screen. Called in the constructor of the super-class.
   *
   * @override
   * @protected
   * @param {Explore1DModel} model
   * @param {CollisionLabViewProperties} viewProperties
   * @param {ModelViewTransform2} modelViewTransform
   * @returns {BallSystemNode}
   */
  createBallSystemNode( model, viewProperties, modelViewTransform ) {
    assert && assert( model instanceof Explore1DModel, `invalid model: ${model}` );
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

collisionLab.register( 'Explore1DScreenView', Explore1DScreenView );
export default Explore1DScreenView;