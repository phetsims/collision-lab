// Copyright 2020, University of Colorado Boulder

/**
 * BallUtils is a collection of utility functions that are related to Balls.
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
   * @param {number} radius - the radius of the Ball, in meters.
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
   * Gets the position of a Ball, given a time-delta and the Ball, assuming the ball is undergoing uniform motion in
   * a straight line and isn't accelerating or colliding with anything. The delta-time can be negative to get the
   * position of the Ball in the past.
   * @public
   *
   * @param {Ball} ball
   * @param {number} dt - in seconds
   * @returns {Vector2} - in meters
   */
  computeUniformMotionBallPosition( ball, dt ) {
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
   * @param {number} mass - in kg.
   * @param {number} speed - in m/s.
   * @returns {number} - in Joules
   */
  calculateBallKineticEnergy( mass, speed ) {
    assert && assert( typeof mass === 'number' && mass > 0, `invalid mass: ${mass}` );
    assert && assert( typeof speed === 'number' && speed >= 0, `invalid speed: ${speed}` );

    // K = 1/2*m*|v|^2
    return 0.5 * mass * speed * speed;
  },

  /**
   * Returns a boolean that indicates if the passed-in Balls are physically overlapping.
   * @public
   *
   * @param {Ball} ball1
   * @param {Ball} ball2
   * @returns {boolean}
   */
  areBallsOverlapping( ball1, ball2 ) {
    assert && assert( ball1 instanceof Ball, `invalid ball1: ${ball1}` );
    assert && assert( ball2 instanceof Ball, `invalid ball2: ${ball2}` );
    assert && assert( ball1 !== ball2, 'ball cannot overlap with itself' );

    // Use a distance approach to detect if the Balls are physically overlapping.
    const distanceBetweenBalls = ball1.position.distance( ball2.position );
    const distanceThreshold = ball1.radius + ball2.radius;

    // If the distance between the Balls is less the sum of the radii, they are overlapping. For the 'collision lab'
    // simulation, if the distance between the Balls is exactly equal to the sum of their radii, which would mean that
    // the Balls are tangent to each other, they are NOT overlapping. This is mainly due to Balls after inelastic
    // collisions that are exactly next to each other but not necessarily colliding.
    return distanceBetweenBalls < distanceThreshold;
  },

  /**
   * Gets the closest Ball in the system that is overlapping with the passed-in Ball. If the passed-in Ball isn't
   * overlapping with any of the other Balls in the system, undefined is returned.
   * @public
   *
   * @param {Ball} ball
   * @param {ObservableArray.<Ball>} balls - all the balls in the system
   * @returns {Ball|undefined}
   */
  getClosestOverlappingBall( ball, balls ) {
    assert && assert( ball instanceof Ball, `invalid ball: ${ball}` );
    assert && AssertUtils.assertObservableArrayOf( balls, Ball );
    assert && assert( balls.contains( ball ) );

    // Filter the Balls array to get the Balls that are overlapping with the passed-in Ball.
    const overlappingBalls = balls.filter( otherBall => {
      return otherBall !== ball && BallUtils.areBallsOverlapping( ball, otherBall );
    } );

    // Get the closest overlappingBall, which has the smallest distance to the passed-in Ball.
    return _.minBy( overlappingBalls, overlappingBall => ball.position.distance( overlappingBall.position ) );
  },

  /**
   * Moves the position of ball1 exactly next to ball2 in a given direction. Used for 'bumping' balls. See
   * https://github.com/phetsims/collision-lab/issues/100 for context.
   *
   * This method uses the directionVector, which is the vector from the center of the ball2 that points in the
   * direction of where to set ball1's position. Note that ball2's position is not mutated. The directionVector is
   * copied and its magnitude is set to the sum of the radii of ball1 and ball2 so that ball1 is adjacent to ball2.
   *
   * @public
   * @param {Ball} ball1 - Position is set.
   * @param {Ball} ball2 - Position not set.
   * @param {Vector2} directionVector - the vector from the center of the ball2 that points in the direction
   *                                    of where to set ball1's position. Won't be mutated.
   */
  moveBallNextToBall( ball1, ball2, directionVector ) {
    assert && assert( ball1 instanceof Ball, `invalid ball1: ${ball1}` );
    assert && assert( ball2 instanceof Ball, `invalid ball2: ${ball2}` );
    assert && assert( directionVector instanceof Vector2, `invalid directionVector: ${directionVector}` );

    // Set the directionVector's magnitude to the sum of the radii of ball1 and ball2.
    // The ZERO_THRESHOLD is also added to add a infinitesimally small separation between the Balls.
    const scaledDirectionVector = directionVector.withMagnitude( ball2.radius
                                                                 + ball1.radius
                                                                 + CollisionLabConstants.ZERO_THRESHOLD );

    // Set ball1's position, which is the center of ball2 plus the scaledDirectionVector.
    ball1.position = scaledDirectionVector.add( ball2.position );

    // Sanity check to ensure that the Balls are adjacent to each other.
    assert && assert( !BallUtils.areBallsOverlapping( ball1, ball2 ) );
  }
};

collisionLab.register( 'BallUtils', BallUtils );
export default BallUtils;