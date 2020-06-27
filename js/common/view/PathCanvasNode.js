// Copyright 2020, University of Colorado Boulder

/**
 * A view that renders the trailing 'Path' behind a moving object, including Balls and the Center of Mass, using
 * its PathDataPoints array.
 *
 * It is a sub-type of CanvasNode to linearly reduce the stroke-alpha to give a "fade over-time" illusion. Opacity is
 * determined by how long ago the PathDataPoint was recorded. See https://github.com/phetsims/collision-lab/issues/61
 * for context on the decision to use CanvasNode. There is no need to adjust the visibility of PathCanvasNodes since
 * Paths are empty in the model when they are not visible.
 *
 * PathCanvasNodes are created for each Ball, which are never disposed, meaning PathCanvasNodes are also never disposed
 * disposed and internal links are left as-is. This doesn't negatively impact performance since Balls that aren't in the
 * system aren't stepped and their positions don't change. See TracedBallSystem for more context.
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
import PaintDef from '../../../../scenery/js/util/PaintDef.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabUtils from '../../common/CollisionLabUtils.js';
import CollisionLabPath from '../model/CollisionLabPath.js';

// constants
const LINE_WIDTH = 2.3; // lineWidth of the Path

class PathCanvasNode extends CanvasNode {

  /**
   * @param {CollisionLabPath} path - the Path model that is rendered.
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options]
   */
  constructor( path, modelViewTransform, options ) {
    assert && assert( path instanceof CollisionLabPath, `invalid path: ${path}` );
    assert && assert( modelViewTransform instanceof ModelViewTransform2, `invalid modelViewTransform: ${modelViewTransform}` );

    options = merge( {

      // {PaintDef} - the base color of the Path. Alpha will be linearly reduced.
      pathBaseColor: Color.BLACK,

      // superclass options
      canvasBounds: modelViewTransform.modelToViewBounds( path.playAreaBounds )

    }, options );

    super( options );

    //----------------------------------------------------------------------------------------

    // @private {CollisionLabPath} - reference the passed-in Path model.
    this.path = path;

    // @private {ModelViewTransform2} - reference the passed-in modelViewTransform.
    this.modelViewTransform = modelViewTransform;

    // @private {Color} - reference the base color of the Path.
    this.baseColor = PaintDef.toColor( options.pathBaseColor );

    //----------------------------------------------------------------------------------------

    // Observe when the Path trail of the MovingObject should be redrawn. This is never removed since
    // PathCanvasNodes are never disposed and persist for the lifetime of the simulation.
    path.redrawPathEmitter.addListener( () => {
      this.invalidatePaint();
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

    // If there are not enough PathDataPoints, do not repaint.
    if ( this.path.dataPoints.length <= 1 ) { return; /* Do nothing */ }

    // Reference the time of the first and last PathDataPoints.
    const firstPathDataPointTime = this.path.dataPoints[ 0 ].time;
    const lastPathDataPointTime = _.last( this.path.dataPoints ).time;

    // Draw the segments that connect each of the PathDataPoints by iterating pairwise.
    CollisionLabUtils.forEachAdjacentPair( this.path.dataPoints, ( dataPoint, previousDataPoint ) => {

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
      context.strokeStyle = this.baseColor.setAlpha( alpha ).toCSS();
      context.lineWidth = LINE_WIDTH;
      context.stroke();
      context.closePath();
    } );
  }
}

collisionLab.register( 'PathCanvasNode', PathCanvasNode );
export default PathCanvasNode;