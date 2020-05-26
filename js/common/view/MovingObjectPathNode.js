// Copyright 2020, University of Colorado Boulder

/**
 * A view that renders the trace Path of recent DataPoints for a single generic MovingObject, which includes Balls and
 * the CenterOfMass.
 *
 * It is a sub-type of CanvasNode to linearly reduce the stroke-alpha to give a "fade over-time" illusion. See
 * https://github.com/phetsims/collision-lab/issues/61 for context on the decision to use CanvasNode.
 *
 * MovingObjectPathNodes are only visible if the 'Path' checkbox is checked.
 *
 * @author Brandon Li
 */

import CanvasNode from '../../../../scenery/js/nodes/CanvasNode.js';
import collisionLab from '../../collisionLab.js';

class MovingObjectPathNode extends CanvasNode {

  /**
   *
   */
  constructor() {
    super();
  }
}

collisionLab.register( 'MovingObjectPathNode', MovingObjectPathNode );
export default MovingObjectPathNode;