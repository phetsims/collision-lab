// Copyright 2020, University of Colorado Boulder

/**
 * A view that renders the trace Path of recent DataPoints for a single generic MovingObject, which includes Balls and
 * the CenterOfMass.
 *
 * It is a sub-type of CanvasNode to linearly reduce the stroke-alpha to give a "fade over-time" illusion. See
 * https://github.com/phetsims/collision-lab/issues/61 for context on the decision to use CanvasNode.
 * MovingObjectPathNodes are also only visible and updated if the 'Path' checkbox is checked.
 *
 * If the MovingObject is a Ball, then the MovingObjectPathNodes should be disposed if and when the Ball is removed
 * from the PlayArea. Otherwise, the MovingObject represents a center of mass and is never disposed since CenterOfMasses
 * last for the lifetime of the sim.
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
import CollisionLabConstants from '../CollisionLabConstants.js';
import MovingObject from '../model/MovingObject.js';

// constants
const LINE_WIDTH = 2.3; // lineWidth of the Path

class MovingObjectPathNode extends CanvasNode {

  /**
   * {MovingObject} movingObject - the generic MovingObject instance whose path is rendered.
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options]
   */
  constructor( movingObject, modelViewTransform, options ) {
    assert && assert( movingObject instanceof MovingObject, `invalid movingObject: ${movingObject}` );
    assert && assert( modelViewTransform instanceof ModelViewTransform2, `invalid modelViewTransform: ${modelViewTransform}` );
    assert && assert( !options || Object.getPrototypeOf( options === Object.prototype ), `invalid options: ${options}` );

    options = merge( {

      // {PaintDef} the color of the Path of the MovingObject. Alpha will be linearly reduced.
      pathBaseColor: Color.BLACK,

      // super-class options
      canvasBounds: modelViewTransform.modelToViewBounds( CollisionLabConstants.PLAY_AREA_BOUNDS )

    }, options );

    super( options );

    //----------------------------------------------------------------------------------------

    // @private {MovingObject} - reference the passed-in MovingObject.
    this.movingObject = movingObject;

    // @private {ModelViewTransform2} - reference the passed-in modelViewTransform.
    this.modelViewTransform = modelViewTransform;

    // @private {Color} - reference the base color of the Path.
    this.baseColor = PaintDef.toColor( options.pathBaseColor );

    //----------------------------------------------------------------------------------------

    // Observe when the Path trail of the MovingObject should be redrawn. Listener is removed in the dispose method.
    const redrawPathEmitter = () => {
      this.invalidatePaint();
    };
    movingObject.redrawPathEmitter.addListener( redrawPathEmitter );

    // @private {function} - function that removes listeners. This is called in the dispose() method.
    this.disposeMovingObjectPathNode = () => {
      movingObject.redrawPathEmitter.removeListener( redrawPathEmitter );
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
   * Draws the path along the DataPoints of a MovingObject.
   * @public
   * @override
   *
   * @param {CanvasRenderingContext2D} context
   */
  paintCanvas( context ) {

    // If the path is not visible or there are not enough DataPoints, do not update the path of the MovingObject.
    if ( this.movingObject.dataPoints.length <= 1 ) { return; /* Do nothing */ }

    // Reference the time of the first and last DataPoints.
    const firstDataPointTime = this.movingObject.dataPoints[ 0 ].time;
    const lastDataPointTime = _.last( this.movingObject.dataPoints ).time;


    // Draw the segments that connect each of the DataPoints.
    for ( let i = 1; i < this.movingObject.dataPoints.length; i++ ) {

      // Each segment of the dataPoint path needs a new canvas path to create the gradient effect.
      context.beginPath();

      // Get the current and the previous dataPoint.
      const previousDataPoint = this.movingObject.dataPoints[ i - 1 ];
      const currentDataPoint = this.movingObject.dataPoints[ i ];

      // Get the start and end positions of the line-segment.
      const segmentStartPosition = this.modelViewTransform.modelToViewPosition( previousDataPoint.position );
      const segmentEndPosition = this.modelViewTransform.modelToViewPosition( currentDataPoint.position );

      // Draw the line-segment that connects the start and end positions.
      context.moveTo( segmentStartPosition.x, segmentStartPosition.y );
      context.lineTo( segmentEndPosition.x, segmentEndPosition.y );

      // Linearly reduce the stroke-alpha to give a "fade over-time" illusion.
      const alpha = Utils.linear( firstDataPointTime, lastDataPointTime, 0, 1, currentDataPoint.time );
      context.strokeStyle = this.baseColor.setAlpha( alpha ).toCSS();
      context.lineWidth = LINE_WIDTH;
      context.stroke();
      context.closePath();
    }
  }
}

collisionLab.register( 'MovingObjectPathNode', MovingObjectPathNode );
export default MovingObjectPathNode;