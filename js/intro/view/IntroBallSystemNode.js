// Copyright 2020, University of Colorado Boulder

/**
 *
 * @author Brandon Li
 */

import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import collisionLab from '../../collisionLab.js';
import PlayArea from '../../common/model/PlayArea.js';
import BallSystemNode from '../../common/view/BallSystemNode.js';
import IntroBallSystem from '../model/IntroBallSystem.js';
import ChangeInMomentumVectorNode from './ChangeInMomentumVectorNode.js';

class IntroBallSystemNode extends BallSystemNode {

  /**
   * @param {IntroBallSystem} ballSystem
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
    assert && assert( ballSystem instanceof IntroBallSystem, `invalid ballSystem: ${ballSystem}` );
    assert && assert( playArea instanceof PlayArea, `invalid playArea: ${playArea}` );
    assert && AssertUtils.assertPropertyOf( valuesVisibleProperty, 'boolean' );
    assert && AssertUtils.assertPropertyOf( velocityVectorVisibleProperty, 'boolean' );
    assert && AssertUtils.assertPropertyOf( momentumVectorVisibleProperty, 'boolean' );
    assert && AssertUtils.assertPropertyOf( isPlayingProperty, 'boolean' );
    assert && assert( modelViewTransform instanceof ModelViewTransform2, `invalid modelViewTransform: ${modelViewTransform}` );
    assert && assert( !options || Object.getPrototypeOf( options === Object.prototype ), `invalid options: ${options}` );

    super( ballSystem,
           playArea,
           valuesVisibleProperty,
           velocityVectorVisibleProperty,
           momentumVectorVisibleProperty,
           isPlayingProperty,
           modelViewTransform,
           options );

    //----------------------------------------------------------------------------------------


    const changeInMomentumContainer = new Node();

    ballSystem.ballToChangeInMomentumVector.forEach( ( changeInMomentumVector, ball ) => {

      // Create the corresponding BallNode for each prepopulatedBall.
      const changeInMomentumVectorNode = new ChangeInMomentumVectorNode( changeInMomentumVector, ball, modelViewTransform );

      // Add the BallNode to the container.
      changeInMomentumContainer.addChild( changeInMomentumVectorNode );
    } );
    this.addChild( changeInMomentumContainer );
  }
}

collisionLab.register( 'IntroBallSystemNode', IntroBallSystemNode );
export default IntroBallSystemNode;