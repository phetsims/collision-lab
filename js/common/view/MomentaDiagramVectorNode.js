// Copyright 2020, University of Colorado Boulder

/**
 * View for a single Vector that appears in the 'Momenta Diagram' accordion box at the bottom-right of each screen. This
 * view is intended to be used for both the Momenta Vectors of the Balls and the total Momenta Vector.
 *
 * Responsible for:
 *  - Keeping the updating an ArrowNode based on the MomentaDiagramVector's tail and tip.
 *  - Labeling the ArrowNode, usually with the index of the Ball but can be the 'total' string for the total Momenta
 *    Vector Node. The positioning is also handled.
 *
 * MomentaDiagramVectorNode is NOT responsible for updating its visibility. MomentaDiagramVectorNodes are created for
 * each prepoluatedBall, which are never disposed. Thus, MomentaDiagramVectorNodes are never disposed.
 *
 * @author Brandon Li
 */

import Property from '../../../../axon/js/Property.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabColors from '../CollisionLabColors.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import MomentaDiagramVector from '../model/MomentaDiagramVector.js';

class MomentaDiagramVectorNode extends Node {

  /**
   * @param {MomentaDiagramVector} momentaDiagramVector
   * @param {string|number} label - what to label the MomentaDiagramVectorNode. Usually, this is the Balls index.
   * @param {Property.<ModelViewTransform2>} modelViewTransformProperty - for the MomentaDiagramAccordionBox
   * @param {Object} [options]
   */
  constructor( momentaDiagramVector, label, modelViewTransformProperty, options ) {
    assert && assert( momentaDiagramVector instanceof MomentaDiagramVector, `invalid momentaDiagramVector: ${momentaDiagramVector}` );
    assert && assert( typeof label === 'number' || typeof label === 'string', `invalid label: ${label}` );
    assert && assert( modelViewTransformProperty instanceof Property && modelViewTransformProperty.value instanceof ModelViewTransform2, `invalid modelViewTransformProperty: ${modelViewTransformProperty}` );
    assert && assert( !options || Object.getPrototypeOf( options === Object.prototype ), `invalid options: ${options}` );

    options = merge( {

      // {number} - the dimensions of the Screen that contains the MomentaDiagram
      dimensions: 2,

      // {boolean} - indicates if this vector Node represents the total Momenta Vector.
      isTotalMomentaVector: false,

      // {number} - margin between the label and the arrow, in view coordinates.
      labelArrowMargin: 5,

      // {Object} - passed to the ArrowNode instance.
      arrowOptions: merge( {}, CollisionLabConstants.ARROW_OPTIONS, CollisionLabColors.MOMENTUM_VECTOR_COLORS ),

      // {Object} - passed to the Text instance for the label.
      textOptions: {
        font: new PhetFont( 13 )
      }

    }, options );

    super( options );

    //----------------------------------------------------------------------------------------

    // Create the ArrowNode that represents the Vector. Initialized at 0 for now. To be updated below.
    const arrowNode = new ArrowNode( 0, 0, 0, 0, options.arrowOptions );

    // Create a label for the vector that is displayed 'next' to the arrow. Positioning handled later.
    const labelNode = new Text( label, options.textOptions );

    // Set the children of this Node in the correct rendering order.
    this.children = [
      arrowNode,
      labelNode
    ];

    //----------------------------------------------------------------------------------------

    // Observe changes to the tail/tip of the Momenta Vector, or when the modelViewTransformProperty changes,
    // and mirror the positioning of the arrow and label in the view.
    Property.multilink( [ momentaDiagramVector.tailPositionProperty,
      momentaDiagramVector.tipPositionProperty,
      modelViewTransformProperty ], ( tailPosition, tipPosition, modelViewTransform ) => {

        // Get the position of the tail, center, and tip in view coordinates.
        const tailViewPosition = modelViewTransform.modelToViewPosition( tailPosition );
        const tipViewPosition = modelViewTransform.modelToViewPosition( tipPosition );
        const centerViewPosition = modelViewTransform.modelToViewPosition( momentaDiagramVector.center );

        // Update the positioning of the ArrowNode to match the MomentaDiagramVector.
        arrowNode.setTailAndTip( tailViewPosition.x, tailViewPosition.y, tipViewPosition.x, tipViewPosition.y );

        // Compute the adjusted offset of the label in view coordinates. It adds extra offset to consider the size
        // of the label.
        const adjustedOffset = options.labelArrowMargin + Math.max( labelNode.height, labelNode.width ) / 2;

        // Position the Label, which depends on the dimensions and whether or not this the total momenta Vector.
        if ( options.dimensions === 2 || options.isTotalMomentaVector ) {

          // Determine how the label should be positioned based on the type of Momenta Vector and what quadrant it's in.
          const yFlip = ( momentaDiagramVector.components.y < 0 ) ? Math.PI : 0;
          const offsetAngleAdjustment = yFlip + ( options.isTotalMomentaVector ? Math.PI / 2 : -Math.PI / 2 );

          // Create an offset that is perpendicular to the vector. The angle is negative since the y-axis is inverted.
          const offset = Vector2.createPolar( adjustedOffset, -( momentaDiagramVector.angle + offsetAngleAdjustment ) );

          // Position the label.
          labelNode.center = centerViewPosition.plus( offset );
        }
        else {

          // Position the label which depends on the sign of the x-component of the Momenta Vector.
          labelNode.center = tipViewPosition.plusXY( Utils.sign( momentaDiagramVector.components.x ) * adjustedOffset, 0 );
        }
     } );
  }
}

collisionLab.register( 'MomentaDiagramVectorNode', MomentaDiagramVectorNode );
export default MomentaDiagramVectorNode;