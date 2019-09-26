// Copyright 2019, University of Colorado Boulder

/**
 * View for a ball that is dragged onto the play area. The ball supports dragging.
 *
 * @author Martin Veillette
 */

define( require => {
  'use strict';

  // modules
  // const ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  // const BooleanProperty = require( 'AXON/BooleanProperty' );
  const Circle = require( 'SCENERY/nodes/Circle' );
  // const Color = require( 'SCENERY/util/Color' );
  const DragListener = require( 'SCENERY/listeners/DragListener' );
  // const merge = require( 'PHET_CORE/merge' );
  const Property = require( 'AXON/Property' );
  const Node = require( 'SCENERY/nodes/Node' );
  const collisionLab = require( 'COLLISION_LAB/collisionLab' );

  const CollisionLabConstants = require( 'COLLISION_LAB/common/CollisionLabConstants' );

  class BallNode extends Node {

    /**
     * @param {Ball} ball - the ball model
     * @param {number} index
     * @param {BooleanProperty} valuesVisibleProperty
     * @param {ModelViewTransform2} modelViewTransform
     * @param {Object} [options]
     */
    constructor( ball, index, valuesVisibleProperty, modelViewTransform, options ) {

      super();

      // drag bounds for the ball
      const dragBoundsProperty = new Property( CollisionLabConstants.TABLE_BOUNDS );

      // ball radius in view coordinates
      const ballRadius = modelViewTransform.modelToViewDeltaX( ball.radius );
      const ballLocation = modelViewTransform.modelToViewPosition( ball.position );

      // add disk to the scene graph
      const diskNode = new Circle( ballRadius, { center: ballLocation, fill: 'black' } );
      this.addChild( diskNode );


      // add input listener to disk
      this.addInputListener( new DragListener( {
        targetNode: diskNode,
        translateNode: true,
        transform: modelViewTransform,
        locationProperty: ball.positionProperty,
        dragBoundsProperty: dragBoundsProperty
      } ) );


      ball.positionProperty.link( position => {
        diskNode.center = modelViewTransform.modelToViewPosition( position );
      } );

      ball.radiusProperty.link( radius => {
        diskNode.radius = modelViewTransform.modelToViewDeltaX( radius );
      } );


    }
  }

  return collisionLab.register( 'BallNode', BallNode );
} );