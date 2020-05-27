// Copyright 2020, University of Colorado Boulder

/**
 * A view that renders the trailing 'Path' behind a moving object, including Balls and the Center of Mass, using
 * its recent PathDataPoints.
 *
 * It is a sub-type of CanvasNode to linearly reduce the stroke-alpha to give a "fade over-time" illusion. See
 * https://github.com/phetsims/collision-lab/issues/61 for context on the decision to use CanvasNode.
 * PathCanvasNodes are also only visible and updated if the 'Path' checkbox is checked.
 *
 * If the path represents the trail of a Ball, then the PathCanvasNodes should be disposed when the Ball is removed
 * from the PlayArea. Otherwise, the path is trailing a center of mass and is never disposed since CenterOfMasses
 * last for the lifetime of the sim.
 *
 * @author Brandon Li
 */

import Property from '../../../../axon/js/Property.js';
import Utils from '../../../../dot/js/Utils.js';
import merge from '../../../../phet-core/js/merge.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import CanvasNode from '../../../../scenery/js/nodes/CanvasNode.js';
import Color from '../../../../scenery/js/util/Color.js';
import PaintDef from '../../../../scenery/js/util/PaintDef.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import Path from '../model/Path.js';

// constants
const LINE_WIDTH = 2.3; // lineWidth of the Path

class PathCanvasNode extends CanvasNode {

  /**
   * @param {Path} path - the Path model that is rendered.
   * @param {Property.<boolean>} pathVisibleProperty - indicates if the 'Path' is visible.
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options]
   */
  constructor( path, pathVisibleProperty, modelViewTransform, options ) {
    assert && assert( path instanceof Path, `invalid path: ${path}` );
    assert && assert( pathVisibleProperty instanceof Property && typeof pathVisibleProperty.value === 'boolean', `invalid pathVisibleProperty: ${pathVisibleProperty}` );
    assert && assert( modelViewTransform instanceof ModelViewTransform2, `invalid modelViewTransform: ${modelViewTransform}` );
    assert && assert( !options || Object.getPrototypeOf( options === Object.prototype ), `invalid options: ${options}` );

    options = merge( {

      // {PaintDef} the color of the Path of the Path. Alpha will be linearly reduced.
      pathBaseColor: Color.BLACK,

      // super-class options
      canvasBounds: modelViewTransform.modelToViewBounds( CollisionLabConstants.PLAY_AREA_BOUNDS )

    }, options );

    super( options );

    //----------------------------------------------------------------------------------------

    // @private {Path} - reference the passed-in Path model.
    this.path = path;

    // @private {ModelViewTransform2} - reference the passed-in modelViewTransform.
    this.modelViewTransform = modelViewTransform;

    // @private {Color} - reference the base color of the Path.
    this.baseColor = PaintDef.toColor( options.pathBaseColor );

    //----------------------------------------------------------------------------------------

    // Observe when the Path trail of the MovingObject should be redrawn. Listener is removed in the dispose method.
    const redrawPathEmitter = () => {
      this.invalidatePaint();
    };
    path.redrawPathEmitter.addListener( redrawPathEmitter );

    // Observe when the pathVisibleProperty changes to update our visibility. Link removed in the dispose method.
    const updateVisibilityListener = pathVisibleProperty.linkAttribute( this, 'visible' );

    // @private {function} - function that removes listeners. This is called in the dispose() method.
    this.disposeMovingObjectPathNode = () => {
      path.redrawPathEmitter.removeListener( redrawPathEmitter );
      pathVisibleProperty.unlinkAttribute( updateVisibilityListener );
    };
  }

  /**
   * Disposes the MovingObjectPathNode, releasing all links that it maintained.
   * @public
   * @override
   *
   * Called when the MovingObject is a Ball that removed from the PlayArea.
   */
  dispose() {
    this.disposeMovingObjectPathNode();
    super.dispose();
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

    // Draw the segments that connect each of the PathDataPoints.
    for ( let i = 1; i < this.path.dataPoints.length; i++ ) {

      // Each segment of the dataPoint path needs a new canvas path to create the gradient effect.
      context.beginPath();

      // Get the current and the previous dataPoint.
      const previousPathDataPoint = this.path.dataPoints[ i - 1 ];
      const currentPathDataPoint = this.path.dataPoints[ i ];

      // Get the start and end positions of the line-segment.
      const segmentStartPosition = this.modelViewTransform.modelToViewPosition( previousPathDataPoint.position );
      const segmentEndPosition = this.modelViewTransform.modelToViewPosition( currentPathDataPoint.position );

      // Draw the line-segment that connects the start and end positions.
      context.moveTo( segmentStartPosition.x, segmentStartPosition.y );
      context.lineTo( segmentEndPosition.x, segmentEndPosition.y );

      // Linearly reduce the stroke-alpha to give a "fade over-time" illusion.
      const alpha = Utils.linear( firstPathDataPointTime, lastPathDataPointTime, 0, 1, currentPathDataPoint.time );
      context.strokeStyle = this.baseColor.setAlpha( alpha ).toCSS();
      context.lineWidth = LINE_WIDTH;
      context.stroke();
      context.closePath();
    }
  }
}

collisionLab.register( 'PathCanvasNode', PathCanvasNode );
export default PathCanvasNode;