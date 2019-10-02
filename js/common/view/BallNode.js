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
  // const Color = require( 'SCENERY/util/Color' );
  // const merge = require( 'PHET_CORE/merge' );
  const Ball = require( 'COLLISION_LAB/common/model/Ball' );
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const Circle = require( 'SCENERY/nodes/Circle' );
  const collisionLab = require( 'COLLISION_LAB/collisionLab' );
  const CollisionLabColors = require( 'COLLISION_LAB/common/CollisionLabColors' );
  const CollisionLabConstants = require( 'COLLISION_LAB/common/CollisionLabConstants' );
  const DragListener = require( 'SCENERY/listeners/DragListener' );
  const ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Property = require( 'AXON/Property' );

  class BallNode extends Node {

    /**
     * @param {Ball} ball - the ball model
     * @param {number} index
     * @param {BooleanProperty} valuesVisibleProperty
     * @param {ModelViewTransform2} modelViewTransform
     * @param {Object} [options]
     */
    constructor( ball, index, valuesVisibleProperty, modelViewTransform, options ) {

      assert && assert( ball instanceof Ball, `invalid ball: ${ball}` );
      assert && assert( typeof index === 'number', `invalid index: ${index}` );
      assert && assert( valuesVisibleProperty instanceof BooleanProperty, `invalid valuesVisibleProperty: ${valuesVisibleProperty}` );
      assert && assert( modelViewTransform instanceof ModelViewTransform2, `invalid modelViewTransform: ${modelViewTransform}` );
      assert && assert( !options || Object.getPrototypeOf( options ) === Object.prototype,
        `Extra prototype on Options: ${options}` );

      //----------------------------------------------------------------------------------------

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