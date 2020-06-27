// Copyright 2020, University of Colorado Boulder

/**
 * TracedBallSystemNode is a BallSystemNode sub-type for TracedBallSystems. See BallSystemNode for context.
 *
 * Adds the following functionality to BallSystemNode:
 *   - Create a PathCanvasNode for all possible Balls.
 *   - Create a PathCanvasNode for the center of mass.
 *
 * TracedBallSystemNode takes advantage of the prepopulatedBalls, which all Balls in the system must be apart of,
 * by creating a PathCanvasNode of all possible Balls and never having to dispose them. There is no performance loss
 * since Balls not in the BallSystem are not stepped or updated, meaning their paths are not updated.
 *
 * Since the pathVisibleProperty (see TraceBallSystem) is in the model, there is no need to adjust the visibility
 * of PathCanvasNodes since Paths are empty in the model when they are not visible.
 *
 * @author Brandon Li
 */

import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabColors from '../../common/CollisionLabColors.js';
import PlayArea from '../../common/model/PlayArea.js';
import BallSystemNode from '../../common/view/BallSystemNode.js';
import TraceBallSystem from '../model/TraceBallSystem.js';
import PathCanvasNode from './PathCanvasNode.js';

class TracedBallSystemNode extends BallSystemNode {

  /**
   * @param {TraceBallSystem} ballSystem
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
    assert && assert( ballSystem instanceof TraceBallSystem, `invalid ballSystem: ${ballSystem}` );
    assert && assert( playArea instanceof PlayArea, `invalid playArea: ${playArea}` );
    assert && AssertUtils.assertPropertyOf( valuesVisibleProperty, 'boolean' );
    assert && AssertUtils.assertPropertyOf( velocityVectorVisibleProperty, 'boolean' );
    assert && AssertUtils.assertPropertyOf( momentumVectorVisibleProperty, 'boolean' );
    assert && AssertUtils.assertPropertyOf( isPlayingProperty, 'boolean' );
    assert && assert( modelViewTransform instanceof ModelViewTransform2, `invalid modelViewTransform: ${modelViewTransform}` );

    super( ballSystem,
           playArea,
           valuesVisibleProperty,
           velocityVectorVisibleProperty,
           momentumVectorVisibleProperty,
           isPlayingProperty,
           modelViewTransform,
           options );

    //----------------------------------------------------------------------------------------

    // Create the container for all Ball Paths.
    const ballPathsContainer = new Node();

    // Loop through each possible Path and create the corresponding PathCanvasNode. There is no need to adjust the
    // visibility of PathCanvasNodes since Paths are empty in the model when they are not visible.
    ballSystem.ballToPathMap.forEach( ( path, ball ) => {

      // Create the corresponding PathCanvasNode for each Path.
      const pathNode = new PathCanvasNode( path, modelViewTransform, {
        pathBaseColor: CollisionLabColors.BALL_COLORS[ ball.index - 1 ]
      } );

      // Add the PathNode to the container.
      ballPathsContainer.addChild( pathNode );
    } );

    //----------------------------------------------------------------------------------------

    // Create the corresponding view for the Path of the center of mass.
    const centerOfMassPath = new PathCanvasNode( ballSystem.centerOfMassPath, modelViewTransform, {
      pathBaseColor: CollisionLabColors.CENTER_OF_MASS_COLORS.fill
    } );

    // Add all Paths as children of this Node.
    this.addChild( ballPathsContainer );
    this.addChild( centerOfMassPath );

    // Move the Paths to the back of this Node's children so that the Balls in the super class are rendered above the
    // Paths. Order here matters: the centerOfMassPath should be on top of the Paths of the Balls.
    centerOfMassPath.moveToBack();
    ballPathsContainer.moveToBack();
  }
}

collisionLab.register( 'TracedBallSystemNode', TracedBallSystemNode );
export default TracedBallSystemNode;