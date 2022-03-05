// Copyright 2020-2022, University of Colorado Boulder

/**
 * BallSystemNode is the corresponding view for BallSystems for displaying a collection of Balls. They appear inside of
 * PlayAreaNodes in all screens.
 *
 * The BallSystemNode displays:
 *   - BallNodes for each Ball in the system.
 *   - Displaying the Center of Mass.
 *   - PathsNode for all 'paths'.
 *
 * BallSystemNode takes advantage of the prepopulatedBalls in the BallSystem, which all Balls in the system must be
 * apart of. Instead of creating a BallNode each time a Ball is added to the system, it creates a BallNode for each
 * prepopulatedBall and adjusts its visibility based on whether or not it is in the system. There is no performance loss
 * since Balls not in the BallSystem are not stepped or updated. Thus, BallNodes and BallSystemNodes are never disposed.
 *
 * NOTE: Do not translate this node. It's origin must be at the origin of the view coordinate frame.
 *
 * @author Brandon Li
 */

import { Shape } from '../../../../kite/js/imports.js';
import merge from '../../../../phet-core/js/merge.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import { Node } from '../../../../scenery/js/imports.js';
import collisionLab from '../../collisionLab.js';
import BallSystem from '../model/BallSystem.js';
import PlayArea from '../model/PlayArea.js';
import BallNode from './BallNode.js';
import CenterOfMassNode from './CenterOfMassNode.js';
import PathsNode from './PathsNode.js';

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
    assert && AssertUtils.assertPropertyOf( valuesVisibleProperty, 'boolean' );
    assert && AssertUtils.assertPropertyOf( velocityVectorVisibleProperty, 'boolean' );
    assert && AssertUtils.assertPropertyOf( momentumVectorVisibleProperty, 'boolean' );
    assert && AssertUtils.assertPropertyOf( isPlayingProperty, 'boolean' );
    assert && assert( modelViewTransform instanceof ModelViewTransform2, `invalid modelViewTransform: ${modelViewTransform}` );

    options = merge( {
      preventFit: true
    }, options );

    super( options );

    //----------------------------------------------------------------------------------------

    // Create the container for all Ball Nodes.
    const ballNodeContainer = new Node();

    // @private {Array.<Node>} - Ordered ball nodes, so we can reset ordering.
    this.ballNodes = [];

    // Loop through each possible Ball. These Balls are NOT necessarily the Balls currently within the BallSystem,
    // so we are responsible for updating its visibility based on whether or not it is the system.
    ballSystem.prepopulatedBalls.forEach( ball => {

      // Create the corresponding BallNode for each prepopulatedBall.
      const ballNode = new BallNode( ball,
        ballSystem,
        valuesVisibleProperty,
        velocityVectorVisibleProperty,
        momentumVectorVisibleProperty,
        playArea.elasticityPercentProperty,
        isPlayingProperty,
        modelViewTransform );

      // Add the BallNode to the container.
      ballNodeContainer.addChild( ballNode );
      this.ballNodes.push( ballNode );

      // Observe when Balls are added or removed from the BallSystem, meaning its visibility could change if it is
      // added or removed from the system. It should only be visible if the ball is in the BallSystem.
      ballSystem.balls.lengthProperty.link( () => {
        ballNode.visible = ballSystem.balls.includes( ball );
      } );

      // Observe when the user controls the Ball and move the BallNode to the front of its layer. Link is never
      // unlinked since Balls are never disposed.
      ball.userControlledProperty.link( userControlled => { userControlled && ballNode.moveToFront(); } );
    } );

    //----------------------------------------------------------------------------------------

    // Create the corresponding view for the Center of Mass.
    const centerOfMassNode = new CenterOfMassNode(
      ballSystem.centerOfMass,
      ballSystem.centerOfMassVisibleProperty,
      valuesVisibleProperty,
      playArea.bounds,
      modelViewTransform
    );

    // Create the PathsNode for the trailing 'Path' behind the Balls and the center of mass.
    const pathsNode = new PathsNode(
      ballSystem.prepopulatedBalls,
      ballSystem.centerOfMass.path,
      playArea.bounds,
      modelViewTransform, {
        clipArea: Shape.bounds( modelViewTransform.modelToViewBounds( playArea.bounds ) )
      }
    );

    //----------------------------------------------------------------------------------------

    // Set the children of this Node to the correct rendering order.
    this.children = [
      pathsNode,
      ballNodeContainer,
      centerOfMassNode
    ];
  }

  /**
   * Resets values to their original state
   * @public
   */
  reset() {
    this.ballNodes.forEach( node => node.moveToFront() );
  }
}

collisionLab.register( 'BallSystemNode', BallSystemNode );
export default BallSystemNode;