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
import BallSystemNode from './BallSystemNode.js';
import BallValuesPanel from './BallValuesPanel.js';
import CollisionLabControlPanel from './CollisionLabControlPanel.js';
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

// constants
const MODEL_TO_VIEW_SCALE = 153; // Meter to view coordinates scale factor.
const PLAY_AREA_LEFT = 55;
const BALL_VALUES_PANEL_TOP = 420;

class CollisionLabScreenView extends ScreenView {

  /**
   * @param {CollisionLabModel} model
   * @param {CollisionLabControlPanel} controlPanel
   * @param {BallSystemNode} ballSystemNode
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( model,
               controlPanel,
               ballSystemNode,
               tandem,
               options ) {
    assert && assert( model instanceof CollisionLabModel, `invalid model: ${model}` );
    assert && assert( controlPanel instanceof CollisionLabControlPanel, `invalid controlPanel: ${controlPanel}` );
    assert && assert( ballSystemNode instanceof BallSystemNode, `invalid ballSystemNode: ${ballSystemNode}` );
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

    // Convenience reference to the view-bounds of the PlayArea. Used for layouting.
    const playAreaViewBounds = modelViewTransform.modelToViewBounds( model.playArea.bounds );

    //----------------------------------------------------------------------------------------

    // PlayArea
    const playAreaNode = new PlayAreaNode(
      model.playArea,
      model.playArea.gridVisibleProperty,
      viewProperties.kineticEnergyVisibleProperty,
      modelViewTransform
    );

    // Scale Bar
    const scaleBar = new PlayAreaScaleBarNode( 0.5, modelViewTransform, {
      scaleBarOrientation: model.playArea.dimensions === 1 ? Orientation.HORIZONTAL : Orientation.VERTICAL,
      leftBottom: model.playArea.dimensions === 1 ? playAreaViewBounds.leftTop.minusXY( 0, 5 ) : null,
      rightTop: model.playArea.dimensions === 2 ? playAreaViewBounds.leftTop.minusXY( 5, 0 ) : null
    } );

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
      model.playArea.elasticityPercentProperty,
      model.elapsedTimeProperty,
      model.timeSpeedProperty,
      model.ballSystem.ballSystemUserControlledProperty,
      model.stepBackward.bind( model ),
      model.stepForward.bind( model )
    );
    timeControlNode.setPlayPauseButtonCenter( playAreaViewBounds.centerBottom.plusXY( 0, timeControlNode.height / 2 + 10 ) );

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

    // Position the ControlPanel
    controlPanel.right = this.layoutBounds.maxX - CollisionLabConstants.SCREEN_VIEW_X_MARGIN;
    controlPanel.top = CollisionLabConstants.SCREEN_VIEW_Y_MARGIN;

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
      ballSystemNode,
      returnBallsButton,
      kineticEnergyNumberDisplay
    ];

    //----------------------------------------------------------------------------------------

    // Add the PlayAreaControlSet if it is included.
    if ( options.includePlayAreaControlSet ) {

      const playAreaControlSet = new PlayAreaControlSet(
        model.ballSystem.numberOfBallsProperty,
        model.ballSystem.numberOfBallsRange,
        model.playArea.gridVisibleProperty, merge( {
          left: playAreaViewBounds.left + 5,
          top: playAreaViewBounds.top + 5
        }, options.playAreaControlSetOptions ) );

      this.addChild( playAreaControlSet );
      playAreaControlSet.moveToBack();
    }
  }
}

collisionLab.register( 'CollisionLabScreenView', CollisionLabScreenView );
export default CollisionLabScreenView;