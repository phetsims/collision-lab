// Copyright 2020-2022, University of Colorado Boulder

/**
 * A view that renders the trailing 'Paths' behind all Balls and the Center of Mass, using their PathDataPoints array.
 *
 * PathsNode subtypes CanvasNode to linearly reduce the stroke-alpha to give a "fade over-time" illusion. Opacity is
 * determined by how long ago the PathDataPoint was recorded. See https://github.com/phetsims/collision-lab/issues/61
 * for context on the decision to use CanvasNode.
 *
 * For performance reasons, PathsNode draws all 'Paths' in one canvas instead of having one PathNode for each
 * Ball and CenterOfMass, including for Balls that aren't in the system. There is no performance loss since Balls that
 * aren't in the BallSystem have empty Paths and all moving objects have empty paths if 'Paths' are not visible.
 *
 * NOTE: Do not translate this node. It's origin must be at the origin of the view coordinate frame.
 *
 * @author Brandon Li
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import { CanvasNode, Color, PaintDef } from '../../../../scenery/js/imports.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabColors from '../CollisionLabColors.js';
import Ball from '../model/Ball.js';
import CollisionLabPath from '../model/CollisionLabPath.js';

// constants
const LINE_WIDTH = 2.3; // lineWidth of Paths

class PathsNode extends CanvasNode {

  /**
   * @param {Ball[]} prepopulatedBalls - an array of All possible balls in the system.
   * @param {CollisionLabPath} centerOfMassPath - path of the CenterOfMass of the system.
   * @param {Bounds2} playAreaBounds
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options]
   */
  constructor( prepopulatedBalls, centerOfMassPath, playAreaBounds, modelViewTransform, options ) {
    assert && AssertUtils.assertArrayOf( prepopulatedBalls, Ball );
    assert && assert( centerOfMassPath instanceof CollisionLabPath, `invalid centerOfMassPath: ${centerOfMassPath}` );
    assert && assert( playAreaBounds instanceof Bounds2, `invalid playAreaBounds: ${playAreaBounds}` );
    assert && assert( modelViewTransform instanceof ModelViewTransform2, `invalid modelViewTransform: ${modelViewTransform}` );

    options = merge( {

      // superclass options
      canvasBounds: modelViewTransform.modelToViewBounds( playAreaBounds )

    }, options );

    super( options );

    // @private {Ball[]} - reference the passed-in prepopulatedBalls.
    this.prepopulatedBalls = prepopulatedBalls;

    // @private {CollisionLabPath[]} - reference the passed-in centerOfMassPath.
    this.centerOfMassPath = centerOfMassPath;

    // @private {ModelViewTransform2} - reference the passed-in modelViewTransform.
    this.modelViewTransform = modelViewTransform;

    // @private {Color} - mutated in critical code to reduce the number of redundant Color instances.
    this.scratchColor = new Color( 0, 0, 0 );

    //----------------------------------------------------------------------------------------

    // Observe when any of the trailing 'Paths' have changed and should be redrawn to call invalidatePaint(). Listeners
    // are never removed since CollisionLabPaths are never disposed and persist for the lifetime of the simulation.
    [ centerOfMassPath, ...prepopulatedBalls.map( ball => ball.path ) ].forEach( path => {

      // When a path has changed, it results in a call to paintCanvas.
      path.pathChangedEmitter.addListener( this.invalidatePaint.bind( this ) );
    } );
  }

  /**
   * Draws the path along the data points of the Path.
   * @private
   *
   * @param {CollisionLabPath} path - the model for the Path
   * @param {PaintDef} baseColor - the base color of the Path. Alpha will be linearly reduced.
   * @param {CanvasRenderingContext2D} context
   */
  drawPath( path, baseColor, context ) {
    assert && assert( PaintDef.isPaintDef( baseColor ), `invalid baseColor: ${baseColor}` );
    assert && assert( path instanceof CollisionLabPath, `invalid path: ${path}` );
    assert && assert( context instanceof CanvasRenderingContext2D, `invalid context: ${context}` );

    // If there aren't enough PathDataPoints, do not repaint.
    if ( path.dataPoints.length <= 1 ) { return; /* Do nothing */ }

    // Reference the time of the first and last PathDataPoints.
    const firstPathDataPointTime = path.dataPoints[ 0 ].time;
    const lastPathDataPointTime = _.last( path.dataPoints ).time;

    // Draw the segments that connect each of the PathDataPoints by iterating pairwise. Storing the previous view
    // position, so we will only need to compute the view position of each point once.
    let previousViewPosition = path.dataPoints.length ? this.modelViewTransform.modelToViewPosition( path.dataPoints[ 0 ].position ) : new Vector2( 0, 0 );
    for ( let i = 1; i < path.dataPoints.length; i++ ) {
      const dataPoint = path.dataPoints[ i ];

      // Each segment of the dataPoint path needs a new canvas path to create the gradient effect.
      context.beginPath();

      // Get the start and end positions of the line-segment.
      const segmentStartPosition = previousViewPosition;
      const segmentEndPosition = this.modelViewTransform.modelToViewPosition( dataPoint.position );
      previousViewPosition = segmentEndPosition;

      // Draw the line-segment that connects the start and end positions.
      context.moveTo( segmentStartPosition.x, segmentStartPosition.y );
      context.lineTo( segmentEndPosition.x, segmentEndPosition.y );

      // Linearly reduce the stroke-alpha to give a "fade over-time" illusion.
      const alpha = Utils.linear( firstPathDataPointTime, lastPathDataPointTime, 0, 1, dataPoint.time );

      // Using built-in toFixed for performance reasons (similar to Color.computeCSS()), and in addition avoiding a lot
      // of the mutation and overhead by just directly creating the CSS color string.
      context.strokeStyle = `rgba(${baseColor.r},${baseColor.g},${baseColor.b},${Utils.toFixed( alpha, 20 )})`;
      context.stroke();
    }
  }

  /**
   * Draws the 'Paths' behind all Balls and the Center of Mass.
   * @public
   * @override
   *
   * @param {CanvasRenderingContext2D} context
   */
  paintCanvas( context ) {
    assert && assert( context instanceof CanvasRenderingContext2D, `invalid context: ${context}` );

    // Set once only for performance.
    context.lineWidth = LINE_WIDTH;

    // First draw the trailing 'Paths' behind every Ball.
    for ( let i = 0; i < this.prepopulatedBalls.length; i++ ) {
      const ball = this.prepopulatedBalls[ i ];
      this.drawPath( ball.path, CollisionLabColors.BALL_COLORS[ ball.index - 1 ], context );
    }

    // Draw the trailing 'Path' behind the CenterOfMass.
    this.drawPath( this.centerOfMassPath, CollisionLabColors.CENTER_OF_MASS_FILL, context );
  }
}

collisionLab.register( 'PathsNode', PathsNode );
export default PathsNode;