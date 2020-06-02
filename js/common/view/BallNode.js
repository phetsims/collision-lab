// Copyright 2019-2020, University of Colorado Boulder

/**
 * View for a ball that is dragged onto the play area. The ball supports dragging.
 *
 * @author Brandon Li
 * @author Martin Veillette
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Property from '../../../../axon/js/Property.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import Shape from '../../../../kite/js/Shape.js';
import merge from '../../../../phet-core/js/merge.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import DragListener from '../../../../scenery/js/listeners/DragListener.js';
import Circle from '../../../../scenery/js/nodes/Circle.js';
import Line from '../../../../scenery/js/nodes/Line.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabColors from '../CollisionLabColors.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import Ball from '../model/Ball.js';
import BallLabelsNode from './BallLabelsNode.js';
import BallMomentumVectorNode from './BallMomentumVectorNode.js';
import BallVelocityVectorNode from './BallVelocityVectorNode.js';
import PathCanvasNode from './PathCanvasNode.js';

// constants
const BALL_VELOCITY_VECTOR_OPTIONS = merge(
  CollisionLabColors.VELOCITY_VECTOR_COLORS, CollisionLabConstants.ARROW_OPTIONS
);
const BALL_MOMENTUM_VECTOR_OPTIONS = merge(
  CollisionLabColors.MOMENTUM_VECTOR_COLORS, CollisionLabConstants.ARROW_OPTIONS
);
const MASS_RANGE = CollisionLabConstants.MASS_RANGE;

class BallNode extends Node {

  /**
   * @param {Ball} ball - the ball model
   * @param {Property.<boolean>} valuesVisibleProperty - are the speed and momentum label visible
   * @param {Property.<boolean>} velocityVisibleProperty - is the velocity vector visible
   * @param {Property.<boolean>} momentumVisibleProperty - is the momentum vector visible
   * @param {Property.<boolean>} constantDadiusProperty - is the grid on the playArea visible
   * @param {Property.<boolean>} playProperty - is simulation of the playArea on
   * @param {Property.<boolean>} pathVisibleProperty - indicates if the 'Path' is visible.
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options]
   */
  constructor( ball,
               valuesVisibleProperty,
               velocityVisibleProperty,
               momentumVisibleProperty,
               isConstantSizeProperty,
               playProperty,
               pathVisibleProperty,
               modelViewTransform,
               options ) {

    assert && assert( ball instanceof Ball, `invalid ball: ${ball}` );
    assert && assert( valuesVisibleProperty instanceof Property, `invalid valuesVisibleProperty: ${valuesVisibleProperty}` );
    assert && assert( modelViewTransform instanceof ModelViewTransform2, `invalid modelViewTransform: ${modelViewTransform}` );
    assert && assert( !options || Object.getPrototypeOf( options ) === Object.prototype,
      `Extra prototype on Options: ${options}` );

    //----------------------------------------------------------------------------------------

    super();

    // bounds of the play area in view coordinates
    const viewPlayAreaBounds = modelViewTransform.modelToViewBounds( ball.bounds );

    // ball radius in view coordinates
    const ballRadius = modelViewTransform.modelToViewDeltaX( ball.radius );

    // ball position in view coordinates
    const position = modelViewTransform.modelToViewPosition( ball.position );


    // @public (read-only) {DerivedProperty.<PaintDef>} - the fill color of the Ball. The color of the Ball changes
    //                                                    when isConstantSizeProperty is true.
    const fillProperty = new DerivedProperty( [ ball.massProperty, isConstantSizeProperty ],
      ( mass, constantRadius ) => {
        const brightnessFactor = constantRadius ? Utils.linear( MASS_RANGE.min, MASS_RANGE.max, 0.7, 0, mass ) : 0;
        return CollisionLabColors.BALL_COLORS[ ball.index - 1 ].colorUtilsBrighter( brightnessFactor );
      } );
    // create and add disk to the scene graph
    const diskNode = new Circle( ballRadius, {
      fill: fillProperty,
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
    const diskLayer = new Node( { children: [ diskNode, labelNode ] } );
    const immovableDiskLayer = new Node( {
      children: [ diskLayer ],
      clipArea: Shape.bounds( viewPlayAreaBounds )
    } );
    this.addChild( immovableDiskLayer );

    // create and add a dashed crosshair on the ball spanning the playArea
    const graticuleOptions = { stroke: 'black', lineDash: [ 10, 2 ] };
    const horizontalLine = new Line( 0, 0, 0, 1, graticuleOptions ); //
    const verticalLine = new Line( 0, 0, 0, 1, graticuleOptions );
    const graticule = new Node( { children: [ verticalLine, horizontalLine ] } );

    // function to set position of crosshair
    const setGraticulePosition = position => {
      horizontalLine.setLine( viewPlayAreaBounds.minX, position.y, viewPlayAreaBounds.maxX, position.y );
      verticalLine.setLine( position.x, viewPlayAreaBounds.minY, position.x, viewPlayAreaBounds.maxY );
    };

    // set position of crosshair at ball position
    setGraticulePosition( position );
    this.addChild( graticule );

    // create the velocityVector and momentumVector nodes
    const ballVelocityVectorNode = new BallVelocityVectorNode(
      ball,
      ball.velocityProperty,
      ball.userControlledProperty,
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
    const vectorLayer = new Node( { children: [ ballMomentumVectorNode, ballVelocityVectorNode ] } );
    this.addChild( vectorLayer );

    // Create a Property of to track the ball's center position in view coordinates
    const centerPositionProperty = new Vector2Property( position );

    // add input listener to disk
    const diskLayerDragListener = new DragListener( {
      positionProperty: centerPositionProperty,
      start: () => {
        ball.userControlledProperty.value = true;
        this.moveToFront();
      },
      end: () => {
        ball.userControlledProperty.value = false;
      }
    } );
    centerPositionProperty.link( centerPosition => {
      ball.dragToPosition( modelViewTransform.viewToModelPosition( centerPosition ) );
    } );

    diskLayer.addInputListener( diskLayerDragListener );

    // create and add the speed and momentum display
    const ballValuesDisplay = new BallLabelsNode( ball.speedProperty, ball.momentumMagnitudeProperty, valuesVisibleProperty, {
      verticalOffset: ballRadius + 10
    } );
    this.addChild( ballValuesDisplay );

    const pathNode = new PathCanvasNode( ball.path, pathVisibleProperty, modelViewTransform, {
      pathBaseColor: CollisionLabColors.BALL_COLORS[ ball.index - 1 ]
    } );
    this.addChild( pathNode );
    pathNode.moveToBack();


    const ballPositionListener = position => {
      const viewPosition = modelViewTransform.modelToViewPosition( position );

      ballValuesDisplay.translation = viewPosition;
      diskLayer.translation = viewPosition;
      vectorLayer.translation = viewPosition;
      setGraticulePosition( viewPosition );

      vectorLayer.visible = viewPlayAreaBounds.containsPoint( viewPosition );
    };

    // translate the vectors, crosshair and disk upon a change of the position of the ball
    ball.positionProperty.link( ballPositionListener );

    // make the crosshair visible if ball is userControlled
    const isUserControlledHandle = ball.userControlledProperty.linkAttribute( graticule, 'visible' );

    const ballRadiusListener = radius => {

      // update the radius of the ball
      diskNode.radius = modelViewTransform.modelToViewDeltaX( radius );
    };

    // updates the radius of the ball
    ball.radiusProperty.link( ballRadiusListener );

    // @private {function} disposeBallNode - function to unlink listeners, called in dispose()
    this.disposeBallNode = () => {
      ball.positionProperty.unlink( ballPositionListener );
      ball.userControlledProperty.unlinkAttribute( isUserControlledHandle );
      ball.radiusProperty.unlink( ballRadiusListener );
      diskLayer.removeInputListener( diskLayerDragListener );
      diskLayerDragListener.dispose();
      ballVelocityVectorNode.dispose();
      ballMomentumVectorNode.dispose();
      ballValuesDisplay.dispose();
      fillProperty.dispose();
      pathNode.dispose();
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

collisionLab.register( 'BallNode', BallNode );
export default BallNode;
