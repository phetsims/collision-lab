// Copyright 2019-2020, University of Colorado Boulder

/**
 * CollisionEngine handles all collision detection and responses within a PlayArea. It is the physics engine for
 * all screens in the 'Collision Lab' simulation.
 *
 * ## Collision detection:
 *
 *   - The CollisionEngine deals with two types of collisions: ball-to-ball and ball-to-border collisions. Collisions
 *     are detected after the collision occurs by checking if any two Balls physically overlap or if any Ball overlaps
 *     with the border of the PlayArea.
 *
 *   - Since there are only a maximum of 4 Balls in a PlayArea at a time, there are a maximum of 6 unique pairs of
 *     Balls to check, so a spatial partitioning collision detection optimization is not used.
 *
 * ## Collision response:
 *
 *   - Collision response determines what affect a collision has on a Ball's motion. When a collision has been detected,
 *     it is processed by first analytically determining the how long the Balls have been overlapping. Using this time,
 *     the collision is reconstructed to the exact moment of contact to more accurately simulate colliding balls, and
 *     the position of Balls after the collision are updated to a more realistic position.
 *     The algorithms for finding the overlapping time of collisions can be found below:
 *       + https://github.com/phetsims/collision-lab/blob/master/doc/images/ball-to-ball-time-of-impact-derivation.pdf
 *       + https://github.com/phetsims/collision-lab/blob/master/doc/images/ball-to-border-time-of-impact-derivation.pdf
 *
 *   - The algorithms for Ball collisions were adapted from the flash implementation of Collision Lab. They follow the
 *     standard rigid-body collision model as described in
 *     http://web.mst.edu/~reflori/be150/Dyn%20Lecture%20Videos/Impact%20Particles%201/Impact%20Particles%201.pdf.
 *
 * @author Brandon Li
 * @author Martin Veillette
 */

import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabUtils from '../CollisionLabUtils.js';
import Ball from './Ball.js';
import BallSystem from './BallSystem.js';
import BallUtils from './BallUtils.js';
import CompositeStuckBalls from './CompositeStuckBalls.js';
import InelasticCollisionTypes from './InelasticCollisionTypes.js';
import PlayArea from './PlayArea.js';

class CollisionEngine {

  /**
   * @param {PlayArea} playArea
   * @param {BallSystem} ballSystem
   */
  constructor( playArea, ballSystem ) {
    assert && assert( playArea instanceof PlayArea, `invalid playArea: ${playArea}` );
    assert && assert( ballSystem instanceof BallSystem, `invalid ballSystem: ${ballSystem}` );

    // @private {PlayArea} - reference to the passed-in PlayArea.
    this.playArea = playArea;

    // @private {BallSystem} - reference to the passed-in BallSystem.
    this.ballSystem = ballSystem;

    // @protected {Object} - mutable vectors, reused in critical code for a slight performance optimization.
    this.mutableVectors = {
      deltaR: new Vector2( 0, 0 ),
      deltaV: new Vector2( 0, 0 ),
      deltaS: new Vector2( 0, 0 ),
      normal: new Vector2( 0, 0 ),
      tangent: new Vector2( 0, 0 )
    };

    this.inelasticRotationEngine = new InelasticRotationEngine();

    this.compositeStuckBall = null;
  }

  /**
   * Steps the Collision Detector, which will handle all collisions involving Balls.
   * @public
   *
   * @param {boolean} isReversing - indicates if the simulation is being ran in reverse.
   */
  step( dt ) {

    // First step the position of the balls based on a ballistic motion model, assuming no collisions occur.
    // Then, step the collisionEngine after to detect if any collisions occurred and formulate a response.
    this.ballSystem.balls.forEach( ball => {
      if ( !this.compositeStuckBall || ( this.compositeStuckBall.ball1 !== ball && this.compositeStuckBall.ball2 !== ball ) )  {

        ball.step( dt );
      }
    } );
    this.compositeStuckBall && this.compositeStuckBall.step( dt );
    this.handleBallToBallCollisions( dt < 0 );
    this.playArea.reflectsBorder && this.handleBallToBorderCollisions( dt < 0 );
  }

