// Copyright 2020, University of Colorado Boulder

/**
 *
 * @author Brandon Li
 */

import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabConstants from '../../common/CollisionLabConstants.js';
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

    ballSystem.ballToChangeInMomentumProperty.forEach( ( changeInMomentumProperty, ball ) => {

      // Create the corresponding BallNode for each prepopulatedBall.
      const changeInMomentumVectorNode = new ChangeInMomentumVectorNode( changeInMomentumProperty, ball, modelViewTransform );

      // Add the BallNode to the container.
      changeInMomentumContainer.addChild( changeInMomentumVectorNode );
    } );
    this.addChild( changeInMomentumContainer );

    const txt = new Text( 'Change in Momentum', {
      top: 10,
      font: CollisionLabConstants.DISPLAY_FONT
    } ); // tODO: move to strings file
    this.addChild( txt );

    ballSystem.changeInMomentumOpacityProperty.link( opacity => {
      changeInMomentumContainer.children.forEach( child => {
        child.opacity = opacity;
      } );
      txt.opacity = opacity;
    } );

    ballSystem.collisionPointProperty.link( collisionPoint => {
      if ( collisionPoint ) {
        txt.centerX = modelViewTransform.modelToViewX( collisionPoint.x );
      }
    } );
  }
}

collisionLab.register( 'IntroBallSystemNode', IntroBallSystemNode );
export default IntroBallSystemNode;