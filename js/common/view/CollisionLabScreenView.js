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
import MomentaDiagramAccordionBox from './MomentaDiagramAccordionBox.js';
import MoreDataCheckbox from './MoreDataCheckbox.js';
import PlayAreaControlSet from './PlayAreaControlSet.js';
import PlayAreaNode from './PlayAreaNode.js';
import RestartButton from './RestartButton.js';

// constants
const MODEL_TO_VIEW_SCALE = 153; // meter to view coordinates (1 m = 200 coordinates)
const SCREEN_VIEW_X_MARGIN = CollisionLabConstants.SCREEN_VIEW_X_MARGIN;
const SCREEN_VIEW_Y_MARGIN = CollisionLabConstants.SCREEN_VIEW_Y_MARGIN;

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

    const ballSystemNode = new BallSystemNode( model.playArea.ballSystem,
        model.playArea,
        viewProperties.valuesVisibleProperty,
        viewProperties.velocityVectorVisibleProperty,
        viewProperties.momentumVectorVisibleProperty,
        model.isPlayingProperty,
        modelViewTransform );
    this.addChild( ballSystemNode );



    if ( options.includePlayAreaControlSet ) {
      const playAreaControlSet = new PlayAreaControlSet( model.playArea.numberOfBallsProperty, model.playArea.numberOfBallsRange, model.playArea.gridVisibleProperty, merge( {
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
      model.playArea.ballSystemUserControlledProperty,
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


    const playAreaControlPanel = new CollisionLabControlPanel( viewProperties,
      model.playArea.centerOfMassVisibleProperty,
      model.playArea.pathVisibleProperty,
      model.playArea.reflectingBorderProperty,
      model.playArea.elasticityPercentProperty,
      model.playArea.inelasticCollisionTypeProperty,
      model.playArea.isBallConstantSizeProperty,
      merge( {
        right: this.layoutBounds.maxX - SCREEN_VIEW_X_MARGIN,
        top: SCREEN_VIEW_Y_MARGIN
      }, options.controlPanelOptions ) );
    this.addChild( playAreaControlPanel );


    const momentaDiagram = new MomentaDiagramAccordionBox( model.momentaDiagram, model.playArea.ballSystem.balls, {
      dimensions: model.dimensions,
      centerX: playAreaControlPanel.centerX,
      top: playAreaControlPanel.bottom + 8
    } );
    this.addChild( momentaDiagram );


    const keypad = new KeypadDialog();

    const ballValuesDisplay = new BallValuesPanel( model.playArea.ballSystem.balls, viewProperties.moreDataVisibleProperty, keypad, {
      dimensions: model.dimensions
    } );
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