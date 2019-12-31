// Copyright 2019, University of Colorado Boulder

/**
 * @author Martin Veillette
 */
define( require => {
  'use strict';

  // modules
  const BallNode = require( 'COLLISION_LAB/common/view/BallNode' );
  const Bounds2 = require( 'DOT/Bounds2' );
  const collisionLab = require( 'COLLISION_LAB/collisionLab' );
  const CollisionLabConstants = require( 'COLLISION_LAB/common/CollisionLabConstants' );
  const CollisionLabKeypad = require( 'COLLISION_LAB/common/view/CollisionLabKeypad' );
  const CollisionLabTimeControlNode = require( 'COLLISION_LAB/common/view/CollisionLabTimeControlNode' );
  const CollisionLabModel = require( 'COLLISION_LAB/common/model/CollisionLabModel' ); // TODO: #13
  const CollisionLabViewProperties = require( 'COLLISION_LAB/common/view/CollisionLabViewProperties' );
  const GridCheckbox = require( 'SCENERY_PHET/GridCheckbox' );
  const HSlider = require( 'SUN/HSlider' );
  const Image = require( 'SCENERY/nodes/Image' );
  const PlayAreaNode = require( 'COLLISION_LAB/common/view/PlayAreaNode' );
  const ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  const Node = require( 'SCENERY/nodes/Node' );
  const NumberProperty = require( 'AXON/NumberProperty' );
  const NumberSpinner = require( 'SUN/NumberSpinner' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const PlayAreaControlPanel = require( 'COLLISION_LAB/common/view/PlayAreaControlPanel' );
  const Property = require( 'AXON/Property' );
  const Range = require( 'DOT/Range' );
  const ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  const RestartButton = require( 'COLLISION_LAB/common/view/RestartButton' );
  const ScreenView = require( 'JOIST/ScreenView' );
  const Tandem = require( 'TANDEM/Tandem' );
  const Text = require( 'SCENERY/nodes/Text' );
  const TimeDisplay = require( 'COLLISION_LAB/common/view/TimeDisplay' );

  // constants
  const MODEL_TO_VIEW_SCALE = 200; // meter to view coordinates (1 m = 200 coordinates)
  const SCREEN_VIEW_X_MARGIN = CollisionLabConstants.SCREEN_VIEW_X_MARGIN;
  const SCREEN_VIEW_Y_MARGIN = CollisionLabConstants.SCREEN_VIEW_Y_MARGIN;
  const PLAY_AREA_BOUNDS = CollisionLabConstants.PLAY_AREA_BOUNDS;

  // strings
  const ballsString = require( 'string!COLLISION_LAB/balls' );

  // images
  const mockupScreen2DLabImage = require( 'image!COLLISION_LAB/mockup-screen-2DLab.png' );

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
      this.setChildren( [backgroundImage, transparencySlider] );

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
        model.isSlowMotionProperty,
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

        const index = model.balls.indexOf( addedBall );
        const addedBallNode = new BallNode( addedBall,
          index,
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

  return collisionLab.register( 'CollisionLabScreenView', CollisionLabScreenView );
} );