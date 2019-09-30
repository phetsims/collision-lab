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
  const GridNode = require( 'COLLISION_LAB/common/view/GridNode' );
  const ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  const Node = require( 'SCENERY/nodes/Node' );
  const NumberSpinner = require( 'SUN/NumberSpinner' );
  const Property = require( 'AXON/Property' );
  const Range = require( 'DOT/Range' );
  const ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  const ScreenView = require( 'JOIST/ScreenView' );

  // constants
  const MODEL_TO_VIEW_SCALE = 200; // meter to view coordinates (1 m = 200 coordinates)
  const SCREEN_VIEW_X_MARGIN = CollisionLabConstants.SCREEN_VIEW_X_MARGIN;
  const SCREEN_VIEW_Y_MARGIN = CollisionLabConstants.SCREEN_VIEW_Y_MARGIN;
  const PLAY_AREA_BOUNDS = CollisionLabConstants.PLAY_AREA_BOUNDS;

  class CollisionLabScreenView extends ScreenView {

    /**
     * @param {CollisionLabModel} model
     * @param {Tandem} tandem
     */
    constructor( model, tandem ) {

      super();

      const playAreaViewBounds = new Bounds2( SCREEN_VIEW_X_MARGIN,
        SCREEN_VIEW_Y_MARGIN,
        SCREEN_VIEW_X_MARGIN + MODEL_TO_VIEW_SCALE * PLAY_AREA_BOUNDS.width,
        SCREEN_VIEW_Y_MARGIN + MODEL_TO_VIEW_SCALE * PLAY_AREA_BOUNDS.height );

      const modelViewTransform = ModelViewTransform2.createRectangleInvertedYMapping(
        PLAY_AREA_BOUNDS,
        playAreaViewBounds
        );

      const numberOfBallsRange = new Range( 0, CollisionLabConstants.MAX_BALLS );
      const numberOfBallsSpinner = new NumberSpinner( model.numberOfBallsProperty, new Property( numberOfBallsRange ) );
      this.addChild( numberOfBallsSpinner );

      const valuesVisibleProperty = new BooleanProperty( false );

      const gridNode = new GridNode( modelViewTransform );
      this.addChild( gridNode );

      this.ballLayerNode = new Node();
      this.addChild( this.ballLayerNode );

      const ballListener = ( addedBall, index ) => {

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

      model.balls.forEach( ballListener );

      model.balls.addItemAddedListener( ballListener );

      const resetAllButton = new ResetAllButton( {
        listener: () => {
          model.reset();
        },
        right: this.layoutBounds.maxX - 10,
        bottom: this.layoutBounds.maxY - 10,
        tandem: tandem.createTandem( 'resetAllButton' )
      } );
      this.addChild( resetAllButton );
    }

    // @public
    step( dt ) {
    }

  }

  return collisionLab.register( 'CollisionLabScreenView', CollisionLabScreenView );
} );