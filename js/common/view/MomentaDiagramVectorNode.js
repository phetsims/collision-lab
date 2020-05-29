// Copyright 2019-2020, University of Colorado Boulder

/**
 * View for a single Vector that appears in the 'Momenta Diagram' accordion box at the bottom-right of each screen. This
 * view is intended to be used for both the Momenta Vectors of the Balls and the total Momenta Vector.
 *
 * Responsible for:
 *  - Keeping the updating an ArrowNode based on the MomentaDiagramVector's tail and tip.
 *  - Labeling the ArrowNode, usually with the index of the Ball but a string for the total Momenta Vector.
 *
 * MomentaDiagramVectorNode is NOT responsible for updating its visibility. MomentaDiagramVectorNodes are created for
 * each prepoluatedBall, which are never disposed. Thus, MomentaDiagramVectorNodes are never disposed.
 *
 * @author Brandon Li
 */

import Property from '../../../../axon/js/Property.js';
import merge from '../../../../phet-core/js/merge.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabColors from '../CollisionLabColors.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import MomentaDiagramVector from '../model/MomentaDiagramVector.js';

class MomentaDiagramVectorNode extends Node {

  /**
   * @param {MomentaDiagramVector} momentaDiagramVector
   * @param {string} label - what to label the MomentaDiagramVectorNode. Usually, this is the Balls index.
   * @param {Property.<ModelViewTransform2>} modelViewTransformProperty - for the MomentaDiagramAccordionBox
   * @param {Object} [options]
   */
  constructor( momentaDiagramVector, label, modelViewTransformProperty, options ) {
    assert && assert( momentaDiagramVector instanceof MomentaDiagramVector, `invalid momentaDiagramVector: ${momentaDiagramVector}` );
    assert && assert( typeof label === 'string', `invalid label: ${label}` );
    assert && assert( modelViewTransformProperty instanceof Property && modelViewTransformProperty.value instanceof ModelViewTransform2, `invalid modelViewTransformProperty: ${modelViewTransformProperty}` );
    assert && assert( !options || Object.getPrototypeOf( options === Object.prototype ), `invalid options: ${options}` );

    options = merge( {

      arrowOptions: merge( {}, CollisionLabConstants.ARROW_OPTIONS, CollisionLabColors.MOMENTUM_VECTOR_COLORS )


    }, options );

    super( options );

    //----------------------------------------------------------------------------------------

    // Create the ArrowNode that represents the Vector. Initialized at 0 for now. To be updated below.
    const arrowNode = new ArrowNode( 0, 0, 0, 0, options );

    // Observe.
    Property.multilink( [ modelViewTransformProperty,
      momentaDiagramVector.tailPositionProperty,
      momentaDiagramVector.tipPositionProperty
    ], ( modelViewTransform, tailPosition, tipPosition ) => {

      const tailViewPosition = modelViewTransform.modelToViewPosition( tailPosition );
      const tipViewPosition = modelViewTransform.modelToViewPosition( tipPosition );

      arrowNode.setTailAndTip( tailViewPosition.x, tailViewPosition.y, tipViewPosition.x, tipViewPosition.y );


      // Update Label
     } );

    this.children = [

      arrowNode
    ];
  }
}

collisionLab.register( 'MomentaDiagramVectorNode', MomentaDiagramVectorNode );
export default MomentaDiagramVectorNode;