  reset() {
    this.compositeStuckBall = null;
  }

  //----------------------------------------------------------------------------------------

  /**
   * Registers the exact position of a ball-to-ball collision.
   * This method is meant to be overridden in subclasses, but it isn't required. It's default behavior is to do nothing.
   *
   * When a collision between two balls occurs, its position and their overlapping time is taken into consideration,
   * and Balls are set to a different position. See collideBall() for background. However, this brings up issues for
   * some screens. For instance, Ball Paths in the 'Explore 2D' screen work by recording the position of a Ball.
   * However, Ball positions are never set to the position where the collision actually occurred, and this separation
   * becomes obvious to the user. See https://github.com/phetsims/collision-lab/issues/75.
   *
   * Instead of setting the position of the Ball to the exact collision position, which brought performance issues and
   * doesn't take the overlapping time into consideration of the PathDataPoints, this method is our fix for this issue,
   * which doesn't require a re-rendering of Balls in the view. It is invoked when a collision is detected and passes
   * necessary information to determine exactly when and where a collision occurred.
   * @protected
   *
   * @param {Ball} ball1 - the first Ball involved in the collision.
   * @param {Ball} ball2 - the second Ball involved in the collision.
   * @param {Vector2} collisionPosition1 - the exact position of where the first Ball collided with the second Ball.
   * @param {Vector2} collisionPosition2 - the exact position of where the second Ball collided with the first Ball.
   * @param {number} overlappedTime - the time the two Balls have been overlapping each other.
   */
  registerExactBallToBallCollision( ball1, ball2, collisionPosition1, collisionPosition2, overlappedTime ) {
    /** Do nothing. Override for functionality. */
  }

  /**
   * Registers the exact position of a ball-to-border collision. See the documentation for the method above for
   * background.
   * @protected
   *
   * @param {Ball} ball - the Ball involved in the collision.
   * @param {Vector2} collisionPosition - the exact position of where the Ball collided with the border.
   * @param {number} overlappedTime - the time the Ball has been overlapping the border.
   */
  registerExactBallToBorderCollision( ball, collisionPosition, overlappedTime ) {
    /** Do nothing. Override for functionality. */
  }

  /*----------------------------------------------------------------------------*
   * Ball To Ball Collisions
   *----------------------------------------------------------------------------*/

  /**
   * A time-discretization approach to detecting and processing ball-ball collisions within the BallSystem. Collisions
   * are detected after the collision occurs by checking if any two Balls physically overlap and processed using the
   * collideBalls() method.
   *
   * @private
   * @param {boolean} isReversing - indicates if the simulation is being ran in reverse.
   */
  handleBallToBallCollisions( isReversing ) {
    assert && assert( typeof isReversing === 'boolean', `invalid isReversing: ${isReversing}` );

    // Loop through each unique possible pair of Balls and check to see if they are colliding.
    CollisionLabUtils.forEachPossiblePair( this.ballSystem.balls, ( ball1, ball2 ) => {
      if ( this.compositeStuckBall && ( this.compositeStuckBall.ball1 !== ball1 || this.compositeStuckBall.ball2 !== ball1 || this.compositeStuckBall.ball1 !== ball2 || this.compositeStuckBall.ball2 !== ball2 ) )  {
        return;
      }
      assert && assert( ball1 !== ball2, 'ball cannot collide with itself' );

      // If two balls are on top of each other, process the collision.
      if ( BallUtils.areBallsOverlapping( ball1, ball2 ) ) {
        this.collideBalls( ball1, ball2, isReversing );
      }
    } );
  }

