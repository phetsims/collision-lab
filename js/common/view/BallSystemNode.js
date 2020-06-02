// Copyright 2020, University of Colorado Boulder

/**
 * BallSystemNode is the corresponding view for BallSystems for displaying a collection of Balls. They appear inside of
 * PlayAreaNodes in all screens.
 *
 * The BallSystemNode displays:
 *   - BallNodes for each Ball in the system.
 *   - Displaying the Center of Mass
 *
 * BallSystemNode takes advantage of the prepopulatedBalls in the PlayArea, which all Balls in the system must be
 * apart of. Instead of creating a BallNode each time a Ball is added to the system, it creates a BallNode for each
 * prepopulatedBall and adjusts its visibility based on whether or not it is the system. Thus, BallNodes and
 * BallSystemNodes are never disposed.
 *
 * NOTE: Do not translate this node. It's origin must be at the origin of the view coordinate frame.
 *
 * @author Brandon Li
 */

import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabUtils from '../CollisionLabUtils.js';
import BallSystem from '../model/BallSystem.js';
import PlayArea from '../model/PlayArea.js';
import BallNode from './BallNode.js';

class BallSystemNode extends Node {

  /**
   * @param {BallSystem} ballSystem
   * @param {PlayArea} playArea
   * @param {Property.<boolean>} valuesVisibleProperty
   * @param {Property.<boolean>} velocityVectorVisibleProperty
   * @param {Property.<boolean>} momentumVectorVisibleProperty
   * @param {Property.<boolean>} isPlayingProperty
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options]
   */
  constructor( ballSystem,
               playArea,
               valuesVisibleProperty,
               velocityVectorVisibleProperty,
               momentumVectorVisibleProperty,
               isPlayingProperty,
               modelViewTransform,
               options ) {
    assert && assert( ballSystem instanceof BallSystem, `invalid ballSystem: ${ballSystem}` );
    assert && assert( playArea instanceof PlayArea, `invalid playArea: ${playArea}` );
    assert && CollisionLabUtils.assertPropertyTypeof( valuesVisibleProperty, 'boolean' );
    assert && CollisionLabUtils.assertPropertyTypeof( velocityVectorVisibleProperty, 'boolean' );
    assert && CollisionLabUtils.assertPropertyTypeof( momentumVectorVisibleProperty, 'boolean' );
    assert && CollisionLabUtils.assertPropertyTypeof( isPlayingProperty, 'boolean' );
    assert && CollisionLabUtils.assertPropertyTypeof( modelViewTransform, 'boolean' );
    assert && assert( modelViewTransform instanceof ModelViewTransform2, `invalid modelViewTransform: ${modelViewTransform}` );
    assert && assert( !options || Object.getPrototypeOf( options === Object.prototype ), `invalid options: ${options}` );

    super( options );

    //----------------------------------------------------------------------------------------


    const addItemAddedBallListener = addedBall => {

      const addedBallNode = new BallNode( addedBall,
        valuesVisibleProperty,
        velocityVectorVisibleProperty,
        momentumVectorVisibleProperty,
        playArea.isConstantSizeProperty,
        isPlayingProperty,
        playArea.pathVisibleProperty,
        modelViewTransform );
      this.ballLayerNode.addChild( addedBallNode );

      // Observe when the ball is removed to unlink listeners
      const removeBallListener = removedBall => {
        if ( removedBall === addedBall ) {
          this.ballLayerNode.removeChild( addedBallNode );
          addedBallNode.dispose();
          playArea.ballSystem.balls.removeItemRemovedListener( removeBallListener );
        }
      };
      playArea.ballSystem.balls.addItemRemovedListener( removeBallListener );
    };

    playArea.ballSystem.balls.forEach( addItemAddedBallListener );
    playArea.ballSystem.balls.addItemAddedListener( addItemAddedBallListener );


  }
}

collisionLab.register( 'BallSystemNode', BallSystemNode );
export default BallSystemNode;