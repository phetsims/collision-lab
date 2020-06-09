// Copyright 2020, University of Colorado Boulder

/**
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
import Explore2DBallSystem from '../model/Explore2DBallSystem.js';
import PathCanvasNode from './PathCanvasNode.js';

class Explore2DBallSystemNode extends BallSystemNode {

  /**
   * @param {Explore2DBallSystem} ballSystem
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
    assert && assert( ballSystem instanceof Explore2DBallSystem, `invalid ballSystem: ${ballSystem}` );
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


    const ballPathsContainer = new Node();

    ballSystem.ballToPathMap.forEach( ( path, ball ) => {
      // Create the corresponding BallNode for each prepopulatedBall.
      const pathNode = new PathCanvasNode( path, modelViewTransform, {
        pathBaseColor: CollisionLabColors.BALL_COLORS[ ball.index - 1 ]
      } );

      // Add the BallNode to the container.
      ballPathsContainer.addChild( pathNode );
    } );

    //----------------------------------------------------------------------------------------

    // Create the corresponding view for the Center of Mass.
    const centerOfMassPath = new PathCanvasNode( ballSystem.centerOfMassPath, modelViewTransform, {
      pathBaseColor: CollisionLabColors.CENTER_OF_MASS_COLORS.fill
    } );
    ballPathsContainer.addChild( centerOfMassPath );

    this.addChild( ballPathsContainer );
    ballPathsContainer.moveToBack();
  }
}

collisionLab.register( 'Explore2DBallSystemNode', Explore2DBallSystemNode );
export default Explore2DBallSystemNode;