  /**
   * Processes and responds to collision between two balls. Will update the velocity and position of both Balls. The
   * collision algorithm follows the standard rigid-body collision model as described in
   * http://web.mst.edu/~reflori/be150/Dyn%20Lecture%20Videos/Impact%20Particles%201/Impact%20Particles%201.pdf.
   *
   * Our version deals with normalized dot product projections to switch coordinate frames. Please reference
   * https://en.wikipedia.org/wiki/Dot_product.
   *
   * @private
   *
   * @param {Ball} ball1 - the first Ball involved in the collision
   * @param {Ball} ball2 - the second Ball involved in the collision.
   * @param {boolean} isReversing - indicates if the simulation is being ran in reverse.
   */
  collideBalls( ball1, ball2, isReversing ) {
    assert && assert( ball1 instanceof Ball, `invalid ball1: ${ball1}` );
    assert && assert( ball2 instanceof Ball, `invalid ball1: ${ball1}` );
    assert && assert( typeof isReversing === 'boolean', `invalid isReversing: ${isReversing}` );
    assert && assert( BallUtils.areBallsOverlapping( ball1, ball2 ), 'balls must be intersecting' );

    // When a collision is detected, Balls have already overlapped, so the current positions are not the exact positions
    // when the balls first collided. Use the overlapped time to find the exact collision positions.
    const overlappedTime = this.getBallToBallCollisionOverlapTime( ball1, ball2, isReversing );

    // Get exact positions when the Balls collided by rewinding by the overlapped time.
    const r1 = BallUtils.computeBallPosition( ball1, -overlappedTime );
    const r2 = BallUtils.computeBallPosition( ball2, -overlappedTime );

    // Convenience references to the other known Ball values.
    const m1 = ball1.mass;
    const m2 = ball2.mass;
    const v1 = ball1.velocity;
    const v2 = ball2.velocity;

    // Normal vector, called the 'line of impact'. Account for a rare scenario when Balls are placed exactly
    // concentrically on-top of each other and both balls have 0 velocity, resulting in r2 equal to r1.
    const normal = !r2.equals( r1 ) ? this.mutableVectors.normal.set( r2 ).subtract( r1 ).normalize() :
                                      this.mutableVectors.normal.set( Vector2.X_UNIT );

    // Tangential vector, called the 'plane of contact'.
    const tangent = this.mutableVectors.tangent.setXY( -this.mutableVectors.normal.y, this.mutableVectors.normal.x );

    // Reference the 'normal' and 'tangential' components of the Ball velocities. This is a switch in coordinate frames.
    const v1n = v1.dot( normal );
    const v2n = v2.dot( normal );
    const v1t = v1.dot( tangent );
    const v2t = v2.dot( tangent );

    // Convenience reference to the elasticity.
    assert && assert( !isReversing || this.playArea.elasticity === 1, 'must be perfectly elastic for reversing.' );
    const e = this.playArea.elasticity;
    const isSticky = e === 0 && this.playArea.inelasticCollisionType === InelasticCollisionTypes.STICK;

    // Compute the 'normal' and 'tangential' components of velocities after collision (P for prime = after).
    const v1nP = ( ( m1 - m2 * e ) * v1n + m2 * ( 1 + e ) * v2n ) / ( m1 + m2 );
    const v2nP = ( ( m2 - m1 * e ) * v2n + m1 * ( 1 + e ) * v1n ) / ( m1 + m2 );
    const v1tP = isSticky ? ( m1 * v1t + m2 * v2t ) / ( m1 + m2 ) : v1t;
    const v2tP = isSticky ? ( m1 * v1t + m2 * v2t ) / ( m1 + m2 ) : v2t;

    // Change coordinate frames back into the standard x-y coordinate frame.
    const v1xP = tangent.dotXY( v1tP, v1nP );
    const v2xP = tangent.dotXY( v2tP, v2nP );
    const v1yP = normal.dotXY( v1tP, v1nP );
    const v2yP = normal.dotXY( v2tP, v2nP );

    if ( isSticky ) {
      ball1.position = r1;
      ball2.position = r2;

      this.compositeStuckBall = new CompositeStuckBalls( ball1, ball2, new Vector2( v1xP, v1yP ) );
      this.compositeStuckBall.step( overlappedTime );
    }
    else {
      ball1.velocity = new Vector2( v1xP, v1yP );
      ball2.velocity = new Vector2( v2xP, v2yP );
      // Register the exact contact position of the collision for sub-classes.
      this.registerExactBallToBallCollision( ball1, ball2, r1, r2, overlappedTime );

      // Adjust the positions of the Ball to take into account their overlapping time and their new velocities.
      ball1.position = r1.plus( ball1.velocity.times( overlappedTime ) );
      ball2.position = r2.plus( ball2.velocity.times( overlappedTime ) );
    }
  }

