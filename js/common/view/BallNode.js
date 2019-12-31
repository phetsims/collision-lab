// Copyright 2019, University of Colorado Boulder

/**
 * View for a ball that is dragged onto the play area. The ball supports dragging.
 *
 * @author Martin Veillette
 */

define( require => {
  'use strict';

  // modules
  const Ball = require( 'COLLISION_LAB/common/model/Ball' );
  const BallMomentumVectorNode = require( 'COLLISION_LAB/common/view/BallMomentumVectorNode' );
  const BallVelocityVectorNode = require( 'COLLISION_LAB/common/view/BallVelocityVectorNode' );
  const BallValuesDisplay = require( 'COLLISION_LAB/common/view/BallValuesDisplay' );
  const Circle = require( 'SCENERY/nodes/Circle' );
  const collisionLab = require( 'COLLISION_LAB/collisionLab' );
  const CollisionLabColors = require( 'COLLISION_LAB/common/CollisionLabColors' );
  const CollisionLabConstants = require( 'COLLISION_LAB/common/CollisionLabConstants' );
  const DragListener = require( 'SCENERY/listeners/DragListener' );
  const Line = require( 'SCENERY/nodes/Line' );
  const merge = require( 'PHET_CORE/merge' );
  const ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  const Node = require( 'SCENERY/nodes/Node' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Property = require( 'AXON/Property' );
  const Shape = require( 'KITE/Shape' );
  const Text = require( 'SCENERY/nodes/Text' );
  const Vector2 = require( 'DOT/Vector2' );

  // constants
  const BALL_VELOCITY_VECTOR_OPTIONS = merge(
    CollisionLabColors.VELOCITY_VECTOR_COLORS, CollisionLabConstants.ARROW_OPTIONS
  );
  const BALL_MOMENTUM_VECTOR_OPTIONS = merge(
    CollisionLabColors.MOMENTUM_VECTOR_COLORS, CollisionLabConstants.ARROW_OPTIONS
  );

  class BallNode extends Node {

    /**
     * @param {Ball} ball - the ball model
     * @param {Property.<boolean>} valuesVisibleProperty - are the speed and momentum label visible
     * @param {Property.<boolean>} velocityVisibleProperty - is the velocity vector visible
     * @param {Property.<boolean>} momentumVisibleProperty - is the momemtum vector visible
     * @param {Property.<boolean>} gridVisibleProperty - is the grid on the playArea visible
     * @param {Property.<boolean>} playProperty - is simulation of the playArea on
     * @param {ModelViewTransform2} modelViewTransform
     * @param {Object} [options]
     */
    constructor( ball,
                 valuesVisibleProperty,
                 velocityVisibleProperty,
                 momentumVisibleProperty,
                 gridVisibleProperty,
                 playProperty,
                 modelViewTransform,
                 options ) {

      assert && assert( ball instanceof Ball, `invalid ball: ${ball}` );
      assert && assert( valuesVisibleProperty instanceof Property, `invalid valuesVisibleProperty: ${valuesVisibleProperty}` );
      assert && assert( modelViewTransform instanceof ModelViewTransform2, `invalid modelViewTransform: ${modelViewTransform}` );
      assert && assert( !options || Object.getPrototypeOf( options ) === Object.prototype,
        `Extra prototype on Options: ${options}` );

      //----------------------------------------------------------------------------------------

      super();

      // drag bounds for the ball
      const dragBoundsProperty = new Property( CollisionLabConstants.PLAY_AREA_BOUNDS );

      // bounds of the play area in view coordinates
      const viewPlayAreaBounds = modelViewTransform.modelToViewBounds( CollisionLabConstants.PLAY_AREA_BOUNDS );

      // ball radius in view coordinates
      const ballRadius = modelViewTransform.modelToViewDeltaX( ball.radius );

      // ball location in view coordinates
      const location = modelViewTransform.modelToViewPosition( ball.position );

      // create and add disk to the scene graph
      const diskNode = new Circle( ballRadius, {
        fill: CollisionLabColors.BALL_COLORS[ ball.index - 1 ],
        stroke: 'black'
      } );

      // create and add labelNode of the ball
      const labelNode = new Text( ball.index, {
        font: new PhetFont( 20 ),
        center: Vector2.ZERO,
        stroke: 'black',
        fill: 'white'
      } );

      // TODO: find out a better way to handle clipArea
      // create and add a layer for the disk and label
      const diskLayer = new Node( { children: [diskNode, labelNode] } );
      const immovableDiskLayer = new Node( {
        children: [diskLayer],
        clipArea: Shape.bounds( viewPlayAreaBounds )
      } );
      this.addChild( immovableDiskLayer );

      // create and add a dashed crosshair on the ball spanning the playArea
      const graticuleOptions = { stroke: 'black', lineDash: [10, 2] };
      const horizontalLine = new Line( 0, 0, 0, 1, graticuleOptions ); //
      const verticalLine = new Line( 0, 0, 0, 1, graticuleOptions );
      const graticule = new Node( { children: [verticalLine, horizontalLine] } );

      // function to set location of crosshair
      const setGraticuleLocation = location => {
        horizontalLine.setLine( viewPlayAreaBounds.minX, location.y, viewPlayAreaBounds.maxX, location.y );
        verticalLine.setLine( location.x, viewPlayAreaBounds.minY, location.x, viewPlayAreaBounds.maxY );
      };

      // set location of crosshair at ball position
      setGraticuleLocation( location );
      this.addChild( graticule );

      // create the velocityVector and momentumVector nodes
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

      // create and add a layer for the velocity and momentum vectors
      const vectorLayer = new Node( { children: [ballMomentumVectorNode, ballVelocityVectorNode] } );
      this.addChild( vectorLayer );

      // add input listener to disk
      const diskLayerDragListener =
        new DragListener( {
          targetNode: diskLayer,
          transform: modelViewTransform,
          locationProperty: ball.positionProperty,
          dragBoundsProperty: dragBoundsProperty,
          start: () => {
            ball.isUserControlledProperty.value = true;
            this.moveToFront();
          },
          end: () => {
            ball.isUserControlledProperty.value = false;
            if ( gridVisibleProperty.value ) {
              ball.snapPosition();
            }
          }
        } );

      diskLayer.addInputListener( diskLayerDragListener );

      // create and add the speed and momentum display
      const ballValuesDisplay = new BallValuesDisplay( ball.speedProperty, ball.momentumMagnitudeProperty, valuesVisibleProperty, {
        verticalOffset: ballRadius + 10
      } );
      this.addChild( ballValuesDisplay );

      const ballPositionListener = position => {

        const location = modelViewTransform.modelToViewPosition( position );

        ballValuesDisplay.translation = location;
        diskLayer.translation = location;
        vectorLayer.translation = location;
        setGraticuleLocation( location );

        vectorLayer.visible = viewPlayAreaBounds.containsPoint( location );
      };

      // translate the vectors, crosshair and disk upon a change of the position of the ball
      ball.positionProperty.link( ballPositionListener );

      // make the crosshair visible if ball is userControlled
      const isUserControlledHandle = ball.isUserControlledProperty.linkAttribute( graticule, 'visible' );

      const ballRadiusListener = radius => {

        // update the radius of the ball
        diskNode.radius = modelViewTransform.modelToViewDeltaX( radius );

        // shrink the dragBounds (in model coordinates) by the radius of the ball
        dragBoundsProperty.value = CollisionLabConstants.PLAY_AREA_BOUNDS.eroded( radius );
      };

      // updates the radius of the ball
      ball.radiusProperty.link( ballRadiusListener );

      // @private {function} disposeBallNode - function to unlink listeners, called in dispose()
      this.disposeBallNode = () => {
        ball.positionProperty.unlink( ballPositionListener );
        ball.isUserControlledProperty.unlinkAttribute( isUserControlledHandle );
        ball.radiusProperty.unlink( ballRadiusListener );
        diskLayer.removeInputListener( diskLayerDragListener );
        diskLayerDragListener.dispose();
        ballVelocityVectorNode.dispose();
        ballMomentumVectorNode.dispose();
      };

    }

    /**
     * @public
     * @override
     */
    dispose() {
      this.disposeBallNode();
      super.dispose();
    }
  }

  return collisionLab.register( 'BallNode', BallNode );
} );