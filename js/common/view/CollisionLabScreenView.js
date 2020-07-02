// Copyright 2019-2020, University of Colorado Boulder

/**
 * Root class (to be subclassed) for the top-level view of every screen in the 'Collision Lab' simulation.
 *
 * Displays these components:
 *   Balls
 *   PlayArea, Scale Bar, Kinetic Energy NumberDisplay
 *   PlayAreaControlSet
 *   Return Balls Button
 *   Restart button and Elapsed Time NumberDisplay
 *   BallValuesPanel
 *   Momenta Diagram
 *   Control Panel
 *   Time controls (play/pause, step buttons)
 *   Reset All Button
 *
 * @author Brandon Li
 * @author Martin Veillette
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import merge from '../../../../phet-core/js/merge.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import CollisionLabModel from '../model/CollisionLabModel.js';
import BallValuesPanel from './BallValuesPanel.js';
import CollisionLabTimeControlNode from './CollisionLabTimeControlNode.js';
import CollisionLabViewProperties from './CollisionLabViewProperties.js';
import ElapsedTimeNumberDisplay from './ElapsedTimeNumberDisplay.js';
import KeypadDialog from './KeypadDialog.js';
import KineticEnergyNumberDisplay from './KineticEnergyNumberDisplay.js';
import MomentaDiagramAccordionBox from './MomentaDiagramAccordionBox.js';
import MoreDataCheckbox from './MoreDataCheckbox.js';
import PlayAreaControlSet from './PlayAreaControlSet.js';
import PlayAreaNode from './PlayAreaNode.js';
import PlayAreaScaleBarNode from './PlayAreaScaleBarNode.js';
import RestartButton from './RestartButton.js';
import ReturnBallsButton from './ReturnBallsButton.js';
import PlayArea from '../model/PlayArea.js';

// constants
const MODEL_TO_VIEW_SCALE = 153; // Meter to view coordinates scale factor.
const PLAY_AREA_LEFT = 55;
const BALL_VALUES_PANEL_TOP = 420;

// @abstract
class CollisionLabScreenView extends ScreenView {

  /**
   * @param {CollisionLabModel} model
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( model, tandem, options ) {
    assert && assert( model instanceof CollisionLabModel, `invalid model: ${model}` );
    assert && assert( tandem instanceof Tandem, `invalid tandem: ${tandem}` );

    options = merge( {

      // {number} - the top of the PlayArea, in view coordinates.
      playAreaTop: CollisionLabConstants.SCREEN_VIEW_Y_MARGIN,

      // {boolean} - indicates if the PlayAreaControlSet is included.
      includePlayAreaControlSet: true,

      // {Object} - options to passed to the PlayAreaControlSet. Ignored if includePlayAreaControlSet is false.
      playAreaControlSetOptions: null

    }, options );

    super( options );

    //----------------------------------------------------------------------------------------

    // Create the ModelViewTransform for the view hierarchy, which maps the coordinates of the PlayArea (meters) to view
    // coordinates. Uses an inverted mapping so that +y is downwards in the view coordinate frame.
    const modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping(
      new Vector2( model.playArea.left, model.playArea.top ),
      new Vector2( PLAY_AREA_LEFT, options.playAreaTop ),
      MODEL_TO_VIEW_SCALE
    );

    // Create the view-specific properties for the screen.
    const viewProperties = new CollisionLabViewProperties();

    // Convenience reference to the view-bounds of the PlayArea. Used for layout.
    const playAreaViewBounds = modelViewTransform.modelToViewBounds( model.playArea.bounds );

    //----------------------------------------------------------------------------------------

    // PlayArea
    const playAreaNode = new PlayAreaNode( model.playArea, model.playArea.gridVisibleProperty, modelViewTransform );

    // BallSystem
    const ballSystemNode = this.createBallSystemNode( model, viewProperties, modelViewTransform );

    // Scale Bar
    const scaleBar = new PlayAreaScaleBarNode( 0.5, modelViewTransform, {
      scaleBarOrientation: model.playArea.dimensions === PlayArea.Dimensions.ONE ? Orientation.HORIZONTAL : Orientation.VERTICAL
    } );
    model.playArea.dimensions === PlayArea.Dimensions.ONE && scaleBar.setLeftBottom( playAreaViewBounds.leftTop.minusXY( 0, 5 ) );
    model.playArea.dimensions === PlayArea.Dimensions.TWO && scaleBar.setRightTop( playAreaViewBounds.leftTop.minusXY( 5, 0 ) );

    // Kinetic Energy NumberDisplay
    const kineticEnergyNumberDisplay = new KineticEnergyNumberDisplay(
      model.ballSystem.totalKineticEnergyProperty,
      viewProperties.kineticEnergyVisibleProperty, {
        left: playAreaViewBounds.left + 5,
        bottom: playAreaViewBounds.bottom - 5
      } );

    // Return Balls Button
    const returnBallsButton = new ReturnBallsButton( model.ballSystem.ballsNotInsidePlayAreaProperty, {
      center: playAreaViewBounds.center,
      listener: model.returnBalls.bind( model )
    } );

    //----------------------------------------------------------------------------------------

    // Elapsed Time NumberDisplay
    const elapsedTimeNumberDisplay = new ElapsedTimeNumberDisplay( model.elapsedTimeProperty, {
      left: playAreaViewBounds.left,
      top: playAreaViewBounds.bottom + 10
    } );

    // Time controls (play/pause, step buttons)
    const timeControlNode = new CollisionLabTimeControlNode(
      model.isPlayingProperty,
      model.timeSpeedProperty,
      model.elapsedTimeProperty,
      model.ballSystem.ballSystemUserControlledProperty,
      model.playArea.elasticityPercentProperty, {
        playPauseStepButtonOptions: {
          stepBackwardButtonOptions: { listener: model.stepBackward.bind( model ) },
          stepForwardButtonOptions: { listener: model.stepForward.bind( model ) }
        }
      } );
    timeControlNode.setPlayPauseButtonCenter( playAreaNode.centerBottom.plusXY( 0, timeControlNode.height / 2 + 10 ) );

    // Restart Button
    const restartButton = new RestartButton( {
      listener: model.restart.bind( model ),
      right: playAreaViewBounds.right,
      centerY: elapsedTimeNumberDisplay.centerY
    } );

    // Reset All Button
    const resetAllButton = new ResetAllButton( {
      listener: () => {
        model.reset();
        viewProperties.reset();
      },
      right: this.layoutBounds.maxX - CollisionLabConstants.SCREEN_VIEW_X_MARGIN,
      bottom: this.layoutBounds.maxY - CollisionLabConstants.SCREEN_VIEW_Y_MARGIN
    } );

    //----------------------------------------------------------------------------------------

    // KeypadDialog
    const keypadDialog = new KeypadDialog( {
      layoutStrategy: ( keypadDialog, simBounds, screenBounds, scale ) => {
        keypadDialog.leftBottom = this.localToGlobalPoint( ballValuesPanel.rightBottom.plusXY( 10, 0 ) )
                                      .times( 1 / scale );
      }
    } );

    // BallValuesPanel
    const ballValuesPanel = new BallValuesPanel(
      model.ballSystem,
      viewProperties.moreDataVisibleProperty,
      model.playArea.dimensions,
      keypadDialog, {
        top: BALL_VALUES_PANEL_TOP,
        left: playAreaViewBounds.left
      } );

    // More Data Checkbox
    const moreDataCheckbox = new MoreDataCheckbox( viewProperties.moreDataVisibleProperty, {
      bottom: ballValuesPanel.top - 4,
      left: playAreaViewBounds.left
    } );

    // ControlPanel
    const controlPanel = this.createControlPanel( viewProperties, model, {
      right: this.layoutBounds.maxX - CollisionLabConstants.SCREEN_VIEW_X_MARGIN,
      top: CollisionLabConstants.SCREEN_VIEW_Y_MARGIN
    } );

    // Momenta Diagram
    const momentaDiagram = new MomentaDiagramAccordionBox( model.momentaDiagram, model.ballSystem.balls, {
      dimensions: model.playArea.dimensions,
      centerX: controlPanel.centerX,
      top: controlPanel.bottom + 8
    } );

    //----------------------------------------------------------------------------------------

    // Set the children in the correct rendering order.
    this.children = [
      playAreaNode,
      scaleBar,
      elapsedTimeNumberDisplay,
      timeControlNode,
      restartButton,
      resetAllButton,
      ballValuesPanel,
      moreDataCheckbox,
      controlPanel,
      momentaDiagram,
      kineticEnergyNumberDisplay,
      ballSystemNode,
      returnBallsButton
    ];

    //----------------------------------------------------------------------------------------

    // Add the PlayAreaControlSet if it is included.
    if ( options.includePlayAreaControlSet ) {
      const playAreaControlSet = new PlayAreaControlSet(
        model.ballSystem.numberOfBallsProperty,
        model.ballSystem.numberOfBallsRange,
        model.playArea.gridVisibleProperty, merge( {
          left: playAreaViewBounds.right + 5,
          top: playAreaViewBounds.top + 5
        }, options.playAreaControlSetOptions ) );

      this.addChild( playAreaControlSet );
      playAreaControlSet.moveToBack();
    }

    // @protected
    this.playAreaViewBounds = playAreaViewBounds;
  }

  /**
   * @abstract
   * Creates the ControlPanel for the screen. Called in the constructor of the CollisionLabScreenView. This is an
   * abstract method because some screens use sub-types of CollisionLabControlPanel and have different APIs, but all
   * screens have a CollisionLabControlPanel.
   *
   * @protected
   * @param {CollisionLabViewProperties} viewProperties
   * @param {CollisionLabModel} model
   * @param {Object} [options]
   * @returns {CollisionLabControlPanel}
   */
  createControlPanel( viewProperties, model, options ) { assert && assert( false, 'abstract method must be overridden' ); }

  /**
   * @abstract
   * Creates the ControlPanel for the screen. Called in the constructor of the CollisionLabScreenView. This is an
   * abstract method because some screens use sub-types of BallSystemNode, but all screens have a BallSystemNode.
   *
   * @protected
   * @param {CollisionLabModel} model
   * @param {CollisionLabViewProperties} viewProperties
   * @param {ModelViewTransform2} modelViewTransform
   * @returns {BallSystemNode}
   */
  createBallSystemNode( model, viewProperties, modelViewTransform ) { assert && assert( false, 'abstract method must be overridden' ); }
}

collisionLab.register( 'CollisionLabScreenView', CollisionLabScreenView );
export default CollisionLabScreenView;