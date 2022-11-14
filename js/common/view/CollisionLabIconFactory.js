// Copyright 2020-2022, University of Colorado Boulder

/**
 * Factory for creating the various icons that appear in the 'Collision Lab' simulation. All methods are static.
 *
 * CollisionLabIconFactory currently creates the following icons:
 *   - Screen Icons
 *   - Checkbox Icons
 *   - Ball Icons
 *   - Button Icons
 *   - Inelastic Preset Icons
 *
 * NOTE: All 'magic' numbers in this file were tentatively determined empirically to match the design document.
 *
 * @author Brandon Li
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import Screen from '../../../../joist/js/Screen.js';
import ScreenIcon from '../../../../joist/js/ScreenIcon.js';
import merge from '../../../../phet-core/js/merge.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import XNode from '../../../../scenery-phet/js/XNode.js';
import { Circle, Color, Node, PaintDef, Path, Rectangle, Spacer, Text } from '../../../../scenery/js/imports.js';
import undoSolidShape from '../../../../sherpa/js/fontawesome-5/undoSolidShape.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabStrings from '../../CollisionLabStrings.js';
import Explore2DBallSystem from '../../explore2D/model/Explore2DBallSystem.js';
import InelasticPreset from '../../inelastic/model/InelasticPreset.js';
import CollisionLabColors from '../CollisionLabColors.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import Ball from '../model/Ball.js';
import BallState from '../model/BallState.js';
import BallUtils from '../model/BallUtils.js';

const CollisionLabIconFactory = {

  /*———————————————————————————————— Screen Icons ————————————————————————————————————————*/

  /**
   * Creates the icon for the 'Intro' Screen.
   * @public
   *
   * @returns {ScreenIcon}
   */
  createIntroScreenIcon() {
    return createScreenIcon( [
      new BallState( new Vector2( -1, 0 ), new Vector2( 1, 0 ), 0.5 ),
      new BallState( Vector2.ZERO, new Vector2( -0.5, 0 ), 1.5 )
    ] );
  },

  /**
   * Creates the icon for the 'Explore 1D' Screen.
   * @public
   *
   * @returns {ScreenIcon}
   */
  createExplore1DScreenIcon() {
    const ballStates = [
      new BallState( new Vector2( -1, 0 ), new Vector2( 0.3, 0 ), 0.2 ),
      new BallState( new Vector2( 0, 0 ), new Vector2( -0.7, 0 ), 0.5 )
    ];

    const ball3Mass = 1.5;
    const ball3Position = ballStates[ 0 ].position
      .plusXY( BallUtils.calculateBallRadius( ballStates[ 0 ].mass ) + BallUtils.calculateBallRadius( ball3Mass ), 0 );

    ballStates.push( new BallState( ball3Position, ballStates[ 0 ].velocity, ball3Mass ) );
    return createScreenIcon( ballStates );
  },

  /**
   * Creates the icon for the 'Explore 2D' Screen.
   * @public
   *
   * @returns {ScreenIcon}
   */
  createExplore2DScreenIcon() { return createScreenIcon( Explore2DBallSystem.INITIAL_BALL_STATES.slice( 0, 2 ) ); },

  /**
   * Creates the icon for the 'Inelastic' Screen.
   * @public
   *
   * @returns {ScreenIcon}
   */
  createInelasticScreenIcon() {
    const velocity = new Vector2( 0, 0.8 );
    const mass = 1.5;
    const radius = BallUtils.calculateBallRadius( mass );

    return createScreenIcon( [
      new BallState( new Vector2( -radius, 0 ), velocity, mass ),
      new BallState( new Vector2( radius, 0 ), velocity, mass )
    ] );
  },

  /*——————————————————————————————— Checkbox Icons ———————————————————————————————————————*/

  /**
   * Creates the velocity vector icon used with the 'Velocity' checkbox.
   * @public
   *
   * @returns {ArrowNode}
   */
  createVelocityVectorIcon() {
    return createVectorIcon( CollisionLabColors.VELOCITY_VECTOR_FILL, CollisionLabColors.VELOCITY_VECTOR_STROKE );
  },

  /**
   * Creates the momentum vector icon used with the 'Momentum' checkbox.
   * @public
   *
   * @returns {ArrowNode}
   */
  createMomentumVectorIcon() {
    return createVectorIcon( CollisionLabColors.MOMENTUM_VECTOR_FILL, CollisionLabColors.MOMENTUM_VECTOR_STROKE );
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
      legThickness: 3.3,
      fill: CollisionLabColors.CENTER_OF_MASS_FILL,
      stroke: CollisionLabColors.CENTER_OF_MASS_STROKE
    } );
  },

  /*—————————————————————————————————— Ball Icons ————————————————————————————————————————*/

  /**
   * Creates a Ball icon that appears in the BallValuesPanel.
   * @public
   *
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
  },

  /*————————————————————————————————— Button Icons ———————————————————————————————————————*/

  /**
   * Creates the icon used on the Restart button just outside the bottom-right corner of the PlayArea.
   * @public
   *
   * @returns {Node}
   */
  createRestartIcon() {
    return new Path( undoSolidShape, { scale: 0.038, fill: 'black' } );
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
      const text = new Text( CollisionLabStrings.custom, {
        font: CollisionLabConstants.CONTROL_FONT,
        maxWidth: 120 // constrain width for i18n, determined empirically
      } );
      if ( text.height < 10 ) {
        return new Rectangle( 0, 0, text.width, 10, {
          children: [ text ]
        } );
      }
      return text;
    }
    else {
      return createBallSystemSnapshotIcon( inelasticPreset.ballStates );
    }
  }
};

