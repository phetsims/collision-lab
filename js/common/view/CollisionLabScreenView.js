// Copyright 2019-2020, University of Colorado Boulder

/**
 * @author Brandon Li
 * @author Martin Veillette
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import merge from '../../../../phet-core/js/merge.js';
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
import RestartButton from './RestartButton.js';
import ReturnMassesButton from './ReturnMassesButton.js';

// constants
const MODEL_TO_VIEW_SCALE = 153; // meter to view coordinates (1 m = 200 coordinates)
const SCREEN_VIEW_X_MARGIN = CollisionLabConstants.SCREEN_VIEW_X_MARGIN;
const SCREEN_VIEW_Y_MARGIN = CollisionLabConstants.SCREEN_VIEW_Y_MARGIN;
const KINETIC_ENERGY_DISPLAY_MARGIN = 5;

class CollisionLabScreenView extends ScreenView {

  /**
   * @param {CollisionLabModel} model
   * @param {Tandem} tandem
   */
  constructor( model, tandem, options ) {

    assert && assert( model instanceof CollisionLabModel, `invalid model: ${model}` );
    assert && assert( tandem instanceof Tandem, `invalid tandem: ${tandem}` );

    super();

    options = merge( {

      playAreaLeftTop: new Vector2( SCREEN_VIEW_X_MARGIN, SCREEN_VIEW_Y_MARGIN ),

      includePlayAreaControlSet: true,
      playAreaControlSetOptions: null,

      controlPanelOptions: null

    }, options );

    const modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping(
      model.playArea.bounds.leftBottom,
      options.playAreaLeftTop,
      MODEL_TO_VIEW_SCALE
    );

    // create the view properties for the view
    const viewProperties = new CollisionLabViewProperties();

    // create the grid and border of the playArea
    const playAreaNode = new PlayAreaNode(
      model.playArea,
      model.playArea.gridVisibleProperty,
      viewProperties.kineticEnergyVisibleProperty,
      modelViewTransform
    );
    this.addChild( playAreaNode );

    const ballSystemNode = this.createBallSystemNode( model, viewProperties, modelViewTransform );
    this.addChild( ballSystemNode );


    const kineticEnergyDisplay = new KineticEnergyNumberDisplay( model.ballSystem.totalKineticEnergyProperty,
      viewProperties.kineticEnergyVisibleProperty, {
        left: playAreaNode.left + KINETIC_ENERGY_DISPLAY_MARGIN,
        bottom: playAreaNode.bottom - KINETIC_ENERGY_DISPLAY_MARGIN
      } );
    this.addChild( kineticEnergyDisplay );



    if ( options.includePlayAreaControlSet ) {
      const playAreaControlSet = new PlayAreaControlSet( model.ballSystem.numberOfBallsProperty, model.ballSystem.numberOfBallsRange, model.playArea.gridVisibleProperty, merge( {
        left: playAreaNode.right + 5,
        top: modelViewTransform.modelToViewY( model.playArea.bounds.maxY ) + 5
      }, options.playAreaControlSetOptions ) );

      this.addChild( playAreaControlSet );
    }

    const timeDisplay = new ElapsedTimeNumberDisplay( model.elapsedTimeProperty );
    this.addChild( timeDisplay );
    timeDisplay.left = SCREEN_VIEW_X_MARGIN;
    timeDisplay.top = playAreaNode.bottom + 10;

    const collisionLabTimeControlNode = new CollisionLabTimeControlNode(
      model.isPlayingProperty,
      model.playArea.elasticityPercentProperty,
      model.elapsedTimeProperty,
      model.timeSpeedProperty,
      model.ballSystem.ballSystemUserControlledProperty,
      model.stepBackward.bind( model ),
      model.stepForward.bind( model )
    );
    const playPauseButtonCenter = playAreaNode.centerBottom.plusXY( 0, collisionLabTimeControlNode.height / 2 + 10 );
    collisionLabTimeControlNode.setPlayPauseButtonCenter( playPauseButtonCenter );
    this.addChild( collisionLabTimeControlNode );

    // create and add restart button
    const restartButton = new RestartButton( {
      listener: () => {
        model.restart();
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


    const playAreaControlPanel = this.createControlPanel( viewProperties, model );
    playAreaControlPanel.right = this.layoutBounds.maxX - SCREEN_VIEW_X_MARGIN;
    playAreaControlPanel.top = SCREEN_VIEW_Y_MARGIN;
    this.addChild( playAreaControlPanel );


    const momentaDiagram = new MomentaDiagramAccordionBox( model.momentaDiagram, model.ballSystem.balls, {
      dimensions: model.playArea.dimensions,
      centerX: playAreaControlPanel.centerX,
      top: playAreaControlPanel.bottom + 8
    } );
    this.addChild( momentaDiagram );

    const keypad = new KeypadDialog( {
      layoutStrategy: ( keypadDialog, simBounds, screenBounds, scale ) => {
        keypadDialog.leftBottom = this.localToGlobalPoint( ballValuesPanel.rightBottom.plusXY( 10, 0 ) ).times( 1 / scale );
      }
    } );

    const ballValuesPanel = new BallValuesPanel( model.ballSystem.balls, viewProperties.moreDataVisibleProperty, keypad, {
      dimensions: model.playArea.dimensions
    } );
    this.addChild( ballValuesPanel );
    ballValuesPanel.top = 420;
    ballValuesPanel.left = SCREEN_VIEW_X_MARGIN;

    const moreDataCheckbox = new MoreDataCheckbox( viewProperties.moreDataVisibleProperty, {
      bottom: ballValuesPanel.top - 4,
      left: SCREEN_VIEW_X_MARGIN
    } );
    this.addChild( moreDataCheckbox );

    const returnMassesButton = new ReturnMassesButton( model.ballSystem.ballsNotInsidePlayAreaProperty, {
      center: modelViewTransform.modelToViewPosition( model.playArea.bounds.center ),
      listener: () => { model.returnMasses(); }
    } );
    this.addChild( returnMassesButton );

  }

  // @protected
  createControlPanel( viewProperties, model ) {
    return new CollisionLabControlPanel( viewProperties,
      model.ballSystem.centerOfMassVisibleProperty,
      model.playArea.reflectingBorderProperty,
      model.playArea.elasticityPercentProperty,
      model.playArea.inelasticCollisionTypeProperty,
      model.ballSystem.ballsConstantSizeProperty );
  }

  // @protected
  createBallSystemNode( model, viewProperties, modelViewTransform ) {
    return new BallSystemNode( model.ballSystem,
        model.playArea,
        viewProperties.valuesVisibleProperty,
        viewProperties.velocityVectorVisibleProperty,
        viewProperties.momentumVectorVisibleProperty,
        model.isPlayingProperty,
        modelViewTransform );
  }

  // @public
  step( dt ) {
    assert && assert( typeof dt === 'number', `invalid dt: ${dt}` );
  }
}

collisionLab.register( 'CollisionLabScreenView', CollisionLabScreenView );
export default CollisionLabScreenView;