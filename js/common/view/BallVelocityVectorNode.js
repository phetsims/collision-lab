// Copyright 2019-2020, University of Colorado Boulder

/**
 * View for the vectors of Balls. See https://github.com/phetsims/collision-lab/issues/24 for
 * an overview of the BallVector view hierarchy.
 *
 * Responsible for:
 *  - Keeping the tail of the ArrowNode at the center of the Ball
 *  - Creating an API to update the direction and magnitude of the ArrowNode
 *
 * @author Martin Veillette
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import DragListener from '../../../../scenery/js/listeners/DragListener.js';
import Circle from '../../../../scenery/js/nodes/Circle.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import collisionLab from '../../collisionLab.js';
import BallVectorNode from './BallVectorNode.js';

class BallVelocityVectorNode extends BallVectorNode {

  /**
   * @param {Property.<Vector2>} velocityProperty
   * @param {Property.<boolean>} visibleProperty - Property that indicates if this node is visible
   * @param {Property.<boolean>} playProperty
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options]
   */
  constructor( velocityProperty, visibleProperty, playProperty, modelViewTransform, options ) {

    assert && assert( visibleProperty instanceof BooleanProperty, `invalid visibleProperty: ${visibleProperty}` );
    assert && assert( modelViewTransform instanceof ModelViewTransform2,
      `invalid modelViewTransform: ${modelViewTransform}` );
    assert && assert( !options || Object.getPrototypeOf( options ) === Object.prototype,
      `Extra prototype on Options: ${options}` );

    //----------------------------------------------------------------------------------------

    super( velocityProperty, visibleProperty, modelViewTransform, options );

    // create label for the tip of velocity vector
    const tipLabelText = new Text( 'V', {
      font: new PhetFont( 16 ),
      center: Vector2.ZERO,
      fill: 'black'
    } );

    // create circular outline for the tip of velocity vector
    const tipCircle = new Circle( 10, { stroke: 'black' } );

    // create a layer node for the circular outline and tip label
    const tipTargetNode = new Node();
    tipTargetNode.addChild( tipCircle );
    tipTargetNode.addChild( tipLabelText );
    tipTargetNode.moveToBack();
    this.addChild( tipTargetNode );

    const tipPositionProperty = new Vector2Property( modelViewTransform.modelToViewDelta( velocityProperty.value ) );

    // create dragListener for the tip
    const tipDragListener = new DragListener( {
      positionProperty: tipPositionProperty
    } );

    // add input listener to tip of the velocity vector
    tipTargetNode.addInputListener( tipDragListener );

    const velocityListener = vector => {
      tipTargetNode.center = modelViewTransform.modelToViewDelta( vector );
    };
    velocityProperty.link( velocityListener );

    const tipPositionListener = velocity => {
      velocity = modelViewTransform.viewToModelDelta( velocity );
    };
    // update the velocity vector upon change of the tip position
    tipPositionProperty.link( tipPositionListener );

    const playListener = play => {tipTargetNode.visible = !play;};

    //  make the tip invisible if the simulation is running
    playProperty.link( playListener );

    // @private {function} disposeVelocityVectorNode - function to unlink listeners, called in dispose()
    this.disposeVelocityVectorNode = () => {
      playProperty.unlink( playListener );
      velocityProperty.unlink( velocityListener );
      tipPositionProperty.unlink( tipPositionListener );
      tipTargetNode.removeInputListener( tipDragListener );
      tipDragListener.dispose();
    };

  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.disposeVelocityVectorNode();
    super.dispose();
  }

}

collisionLab.register( 'BallVelocityVectorNode', BallVelocityVectorNode );
export default BallVelocityVectorNode;