/*----------------------------------------------------------------------------*
 * Helper Functions
 *----------------------------------------------------------------------------*/

/**
 * Helper function that a arrow icon that points to the right, used with various checkboxes that toggle the visibility
 * of vectors, such as the 'Velocity' and 'Momentum' checkboxes.
 *
 * @param {PaintDef} fill
 * @param {PaintDef} stroke
 * @returns {ArrowNode}
 */
function createVectorIcon( fill, stroke ) {
  assert && assert( PaintDef.isPaintDef( fill ), `invalid fill: ${fill}` );
  assert && assert( PaintDef.isPaintDef( stroke ), `invalid stroke: ${stroke}` );

  return new ArrowNode( 0, 0, 27, 0, merge( {}, CollisionLabConstants.ARROW_OPTIONS, {
    fill: fill,
    stroke: stroke,
    lineWidth: 1
  } ) );
}

/**
 * Helper function that creates a 'snapshot' icon of a BallSystem. A 'snapshot' is a replica of some moment of a
 * BallSystem, but with only balls and their velocity vectors visible. The Balls have no numbers and their is no
 * tip-circle on the velocity vectors. Balls have a 'thicker' stroke.
 *
 * This helper function is used in two places in CollisionLab; for screen icons and for the inelastic preset
 * radio buttons.
 *
 * @param {BallState[]} ballStates - the states of the Balls in the 'snapshot'. This is given in 'model' units.
 * @returns {Node}
 */
function createBallSystemSnapshotIcon( ballStates, options ) {
  assert && AssertUtils.assertArrayOf( ballStates, BallState );

  options = merge( {

    // {number} - the scale to map model units to view coordinates.
    modelToViewScale: 50,

    // {number} - the scale of the dimensions (i.e. tailWidth, headWidth, headHeight, etc.) of velocity vectors.
    velocityVectorDimensionsScale: 1 / 100,

    // {number} - the scale to multiply the magnitude of the velocity vectors.
    velocityMultiplier: 1

  }, options );

  // Array of the velocityVectors and the ball circles of the snapshot.
  const balls = [];
  const velocityVectors = [];

  ballStates.forEach( ( ballState, index ) => {

    const ball = new Circle( BallUtils.calculateBallRadius( ballState.mass ), {
      center: ballState.position,
      fill: CollisionLabColors.BALL_COLORS[ index ],
      stroke: CollisionLabColors.BALL_STROKE_COLOR,
      lineWidth: 1 / options.modelToViewScale
    } );

    const velocityVector = new ArrowNode(
      ball.center.x,
      ball.center.y,
      ball.center.x + ballState.velocity.x * options.velocityMultiplier,
      ball.center.y + ballState.velocity.y * options.velocityMultiplier, {
        fill: CollisionLabColors.VELOCITY_VECTOR_FILL,
        stroke: CollisionLabColors.VELOCITY_VECTOR_STROKE,
        headWidth: CollisionLabConstants.ARROW_OPTIONS.headWidth * options.velocityVectorDimensionsScale,
        headHeight: CollisionLabConstants.ARROW_OPTIONS.headHeight * options.velocityVectorDimensionsScale,
        tailWidth: CollisionLabConstants.ARROW_OPTIONS.tailWidth * options.velocityVectorDimensionsScale,
        lineWidth: CollisionLabConstants.ARROW_OPTIONS.lineWidth * options.velocityVectorDimensionsScale
      } );

    balls.push( ball );
    velocityVectors.push( velocityVector );
  } );

  // Create the snapshot icon and scale it to the modelToViewScale (y is inverted for the view).
  const icon = new Node( { children: [ ...balls, ...velocityVectors ] } );
  icon.scale( options.modelToViewScale, -options.modelToViewScale );
  return icon;
}

/*
 * Helper function that creates a ScreenIcon for the CollisionLab simulation. All screen icons are 'snapshot' icons
 * made via createBallSystemSnapshotIcon. This function will also  adds a Spacer to fill extra space to ensure all
 * screen icons are the same width and height which ensures that they are all scaled the same. This keeps all Arrow
 * Nodes inside of screen icons the same 'dimensions' (i.e. tailWidth, headWidth, headHeight, etc. ).
 *
 * @param {BallState[]} ballStates - the states of the Balls in the 'snapshot'. This is given in 'model' units.
 * @returns {ScreenIcon}
 */
function createScreenIcon( ballStates, options ) {
  assert && AssertUtils.assertArrayOf( ballStates, BallState );

  options = merge( {

    // {number} - the width of the screen icon, given in model units.
    width: 70

  }, options );

  // Create the snapshot icon from the given ballStates array.
  const snapshot = createBallSystemSnapshotIcon( ballStates, { velocityMultiplier: 0.6 } );

  // Create the icon, adding a Spacer to fill extra space if needed (Equivalent to setting a minimum width/height)
  const icon = new Node().addChild( new Spacer( options.width, options.width / Screen.HOME_SCREEN_ICON_ASPECT_RATIO ) );

  // Ensure the icon doesn't get wider than the width/height.
  icon.maxWidth = icon.width;
  icon.maxHeight = icon.height;

  snapshot.center = icon.center;
  return new ScreenIcon( icon.addChild( snapshot ) );
}

collisionLab.register( 'CollisionLabIconFactory', CollisionLabIconFactory );
export default CollisionLabIconFactory;
