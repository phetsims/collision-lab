// Copyright 2019, University of Colorado Boulder

/**
 * View for a ball that is dragged onto the play area. The ball supports dragging.
 *
 * @author Martin Veillette
 */

define( require => {
  'use strict';

  // modules

  // const Color = require( 'SCENERY/util/Color' );
  const Ball = require( 'COLLISION_LAB/common/model/Ball' );
  const BallMomentumVectorNode = require( 'COLLISION_LAB/common/view/BallMomentumVectorNode' );
  const BallVelocityVectorNode = require( 'COLLISION_LAB/common/view/BallVelocityVectorNode' );
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const Circle = require( 'SCENERY/nodes/Circle' );
  const collisionLab = require( 'COLLISION_LAB/collisionLab' );
  const CollisionLabColors = require( 'COLLISION_LAB/common/CollisionLabColors' );
  const CollisionLabConstants = require( 'COLLISION_LAB/common/CollisionLabConstants' );
  const DragListener = require( 'SCENERY/listeners/DragListener' );
  const merge = require( 'PHET_CORE/merge' );
  const ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  const Node = require( 'SCENERY/nodes/Node' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Property = require( 'AXON/Property' );
  const Text = require( 'SCENERY/nodes/Text' );
  const Vector2 = require( 'DOT/Vector2' );

  // constants
  const BALL_VELOCITY_VECTOR_OPTIONS = merge( CollisionLabConstants.ARROW_OPTIONS,
    CollisionLabColors.VELOCITY_VECTOR_COLORS
  );
  const BALL_MOMENTUM_VECTOR_OPTIONS = merge( CollisionLabConstants.ARROW_OPTIONS,
    CollisionLabColors.MOMENTUM_VECTOR_COLORS
  );

  class BallNode extends Node {

    /**
     * @param {Ball} ball - the ball model
     * @param {number} index
     * @param {Property.<boolean>} valuesVisibleProperty
     * @param {Property.<boolean>} velocityVisibleProperty
     * @param {Property.<boolean>} momentumVisibleProperty
     * @param {Property.<boolean>} playProperty
     * @param {ModelViewTransform2} modelViewTransform
     * @param {Object} [options]
     */
    constructor( ball,
                 index,
                 valuesVisibleProperty,
                 velocityVisibleProperty,
                 momentumVisibleProperty,
                 playProperty,
                 modelViewTransform,
                 options ) {

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

      // ball position in view coordinates
      const ballLocation = modelViewTransform.modelToViewPosition( ball.position );

      // translate the location of this node
      this.translation = ballLocation;

      // ball radius in view coordinates
      const ballRadius = modelViewTransform.modelToViewDeltaX( ball.radius );

      // create and add disk to the scene graph
      const diskNode = new Circle( ballRadius, {
        fill: CollisionLabColors.BALL_COLORS[ index ],
        stroke: 'black'
      } );
      this.addChild( diskNode );


      // create and add labelNode of the ball
      const labelNode = new Text( index + 1, {
        font: new PhetFont( 20 ),
        center: Vector2.ZERO,
        stroke: 'black',
        fill: 'white'
      } );
      this.addChild( labelNode );

      // create and add the velocityVector and momentumVector nodes
      const ballVelocityVectorNode = new BallVelocityVectorNode(
        ball.velocityProperty,
        velocityVisibleProperty,
        playProperty,
        modelViewTransform,
        BALL_VELOCITY_VECTOR_OPTIONS );
      const ballMomentumVectorNode = new BallMomentumVectorNode(
        ball.momentumProperty,
        momentumVisibleProperty,
        modelViewTransform,
        BALL_MOMENTUM_VECTOR_OPTIONS );

      this.addChild( ballMomentumVectorNode );
      this.addChild( ballVelocityVectorNode );

      // add input listener to disk
      diskNode.addInputListener( new DragListener( {
        targetNode: this,
        transform: modelViewTransform,
        locationProperty: ball.positionProperty,
        dragBoundsProperty: dragBoundsProperty,
        start: () => {
          ball.isUserControlledProperty.value = true;
          this.moveToFront();
        },
        end: () => { ball.isUserControlledProperty.value = false;}
      } ) );

      // translate this node upon a change opf the position of the ball
      ball.positionProperty.link( position => {
        this.translation = modelViewTransform.modelToViewPosition( position );
      } );

      // updates the radius of the ball
      ball.radiusProperty.link( radius => {

        // update the radius of the ball
        diskNode.radius = modelViewTransform.modelToViewDeltaX( radius );

        // shrink the dragBounds (in model coordinates) by the radius of the ball
        dragBoundsProperty.value = dragBoundsProperty.value.eroded( radius );
      } );


    }
  }

  return collisionLab.register( 'BallNode', BallNode );
} );