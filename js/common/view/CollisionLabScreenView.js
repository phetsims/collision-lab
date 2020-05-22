// Copyright 2019-2020, University of Colorado Boulder

/**
 * @author Martin Veillette
 */

import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Range from '../../../../dot/js/Range.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import GridCheckbox from '../../../../scenery-phet/js/GridCheckbox.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import NumberSpinner from '../../../../sun/js/NumberSpinner.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import collisionLab from '../../collisionLab.js';
import collisionLabStrings from '../../collisionLabStrings.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import CollisionLabModel from '../model/CollisionLabModel.js';
import BallNode from './BallNode.js';
import BallValuesPanel from './BallValuesPanel.js';
import CollisionLabTimeControlNode from './CollisionLabTimeControlNode.js';
import CollisionLabViewProperties from './CollisionLabViewProperties.js';
import ControlPanelCheckbox from './ControlPanelCheckbox.js';
import KeypadPlane from './KeypadPlane.js';
import PlayAreaControlPanel from './PlayAreaControlPanel.js';
import PlayAreaNode from './PlayAreaNode.js';
import RestartButton from './RestartButton.js';
import TimeDisplay from './TimeDisplay.js';

// constants
const MODEL_TO_VIEW_SCALE = 200; // meter to view coordinates (1 m = 200 coordinates)
const SCREEN_VIEW_X_MARGIN = CollisionLabConstants.SCREEN_VIEW_X_MARGIN;
const SCREEN_VIEW_Y_MARGIN = CollisionLabConstants.SCREEN_VIEW_Y_MARGIN;
const PLAY_AREA_BOUNDS = CollisionLabConstants.PLAY_AREA_BOUNDS;

const ballsString = collisionLabStrings.balls;
const moreDataString = collisionLabStrings.moreData;


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

    const ballsText = new Text( ballsString, { font: new PhetFont( 18 ) } );
    this.addChild( ballsText );

    // create and add number spinner for number of balls
    const numberOfBallsRange = new Range( 1, CollisionLabConstants.MAX_BALLS );
    const numberOfBallsSpinner = new NumberSpinner( model.numberOfBallsProperty, new Property( numberOfBallsRange ) );
    this.addChild( numberOfBallsSpinner );

    // create the grid and border of the playArea
    const playAreaNode = new PlayAreaNode(
      model.playArea,
      model.gridVisibleProperty,
      viewProperties.kineticEnergyVisibleProperty,
      viewProperties.centerOfMassVisibleProperty,
      modelViewTransform
    );
    this.addChild( playAreaNode );

    const timeDisplay = new TimeDisplay( model.elapsedTimeProperty );
    this.addChild( timeDisplay );
    timeDisplay.left = playAreaNode.left + 5;
    timeDisplay.top = playAreaNode.bottom + 5;

    numberOfBallsSpinner.left = playAreaNode.right + 5;
    ballsText.center = numberOfBallsSpinner.center;
    ballsText.top = 20;
    numberOfBallsSpinner.top = ballsText.bottom + 5;

    const collisionLabTimeControlNode = new CollisionLabTimeControlNode(
      model.playProperty,
      model.timeSpeedProperty,
      model.playArea.playAreaUserControlledProperty,
      model.stepBackward.bind( model ),
      model.stepForward.bind( model )
    );
    const playPauseButtonCenter = playAreaNode.centerBottom.plusXY( 0, collisionLabTimeControlNode.height / 2 + 5 );
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
      top: playAreaNode.bottom + 5
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

    const gridCheckbox = new GridCheckbox( model.gridVisibleProperty, {
      top: numberOfBallsSpinner.bottom + 5,
      left: numberOfBallsSpinner.left
    } );
    this.addChild( gridCheckbox );

    const playAreaControlPanel = new PlayAreaControlPanel( viewProperties,
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

    const moreDataCheckbox = new ControlPanelCheckbox( moreDataString, viewProperties.moreDataVisibleProperty );
    this.addChild( moreDataCheckbox );
    moreDataCheckbox.top = playAreaNode.bottom + 30;


    const keypad = new KeypadPlane();

    const ballValuesDisplay = new BallValuesPanel( model.playArea.balls, viewProperties.moreDataVisibleProperty, keypad );
    this.addChild( ballValuesDisplay );
    ballValuesDisplay.top = collisionLabTimeControlNode.bottom + 10;
    ballValuesDisplay.left = 40;
    this.addChild( keypad );
  }

  // @public
  step( dt ) {
    assert && assert( typeof dt === 'number', `invalid dt: ${dt}` );
  }
}

collisionLab.register( 'CollisionLabScreenView', CollisionLabScreenView );
export default CollisionLabScreenView;