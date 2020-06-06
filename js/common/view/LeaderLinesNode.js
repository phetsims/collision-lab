// Copyright 2020, University of Colorado Boulder

/**
 * LeaderLinesNode is a specialized view to display guiding dashed lines from a location to the edge of a border.
 * In the 'Collision Lab' simulation, its purpose is to allow the user to line up Balls within the PlayArea's
 * coordinate system.
 *
 * LeaderLinesNode appears when Balls are being dragged. Contains a method to set the reticle position. They should
 * be instantiated once for every BallNode for multi touch (since dragging multiple Balls at once is allowed). Like
 * BallNodes, they are created at the start of the sim and are never disposed.
 *
 * @author Brandon Li
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Shape from '../../../../kite/js/Shape.js';
import merge from '../../../../phet-core/js/merge.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Color from '../../../../scenery/js/util/Color.js';
import collisionLab from '../../collisionLab.js';

class LeaderLinesNode extends Path {

  /**
   * @param {Bounds2} playAreaViewBounds - the Bounds of the PlayArea, in view coordinates.
   * @param {Object} [options]
   */
  constructor( playAreaViewBounds, options ) {
    assert && assert( playAreaViewBounds instanceof Bounds2, `invalid playAreaViewBounds: ${playAreaViewBounds}` );
    assert && assert( !options || Object.getPrototypeOf( options === Object.prototype ), `invalid options: ${options}` );

    options = merge( {

      lineDash: [ 10, 2 ],
      stroke: Color.BLACK

    }, options );

    super( new Shape().makeImmutable(), options );

    //----------------------------------------------------------------------------------------

    // @private {Bounds2} - reference to the passed-in playAreaViewBounds
    this.playAreaViewBounds = playAreaViewBounds;
  }

  /**
   * Sets the position of the reticle (intersection point) of the leader lines, in the parent coordinate-frame.
   * @public
   *
   * @param {Vector2} position - in view coordinates
   */
  set reticle( position ) {
    assert && assert( position instanceof Vector2 && position.isFinite(), `invalid position: ${position}` );

    this.shape = new Shape()
      .moveTo( this.playAreaViewBounds.minX, position.y )
      .horizontalLineTo( this.playAreaViewBounds.maxX )
      .moveTo( position.x, this.playAreaViewBounds.minY )
      .verticalLineTo( this.playAreaViewBounds.maxY )
      .makeImmutable();
  }
}

collisionLab.register( 'LeaderLinesNode', LeaderLinesNode );
export default LeaderLinesNode;