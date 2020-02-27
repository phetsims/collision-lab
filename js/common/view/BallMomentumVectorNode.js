// Copyright 2019, University of Colorado Boulder

/**
 * View for the Momentum Vector of Ball
 *
 * Responsible for:
 *  - Keeping the tail of the ArrowNode at the center of the Ball
 *  - Creating an API to update the direction and magnitude of the ArrowNode
 *
 * @author Martin Veillette
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import merge from '../../../../phet-core/js/merge.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import collisionLab from '../../collisionLab.js';
import BallVectorNode from './BallVectorNode.js';

class BallMomentumVectorNode extends BallVectorNode {

  /**
   * @param {Property.<Vector2>} momentumProperty
   * @param {Property.<boolean>} visibleProperty - Property that indicates if this node is visible
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options]
   */
  constructor( momentumProperty, visibleProperty, modelViewTransform, options ) {

    assert && assert( visibleProperty instanceof BooleanProperty, `invalid visibleProperty: ${visibleProperty}` );
    assert && assert( modelViewTransform instanceof ModelViewTransform2,
      `invalid modelViewTransform: ${modelViewTransform}` );
    assert && assert( !options || Object.getPrototypeOf( options ) === Object.prototype,
      `Extra prototype on Options: ${options}` );

    //----------------------------------------------------------------------------------------

    options = merge( {

      arrowOptions: {} // TODO
    }, options );

    super( momentumProperty, visibleProperty, modelViewTransform, options );

  }

}

collisionLab.register( 'BallMomentumVectorNode', BallMomentumVectorNode );
export default BallMomentumVectorNode;