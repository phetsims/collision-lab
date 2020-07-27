// Copyright 2020, University of Colorado Boulder

/**
 * Factory for creating the various icons that appear in the 'Collision Lab' simulation. All methods are static.
 *
 * CollisionLabIconFactory currently creates the following icons:
 *   - Screen Icons
 *   - Checkbox Icons
 *   -
 *
 *
 * NOTE: All 'magic' numbers in this file were tentatively determined empirically to match the design document.
 *
 * @author Brandon Li
 */

import merge from '../../../../phet-core/js/merge.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Circle from '../../../../scenery/js/nodes/Circle.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Color from '../../../../scenery/js/util/Color.js';
import FontAwesomeNode from '../../../../sun/js/FontAwesomeNode.js';
import collisionLab from '../../collisionLab.js';
import collisionLabStrings from '../../collisionLabStrings.js';
import InelasticPreset from '../../inelastic/model/InelasticPreset.js';
import CollisionLabColors from '../CollisionLabColors.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import Ball from '../model/Ball.js';
import BallUtils from '../model/BallUtils.js';
import XNode from './XNode.js';

const CollisionLabIconFactory = {

  /*———————————————————————————————— Screen Icons ————————————————————————————————————————*/

  /**
   * Creates the icon for the 'Intro' Screen.
   * @public
   *
   * @returns {ScreenIcon}
   */
  createIntroScreenIcon() {

    // TODO: #105
    // return new ScreenIcon( new Node() );
  },

  /**
   * Creates the icon for the 'Explore 1D' Screen.
   * @public
   *
   * @returns {ScreenIcon}
   */
  createExplore1DScreenIcon() {

    // TODO: #105
    // return new ScreenIcon( new Node() );
  },

  /**
   * Creates the icon for the 'Explore 2D' Screen.
   * @public
   *
   * @returns {ScreenIcon}
   */
  createExplore2DScreenIcon() {

    // TODO: #105
    // return new ScreenIcon( new Node() );
  },

  /**
   * Creates the icon for the 'Inelastic' Screen.
   * @public
   *
   * @returns {ScreenIcon}
   */
  createInelasticScreenIcon() {

    // TODO: #105
    // return new ScreenIcon( new Node() );
  },

  /*——————————————————————————————— Checkbox Icons ———————————————————————————————————————*/

  /**
   * Creates a vector icon that points to the right, used with various checkboxes.
   * @public
   *
   * @param {Object} [options]
   * @returns {ArrowNode}
   */
  createVectorIcon( options ) {
    options = merge( {}, CollisionLabConstants.ARROW_OPTIONS, {
      lineWidth: 1,
      length: 27
    }, options );

    return new ArrowNode( 0, 0, options.length, 0, options );
  },

  /**
   * Creates the velocity vector icon that points to the right, used with the 'Velocity' checkbox.
   * @public
   *
   * @returns {ArrowNode}
   */
  createVelocityVectorIcon() {
    return CollisionLabIconFactory.createVectorIcon( {
      fill: CollisionLabColors.VELOCITY_VECTOR_FILL,
      stroke: CollisionLabColors.VELOCITY_VECTOR_STROKE
    } );
  },

  /**
   * Creates the momentum vector icon that points to the right, used with the 'Momentum' checkbox.
   * @public
   *
   * @returns {ArrowNode}
   */
  createMomentumVectorIcon() {
    return CollisionLabIconFactory.createVectorIcon( {
      fill: CollisionLabColors.MOMENTUM_VECTOR_FILL,
      stroke: CollisionLabColors.MOMENTUM_VECTOR_STROKE
    } );
  },

  /**
   * Creates the center of mass icon, which is placed next to the 'Center of Mass' checkbox.
   * @public
   *
   * @returns {Node}
   */
  createCenterOfMassIcon() {
    return new XNode( {
      lineWidth: 1,
      length: 15,
      legThickness: 3.3
    } );
  },

  /*————————————————————————————— Inelastic Preset Icons —————————————————————————————————*/

  /**
   * Creates an icon that appears on the InelasticPresets radio button icons on the 'Inelastic' screen.
   * @public
   *
   * @param {InelasticPreset} inelasticPreset
   * @returns {Node}
   */
  createInelasticPresetIcon( inelasticPreset ) {
    assert && assert( InelasticPreset.includes( inelasticPreset ), `invalid inelasticPreset: ${inelasticPreset}` );

    // For the 'Custom' preset, the icon is just a Text instance that displays 'Custom'.
    if ( inelasticPreset === InelasticPreset.CUSTOM ) {
      return new Text( collisionLabStrings.custom, {
        font: CollisionLabConstants.CONTROL_FONT,
        maxWidth: 120 // constrain width for i18n, determined empirically
      } );
    }

    // Create a blank icon for now. To be filled below.
    const icon = new Node();
    icon.scale( 50, -50 );

    inelasticPreset.ballStates.forEach( ( ballState, index ) => {

      const circle = new Circle( BallUtils.calculateBallRadius( ballState.mass, false ), {
        center: ballState.position,
        fill: CollisionLabColors.BALL_COLORS[ index ],
        stroke: CollisionLabColors.BALL_STROKE_COLOR,
        lineWidth: 1 / 50
      } );

      const velocityVector = new ArrowNode(
        circle.center.x,
        circle.center.y,
        circle.center.x + ballState.velocity.x,
        circle.center.y + ballState.velocity.y, {
          fill: CollisionLabColors.VELOCITY_VECTOR_FILL,
          stroke: CollisionLabColors.VELOCITY_VECTOR_STROKE,
          headWidth: CollisionLabConstants.ARROW_OPTIONS.headWidth / 100,
          headHeight: CollisionLabConstants.ARROW_OPTIONS.headHeight / 100,
          tailWidth: CollisionLabConstants.ARROW_OPTIONS.tailWidth / 100,
          lineWidth: CollisionLabConstants.ARROW_OPTIONS.lineWidth / 100
        } );

      icon.addChild( circle );
      icon.addChild( velocityVector );
    } );

    return icon;
  },






  /**
   * Creates the icon used on the Restart button just outside the bottom-right corner of the PlayArea.
   * @public
   *
   * @returns {Node}
   */
   createRestartIcon() {

    // A solution using common-code components was investigated, and it was decided to use the FontAwesomeNode 'undo'
    // character. See https://github.com/phetsims/collision-lab/issues/54
    return new FontAwesomeNode( 'undo', { scale: 0.5 } );
  },

  /**
   * Creates a Ball icon that appears in the BallValuesPanel.
   * @public
   * @param {Ball} ball
   * @returns {Node}
   */
  createBallIcon( ball ) {
    assert && assert( ball instanceof Ball, `invalid ball: ${ball}` );

    // Circle representation of the Ball.
    const ballCircle = new Circle( 10.5, {
      fill: CollisionLabColors.BALL_COLORS[ ball.index - 1 ],
      stroke: Color.BLACK
    } );

    // Labels the index of the Ball
    const labelNode = new Text( ball.index, {
      font: new PhetFont( { size: 18, weight: 600 } ),
      center: ballCircle.center,
      stroke: Color.BLACK,
      fill: Color.WHITE
    } );

    return new Node( { children: [ ballCircle, labelNode ] } );
  }
};

collisionLab.register( 'CollisionLabIconFactory', CollisionLabIconFactory );
export default CollisionLabIconFactory;