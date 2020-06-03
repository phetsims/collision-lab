// Copyright 2019-2020, University of Colorado Boulder

/**
 * CollisionEngine handles all collision detection and responses within a PlayArea. It is the physics engine for
 * all screens in the 'Collision Lab' simulation.
 *
 * ## Collision detection:
 *   - The CollisionEngine deals with two types of collisions: ball-to-ball and ball-to-border collisions. Collisions
 *     are detected after the collision occurs by checking if any two Balls physically overlap or if any Ball overlaps
 *     with the border of the PlayArea.
 *   - Since there are only a maximum of 5 Balls in a PlayArea at a time, there are a maximum of 10 unique pairs of
 *     Balls to check, so a spatial partitioning collision detection optimization is not used.
 *   - Collision detection occurs only within the PlayArea. There is no collision detection performed for Balls that
 *     have escaped the PlayArea when its border doesn't reflect.
 *
 * ## Collision response:
 *   - Collision response determines what affect a collision has on a Balls motion. When a collision has been detected,
 *     it is processed by first analytically determining the how long the Balls have been overlapping. Using this time,
 *     the collision is reconstructed to the exact moment of contact to more accurately simulate colliding balls.
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
import InelasticCollisionTypes from './InelasticCollisionTypes.js';
import PlayArea from './PlayArea.js';

class CollisionEngine {

  /**
   * @param {PlayArea} playArea
   * @param {BallSystem} ballSystem
   * @param {Property.<number>} elapsedTimeProperty
   */
  constructor( playArea, ballSystem, elapsedTimeProperty ) {
    assert && assert( playArea instanceof PlayArea, `invalid playArea: ${playArea}` );
    assert && assert( ballSystem instanceof BallSystem, `invalid ballSystem: ${ballSystem}` );
    assert && CollisionLabUtils.assertPropertyTypeof( elapsedTimeProperty, 'number' );

    // @private {PlayArea} - reference to the passed-in PlayArea.
    this.playArea = playArea;

    // @private {BallSystem} - reference to the passed-in BallSystem.
    this.ballSystem = ballSystem;

    // @private {Property.<number>} - reference to the passed-in elapsedTimeProperty.
    this.elapsedTimeProperty = elapsedTimeProperty;

    //----------------------------------------------------------------------------------------

    // @private {Object} - mutable vectors, reused in critical code for a slight performance optimization.
    this.mutableVectors = {
      deltaR: new Vector2( 0, 0 ),
      deltaV: new Vector2( 0, 0 ),
      deltaS: new Vector2( 0, 0 ),
      normal: new Vector2( 0, 0 ),
      tangent: new Vector2( 0, 0 )
    };
  }

  /**
   * Steps the Collision Detector, which will handle all collisions involving Balls.
   * @public
   *
   * @param {number} dt - the time interval since the last step, in seconds.
   */
  step( dt ) {
    this.handleBallToBallCollisions( dt );
    this.handleBallToBorderCollisions( dt );
  }

  /*----------------------------------------------------------------------------*
   * Ball To Ball Collisions
   *----------------------------------------------------------------------------*/

  /**
   * A time-discretization approach to detecting and processing ball-ball collisions within the BallSystem.Collisions
   * are detected after the collision occurs by checking if any two Balls physically overlap and processed using the
   * collideBalls() method.
   *
   * Collision detection occurs only within the PlayArea. There is no collision detection performed for Balls that
   * have escaped the PlayArea when its border doesn't reflect. See https://en.wikipedia.org/wiki/Collision_detection.
   *
   * @public
   * @param {number} dt - time interval since last step, in seconds.
   */
  handleBallToBallCollisions( dt ) {
    assert && assert( typeof dt === 'number', `invalid dt: ${dt}` );

    // Loop through each unique possible pair of Balls and check to see if they are colliding.
    CollisionLabUtils.forEachPossiblePair( this.ballSystem.balls, ( ball1, ball2 ) => {
      assert && assert( ball1 !== ball2, 'ball cannot collide with itself' );

      // Use a distance approach to detect if the Balls are physically overlapping, meaning they are colliding.
      const distanceBetweenBalls = ball1.position.distance( ball2.position );
      const minimumSeparation = ball1.radius + ball2.radius;

      // If two balls are on top of each other, process the collision.
      if ( distanceBetweenBalls < minimumSeparation ) {
        this.collideBalls( ball1, ball2, dt < 0 );
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
    assert && assert( BallUtils.areBallsColliding( ball1, ball2 ), 'balls must be intersecting' );

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

    // Normal vector, called the 'line of impact'.
    this.mutableVectors.normal.set( r2 ).subtract( r1 ).normalize();

    // Tangential vector, called the 'plane of contact.
    this.mutableVectors.tangent.setXY( -this.mutableVectors.normal.y, this.mutableVectors.normal.x );

    // Reference the 'normal' and 'tangential' components of the Ball velocities. This is a switch in coordinate frames.
    const v1n = v1.dot( this.mutableVectors.normal );
    const v2n = v2.dot( this.mutableVectors.normal );
    const v1t = v1.dot( this.mutableVectors.tangent );
    const v2t = v2.dot( this.mutableVectors.tangent );

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
    const v1xP = this.mutableVectors.tangent.dotXY( v1tP, v1nP );
    const v2xP = this.mutableVectors.tangent.dotXY( v2tP, v2nP );
    const v1yP = this.mutableVectors.normal.dotXY( v1tP, v1nP );
    const v2yP = this.mutableVectors.normal.dotXY( v2tP, v2nP );
    ball1.velocity = new Vector2( v1xP, v1yP );
    ball2.velocity = new Vector2( v2xP, v2yP );

    // Set the position of the balls to the contactPosition.
    if ( this.ballSystem.pathVisibleProperty.value && this.elapsedTimeProperty.value - overlappedTime >= 0 && overlappedTime !== 0 ) {
      ball1.path.updatePath( r1, this.elapsedTimeProperty.value - overlappedTime );
      ball2.path.updatePath( r2, this.elapsedTimeProperty.value - overlappedTime );
    }

    // Adjust the positions of the Ball to take into account their overlapping time and their new velocities.
    ball1.position = r1.plus( ball1.velocity.times( overlappedTime ) );
    ball2.position = r2.plus( ball2.velocity.times( overlappedTime ) );
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
    assert && assert( BallUtils.areBallsColliding( ball1, ball2 ), 'balls must be intersecting' );

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
    const contactTime = _.find( possibleRoots, root => isReversing ? root < 0 : root >= 0 ) || 1;

    assert && assert( isFinite( contactTime ) && ( isReversing ? contactTime <= 0 : contactTime >= 0 ) );
    return contactTime;
  }

  /*----------------------------------------------------------------------------*
   * Ball To Border Collisions
   *----------------------------------------------------------------------------*/

  /**
   * A time-discretization approach to detecting and processing ball-border collisions. This checks to see if a
   * collision has occurred between any balls are overlapping with the border in the last time step, which means the
   * Ball has collided with the border.
   *
   * If a Ball is detected to have collided with the border, then the collision is processed and the velocity and the
   * position of the Ball is updated.
   * @public
   *
   * See https://en.wikipedia.org/wiki/Collision_detection
   *
   * @param {number} dt - time interval since last step, in seconds.
   */
  handleBallToBorderCollisions( dt ) {
    assert && assert( typeof dt === 'number', `invalid dt: ${dt}` );

    // Do nothing if the border doesn't reflect Balls, meaning there are no collisions involving the Border.
    if ( !this.playArea.reflectingBorderProperty.value ) { return; }

    let elasticity = this.playArea.elasticity;
    if ( dt < 0 && this.playArea.elasticity > 0 ) {
      elasticity = 1 / this.playArea.elasticity;
    }

    this.ballSystem.balls.forEach( ball => {

      // If the Ball is outside the bounds of the PlayArea, it is now colliding with the walls.
      if ( ball.left <= this.playArea.bounds.minX ||
           ball.right >= this.playArea.bounds.maxX ||
           ball.top >= this.playArea.bounds.maxY ||
           ball.bottom <= this.playArea.bounds.minY ) {

        // When a collision is detected, the Ball has already overlapped, so the current positions isn't the exact
        // position when the balls first collided. Use the overlapped time to find the exact collision positions.
        const overlappedTime = this.getBallToBorderCollisionOverlapTime( ball, dt < 0 );

        // Get exact position when the Ball collided by rewinding.
        const contactPosition = BallUtils.computeBallPosition( ball, -overlappedTime );

        // Update the velocity after the collision.
        if ( elasticity === 0 && this.playArea.inelasticCollisionType === InelasticCollisionTypes.STICK ) {

          // If the collision is inelastic and sticky, the Ball has zero velocity after the collision.
          ball.velocity = Vector2.ZERO;
        }
        else {
          if ( ball.left <= this.playArea.bounds.minX || ball.right >= this.playArea.bounds.maxX ) {

            // Left and Right Border wall collisions incur a flip in horizontal velocity.
            ball.xVelocity *= -elasticity;
          }
          if ( ball.top >= this.playArea.bounds.maxY || ball.bottom <= this.playArea.bounds.minY ) {

            // Top and Bottom Border wall collisions incur a flip in horizontal velocity.
            ball.yVelocity *= -elasticity;
          }
        }

        //----------------------------------------------------------------------------------------

        // Set the position of the ball to the contactPosition.
        if ( this.ballSystem.pathVisibleProperty.value && this.elapsedTimeProperty.value - overlappedTime >= 0 && overlappedTime !== 0 ) {
          ball.path.updatePath( contactPosition, this.elapsedTimeProperty.value - overlappedTime );
        }

        // Update the position after the collision.
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
    assert && assert( !this.playArea.containsBall( ball ), 'ball must be intersecting' );

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
    const contactTime = deltaS.magnitudeSquared / ball.velocity.dot( deltaS );

    assert && assert( isFinite( contactTime ) && ( isReversing ? contactTime <= 0 : contactTime >= 0 ) );
    return contactTime;
  }
}

collisionLab.register( 'CollisionEngine', CollisionEngine );
export default CollisionEngine;