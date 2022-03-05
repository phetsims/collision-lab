// Copyright 2020-2022, University of Colorado Boulder

/**
 * LeaderLinesNode is a specialized view to display guiding dashed lines from a location to the edge of a bounding box.
 * In the 'Collision Lab' simulation, its purpose is to allow the user to line up Balls within the PlayArea's
 * coordinate system.
 *
 * LeaderLinesNode appears when Balls are being dragged. It contains a method to set the reticle position. They should
 * be instantiated once for every BallNode for multi-touch (since dragging multiple Balls at once is allowed). Like
 * BallNodes, they are created at the start of the sim and are never disposed.
 *
 * @author Brandon Li
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import merge from '../../../../phet-core/js/merge.js';
import { Path } from '../../../../scenery/js/imports.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabColors from '../CollisionLabColors.js';

class LeaderLinesNode extends Path {

  /**
   * @param {Bounds2} leaderLinesBounds - the Bounding box of the lines, in the parent-coordinate frame.
   * @param {Object} [options]
   */
  constructor( leaderLinesBounds, options ) {
    assert && assert( leaderLinesBounds instanceof Bounds2, `invalid leaderLinesBounds: ${leaderLinesBounds}` );

    options = merge( {

      lineDash: [ 10, 2 ],
      stroke: CollisionLabColors.BALL_LEADER_LINES_COLOR

    }, options );

    super( new Shape().makeImmutable(), options );

    //----------------------------------------------------------------------------------------

    // @private {Bounds2} - reference to the passed-in leaderLinesBounds
    this.leaderLinesBounds = leaderLinesBounds;
  }

  /**
   * Sets the position of the reticle (intersection point) of the leader lines, in the parent coordinate-frame.
   * @public
   *
   * @param {Vector2} reticle - in view coordinates
   */
  setReticle( reticle ) {
    assert && assert( reticle instanceof Vector2 && reticle.isFinite(), `invalid reticle: ${reticle}` );
    assert && assert( this.leaderLinesBounds.containsPoint( reticle ), `reticle out of bounds: ${reticle}` );

    // Update the shape.
    this.shape = new Shape()
      .moveTo( this.leaderLinesBounds.minX, reticle.y )
      .horizontalLineTo( this.leaderLinesBounds.maxX )
      .moveTo( reticle.x, this.leaderLinesBounds.minY )
      .verticalLineTo( this.leaderLinesBounds.maxY )
      .makeImmutable();
  }
}

collisionLab.register( 'LeaderLinesNode', LeaderLinesNode );
export default LeaderLinesNode;