// Copyright 2020-2022, University of Colorado Boulder

/**
 * IntroBallSystemNode is a BallSystemNode sub-type for the 'Intro' screen. See BallSystemNode for context. Like the
 * super-class, IntroBallSystems are never disposed and uses the prepopulatedBalls of the IntroBallSystem.
 *
 * In the 'Intro' screen, there are 'Change in Momentum' vectors that appear 'briefly' when the momentum of a Ball
 * collides and changes momentum with another Ball. See IntroBallSystem for context. The opacity and magnitudes of the
 * 'Change in Momentum' vectors are modeled in IntroBallSystem, so all the view has to do is mirror the opacity and
 * components that are modeled.
 *
 * IntroBallSystem will create a ChangeInMomentumVectorNode for each of the 2 Balls in the 'Intro' screen. It will
 * also create a text that displays 'Change in Momentum,' which is positioned over the collision point of the two
 * Balls. See https://github.com/phetsims/collision-lab/issues/85.
 *
 * NOTE: Do not translate this node. It's origin must be at the origin of the view coordinate frame.
 *
 * @author Brandon Li
 */

import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import { Node, Text } from '../../../../scenery/js/imports.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabStrings from '../../CollisionLabStrings.js';
import CollisionLabConstants from '../../common/CollisionLabConstants.js';
import PlayArea from '../../common/model/PlayArea.js';
import BallSystemNode from '../../common/view/BallSystemNode.js';
import IntroBallSystem from '../model/IntroBallSystem.js';
import ChangeInMomentumVectorNode from './ChangeInMomentumVectorNode.js';

// constants
const CHANGE_IN_MOMENTUM_TEXT_Y_OFFSET = 30; // Vertical margin between the label and the ChangeInMomentumVectorNodes.

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

    // Create the container for the Change In Momentum Vectors.
    const changeInMomentumContainer = new Node();

    // Loop through each possible changeInMomentumProperty and create the corresponding ChangeInMomentumVectorNode of
    // each Ball.
    ballSystem.ballToChangeInMomentumProperty.forEach( ( changeInMomentumProperty, ball ) => {

      // Create the corresponding ChangeInMomentumVectorNode for each prepopulatedBall.
      const changeInMomentumVectorNode = new ChangeInMomentumVectorNode(
        changeInMomentumProperty,
        ballSystem.changeInMomentumOpacityProperty,
        ball.positionProperty,
        playArea.bounds,
        modelViewTransform
      );

      // Add the ChangeInMomentumVectorNode to the container.
      changeInMomentumContainer.addChild( changeInMomentumVectorNode );
    } );

    // Add all ChangeInMomentumVectorNodes as children of this Node.
    this.addChild( changeInMomentumContainer );

    //----------------------------------------------------------------------------------------

    // Create the 'Change in Momentum' text, which is displayed above the collision point.
    const changeInMomentumText = new Text( CollisionLabStrings.changeInMomentum, {
      font: CollisionLabConstants.DISPLAY_FONT,
      maxWidth: 160, // Constrain width for i18n. Determined empirically.
      top: modelViewTransform.modelToViewY( playArea.bounds.centerY )
           - ChangeInMomentumVectorNode.CHANGE_IN_MOMENTUM_Y_OFFSET
           - CHANGE_IN_MOMENTUM_TEXT_Y_OFFSET
    } );

    // Add the 'Change in Momentum' text as a child of this Node.
    this.addChild( changeInMomentumText );

    //----------------------------------------------------------------------------------------

    // Observe when the changeInMomentumOpacityProperty changes and match the opacity of the 'Change in Momentum' Text.
    // Link is never unlinked since IntroBallSystems are never disposed.
    ballSystem.changeInMomentumOpacityProperty.linkAttribute( changeInMomentumText, 'opacity' );

    // Observe when the collision-point changes and match the x-position of the 'Change in Momentum' Text, if it exists.
    // Link is never unlinked since IntroBallSystems are never disposed.
    ballSystem.collisionPointProperty.link( collisionPoint => {
      collisionPoint && changeInMomentumText.setCenterX( modelViewTransform.modelToViewX( collisionPoint.x ) );
    } );
  }
}

collisionLab.register( 'IntroBallSystemNode', IntroBallSystemNode );
export default IntroBallSystemNode;