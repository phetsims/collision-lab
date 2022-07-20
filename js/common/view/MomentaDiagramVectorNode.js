// Copyright 2020-2022, University of Colorado Boulder

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
 * each prepopulatedBall, which are never disposed. Thus, MomentaDiagramVectorNodes are never disposed.
 *
 * @author Brandon Li
 */

import Multilink from '../../../../axon/js/Multilink.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Text } from '../../../../scenery/js/imports.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabColors from '../CollisionLabColors.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import MomentaDiagramVector from '../model/MomentaDiagramVector.js';
import PlayArea from '../model/PlayArea.js';

class MomentaDiagramVectorNode extends Node {

  /**
   * @param {MomentaDiagramVector} momentaDiagramVector
   * @param {string|number} label - what to label the MomentaDiagramVectorNode. Usually, this is the Balls index.
   * @param {ReadOnlyProperty.<ModelViewTransform2>} modelViewTransformProperty - for the MomentaDiagramAccordionBox
   * @param {Object} [options]
   */
  constructor( momentaDiagramVector, label, modelViewTransformProperty, options ) {
    assert && assert( momentaDiagramVector instanceof MomentaDiagramVector, `invalid momentaDiagramVector: ${momentaDiagramVector}` );
    assert && assert( typeof label === 'number' || typeof label === 'string', `invalid label: ${label}` );
    assert && AssertUtils.assertAbstractPropertyOf( modelViewTransformProperty, ModelViewTransform2 );

    options = merge( {

      // {number} - the dimension of the Screen that contains the MomentaDiagram
      dimension: PlayArea.Dimension.TWO,

      // {boolean} - indicates if this vector Node represents the total Momenta Vector.
      isTotalMomentaVector: false,

      // {number} - margin between the label and the arrow, in view coordinates.
      labelArrowMargin: 2,

      // {Object} - passed to the ArrowNode instance.
      arrowOptions: merge( {
        fill: CollisionLabColors.MOMENTUM_VECTOR_FILL,
        stroke: CollisionLabColors.MOMENTUM_VECTOR_STROKE
      }, CollisionLabConstants.ARROW_OPTIONS ),

      // {Object} - passed to the Text instance for the label.
      textOptions: {
        font: new PhetFont( { size: 14, weight: 500 } ),
        maxWidth: 30 // constrain width for i18n, determined empirically.
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
    Multilink.multilink( [ momentaDiagramVector.tailPositionProperty,
      momentaDiagramVector.tipPositionProperty,
      modelViewTransformProperty ], ( tailPosition, tipPosition, modelViewTransform ) => {

      // Only display the Vector and its label if the momentaDiagramVector has a magnitude that isn't effectively 0.
      arrowNode.visible = ( momentaDiagramVector.magnitude > CollisionLabConstants.ZERO_THRESHOLD );
      labelNode.visible = arrowNode.visible;
      if ( !arrowNode.visible ) { /** exit **/
        return;
      }

      // Get the position of the tail, center, and tip in view coordinates.
      const tailViewPosition = modelViewTransform.modelToViewPosition( tailPosition );
      const tipViewPosition = modelViewTransform.modelToViewPosition( tipPosition );
      const centerViewPosition = modelViewTransform.modelToViewPosition( momentaDiagramVector.center );

      // Update the positioning of the ArrowNode to match the MomentaDiagramVector.
      arrowNode.setTailAndTip( tailViewPosition.x, tailViewPosition.y, tipViewPosition.x, tipViewPosition.y );

      //----------------------------------------------------------------------------------------

      // Compute the adjusted offset of the label in view coordinates. It adds extra offset to consider the size
      // of the label.
      const adjustedOffset = options.labelArrowMargin + Math.max( labelNode.height, labelNode.width ) / 2;

      // Position the Label, which depends on the dimension and whether or not this the total momenta Vector.
      if ( options.dimension === PlayArea.Dimension.TWO ) {

        // Determine how the label should be positioned based on the type of Momenta Vector and what quadrant it's in.
        const yFlip = ( momentaDiagramVector.componentsProperty.value.y < 0 ) ? Math.PI : 0;
        const offsetAngleAdjustment = yFlip + ( options.isTotalMomentaVector ? Math.PI / 2 : -Math.PI / 2 );

        // Create an offset that is perpendicular to the vector. The angle is negative since the y-axis is inverted.
        const offset = Vector2.createPolar( adjustedOffset, -( momentaDiagramVector.angle + offsetAngleAdjustment ) );

        // Position the label.
        labelNode.center = centerViewPosition.plus( offset );
      }
      else if ( options.isTotalMomentaVector ) {

        // Position the label below the Momenta Vector.
        labelNode.centerTop = centerViewPosition.plusXY( 0, adjustedOffset * 0.5 );
      }
      else {

        // Position the label which depends on the sign of the x-component of the Momenta Vector.
        labelNode.center = tipViewPosition.plusXY( Math.sign( momentaDiagramVector.componentsProperty.value.x ) * adjustedOffset, 0 );
      }
    } );
  }
}

collisionLab.register( 'MomentaDiagramVectorNode', MomentaDiagramVectorNode );
export default MomentaDiagramVectorNode;