// Copyright 2020, University of Colorado Boulder

/**
 *
 * @author Brandon Li
 */

import Property from '../../../../axon/js/Property.js';
import merge from '../../../../phet-core/js/merge.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import Line from '../../../../scenery/js/nodes/Line.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Color from '../../../../scenery/js/util/Color.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabColors from '../../common/CollisionLabColors.js';
import CollisionLabConstants from '../../common/CollisionLabConstants.js';

const Y = 40;

class ChangeInMomentumVectorNode extends Node {

  /**
   * @param {Property.<Vector2>} changeInMomentumProperty
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options]
   */
  constructor( changeInMomentumProperty, ball, modelViewTransform, options ) {

    options = merge( {

      // {Object} - passed to the ArrowNode instance.
      arrowOptions: merge( {}, CollisionLabConstants.ARROW_OPTIONS, CollisionLabColors.MOMENTUM_VECTOR_COLORS )

    }, options );

    super( options );

    //----------------------------------------------------------------------------------------

    // Create the ArrowNode that represents the Vector. Initialized at 0 for now. To be updated below.
    const arrowNode = new ArrowNode( 0, 0, 0, 0, options.arrowOptions );

    const line = new Line( {
      lineDash: [ 10, 2 ],
      stroke: Color.BLACK
    } );

    // Set the children of this Node in the correct rendering order.
    this.children = [
      arrowNode,
      line
    ];

    //----------------------------------------------------------------------------------------

    Property.multilink( [ ball.positionProperty,
      changeInMomentumProperty  ], ( position, components ) => {

        // Only display the Vector and its label if the momentaDiagramVector has a magnitude that isn't effectively 0.
        this.visible = ( components.magnitude > CollisionLabConstants.ZERO_THRESHOLD );
        if ( !this.visible ) { /** exit **/ return; }

        const ballViewPosition = modelViewTransform.modelToViewPosition( position );

        const tailViewPosition = ballViewPosition.copy().setY( Y );
        const tipViewPosition = tailViewPosition.plus(  modelViewTransform.modelToViewDelta( components ) );

        // Update the positioning of the ArrowNode to match the MomentaDiagramVector.
        arrowNode.setTailAndTip( tailViewPosition.x, tailViewPosition.y, tipViewPosition.x, tipViewPosition.y );

        line.setLine( ballViewPosition.x, ballViewPosition.y, tailViewPosition.x, tailViewPosition.y );
     } );
  }
}

collisionLab.register( 'ChangeInMomentumVectorNode', ChangeInMomentumVectorNode );
export default ChangeInMomentumVectorNode;