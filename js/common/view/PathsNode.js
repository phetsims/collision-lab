// Copyright 2020, University of Colorado Boulder

/**
 * A view that renders the trailing 'Paths' behind all moving objects, including Balls and the Center of Mass, using
 * its PathDataPoints array.
 *
 * It is a sub-type of CanvasNode to linearly reduce the stroke-alpha to give a "fade over-time" illusion. Opacity is
 * determined by how long ago the PathDataPoint was recorded. See https://github.com/phetsims/collision-lab/issues/61
 * for context on the decision to use CanvasNode. There is no need to adjust the visibility of PathsNodes since
 * Paths are empty in the model when they are not visible.
 *
 * For performance reasons, PathsCanvasNodes draws all 'Paths' in one canvas instead of having one PathNode for each
 * Ball. PathsNodes are also never disposed and internal links are left as-is. This doesn't negatively impact
 * performance since Balls that aren't in the system aren't stepped and their positions don't change.
 *
 * NOTE: Do not translate this node. It's origin must be at the origin of the view coordinate frame.
 *
 * @author Brandon Li
 */

import Utils from '../../../../dot/js/Utils.js';
import merge from '../../../../phet-core/js/merge.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import CanvasNode from '../../../../scenery/js/nodes/CanvasNode.js';
import Color from '../../../../scenery/js/util/Color.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabUtils from '../../common/CollisionLabUtils.js';
import CollisionLabColors from '../CollisionLabColors.js';
import BallSystem from '../model/BallSystem.js';

// constants
const LINE_WIDTH = 2.3; // lineWidth of the Path

class PathsNode extends CanvasNode {

  /**
   * @param {BallSystem} ballSystem
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options]
   */
  constructor( ballSystem, playAreaBounds, modelViewTransform, options ) {
    assert && assert( ballSystem instanceof BallSystem, `invalid ballSystem: ${ballSystem}` );
    assert && assert( modelViewTransform instanceof ModelViewTransform2, `invalid modelViewTransform: ${modelViewTransform}` );

    options = merge( {

      // superclass options
      canvasBounds: modelViewTransform.modelToViewBounds( playAreaBounds )

    }, options );

    super( options );

    //----------------------------------------------------------------------------------------

    // @private {BallSystem} - reference the passed-in BallSystem model.
    this.ballSystem = ballSystem;

    // @private {ModelViewTransform2} - reference the passed-in modelViewTransform.
    this.modelViewTransform = modelViewTransform;

    this.scratchColor = new Color( 0, 0, 0 );

    //----------------------------------------------------------------------------------------

    // Observe when the Path trail of the MovingObject should be redrawn. This is never removed since
    // PathsNodes are never disposed and persist for the lifetime of the simulation.
    [ ...ballSystem.prepopulatedBalls.map( ball => ball.path.pathChangedEmitter ),
      ballSystem.centerOfMass.path.pathChangedEmitter ].forEach( pathChangedEmitter => {

        pathChangedEmitter.addListener( this.invalidatePaint.bind( this ) );
      } );
  }

  /**
   * Draws the path along the data points of the Path.
   * @public
   * @override
   *
   * @param {CanvasRenderingContext2D} context
   */
  paintCanvas( context ) {
    this.ballSystem.prepopulatedBalls.forEach( ball => {
      this.drawPath( context, ball.path, CollisionLabColors.BALL_COLORS[ ball.index - 1 ] );

    } );
    this.drawPath( context, this.ballSystem.centerOfMass.path, CollisionLabColors.CENTER_OF_MASS_COLORS.fill );
  }

  /**
   * @private
   */
  drawPath( context, path, color ) {

    // If there are not enough PathDataPoints, do not repaint.
    if ( path.dataPoints.length <= 1 ) { return; /* Do nothing */ }

    // Reference the time of the first and last PathDataPoints.
    const firstPathDataPointTime = path.dataPoints[ 0 ].time;
    const lastPathDataPointTime = _.last( path.dataPoints ).time;

    // Draw the segments that connect each of the PathDataPoints by iterating pairwise.
    CollisionLabUtils.forEachAdjacentPair( path.dataPoints, ( dataPoint, previousDataPoint ) => {

      // Each segment of the dataPoint path needs a new canvas path to create the gradient effect.
      context.beginPath();

      // Get the start and end positions of the line-segment.
      const segmentStartPosition = this.modelViewTransform.modelToViewPosition( previousDataPoint.position );
      const segmentEndPosition = this.modelViewTransform.modelToViewPosition( dataPoint.position );

      // Draw the line-segment that connects the start and end positions.
      context.moveTo( segmentStartPosition.x, segmentStartPosition.y );
      context.lineTo( segmentEndPosition.x, segmentEndPosition.y );

      // Linearly reduce the stroke-alpha to give a "fade over-time" illusion.
      const alpha = Utils.linear( firstPathDataPointTime, lastPathDataPointTime, 0, 1, dataPoint.time );
      context.strokeStyle = this.scratchColor.set( color ).setAlpha( alpha ).toCSS();
      context.lineWidth = LINE_WIDTH;
      context.stroke();
      context.closePath();
    } );
  }
}

collisionLab.register( 'PathsNode', PathsNode );
export default PathsNode;