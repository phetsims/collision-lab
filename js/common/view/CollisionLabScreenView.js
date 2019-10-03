// Copyright 2019, University of Colorado Boulder

/**
 * @author Martin Veillette
 */
define( require => {
  'use strict';

  // modules
  const BallNode = require( 'COLLISION_LAB/common/view/BallNode' );
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const Bounds2 = require( 'DOT/Bounds2' );
  const collisionLab = require( 'COLLISION_LAB/collisionLab' );
  const CollisionLabConstants = require( 'COLLISION_LAB/common/CollisionLabConstants' );
  const CollisionLabModel = require( 'COLLISION_LAB/common/model/CollisionLabModel' ); // TODO: #13
  const GridNode = require( 'COLLISION_LAB/common/view/GridNode' );
  const Image = require( 'SCENERY/nodes/Image' );
  const ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  const Node = require( 'SCENERY/nodes/Node' );
  const NumberProperty = require( 'AXON/NumberProperty' );
  const NumberSpinner = require( 'SUN/NumberSpinner' );
  const Property = require( 'AXON/Property' );
  const Range = require( 'DOT/Range' );
  const ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  const ScreenView = require( 'JOIST/ScreenView' );
  const HSlider = require( 'SUN/HSlider' );
  const Tandem = require( 'TANDEM/Tandem' );

  // constants
  const MODEL_TO_VIEW_SCALE = 200; // meter to view coordinates (1 m = 200 coordinates)
  const SCREEN_VIEW_X_MARGIN = CollisionLabConstants.SCREEN_VIEW_X_MARGIN;
  const SCREEN_VIEW_Y_MARGIN = CollisionLabConstants.SCREEN_VIEW_Y_MARGIN;
  const PLAY_AREA_BOUNDS = CollisionLabConstants.PLAY_AREA_BOUNDS;

  // images
  const Mockup2DLabImage = require( 'image!COLLISION_LAB/mockup2DLab.png' );

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
      const backgroundImage = new Image( Mockup2DLabImage, { scale: 0.66 } );
      const transparencySlider = new HSlider( transparencyProperty, new Range( 0, 1 ), { x: 600, y: 500 } );
      transparencyProperty.link( transparency => {backgroundImage.imageOpacity = transparency;} );
      this.setChildren( [backgroundImage, transparencySlider] );

      // create and add number spinner for number of balls
      const numberOfBallsRange = new Range( 0, CollisionLabConstants.MAX_BALLS );
      const numberOfBallsSpinner = new NumberSpinner( model.playArea.numberOfBallsProperty, new Property( numberOfBallsRange ) );
      this.addChild( numberOfBallsSpinner );

      const valuesVisibleProperty = new BooleanProperty( false );

      const gridNode = new GridNode( modelViewTransform );
      this.addChild( gridNode );

      numberOfBallsSpinner.left = gridNode.right;
      numberOfBallsSpinner.top = 20;

      this.ballLayerNode = new Node();
      this.addChild( this.ballLayerNode );

      //TODO: the two following listeners are almost identical
      const addItemAddedBallListener = ( addedBall, balls ) => {

        const index = balls.indexOf( addedBall );
        const addedBallNode = new BallNode( addedBall, index, valuesVisibleProperty, modelViewTransform );
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

        const addedBallNode = new BallNode( addedBall, index, valuesVisibleProperty, modelViewTransform );
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
        },
        right: this.layoutBounds.maxX - SCREEN_VIEW_X_MARGIN,
        bottom: this.layoutBounds.maxY - SCREEN_VIEW_Y_MARGIN,
        tandem: tandem.createTandem( 'resetAllButton' )
      } );
      this.addChild( resetAllButton );
    }

    // @public
    step( dt ) {
      assert && assert( typeof dt === 'number', `invalid dt: ${dt}` );
    }

  }

  return collisionLab.register( 'CollisionLabScreenView', CollisionLabScreenView );
} );