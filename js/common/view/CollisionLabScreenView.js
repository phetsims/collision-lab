// Copyright 2019-2022, University of Colorado Boulder

/**
 * Root class (to be subclassed) for the top-level view of every screen in the 'Collision Lab' simulation.
 *
 * Displays these components:
 *   Balls
 *   PlayArea, Scale Bar, Kinetic Energy NumberDisplay
 *   PlayAreaTopRightControls
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
import CollisionLabColors from '../CollisionLabColors.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import CollisionLabModel from '../model/CollisionLabModel.js';
import PlayArea from '../model/PlayArea.js';
import BallValuesPanel from './BallValuesPanel.js';
import CollisionLabTimeControlNode from './CollisionLabTimeControlNode.js';
import CollisionLabViewProperties from './CollisionLabViewProperties.js';
import ElapsedTimeNumberDisplay from './ElapsedTimeNumberDisplay.js';
import KeypadDialog from '../../../../scenery-phet/js/keypad/KeypadDialog.js';
import KineticEnergyNumberDisplay from './KineticEnergyNumberDisplay.js';
import MomentaDiagramAccordionBox from './MomentaDiagramAccordionBox.js';
import MoreDataCheckbox from './MoreDataCheckbox.js';
import PlayAreaNode from './PlayAreaNode.js';
import PlayAreaScaleBarNode from './PlayAreaScaleBarNode.js';
import PlayAreaTopRightControls from './PlayAreaTopRightControls.js';
import RestartButton from './RestartButton.js';
import ReturnBallsButton from './ReturnBallsButton.js';
import { ManualConstraint } from '../../../../scenery/js/imports.js';

// constants
const MODEL_TO_VIEW_SCALE = 152; // Meter to view coordinates scale factor.
const PLAY_AREA_LEFT = 55;
const BALL_VALUES_PANEL_TOP = 410;

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

      // {boolean} - indicates if the PlayAreaTopRightControls is included.
      includePlayAreaTopRightControls: true,

      // {boolean}
      includeStepBack: true,

      // {Object} - options to passed to the PlayAreaTopRightControls, if it is included.
      playAreaTopRightControlsOptions: null

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

    // @private {BallSystem}
    this.ballSystemNode = this.createBallSystemNode( model, viewProperties, modelViewTransform );

    // Scale Bar
    const scaleBar = new PlayAreaScaleBarNode( 0.5, modelViewTransform, {
      scaleBarOrientation: model.playArea.dimension === PlayArea.Dimension.ONE ? Orientation.HORIZONTAL : Orientation.VERTICAL
    } );
    ManualConstraint.create( this, [ scaleBar ], scaleBarProxy => {
      if ( model.playArea.dimension === PlayArea.Dimension.ONE ) {
        scaleBarProxy.leftBottom = playAreaViewBounds.leftTop.minusXY( 0, 5 );
      }
      else {
        scaleBarProxy.rightTop = playAreaViewBounds.leftTop.minusXY( 5, 0 );
      }
    } );

    // Kinetic Energy NumberDisplay
    const kineticEnergyNumberDisplay = new KineticEnergyNumberDisplay(
      model.ballSystem.totalKineticEnergyProperty, {
        visibleProperty: viewProperties.kineticEnergyVisibleProperty,
        left: playAreaViewBounds.left + 5,
        bottom: playAreaViewBounds.bottom - 3
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
          stepBackwardButtonOptions: { listener: model.stepBackwards.bind( model ) },
          stepForwardButtonOptions: { listener: model.stepForwards.bind( model ) },
          includeStepBackwardButton: options.includeStepBack
        }
      } );
    timeControlNode.setPlayPauseButtonCenter( playAreaViewBounds.centerBottom.plusXY( 0, timeControlNode.height / 2 + 10 ) );

    // Restart Button
    const restartButton = new RestartButton( {
      listener: () => {
        this.interruptSubtreeInput();
        model.restart();
      },
      right: playAreaViewBounds.right,
      top: elapsedTimeNumberDisplay.top
    } );

    //----------------------------------------------------------------------------------------

    // KeypadDialog
    const keypadDialog = new KeypadDialog( {
      layoutStrategy: ( keypadDialog, simBounds, screenBounds, scale ) => {
        keypadDialog.leftBottom = this.ballValuesPanel.rightBottom.plusXY( 10, 0 );
      },
      keypadOptions: {
        accumulatorOptions: {

          // {number} - maximum number of digits that can be entered on the keypad.
          maxDigits: 8,

          // {number} - maximum number of decimal places that can be entered on the keypad.
          maxDigitsRightOfMantissa: CollisionLabConstants.DISPLAY_DECIMAL_PLACES
        }
      },
      enterButtonOptions: {
        baseColor: CollisionLabColors.KEYPAD_ENTER_BUTTON
      },
      fill: CollisionLabColors.PANEL_FILL,
      stroke: CollisionLabColors.PANEL_STROKE
    } );

    // @protected - BallValuesPanel, exposed to sub-classes for layout.
    this.ballValuesPanel = new BallValuesPanel(
      model.ballSystem,
      viewProperties.moreDataVisibleProperty,
      model.playArea.dimension,
      keypadDialog, {
        top: BALL_VALUES_PANEL_TOP,
        left: playAreaViewBounds.left
      } );

    // More Data Checkbox
    const moreDataCheckbox = new MoreDataCheckbox( viewProperties.moreDataVisibleProperty, {
      bottom: this.ballValuesPanel.top - 4,
      left: playAreaViewBounds.left
    } );

    // ControlPanel
    const controlPanel = this.createControlPanel( viewProperties, model, {
      right: this.layoutBounds.maxX - CollisionLabConstants.SCREEN_VIEW_X_MARGIN,
      top: CollisionLabConstants.SCREEN_VIEW_Y_MARGIN
    } );

    // Momenta Diagram
    const momentaDiagram = new MomentaDiagramAccordionBox( model.momentaDiagram, model.ballSystem.balls, {
      dimension: model.playArea.dimension,
      centerX: controlPanel.centerX,
      top: controlPanel.bottom + 8
    } );

    // Reset All Button
    const resetAllButton = new ResetAllButton( {
      listener: () => {
        this.interruptSubtreeInput();
        model.reset();
        viewProperties.reset();
        this.ballSystemNode.reset();
      },
      right: this.layoutBounds.maxX - CollisionLabConstants.SCREEN_VIEW_X_MARGIN,
      bottom: this.layoutBounds.maxY - CollisionLabConstants.SCREEN_VIEW_Y_MARGIN
    } );

    //----------------------------------------------------------------------------------------

    // Set the children in the correct rendering order.
    this.children = [
      this.ballValuesPanel,
      moreDataCheckbox,
      playAreaNode,
      scaleBar,
      elapsedTimeNumberDisplay,
      timeControlNode,
      restartButton,
      resetAllButton,
      controlPanel,
      momentaDiagram,
      kineticEnergyNumberDisplay,
      this.ballSystemNode,
      returnBallsButton
    ];

    //----------------------------------------------------------------------------------------

    // Add the PlayAreaTopRightControls if it is included.
    if ( options.includePlayAreaTopRightControls ) {
      const playAreaControlSet = new PlayAreaTopRightControls(
        model.ballSystem.numberOfBallsProperty,
        model.ballSystem.numberOfBallsRange,
        model.playArea.gridVisibleProperty, merge( {
          left: playAreaViewBounds.right + 8,
          top: playAreaViewBounds.top + 2
        }, options.playAreaTopRightControlsOptions ) );

      this.addChild( playAreaControlSet );
      playAreaControlSet.moveToBack();
    }
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