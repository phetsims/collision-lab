// Copyright 2019-2020, University of Colorado Boulder

/**
 * @author Martin Veillette
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Range from '../../../../dot/js/Range.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import GridCheckbox from '../../../../scenery-phet/js/GridCheckbox.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Image from '../../../../scenery/js/nodes/Image.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import HSlider from '../../../../sun/js/HSlider.js';
import NumberSpinner from '../../../../sun/js/NumberSpinner.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import mockupScreen2DLabImage from '../../../images/mockup-screen-2DLab_png.js';
import collisionLabStrings from '../../collisionLabStrings.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import CollisionLabModel from '../model/CollisionLabModel.js'; // TODO: #13
import BallNode from './BallNode.js';
import BallValuesPanel from './BallValuesPanel.js';
import CollisionLabKeypad from './CollisionLabKeypad.js';
import CollisionLabTimeControlNode from './CollisionLabTimeControlNode.js';
import CollisionLabViewProperties from './CollisionLabViewProperties.js';
import ControlPanelCheckbox from './ControlPanelCheckbox.js';
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

    // mockup image and transparency slider
    const transparencyProperty = new NumberProperty( 0 );
    const backgroundImage = new Image( mockupScreen2DLabImage, { scale: 0.66 } );
    const transparencySlider = new HSlider( transparencyProperty, new Range( 0, 1 ), { x: 600, y: 500 } );
    transparencyProperty.link( transparency => {backgroundImage.imageOpacity = transparency;} );
    this.setChildren( [ backgroundImage, transparencySlider ] );

    // create the view properties for the view
    const viewProperties = new CollisionLabViewProperties();

    const ballsText = new Text( ballsString, { font: new PhetFont( 18 ) } );
    this.addChild( ballsText );

    // create and add number spinner for number of balls
    const numberOfBallsRange = new Range( 0, CollisionLabConstants.MAX_BALLS );
    const numberOfBallsSpinner = new NumberSpinner( model.playArea.numberOfBallsProperty, new Property( numberOfBallsRange ) );
    this.addChild( numberOfBallsSpinner );

    // create the grid and border of the playArea
    const playAreaNode = new PlayAreaNode(
      model.playArea,
      viewProperties.gridVisibleProperty,
      viewProperties.kineticEnergyVisibleProperty,
      viewProperties.centerOfMassVisibleProperty,
      modelViewTransform
    );
    this.addChild( playAreaNode );

    const timeDisplay = new TimeDisplay( model.timeClock.elapsedTimeProperty );
    this.addChild( timeDisplay );
    timeDisplay.left = playAreaNode.left + 5;
    timeDisplay.top = playAreaNode.bottom + 5;

    numberOfBallsSpinner.left = playAreaNode.right + 5;
    ballsText.center = numberOfBallsSpinner.center;
    ballsText.top = 20;
    numberOfBallsSpinner.top = ballsText.bottom + 5;

    const collisionLabTimeControlNode = new CollisionLabTimeControlNode(
      model.playProperty,
      model.timeControlSpeedProperty,
      model.playAreaFreeProperty,
      model.timeClock.stepBackward.bind( model.timeClock ),
      model.timeClock.stepForward.bind( model.timeClock ), {
        centerX: playAreaNode.centerX + 50,
        top: playAreaNode.bottom + 10
      } );
    this.addChild( collisionLabTimeControlNode );

    // create and add restart button
    const restartButton = new RestartButton( {
      listener: () => {
        model.balls.forEach( ball =>
          ball.reset() );
        model.timeClock.reset();
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

    const gridCheckbox = new GridCheckbox( viewProperties.gridVisibleProperty, {
      top: numberOfBallsSpinner.bottom + 5,
      left: numberOfBallsSpinner.left
    } );
    this.addChild( gridCheckbox );

    const playAreaControlPanel = new PlayAreaControlPanel( viewProperties,
      model.playArea.reflectingBorderProperty,
      model.playArea.elasticityPercentProperty,
      model.playArea.isStickyProperty,
      model.playArea.constantRadiusProperty,
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
        viewProperties.gridVisibleProperty,
        model.playProperty,
        modelViewTransform );
      this.ballLayerNode.addChild( addedBallNode );

      // Observe when the ball is removed to unlink listeners
      const removeBallListener = removedBall => {
        if ( removedBall === addedBall ) {
          this.ballLayerNode.removeChild( addedBallNode );
          addedBallNode.dispose();
          model.balls.removeItemRemovedListener( removeBallListener );
        }
      };
      model.balls.addItemRemovedListener( removeBallListener );
    };

    model.balls.forEach( addItemAddedBallListener );
    model.balls.addItemAddedListener( addItemAddedBallListener );

    const moreDataCheckbox = new ControlPanelCheckbox( moreDataString, viewProperties.moreDataVisibleProperty );
    this.addChild( moreDataCheckbox );
    moreDataCheckbox.top = playAreaNode.bottom + 30;

    const ballValuesDisplay = new BallValuesPanel( model.balls, viewProperties.moreDataVisibleProperty );
    this.addChild( ballValuesDisplay );
    ballValuesDisplay.top = collisionLabTimeControlNode.bottom + 10;
    ballValuesDisplay.left = 40;

    backgroundImage.moveToFront();
    transparencySlider.moveToFront();

    const keypad = new CollisionLabKeypad();
    this.addChild( keypad );
  }

  // @public
  step( dt ) {
    assert && assert( typeof dt === 'number', `invalid dt: ${dt}` );
  }
}

collisionLab.register( 'CollisionLabScreenView', CollisionLabScreenView );
export default CollisionLabScreenView;