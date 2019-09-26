// Copyright 2019, University of Colorado Boulder

/**
 * @author Martin Veillette
 */
define( require => {
  'use strict';

  // modules
  const ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  const Vector2 = require( 'DOT/Vector2' );
  const collisionLab = require( 'COLLISION_LAB/collisionLab' );
  const CollisionLabConstants = require( 'COLLISION_LAB/common/CollisionLabConstants' );
  const BallNode = require( 'COLLISION_LAB/common/view/BallNode' );
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const NumberSpinner = require( 'SUN/NumberSpinner' );
  const Property = require( 'AXON/Property' );
  const Range = require( 'DOT/Range' );
  const ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  const ScreenView = require( 'JOIST/ScreenView' );
  const Node = require( 'SCENERY/nodes/Node' );
  const GridNode = require( 'COLLISION_LAB/common/view/GridNode' );

  class CollisionLabScreenView extends ScreenView {

    /**
     * @param {CollisionLabModel} model
     * @param {Tandem} tandem
     */
    constructor( model, tandem ) {

      super();

      const modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping(
        Vector2.ZERO,
        this.layoutBounds.center,
        CollisionLabConstants.VIEW_TO_MODEL_SCALING );


      const numberOfBallsRange = new Range( 0, CollisionLabConstants.MAX_BALLS );
      const numberOfBallsSpinner = new NumberSpinner( model.numberOfBallsProperty, new Property( numberOfBallsRange ) );
      this.addChild( numberOfBallsSpinner );

      const valuesVisibleProperty = new BooleanProperty( false );

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

      const gridNode = new GridNode( modelViewTransform );
      this.addChild( gridNode );

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