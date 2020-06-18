// Copyright 2019-2020, University of Colorado Boulder

/**
 * BallVelocityVectorNode is a BallVectorNode subtype for a single Ball's velocity vector. They appear in all screens
 * of the 'Collision Lab' simulation when the 'Velocity' checkbox is checked.
 *
 * Adds the following functionality to BallVectorNode:
 *   - Adds a circle at the tip of the Vector, with the velocity symbol on top of it. The tip and the symbol are only
 *     visible if and only if the simulation is paused.
 *
 *   - If the tip of the Vector is dragged, the velocity of the Ball changes based on the new components of the
 *     velocity vector. Dragging the dip of the vector indicates that the user is controlling both components of the
 *     Ball's velocity.
 *
 * For the 'Collision Lab' sim, BallVelocityVectorNode are instantiated at the start and are never disposed.
 * See BallVectorNode for more background.
 *
 * @author Brandon Li
 * @author Martin Veillette
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import merge from '../../../../phet-core/js/merge.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import DragListener from '../../../../scenery/js/listeners/DragListener.js';
import Circle from '../../../../scenery/js/nodes/Circle.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabColors from '../CollisionLabColors.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import BallVectorNode from './BallVectorNode.js';

const BALL_VELOCITY_VECTOR_OPTIONS = merge(
  CollisionLabColors.VELOCITY_VECTOR_COLORS, CollisionLabConstants.ARROW_OPTIONS
);

class BallVelocityVectorNode extends BallVectorNode {

  /**
   * @param {Property.<Vector2>} velocityProperty
   * @param {Property.<boolean>} userControlledProperty
   * @param {Property.<boolean>} visibleProperty - Property that indicates if this node is visible
   * @param {Property.<boolean>} isPlayingProperty
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options]
   */
  constructor( ball, velocityProperty, xUserControlledProperty, yUserControlledProperty, visibleProperty, isPlayingProperty, modelViewTransform, options ) {

    assert && assert( visibleProperty instanceof BooleanProperty, `invalid visibleProperty: ${visibleProperty}` );
    assert && assert( modelViewTransform instanceof ModelViewTransform2,
      `invalid modelViewTransform: ${modelViewTransform}` );
    assert && assert( !options || Object.getPrototypeOf( options ) === Object.prototype,
      `Extra prototype on Options: ${options}` );

    //----------------------------------------------------------------------------------------

    super( velocityProperty, visibleProperty, modelViewTransform, BALL_VELOCITY_VECTOR_OPTIONS );

    // create label for the tip of velocity vector
    const tipLabelText = new Text( 'V', {
      font: new PhetFont( 16 ),
      center: Vector2.ZERO,
      fill: 'black'
    } );

    // create circular outline for the tip of velocity vector
    const tipCircle = new Circle( 13, { stroke: 'black' } );

    // create a layer node for the circular outline and tip label
    const tipTargetNode = new Node();
    tipTargetNode.addChild( tipCircle );
    tipTargetNode.addChild( tipLabelText );
    tipTargetNode.moveToBack();
    this.addChild( tipTargetNode );

    const tipPositionProperty = new Vector2Property( modelViewTransform.modelToViewDelta( velocityProperty.value ) );

    // create dragListener for the tip
    const tipDragListener = new DragListener( {
      positionProperty: tipPositionProperty,
      start: () => {
        xUserControlledProperty.value = true;
        yUserControlledProperty.value = true;
      },
      end: () => {
        xUserControlledProperty.value = false;
        yUserControlledProperty.value = false;
      }
    } );

    // add input listener to tip of the velocity vector
    tipTargetNode.addInputListener( tipDragListener );

    const velocityListener = vector => {
      tipTargetNode.center = modelViewTransform.modelToViewDelta( vector );
    };
    velocityProperty.link( velocityListener );

    const tipPositionListener = velocity => {
      if ( ball.playArea.dimensions === 2 ) {
        ball.velocity = modelViewTransform.viewToModelDelta( velocity );
      }
      else {
        ball.xVelocity = modelViewTransform.viewToModelDeltaX( velocity.x );
        ball.yVelocity = 0;
      }
    };
    // update the velocity vector upon change of the tip position
    tipPositionProperty.lazyLink( tipPositionListener );

    const playListener = play => { tipTargetNode.visible = !play; };

    //  make the tip invisible if the simulation is running
    isPlayingProperty.link( playListener );
  }
}

collisionLab.register( 'BallVelocityVectorNode', BallVelocityVectorNode );
export default BallVelocityVectorNode;