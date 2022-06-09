// Copyright 2019-2022, University of Colorado Boulder

/**
 * BallMomentumVectorNode is a BallVectorNode subtype for a single Ball's momentum vector. They appear in all screens
 * of the 'Collision Lab' simulation when the 'Momentum' checkbox is checked.
 *
 * Currently, it adds no additional Properties to the super-class, but is provided for symmetry in the view hierarchy.
 * Like its super-class, BallMomentumVectorNode persists for the lifetime of the simulation and are never disposed.
 * See BallNode.js for more background.
 *
 * @author Brandon Li
 * @author Martin Veillette
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabColors from '../CollisionLabColors.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import BallVectorNode from './BallVectorNode.js';

// constants
const MOMENTUM_VECTOR_HEAD_DILATION_SCALE = 1.4; // See https://github.com/phetsims/collision-lab/issues/130.
const MOMENTUM_VECTOR_TAIL_DILATION_SCALE = 1.8; // See https://github.com/phetsims/collision-lab/issues/130.

class BallMomentumVectorNode extends BallVectorNode {

  /**
   * @param {Property.<Vector2>} ballPositionProperty - the position of the Ball, in meters.
   * @param {ReadOnlyProperty.<Vector2>} momentumProperty - the momentum of the Ball, in kg*(m/s).
   * @param {Property.<boolean>} momentumVectorVisibleProperty
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options]
   */
  constructor( ballPositionProperty, momentumProperty, momentumVectorVisibleProperty, modelViewTransform, options ) {
    assert && AssertUtils.assertPropertyOf( ballPositionProperty, Vector2 );
    assert && AssertUtils.assertAbstractPropertyOf( momentumProperty, Vector2 );
    assert && AssertUtils.assertPropertyOf( momentumVectorVisibleProperty, 'boolean' );
    assert && assert( modelViewTransform instanceof ModelViewTransform2, `invalid modelViewTransform: ${modelViewTransform}` );

    options = merge( {

      // super-class options
      arrowOptions: {
        fill: CollisionLabColors.MOMENTUM_VECTOR_FILL,
        stroke: CollisionLabColors.MOMENTUM_VECTOR_STROKE,
        headWidth: CollisionLabConstants.ARROW_OPTIONS.headWidth * MOMENTUM_VECTOR_HEAD_DILATION_SCALE,
        headHeight: CollisionLabConstants.ARROW_OPTIONS.headHeight * MOMENTUM_VECTOR_HEAD_DILATION_SCALE,
        tailWidth: CollisionLabConstants.ARROW_OPTIONS.tailWidth * MOMENTUM_VECTOR_TAIL_DILATION_SCALE
      }

    }, options );

    //----------------------------------------------------------------------------------------

    super( ballPositionProperty, momentumProperty, momentumVectorVisibleProperty, modelViewTransform, options );
  }
}

collisionLab.register( 'BallMomentumVectorNode', BallMomentumVectorNode );
export default BallMomentumVectorNode;