  /**
   * Reconstructs ballistic motion of two colliding Balls that are currently overlapping to compute the elapsed time
   * from the when the Balls first exactly collided to their overlapped positions. The contact time is positive if the
   * collision occurred in the past and negative if the contact time is in the future (which happens if the simulation
   * is ran in reverse).
   * @private
   *
   * @param {Ball} ball1 - the first Ball involved in the collision
   * @param {Ball} ball2 - the second Ball involved in the collision.
   * @param {boolean} isReversing - indicates if the simulation is being ran in reverse.
   *
   * @returns {number} contactTime - in seconds
   */
  getBallToBallCollisionOverlapTime( ball1, ball2, isReversing ) {
    assert && assert( ball1 instanceof Ball, `invalid ball1: ${ball1}` );
    assert && assert( ball2 instanceof Ball, `invalid ball1: ${ball1}` );
    assert && assert( typeof isReversing === 'boolean', `invalid isReversing: ${isReversing}` );
    assert && assert( !isReversing || this.playArea.elasticity === 1, 'must be perfectly elastic for reversing' );
    assert && assert( BallUtils.areBallsOverlapping( ball1, ball2 ), 'balls must be intersecting' );

    /*----------------------------------------------------------------------------*
     * This calculation comes from the known fact that when the Balls are exactly colliding,
     * their distance is exactly equal to the sum of their radii.
     *
     * Documenting the derivation was beyond the scope of code comments. Please reference
     * https://github.com/phetsims/collision-lab/blob/master/doc/images/ball-to-ball-time-of-impact-derivation.pdf
     *----------------------------------------------------------------------------*/

    const deltaR = this.mutableVectors.deltaR.set( ball2.position ).subtract( ball1.position );
    const deltaV = this.mutableVectors.deltaV.set( ball2.velocity ).subtract( ball1.velocity );
    const sumOfRadiiSquared = Math.pow( ball1.radius + ball2.radius, 2 );

    // Solve for the roots of the quadratic outlined in the document above.
    const possibleRoots = Utils.solveQuadraticRootsReal(
                            deltaV.magnitudeSquared,
                            -2 * deltaR.dot( deltaV ),
                            deltaR.magnitudeSquared - sumOfRadiiSquared );

    assert && assert( possibleRoots && possibleRoots.length <= 2 && possibleRoots.length >= 0 );

    // Pick the positive root for forward stepping and the negative root if isReversing is true.
    const contactTime = _.find( possibleRoots, root => isReversing ? root < 0 : root >= 0 ) || 0;

    assert && assert( Number.isFinite( contactTime ) && ( isReversing ? contactTime <= 0 : contactTime >= 0 ), contactTime );
    return contactTime;
  }

  /*----------------------------------------------------------------------------*
   * Ball To Border Collisions
   *----------------------------------------------------------------------------*/

