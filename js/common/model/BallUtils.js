// Copyright 2020, University of Colorado Boulder

/**
 * BallUtils is a collection of utility functions related to Balls.
 *
 * @author Brandon Li
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import CollisionLabUtils from '../CollisionLabUtils.js';
import Ball from './Ball.js';

const BallUtils = {

  /**
   * Calculates the radius of a Ball. If the 'Constant Size' checkbox is checked, it uses the constant radius.
   * Otherwise, the radius is derived from the mass and the uniform density of the Ball.
   *
   * Derivation:
   *   Volume = 4/3 PI * Radius^3
   *     => Density = Mass / Volume = Mass / ( 4/3 PI * Radius^3 )
   *     => Radius = (3/4 * Mass / Density / PI ) ^ 1/3
   *
   * @public
   * @param {number} mass - mass of the Ball, in kg.
   * @param {boolean} isConstantSize - indicates if the 'Constant Size' checkbox is checked.
   * @returns {number} - in meters
   */
  calculateBallRadius( mass, isConstantSize ) {
    assert && assert( typeof mass === 'number', `invalid mass: ${mass}` );
    assert && assert( typeof isConstantSize === 'boolean', `invalid isConstantSize: ${isConstantSize}` );

    return isConstantSize ?
      CollisionLabConstants.BALL_CONSTANT_RADIUS :
      Math.pow( ( 3 * mass / CollisionLabConstants.BALL_DEFAULT_DENSITY ) / ( 4 * Math.PI ), 1 / 3 );
  },

  /**
   * Computes the Bounds of the center-position of the Ball that satisfies the following invariants:
   *   (1) The Bounds of the PlayArea is eroded inwards such that the Ball is fully inside the PlayArea bounds.
   *   (2) The edge of the Bounds is eroded inwards further so that it is on an exact grid-line.
   *
   * This Bounds is used when the Ball is dragged with the grid visible to ensure that the Ball isn't snapped to a
   * grid-line that makes part of the Ball out of Bounds. Also used for position ranges in the Keypad.
   *
   * @public
   * @param {Bounds2} playAreaBounds - the bounds of the PlayArea.
   * @param {number} radius - the radius of the Ball, in meters
   * @returns {Bounds2}
   */
  getBallGridSafeConstrainedBounds( playAreaBounds, radius ) {
    assert && assert( playAreaBounds instanceof Bounds2, `invalid playAreaBounds: ${playAreaBounds}` );
    assert && assert( typeof radius === 'number' && radius > 0, `invalid radius: ${radius}` );

    // First get the constrainedBounds, which is the Bounds that ensures the Ball is completely inside the PlayArea. It
    // is eroded by the radius of the ball since the Bounds is the bounding-box of the center of the Ball.
    const constrainedBounds = playAreaBounds.eroded( radius );

    // Round the constrainedBounds inwards to the nearest grid-line to ensure that the Ball's center-position is bounded
    // on an exact grid-line AND is fully inside the PlayArea.
    return CollisionLabUtils.roundBoundsInToNearest( constrainedBounds, CollisionLabConstants.MINOR_GRIDLINE_SPACING );
  },

  /**
   * Gets the position of a Ball given the delta-time and the Ball, assuming the ball is undergoing ballistic
   * motion and is not accelerating or colliding with anything. The delta-time can be negative to get the position
   * of the Ball in the past.
   * @public
   *
   * @param {Ball} ball
   * @param {number} dt - in seconds
   * @returns {Vector2} - in meters
   */
  computeBallPosition( ball, dt ) {
    assert && assert( ball instanceof Ball, `invalid ball: ${ball}` );
    assert && assert( typeof dt === 'number', `invalid dt: ${dt}` );

    // Since velocity is the first derivative of position, and the ball isn't accelerating, we can solely multiply
    // the velocity by the delta-time to get the displacement.
    return ball.position.plus( ball.velocity.times( dt ) );
  },

  /**
   * Gets the editing Range of the Ball's center x-position, in meters. This range is for when the user changes the
   * x-position of the Ball in the KeypadDialog. It uses the grid-safe constrained Bounds of the Ball to give a
   * nicer-looking Range that still guarantees that the Ball is inside the PlayArea. See
   * https://github.com/phetsims/collision-lab/issues/72
   * @public
   *
   * @param {Ball} ball
   * @returns {Range} - in meters
   */
  getKeypadXPositionRange( ball ) {
    assert && assert( ball instanceof Ball, `invalid ball: ${ball}` );

    // First get the grid-safe constrained Bounds of the Ball. See getBallGridSafeConstrainedBounds() for context.
    const gridSafeConstrainedBounds = BallUtils.getBallGridSafeConstrainedBounds( ball.playArea.bounds, ball.radius );

    // With the getBallGridSafeConstrainedBounds() computation, there are some floating-point inaccuracies to round off.
    const minX = Utils.toFixed( gridSafeConstrainedBounds.minX, CollisionLabConstants.DISPLAY_DECIMAL_PLACES );
    const maxX = Utils.toFixed( gridSafeConstrainedBounds.maxX, CollisionLabConstants.DISPLAY_DECIMAL_PLACES );

    return new Range( minX, maxX );
  },

  /**
   * Gets the editing Range of the Ball's center y-position, in meters. This range is for when the user changes the
   * y-position of the Ball in the KeypadDialog. It uses the grid-safe constrained Bounds of the Ball to give a
   * nicer-looking Range that still guarantees that the Ball is inside the PlayArea. See
   * https://github.com/phetsims/collision-lab/issues/72
   * @public
   *
   * @param {Ball} ball
   * @returns {Range} - in meters
   */
  getKeypadYPositionRange( ball ) {
    assert && assert( ball instanceof Ball, `invalid ball: ${ball}` );

    // First get the grid-safe constrained Bounds of the Ball. See getBallGridSafeConstrainedBounds() for context.
    const gridSafeConstrainedBounds = BallUtils.getBallGridSafeConstrainedBounds( ball.playArea.bounds, ball.radius );

    // With the getBallGridSafeConstrainedBounds() computation, there are some floating-point inaccuracies to round off.
    const minY = Utils.toFixed( gridSafeConstrainedBounds.minY, CollisionLabConstants.DISPLAY_DECIMAL_PLACES );
    const maxY = Utils.toFixed( gridSafeConstrainedBounds.maxY, CollisionLabConstants.DISPLAY_DECIMAL_PLACES );

    return new Range( minY, maxY );
  },

  /**
   * Calculates the Kinetic Energy of the Ball, which is defined as the work necessary to get a Ball to its speed.
   * See https://en.wikipedia.org/wiki/Kinetic_energy for background.
   * @public
   *
   * @param {Ball} ball
   * @returns {number} - in Joules
   */
  calculateBallKineticEnergy( ball ) {
    assert && assert( ball instanceof Ball, `invalid ball: ${ball}` );

    // K=1/2*m*|v|^2
    return 0.5 * ball.mass * ball.velocity.magnitudeSquared;
  },

  /**
   * Returns a boolean that indicates if the passed-in balls are physically overlapping.
   * @public
   *
   * @param {Ball} ball1
   * @param {Ball} ball2
   */
  areBallsOverlapping( ball1, ball2 ) {
    assert && assert( ball1 instanceof Ball, `invalid ball1: ${ball1}` );
    assert && assert( ball2 instanceof Ball, `invalid ball2: ${ball2}` );
    assert && assert( ball1 !== ball2, 'ball cannot overlap with itself' );

    // Use a distance approach to detect if the Balls are physically overlapping.
    const distanceBetweenBalls = ball1.position.distance( ball2.position );
    const distanceThreshold = ball1.radius + ball2.radius;

    // If the distance between the Balls is less the sum of the radii, they are overlapping.
    return distanceBetweenBalls < distanceThreshold;
  },

  /**
   * Gets the first Ball that is overlapping with the passed-in Ball of the system. If the passed-in Ball isn't
   * overlapping with any of the other Balls in the system, null is returned.
   * @public
   *
   * @param {Ball} ball
   * @param {ObservableArray.<Ball>} balls - all the balls in the system
   * @returns {Ball|null}
   */
  getOverlappingBall( ball, balls ) {
    assert && assert( ball instanceof Ball, `invalid ball: ${ball}` );
    assert && AssertUtils.assertObservableArrayOf( balls, Ball );

    const overlappingBalls = balls.filter( otherBall => {
      return otherBall !== ball && BallUtils.areBallsOverlapping( ball, otherBall );
    } );
    return _.minBy( overlappingBalls, otherBall => otherBall.position.distance( ball.position ) );
  },

  /**
   * Moves the passed-in Ball away from the other Balls in the system that overlap with it. See
   * https://github.com/phetsims/collision-lab/issues/100. Does nothing if the Ball isn't overlapping with any other
   * Balls.
   *
   * This feature was modified from the flash version; the ball that the user is dragging will get "bumped" away, and
   * won’t affect the position of the other balls.
   *
   * This is generally called when the user is **finished** controlling the radius or the position of the Ball, either
   * through the Keypad or by dragging the Ball. We decided it was most natural and smooth to 'bump' Balls away after
   * the user interaction. It was also decided that Balls that are bumped away must still be inside the PlayArea.
   *
   * @public
   * @param {Ball} ball - the Ball that was just user-controlled.
   * @param {ObservableArray.<Ball>} balls - all the balls in the system
   */
  bumpBallFromOtherBalls( ball, balls ) {
    assert && assert( ball instanceof Ball && balls.contains( ball ), `invalid ball: ${ball}` );
    assert && AssertUtils.assertObservableArrayOf( balls, Ball );

    // Flag that points to the first Ball that overlaps with the passed-in Ball. Will be null if no other balls
    // are overlapping with the passed-in Ball.
    let overlappingBall = BallUtils.getOverlappingBall( ball, balls );

    // Array of the overlapingBalls that we have bumped away from. This is used to break infinite loops.
    const bumpedAwayFromBalls = [];

    // We use a while loop to fully ensure that the Ball isn't overlapping with any other Balls in scenarios where
    // Ball is bumped to a position where it overlaps with another Ball. No matter what,
    // every Ball has a place where it is fully inside the PlayArea.
    while ( overlappingBall ) {
      // DirectionVector, which is the unit vector from the center of the colliding Ball that points in the direction of
      // the passed-in Ball. Account for a scenario when Balls are placed exactly concentrically on-top of each other.
      const directionVector = !ball.position.equals( overlappingBall.position ) ?
                                ball.position.minus( overlappingBall.position ).normalize() :
                                Vector2.X_UNIT.copy();

      // Bump the Ball from the overlappingBall, using the directionVector,
      BallUtils.bumpBallFromOverlappingBall( ball, overlappingBall, directionVector );
      // If the Ball isn't fully inside the PlayArea, or if this Ball has been bumped away from the overlappingBall
      // before, reverse the directionVector and attempt to bump the Ball again.
      if ( _.includes( bumpedAwayFromBalls, BallUtils.getOverlappingBall( ball, balls ) ) ) {
        BallUtils.bumpBallFromOverlappingBall( ball, overlappingBall, directionVector.multiply( -1 ) );

      }

      // Sanity check.
      assert && assert( BallUtils.getOverlappingBall( ball, balls ) !== overlappingBall );

      // Recompute the overlappingBall for the next iteration.
      bumpedAwayFromBalls.push( overlappingBall );
      overlappingBall = BallUtils.getOverlappingBall( ball, balls );
    }

    // Sanity check.
    assert && assert( !BallUtils.getOverlappingBall( ball, balls ) );
  },

  /**
   * 'Bumps' the position of a Ball that is overlapping with the overlappingBall. See
   * https://github.com/phetsims/collision-lab/issues/100.
   *
   * This method uses the directionVector, which is the vector from the center of the overlappingBall that points in the
   * direction of where to set the Ball's position.
   *
   * The directionVector's magnitude is set to the sum of the radii of the passed-in Ball and the overlappingBall so
   * that the Balls are no longer overlapping.
   *
   * @public
   * @param {Ball} ball - the Ball whose position is set.
   * @param {Ball} overlappingBall - the Ball that is overlapping with the passed-in ball. Position not set.
   * @param {Vector2} directionVector - the vector from the center of the overlappingBall that points in the direction
   *                                    of where to set the Ball's position. Won't be mutated.
   */
  bumpBallFromOverlappingBall( ball, overlappingBall, directionVector ) {
    assert && assert( ball instanceof Ball, `invalid ball: ${ball}` );
    assert && assert( overlappingBall instanceof Ball, `invalid overlappingBall: ${overlappingBall}` );
    assert && assert( directionVector instanceof Vector2, `invalid directionVector: ${directionVector}` );

    // Set the directionVector's magnitude to the sum of the radii of the passed-in Ball and the overlappingBall.
    // The ZERO_THRESHOLD is also added to add a infinitesimally small separation between the Balls.
    const scaledDirectionVector = directionVector.withMagnitude( overlappingBall.radius
                                                                 + ball.radius
                                                                 + CollisionLabConstants.ZERO_THRESHOLD );

    // Set the Ball's position, which is the center of the overlappingBall plus the scaledDirectionVector.
    ball.position = scaledDirectionVector.add( overlappingBall.position );

    // Sanity check.
    assert && assert( !BallUtils.areBallsOverlapping( ball, overlappingBall ) );
  }
};

collisionLab.register( 'BallUtils', BallUtils );
export default BallUtils;