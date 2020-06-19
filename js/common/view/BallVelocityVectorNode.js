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

import merge from '../../../../phet-core/js/merge.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import DragListener from '../../../../scenery/js/listeners/DragListener.js';
import Circle from '../../../../scenery/js/nodes/Circle.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Color from '../../../../scenery/js/util/Color.js';
import collisionLab from '../../collisionLab.js';
import collisionLabStrings from '../../collisionLabStrings.js';
import CollisionLabColors from '../CollisionLabColors.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import Ball from '../model/Ball.js';
import BallVectorNode from './BallVectorNode.js';

class BallVelocityVectorNode extends BallVectorNode {

  /**
   * @param {Ball} ball - the ball model.
   * @param {number} dimensions - the dimensions of the PlayArea.
   * @param {Property.<boolean>} velocityVectorVisibleProperty
   * @param {Property.<boolean>} isPlayingProperty - indicates if the sim is playing.
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options]
   */
  constructor( ball, dimensions, velocityVectorVisibleProperty, isPlayingProperty, modelViewTransform, options ) {
    assert && assert( ball instanceof Ball, `invalid ball: ${ball}` );
    assert && assert( dimensions === 1 || dimensions === 2, `invalid dimensions: ${dimensions}` );
    assert && AssertUtils.assertPropertyOf( velocityVectorVisibleProperty, 'boolean' );
    assert && AssertUtils.assertPropertyOf( isPlayingProperty, 'boolean' );
    assert && assert( modelViewTransform instanceof ModelViewTransform2, `invalid modelViewTransform: ${modelViewTransform}` );

    options = merge( {

      // {number} - the radius of the tip-circle, in view coordinates.
      tipCircleRadius: 13,

      // super-class options
      arrowOptions: CollisionLabColors.VELOCITY_VECTOR_COLORS

    }, options );

    super( ball.positionProperty, ball.velocityProperty, velocityVectorVisibleProperty, modelViewTransform, options );

    //----------------------------------------------------------------------------------------

    // Create the Text instance that displays the velocity symbol. Position to be updated later.
    const velocitySymbolText = new Text( collisionLabStrings.symbol.velocity, {
      font: CollisionLabConstants.CONTROL_FONT,
      fill: Color.BLACK
    } );

    // Create the circle at the tip of the vector. Position to be updated later.
    const tipCircle = new Circle( options.tipCircleRadius, { stroke: Color.BLACK, cursor: 'pointer' } );

    // Add the tipCircle and the velocitySymbolText as children of this Node.
    this.addChild( tipCircle );
    this.addChild( velocitySymbolText );

    //----------------------------------------------------------------------------------------

    // Add a DragListener to the Tip Circle. When this happens, the velocity of the Ball changes based on the new
    // components of the velocity vector. Listener never removed since BallVelocityVectorNode are never disposed.
    tipCircle.addInputListener( new DragListener( {
      applyOffset: false,
      drag: ( event, listener ) => {

        // Update the xVelocity of the Ball first.
        ball.xVelocity = modelViewTransform.viewToModelDeltaX( listener.modelPoint.x );

        // If the dimensional PlayArea is 2D, then update the yVelocity of the Ball as well.
        ( dimensions === 2 ) && ( ball.yVelocity = modelViewTransform.viewToModelDeltaY( listener.modelPoint.y ) );
      },

      // Set the positionUserControlledProperty of the ball and the visibility of the leader-lines when dragging.
      start: ( event, listener ) => {
        ball.xVelocityUserControlledProperty.value = true;
        ( dimensions === 2 ) && ( ball.yVelocityUserControlledProperty.value = true );
      },
      end: () => {
        ball.xVelocityUserControlledProperty.value = false;
        ( dimensions === 2 ) && ( ball.yVelocityUserControlledProperty.value = false );
      }
    } ) );

    //----------------------------------------------------------------------------------------

    // Observe when the ballValueProperty changes and update the tip-circle position. Link is never unlinked since
    // BallVectorNodes are never disposed.
    ball.velocityProperty.link( velocity => {

      // Get the position of the tip in view coordinates. This is relative to our origin, which is the tail of the
      // Vector.
      tipCircle.center = modelViewTransform.modelToViewDelta( velocity );
      velocitySymbolText.center = tipCircle.center;
    } );

    // Observe when the sim's isPlayingProperty changes and update the visibility of the tip. The tip and the symbol are
    // only visible if and only if the simulation is paused. Link never unlinked BallVectorNodes are never disposed.
    isPlayingProperty.link( isPlaying => {
      tipCircle.visible = !isPlaying;
      velocitySymbolText.visible = !isPlaying;
    } );
  }
}

collisionLab.register( 'BallVelocityVectorNode', BallVelocityVectorNode );
export default BallVelocityVectorNode;