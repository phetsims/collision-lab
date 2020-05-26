// Copyright 2019-2020, University of Colorado Boulder

/**
 * @author Martin Veillette
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import CollisionLabModel from '../model/CollisionLabModel.js';
import BallNode from './BallNode.js';
import BallValuesPanel from './BallValuesPanel.js';
import CollisionLabControlPanel from './CollisionLabControlPanel.js';
import CollisionLabTimeControlNode from './CollisionLabTimeControlNode.js';
import CollisionLabViewProperties from './CollisionLabViewProperties.js';
import ElapsedTimeNumberDisplay from './ElapsedTimeNumberDisplay.js';
import KeypadDialog from './KeypadDialog.js';
import MoreDataCheckbox from './MoreDataCheckbox.js';
import PlayAreaControlSet from './PlayAreaControlSet.js';
import PlayAreaNode from './PlayAreaNode.js';
import RestartButton from './RestartButton.js';

// constants
const MODEL_TO_VIEW_SCALE = 190; // meter to view coordinates (1 m = 200 coordinates)
const SCREEN_VIEW_X_MARGIN = CollisionLabConstants.SCREEN_VIEW_X_MARGIN;
const SCREEN_VIEW_Y_MARGIN = CollisionLabConstants.SCREEN_VIEW_Y_MARGIN;
const PLAY_AREA_BOUNDS = CollisionLabConstants.PLAY_AREA_BOUNDS;

class CollisionLabScreenView extends ScreenView {

  /**
   * @param {CollisionLabModel} model
   * @param {Tandem} tandem
   */
  constructor( model, tandem ) {

    assert && assert( model instanceof CollisionLabModel, `invalid model: ${model}` );
    assert && assert( tandem instanceof Tandem, `invalid tandem: ${tandem}` );

    super();

    const playAreaViewBounds = Bounds2.rect( SCREEN_VIEW_X_MARGIN,
      SCREEN_VIEW_Y_MARGIN,
      MODEL_TO_VIEW_SCALE * PLAY_AREA_BOUNDS.width,
      MODEL_TO_VIEW_SCALE * PLAY_AREA_BOUNDS.height );

    const modelViewTransform = ModelViewTransform2.createRectangleInvertedYMapping(
      PLAY_AREA_BOUNDS,
      playAreaViewBounds
    );

    // create the view properties for the view
    const viewProperties = new CollisionLabViewProperties();

    const playAreaControlSet = new PlayAreaControlSet( model.numberOfBallsProperty, model.gridVisibleProperty );
    this.addChild( playAreaControlSet );

    // create the grid and border of the playArea
    const playAreaNode = new PlayAreaNode(
      model.playArea,
      model.gridVisibleProperty,
      viewProperties.kineticEnergyVisibleProperty,
      model.centerOfMassVisibleProperty,
      modelViewTransform
    );
    this.addChild( playAreaNode );

    const timeDisplay = new ElapsedTimeNumberDisplay( model.elapsedTimeProperty );
    this.addChild( timeDisplay );
    timeDisplay.left = SCREEN_VIEW_X_MARGIN;
    timeDisplay.top = playAreaNode.bottom + 10;

    playAreaControlSet.left = playAreaNode.right + 5;
    playAreaControlSet.top = 20;

    const collisionLabTimeControlNode = new CollisionLabTimeControlNode(
      model.playProperty,
      model.elasticityPercentProperty,
      model.timeSpeedProperty,
      model.playArea.playAreaUserControlledProperty,
      model.stepBackward.bind( model ),
      model.stepForward.bind( model )
    );
    const playPauseButtonCenter = playAreaNode.centerBottom.plusXY( 0, collisionLabTimeControlNode.height / 2 + 10 );
    collisionLabTimeControlNode.setPlayPauseButtonCenter( playPauseButtonCenter );
    this.addChild( collisionLabTimeControlNode );

    // create and add restart button
    const restartButton = new RestartButton( {
      listener: () => {
        // TODO: move this to a model method.
        // model.playArea.balls.forEach( ball => ball.reset() );
        // model.clock.reset();
      },
      right: playAreaNode.right,
      centerY: timeDisplay.centerY
    } );
    this.addChild( restartButton );

    const resetAllButton = new ResetAllButton( {
      listener: () => {
        model.reset();
        viewProperties.reset();
      },
      right: this.layoutBounds.maxX - SCREEN_VIEW_X_MARGIN,
      bottom: this.layoutBounds.maxY - SCREEN_VIEW_Y_MARGIN,
      tandem: tandem.createTandem( 'resetAllButton' )
    } );
    this.addChild( resetAllButton );


    const playAreaControlPanel = new CollisionLabControlPanel( viewProperties,
      model.centerOfMassVisibleProperty,
      model.pathVisibleProperty,
      model.reflectingBorderProperty,
      model.elasticityPercentProperty,
      model.isStickyProperty,
      model.constantRadiusProperty,
      {
        right: this.layoutBounds.maxX - SCREEN_VIEW_X_MARGIN,
        top: SCREEN_VIEW_Y_MARGIN
      } );
    this.addChild( playAreaControlPanel );

    this.ballLayerNode = new Node();
    this.addChild( this.ballLayerNode );

    const addItemAddedBallListener = addedBall => {

      const addedBallNode = new BallNode( addedBall,
        viewProperties.valuesVisibleProperty,
        viewProperties.velocityVisibleProperty,
        viewProperties.momentumVisibleProperty,
        model.gridVisibleProperty,
        model.playProperty,
        modelViewTransform );
      this.ballLayerNode.addChild( addedBallNode );

      // Observe when the ball is removed to unlink listeners
      const removeBallListener = removedBall => {
        if ( removedBall === addedBall ) {
          this.ballLayerNode.removeChild( addedBallNode );
          addedBallNode.dispose();
          model.playArea.balls.removeItemRemovedListener( removeBallListener );
        }
      };
      model.playArea.balls.addItemRemovedListener( removeBallListener );
    };

    model.playArea.balls.forEach( addItemAddedBallListener );
    model.playArea.balls.addItemAddedListener( addItemAddedBallListener );


    const keypad = new KeypadDialog();

    const ballValuesDisplay = new BallValuesPanel( model.playArea.balls, viewProperties.moreDataVisibleProperty, keypad );
    this.addChild( ballValuesDisplay );
    ballValuesDisplay.top = 420;
    ballValuesDisplay.left = SCREEN_VIEW_X_MARGIN;

    const moreDataCheckbox = new MoreDataCheckbox( viewProperties.moreDataVisibleProperty, {
      bottom: ballValuesDisplay.top - 4,
      left: SCREEN_VIEW_X_MARGIN
    } );
    this.addChild( moreDataCheckbox );
  }

  // @public
  step( dt ) {
    assert && assert( typeof dt === 'number', `invalid dt: ${dt}` );
  }
}

collisionLab.register( 'CollisionLabScreenView', CollisionLabScreenView );
export default CollisionLabScreenView;