  /**
   * A time-discretization approach to detecting and processing ball-border collisions. This checks to see if any balls
   * are overlapping with the border in the last time step, which means the Ball has collided with the border.
   *
   * If a Ball is detected to have collided with the border, then the collision is processed and the velocity and the
   * position of the Ball is updated. The collision algorithm follows the standard rigid-body collision model as
   * described in
   * http://web.mst.edu/~reflori/be150/Dyn%20Lecture%20Videos/Impact%20Particles%201/Impact%20Particles%201.pdf.
   *
   * NOTE: this method assumes that the border of the PlayArea reflects. Don't call this method if it doesn't.
   *
   * @private
   * @param {boolean} isReversing - indicates if the simulation is being ran in reverse.
   */
  handleBallToBorderCollisions( isReversing ) {
    assert && assert( typeof isReversing === 'boolean', `invalid isReversing: ${isReversing}` );

    // Convenience reference to the elasticity.
    assert && assert( !isReversing || this.playArea.elasticity === 1, 'must be perfectly elastic for reversing.' );
    const elasticity = this.playArea.elasticity;

    // Loop through each Balls and check to see if it is colliding with the border.
    this.ballSystem.balls.forEach( ball => {

      // If the Ball is outside the bounds of the PlayArea, it is now colliding with the wall.
      if ( !this.playArea.fullyContainsBall( ball ) ) {
        if ( this.compositeStuckBall && ( this.compositeStuckBall.ball1 !== ball || this.compositeStuckBall.ball2 !== ball ) ) {
          this.compositeStuckBall.freeze();
          return;
        }


        // When a collision is detected, the Ball has already overlapped, so the current position isn't the exact
        // position when the ball first collided. Use the overlapped time to find the exact collision position.
        const overlappedTime = this.getBallToBorderCollisionOverlapTime( ball, isReversing );

        // Get exact position when the Ball collided by rewinding by the overlapped time.
        const contactPosition = BallUtils.computeBallPosition( ball, -overlappedTime );

        // Update the velocity after the collision.
        if ( elasticity === 0 && this.playArea.inelasticCollisionType === InelasticCollisionTypes.STICK ) {

          // If the collision is inelastic and sticky, the Ball has zero velocity after the collision.
          ball.velocity = Vector2.ZERO;
        }
        else {
          if ( !this.playArea.fullyContainsBallHorizontally( ball ) ) {

            // Left and Right Border wall collisions incur a flip in horizontal velocity.
            ball.xVelocity *= -elasticity;
          }
          if ( !this.playArea.fullyContainsBallVertically( ball ) ) {

            // Top and Bottom Border wall collisions incur a flip in vertical velocity.
            ball.yVelocity *= -elasticity;
          }
        }

        // Register the exact contact position of the collision for sub-classes.
        this.registerExactBallToBorderCollision( ball, contactPosition, overlappedTime );

        // Adjust the position of the Ball to take into account its overlapping time and its new velocity.
        ball.position = contactPosition.plus( ball.velocity.times( overlappedTime ) );
      }
    } );
  }

  /**
   * Reconstructs ballistic motion of a Ball that is currently overlapping with a border to compute the elapsed time
   * from the when the Ball first exactly collided to its overlapped position. The contact time is positive if the
   * contact time occurred in the past and negative if the contact time is in the future (which happens if the
   * simulation is ran in reverse).
   * @private
   *
   * @param {Ball} ball - the ball involved in the collision
   * @param {boolean} isReversing - indicates if the simulation is being ran in reverse.
   *
   * @returns {number} contactTime - in seconds
   */
  getBallToBorderCollisionOverlapTime( ball, isReversing ) {
    assert && assert( ball instanceof Ball, `invalid Ball: ${ball}` );
    assert && assert( typeof isReversing === 'boolean', `invalid isReversing: ${isReversing}` );
    assert && assert( !isReversing || this.playArea.elasticity === 1, 'must be perfectly elastic for reversing' );
    assert && assert( !this.playArea.fullyContainsBall( ball ), 'ball must be intersecting' );

    /*----------------------------------------------------------------------------*
     * This calculation comes from the known fact that when the Ball's distance to the
     * border is exactly equal to its radius when it collides with the border. It
     * uses a dot-product projection to exploit this and solve the overlap time.
     *
     *
     * Documenting the derivation was beyond the scope of code comments. Please reference
     * https://github.com/phetsims/collision-lab/blob/master/doc/images/ball-to-border-time-of-impact-derivation.pdf
     *----------------------------------------------------------------------------*/

    // The position of a ball with the same radius as the Ball involved in the collision that is closest to the current
    // position of the ball and fully inside of the border. Again, visit the document above for a visual on the
    // geometric representation.
    const closestPoint = this.playArea.bounds.eroded( ball.radius ).closestPointTo( ball.position );
    const deltaS = this.mutableVectors.deltaS.set( ball.position ).subtract( closestPoint );

    // Use the formula derived in the document above.
    const contactTime = ball.velocity.dot( deltaS ) !== 0 ? deltaS.magnitudeSquared / ball.velocity.dot( deltaS ) : 0;

    assert && assert( Number.isFinite( contactTime ), `invalid contactTime: ${ contactTime }` );
    return contactTime;
  }
}

collisionLab.register( 'CollisionEngine', CollisionEngine );
export default CollisionEngine;