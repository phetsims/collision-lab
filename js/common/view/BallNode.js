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
  // const Color = require( 'SCENERY/util/Color' );
  // const merge = require( 'PHET_CORE/merge' );
  const Circle = require( 'SCENERY/nodes/Circle' );
  const collisionLab = require( 'COLLISION_LAB/collisionLab' );
  const DragListener = require( 'SCENERY/listeners/DragListener' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Property = require( 'AXON/Property' );
  const CollisionLabConstants = require( 'COLLISION_LAB/common/CollisionLabConstants' );
  const CollisionLabColors = require( 'COLLISION_LAB/common/CollisionLabColors' );

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
      const dragBoundsProperty = new Property( CollisionLabConstants.PLAY_AREA_BOUNDS );

      // ball radius in view coordinates
      const ballRadius = modelViewTransform.modelToViewDeltaX( ball.radius );
      const ballLocation = modelViewTransform.modelToViewPosition( ball.position );

      // add disk to the scene graph
      const diskNode = new Circle( ballRadius, {
        center: ballLocation,
        fill: CollisionLabColors.BALL_COLORS[ index ],
        stroke: 'black'
      } );
      this.addChild( diskNode );


      // add input listener to disk
      this.addInputListener( new DragListener( {
        targetNode: diskNode,
        transform: modelViewTransform,
        locationProperty: ball.positionProperty,
        dragBoundsProperty: dragBoundsProperty
      } ) );


      ball.positionProperty.link( position => {
        diskNode.translation = modelViewTransform.modelToViewPosition( position );
      } );

      ball.radiusProperty.link( radius => {
        diskNode.radius = modelViewTransform.modelToViewDeltaX( radius );
      } );


    }
  }

  return collisionLab.register( 'BallNode', BallNode );
} );