// Copyright 2019-2020, University of Colorado Boulder

/**
 * Top level view for the 'Intro' screen.
 *
 * @author BrandonLi
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabConstants from '../../common/CollisionLabConstants.js';
import CollisionLabControlPanel from '../../common/view/CollisionLabControlPanel.js';
import CollisionLabScreenView from '../../common/view/CollisionLabScreenView.js';

class Explore1DScreenView extends CollisionLabScreenView {

  /**
   * @param {IntroModel} model
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( model, tandem ) {
    assert && assert( model instanceof IntroModel, `invalid model: ${model}` );
    assert && assert( tandem instanceof Tandem, `invalid tandem: ${tandem}` );

    // Create the ControlPanel for the 'Explore 1D' screen.
    const controlPanel = new CollisionLabControlPanel( viewProperties,
      model.ballSystem.centerOfMassVisibleProperty,
      model.playArea.reflectingBorderProperty,
      model.playArea.elasticityPercentProperty,
      model.playArea.inelasticCollisionTypeProperty,
      model.ballSystem.ballsConstantSizeProperty, {
        elasticityControlSetNodeOptions: {
          includeStickSlipSwitch: false
        }
      } );

    // Create the BallSystemNode for the 'Explore 1D' screen.

    super( model, tandem, {
      playAreaLeftTop: new Vector2( CollisionLabConstants.PLAY_AREA_LEFT, CollisionLabConstants.PLAY_AREA_VIEW_TOP_1D ),
      playAreaControlSetOptions: {
        includeGridCheckbox: false
      }
    } );
  }

  // @protected
  createControlPanel( viewProperties, model ) {
    return
  }
}

collisionLab.register( 'Explore1DScreenView', Explore1DScreenView );
export default Explore1DScreenView;