// Copyright 2019, University of Colorado Boulder

/**
 * @author Martin Veillette
 */
define( require => {
  'use strict';

  // modules
  const BallNode = require( 'COLLISION_LAB/common/view/BallNode' );
  const Bounds2 = require( 'DOT/Bounds2' );
  const CenterOfMassNode = require( 'COLLISION_LAB/common/view/CenterOfMassNode' );
  const collisionLab = require( 'COLLISION_LAB/collisionLab' );
  const CollisionLabConstants = require( 'COLLISION_LAB/common/CollisionLabConstants' );
  const CollisionLabModel = require( 'COLLISION_LAB/common/model/CollisionLabModel' ); // TODO: #13
  const CollisionLabViewProperties = require( 'COLLISION_LAB/common/view/CollisionLabViewProperties' );
  const GridCheckbox = require( 'SCENERY_PHET/GridCheckbox' );
  const GridNode = require( 'COLLISION_LAB/common/view/GridNode' );
  const HSlider = require( 'SUN/HSlider' );
  const Image = require( 'SCENERY/nodes/Image' );
  const ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  const Node = require( 'SCENERY/nodes/Node' );
  const NumberProperty = require( 'AXON/NumberProperty' );
  const NumberSpinner = require( 'SUN/NumberSpinner' );
  const Property = require( 'AXON/Property' );
  const Range = require( 'DOT/Range' );
  const ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  const ScreenView = require( 'JOIST/ScreenView' );
  const SpeedRadioButtons = require( 'COLLISION_LAB/common/view/SpeedRadioButtons' );
  const Tandem = require( 'TANDEM/Tandem' );
  const TimeControlBox = require( 'COLLISION_LAB/common/view/TimeControlBox' );


  // constants
  const MODEL_TO_VIEW_SCALE = 200; // meter to view coordinates (1 m = 200 coordinates)
  const SCREEN_VIEW_X_MARGIN = CollisionLabConstants.SCREEN_VIEW_X_MARGIN;
  const SCREEN_VIEW_Y_MARGIN = CollisionLabConstants.SCREEN_VIEW_Y_MARGIN;
  const PLAY_AREA_BOUNDS = CollisionLabConstants.PLAY_AREA_BOUNDS;

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

      const playAreaViewBounds = new Bounds2( SCREEN_VIEW_X_MARGIN,
        SCREEN_VIEW_Y_MARGIN,
        SCREEN_VIEW_X_MARGIN + MODEL_TO_VIEW_SCALE * PLAY_AREA_BOUNDS.width,
        SCREEN_VIEW_Y_MARGIN + MODEL_TO_VIEW_SCALE * PLAY_AREA_BOUNDS.height );

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

      // create and add number spinner for number of balls
      const numberOfBallsRange = new Range( 0, CollisionLabConstants.MAX_BALLS );
      const numberOfBallsSpinner = new NumberSpinner( model.playArea.numberOfBallsProperty, new Property( numberOfBallsRange ) );
      this.addChild( numberOfBallsSpinner );

      // create the grid and border of the playArea
      const gridNode = new GridNode( model.playArea.grid, viewProperties.gridVisibleProperty, modelViewTransform );
      this.addChild( gridNode );

      numberOfBallsSpinner.left = gridNode.right + 5;
      numberOfBallsSpinner.top = 20;

      this.ballLayerNode = new Node();
      this.addChild( this.ballLayerNode );

      //  create and add time control buttons (
      const timeControlBox = new TimeControlBox( model, model.playProperty, {
        centerX: gridNode.centerX,
        top: gridNode.bottom + 10
      } );
      this.addChild( timeControlBox );

      //  create and add time control buttons (
      const speedRadioButtons = new SpeedRadioButtons( model.speedProperty, {
        left: timeControlBox.right + 10,
        centerY: timeControlBox.centerY
      } );
      this.addChild( speedRadioButtons );


      //TODO: the two following listeners are almost identical
      const addItemAddedBallListener = ( addedBall, balls ) => {

        const index = balls.indexOf( addedBall );
        const addedBallNode = new BallNode( addedBall,
          index,
          viewProperties.valuesVisibleProperty,
          viewProperties.velocityVisibleProperty,
          viewProperties.momentumVisibleProperty,
          model.playProperty,
          modelViewTransform );
        this.ballLayerNode.addChild( addedBallNode );

        // Observe when the ball is removed to unlink listeners
        const removeBallListener = removedBall => {
          if ( removedBall === addedBall ) {
            this.ballLayerNode.removeChild( addedBallNode );
            model.balls.removeItemRemovedListener( removeBallListener );
          }
        };
        model.balls.addItemRemovedListener( removeBallListener );
      };

      const forEachBallListener = ( addedBall, index ) => {

        const addedBallNode = new BallNode( addedBall,
          index,
          viewProperties.valuesVisibleProperty,
          viewProperties.velocityVisibleProperty,
          viewProperties.momentumVisibleProperty,
          model.playProperty,
          modelViewTransform );
        this.ballLayerNode.addChild( addedBallNode );

        // Observe when the ball is removed to unlink listeners
        const removeBallListener = removedBall => {
          if ( removedBall === addedBall ) {
            this.ballLayerNode.removeChild( addedBallNode );
            model.balls.removeItemRemovedListener( removeBallListener );
          }
        };
        model.balls.addItemRemovedListener( removeBallListener );
      };

      model.balls.forEach( forEachBallListener );

      model.balls.addItemAddedListener( addItemAddedBallListener );

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

      const centerOfMassNode = new CenterOfMassNode( model.playArea.centerOfMass,
        viewProperties.centerOfMassVisibleProperty,
        model.playArea.numberOfBallsProperty,
        modelViewTransform );
      this.addChild( centerOfMassNode );


    }

    // @public
    step( dt ) {
      assert && assert( typeof dt === 'number', `invalid dt: ${dt}` );
    }
  }

  return collisionLab.register( 'CollisionLabScreenView', CollisionLabScreenView );
} );