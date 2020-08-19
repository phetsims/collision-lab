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

import Vector2 from '../../../../dot/js/Vector2.js';
import Screen from '../../../../joist/js/Screen.js';
import ScreenIcon from '../../../../joist/js/ScreenIcon.js';
import merge from '../../../../phet-core/js/merge.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Circle from '../../../../scenery/js/nodes/Circle.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Spacer from '../../../../scenery/js/nodes/Spacer.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Color from '../../../../scenery/js/util/Color.js';
import FontAwesomeNode from '../../../../sun/js/FontAwesomeNode.js';
import collisionLab from '../../collisionLab.js';
import collisionLabStrings from '../../collisionLabStrings.js';
import InelasticPreset from '../../inelastic/model/InelasticPreset.js';
import CollisionLabColors from '../CollisionLabColors.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import Ball from '../model/Ball.js';
import BallState from '../model/BallState.js';
import BallUtils from '../model/BallUtils.js';
import XNode from './XNode.js';

const SCREEN_ICON_WIDTH = 70;
const SCREEN_ICON_HEIGHT = SCREEN_ICON_WIDTH / Screen.HOME_SCREEN_ICON_ASPECT_RATIO; // w/h = ratio <=> h = w/ratio


/*
 * See https://github.com/phetsims/vector-addition/issues/76#issuecomment-515197547 for context.
 * Helper function that creates a ScreenIcon but adds a Spacer to fill extra space. This ensures all screen icons are
 * the same width and height which ensures that they are all scaled the same. Thus, this keeps all Arrow Nodes inside
 * of screen icons the same 'dimensions' (i.e. tailWidth, headWidth, headHeight, etc. ).
 *
 * @param {Node[]} children - the children of the icon
 * @returns {ScreenIcon}
 */
function createScreenIcon( icon ) {

  const iconNode = new Node().addChild( new Spacer( SCREEN_ICON_WIDTH, SCREEN_ICON_HEIGHT, { pickable: false } ) );
  icon.center = iconNode.center;
  icon.maxWidth = SCREEN_ICON_WIDTH;
  icon.maxHeight = SCREEN_ICON_HEIGHT;

  return new ScreenIcon( iconNode.addChild( icon ) );
}

function createBallSystemSnapshotIcon( ballStates, options ) {

  options = merge( {
    modelToViewScale: 50,
    arrowOptionsScale: 100,
    velocityMultiplier: 0.6
  }, options );

  // Create a blank icon for now. To be filled below.
  const icon = new Node();
  icon.scale( options.modelToViewScale, -options.modelToViewScale );

  const velocityVectors = [];
  const circles = [];
  ballStates.forEach( ( ballState, index ) => {

    const circle = new Circle( BallUtils.calculateBallRadius( ballState.mass, false ), {
      center: ballState.position,
      fill: CollisionLabColors.BALL_COLORS[ index ],
      stroke: CollisionLabColors.BALL_STROKE_COLOR,
      lineWidth: 1 / options.modelToViewScale
    } );

    const velocityVector = new ArrowNode(
      circle.center.x,
      circle.center.y,
      circle.center.x + ballState.velocity.x * options.velocityMultiplier,
      circle.center.y + ballState.velocity.y * options.velocityMultiplier, {
        fill: CollisionLabColors.VELOCITY_VECTOR_FILL,
        stroke: CollisionLabColors.VELOCITY_VECTOR_STROKE,
        headWidth: CollisionLabConstants.ARROW_OPTIONS.headWidth / options.arrowOptionsScale,
        headHeight: CollisionLabConstants.ARROW_OPTIONS.headHeight / options.arrowOptionsScale,
        tailWidth: CollisionLabConstants.ARROW_OPTIONS.tailWidth / options.arrowOptionsScale,
        lineWidth: CollisionLabConstants.ARROW_OPTIONS.lineWidth / options.arrowOptionsScale
      } );

    circles.push( circle );
    velocityVectors.push( velocityVector );
  } );

  return icon.setChildren( [ ...circles, ...velocityVectors ] );
}


const CollisionLabIconFactory = {

  /*———————————————————————————————— Screen Icons ————————————————————————————————————————*/

  /**
   * Creates the icon for the 'Intro' Screen.
   * @public
   *
   * @returns {ScreenIcon}
   */
  createIntroScreenIcon() {
    const snapshot = [
      new BallState( new Vector2( -1.0, 0 ), new Vector2( 1.00, 0 ), 0.5 ),
      new BallState( new Vector2( 0.00, 0 ), new Vector2( -0.5, 0 ), 1.5 )
    ];

    return createScreenIcon( createBallSystemSnapshotIcon( snapshot ) );
  },

  /**
   * Creates the icon for the 'Explore 1D' Screen.
   * @public
   *
   * @returns {ScreenIcon}
   */
  createExplore1DScreenIcon() {
    const firstBallState = new BallState( new Vector2( -1.0, 0.000 ), new Vector2( 0.3, 0 ), 0.2 );
    const thirdBallStateMass = 1.5;
    const thirdBallStatePosition = firstBallState.position
      .plusXY( BallUtils.calculateBallRadius( firstBallState.mass, false ), 0 )
      .addXY( BallUtils.calculateBallRadius( thirdBallStateMass, false ), 0 );

    const snapshot = [
      firstBallState,
      new BallState( new Vector2( 0.00, 0 ), new Vector2( -0.7, 0 ), 0.5 ),
      new BallState( thirdBallStatePosition, firstBallState.velocity, thirdBallStateMass )
    ];

    return createScreenIcon( createBallSystemSnapshotIcon( snapshot ) );
  },

  /**
   * Creates the icon for the 'Explore 2D' Screen.
   * @public
   *
   * @returns {ScreenIcon}
   */
  createExplore2DScreenIcon() {
    const snapshot = [
      new BallState( new Vector2( -1.0, 0.000 ), new Vector2( 1.00, 0.300 ), 0.50 ),
      new BallState( new Vector2( 0.00, 0.500 ), new Vector2( -0.5, -0.50 ), 1.50 )
    ];

    return createScreenIcon( createBallSystemSnapshotIcon( snapshot ) );
  },

  /**
   * Creates the icon for the 'Inelastic' Screen.
   * @public
   *
   * @returns {ScreenIcon}
   */
  createInelasticScreenIcon() {
    const velocity = new Vector2( 0, 0.8 );
    const mass = 1.5;
    const radius = BallUtils.calculateBallRadius( mass, false );

    const snapshot = [
      new BallState( new Vector2( -radius, 0 ), velocity, mass ),
      new BallState( new Vector2( radius, 0 ), velocity, mass )
    ];

    return createScreenIcon( createBallSystemSnapshotIcon( snapshot ) );
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
    else {
      return createBallSystemSnapshotIcon( inelasticPreset.ballStates, {
        velocityMultiplier: 1
      } );
    }
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