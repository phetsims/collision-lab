// Copyright 2019-2020, University of Colorado Boulder

/**
 * CollisionEngine handles all collision detection and responses of Ball collisions. It is the physics engine that is
 * used for all screens of the 'Collision Lab' simulation.
 *
 * ## Collision detection:
 *
 *   - CollisionEngine deals with two types of collisions: ball-to-ball and ball-to-border collisions. Both of these
 *     collisions are detected before the collision occurs to avoid tunneling scenarios where Balls would pass through
 *     each other with high velocities and/or slow frame rates.
 *     The algorithms for detecting ball-to-ball and ball-to-border collisions can be found below:
 *       + https://github.com/phetsims/collision-lab/blob/master/doc/ball-to-ball-collision-detection.md
 *       + https://github.com/phetsims/collision-lab/blob/master/doc/ball-to-border-collision-detection.md
 *
 *   - On each time-step, _all_ potential collisions are detected at once and encapsulated in a Collision instance. To
 *     fully ensure that collisions are simulated correctly — even with extremely high time-steps — only the first
 *     collision is handled and all potential collisions afterwards are re-computed. This process is repeated until
 *     there are no collisions detected within the time-step.
 *
 *   - Since there are only a maximum of 4 Balls in a PlayArea at a time, there are a maximum of 6 unique pairs of
 *     Balls to check, so a spatial partitioning collision detection optimization is not used.
 *
 * ## Collision response:
 *
 *   - Collision response determines what affect a collision has on a Ball's motion. The algorithms for Ball collisions
 *     were adapted but significantly improved from the flash implementation of
 *     Collision Lab. They follow the standard rigid-body collision model as described in
 *     http://web.mst.edu/~reflori/be150/Dyn%20Lecture%20Videos/Impact%20Particles%201/Impact%20Particles%201.pdf.
 *
 * @author Brandon Li
 * @author Martin Veillette
 */

import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabUtils from '../CollisionLabUtils.js';
import Ball from './Ball.js';
import BallSystem from './BallSystem.js';
import BallUtils from './BallUtils.js';
import Collision from './Collision.js';
import PlayArea from './PlayArea.js';
const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}
class CollisionEngine {

  /**
   * @param {PlayArea} playArea
   * @param {BallSystem} ballSystem
   * @param {Property.<number>} elapsedTimeProperty
   */
  constructor( playArea, ballSystem, elapsedTimeProperty ) {
    assert && assert( playArea instanceof PlayArea, `invalid playArea: ${playArea}` );
    assert && assert( ballSystem instanceof BallSystem, `invalid ballSystem: ${ballSystem}` );
    assert && AssertUtils.assertPropertyOf( elapsedTimeProperty, 'number' );

    // @private {PlayArea} - reference to the passed-in PlayArea.
    this.playArea = playArea;

    // @private {BallSystem} - reference to the passed-in BallSystem.
    this.ballSystem = ballSystem;

    // @private {Property.<number>} - reference to the passed-in elapsedTimeProperty.
    this.elapsedTimeProperty = elapsedTimeProperty;

    // @protected {Object} - mutable vectors, reused in critical code for a slight performance optimization.
    this.mutableVectors = {
      deltaR: new Vector2( 0, 0 ),
      deltaV: new Vector2( 0, 0 ),
      deltaS: new Vector2( 0, 0 ),
      normal: new Vector2( 0, 0 ),
      tangent: new Vector2( 0, 0 )
    };

    this.collisions = [];
  }

  /**
   * Steps the CollisionEngine, which will handle all collisions involving Balls.
   * @public
   *
   * @param {number} dt - time in seconds
   */
  step( dt ) {

    // First step the position of the balls, assuming they are undergoing uniform motion and that there are no
    // collisions (for now).

    // Handle all collisions now that the Balls have been moved.
    this.collisions = [];
    let passedTime = 0;
    this.detectBallToBallCollisions( dt - passedTime );
    this.playArea.reflectsBorder && this.detectBallToBorderCollisions( dt );
    if ( this.collisions.length ) {
      while ( this.collisions.length && passedTime <= dt ) {
        const collision = _.minBy( this.collisions, _.property( 'collisionTime' ) );
        this.ballSystem.balls.forEach( ball => { ball.stepUniformMotion( collision.collisionTime ); } );

        if ( collision.collidingObject instanceof Ball ) {
          this.collideBalls( collision.ball, collision.collidingObject );
        }
        else {
          this.collideBallWithBorder( collision.ball );
        }

        passedTime += collision.collisionTime;

        this.collisions = [];
        this.detectBallToBallCollisions( dt - passedTime );
        this.playArea.reflectsBorder && this.detectBallToBorderCollisions( dt - passedTime );
        // await sleep(1500)
      }
    }
    // else {
      this.ballSystem.balls.forEach( ball => { ball.stepUniformMotion( dt - passedTime ); } );
    // }

    // this.ballSystem.balls.forEach( ball => { ball.stepUniformMotion( dt - passedTime ); } );

  }

  /**
   * Records the exact position of a collision involving Balls in the Ball's trailing 'path'.
   *
   * When a collision involving balls occurs, its position and the overlapping time is taken into consideration,
   * and Balls are set to a different position. However, this brings up issues for Ball Paths, which work by recording
   * the position of a Ball at each frame. Since Ball positions are never set to the position where the collision
   * actually occurred, this separation becomes obvious to the user, particularly at high velocities.
   * See https://github.com/phetsims/collision-lab/issues/75.
   *
   * Instead of setting the position of the Ball to the exact collision position, which brought performance issues and
   * doesn't take the overlapping time into consideration of the PathDataPoints, this method is our fix for this issue,
   * which doesn't require a re-rendering of Balls in the view.
   *
   * @private
   * @param {Ball} ball - the Ball involved in the collision.
   * @param {Vector2} collisionPosition - the center-position of the Ball when it exactly collided with another object.
   * @param {number} overlappedTime - the time the Ball has been overlapping with the object that it is colliding with.
   */
  recordCollisionPosition( ball, collisionPosition, overlappedTime ) {
    assert && assert( ball instanceof Ball, `invalid ball: ${ball}` );
    assert && assert( collisionPosition instanceof Vector2, `invalid collisionPosition: ${collisionPosition}` );
    assert && assert( typeof overlappedTime === 'number', `invalid overlappedTime: ${overlappedTime}` );

    // Only record Path's of the Balls if Paths are visible and the overlapped time is non-zero.
    if ( this.ballSystem.pathsVisibleProperty.value
         && this.elapsedTimeProperty.value - overlappedTime >= 0
         && overlappedTime !== 0 ) {

      ball.path.updatePath( collisionPosition, this.elapsedTimeProperty.value - overlappedTime );
    }
  }

  /*----------------------------------------------------------------------------*
   * Ball To Ball Collisions
   *----------------------------------------------------------------------------*/

  /**
   * A time-discretization approach to detecting and processing ball-ball collisions within the BallSystem. Collisions
   * are detected after the collision occurs by checking if any two Balls physically overlap.
   *
   * When a ball-to-ball collision is detected, this method will do some of the preliminary work to formulating a
   * collision response by computing the overlapping time and the normal and tangent axes described in
   * http://web.mst.edu/~reflori/be150/Dyn%20Lecture%20Videos/Impact%20Particles%201/Impact%20Particles%201.pdf.
   *
   * @private
   * @param {number} dt - time in seconds
   */
  detectBallToBallCollisions( dt ) {
    // assert && assert( typeof isReversing === 'boolean', `invalid isReversing: ${isReversing}` );
    // assert && assert( !isReversing || this.playArea.elasticity === 1, 'must be perfectly elastic for reversing.' );

    // Loop through each unique possible pair of Balls and check to see if they are colliding.
    CollisionLabUtils.forEachPossiblePair( this.ballSystem.balls, ( ball1, ball2 ) => {
      assert && assert( ball1 !== ball2, 'ball cannot collide with itself' );

      const deltaR = this.mutableVectors.deltaR.set( ball2.position ).subtract( ball1.position );
      const deltaV = this.mutableVectors.deltaV.set( ball2.velocity ).subtract( ball1.velocity );
      const sumOfRadiiSquared = Math.pow( ball1.radius + ball2.radius, 2 );

      // Solve for the roots of the quadratic outlined in the document above.
      // https://math.stackexchange.com/questions/311921/get-location-of-vector-circle-intersection
      const possibleRoots = Utils.solveQuadraticRootsReal(
                              deltaV.magnitudeSquared,
                              2 * deltaV.dot( deltaR ),
                              deltaR.magnitudeSquared - sumOfRadiiSquared );


      // possibleRoots = possibleRoots.filter( root => root > 1E-13 && Number.isFinite( root ) );
      // if ( possibleRoots.length === 0 ) return;
      // const deltaCollisionTime = possibleRoots[ 0 ];


      // If two balls are on top of each other, process the collision.
      if ( possibleRoots && possibleRoots.length && possibleRoots[ 0 ] <= dt && possibleRoots[ 0 ] >= 0 ) {
        this.collisions.push( new Collision( ball1, ball2, possibleRoots[ 0 ] ) );

        // this.collidingBalls.push( ball2 );
        // // When a collision is detected, Balls have already overlapped, so the current positions are not the exact
        // // positions when the balls first collided. Use the overlapped time to find the exact collision positions.
        // const overlappedTime = dt - deltaCollisionTime;

        // // Get exact positions when the Balls collided by rewinding by the overlapped time.
        // const r1 = BallUtils.computeUniformMotionBallPosition( ball1, deltaCollisionTime );
        // const r2 = BallUtils.computeUniformMotionBallPosition( ball2, deltaCollisionTime );

        // // Set the Normal vector, called the 'line of impact'. Account for a rare scenario when Balls are placed exactly
        // // concentrically on-top of each other and both balls have 0 velocity, resulting in r2 equal to r1.
        // !r2.equals( r1 ) ? this.mutableVectors.normal.set( r2 ).subtract( r1 ).normalize() :
        //                    this.mutableVectors.normal.set( Vector2.X_UNIT );

        // // Set the Tangential vector, called the 'plane of contact'.
        // this.mutableVectors.tangent.setXY( -this.mutableVectors.normal.y, this.mutableVectors.normal.x );

        // // // Record the collision in both of the Ball's trailing 'paths'.
        // // this.recordCollisionPosition( ball1, r1, overlappedTime );
        // // this.recordCollisionPosition( ball2, r2, overlappedTime );

        // // Forward the rest of the collision response to the collide-balls method.
        // this.collideBalls( ball1, ball2, r1, r2, overlappedTime );
      }
    } );
  }

  /**
   * Processes and responds to a collision between two balls. Will update the velocity and position of both Balls. The
   * collision algorithm follows the standard rigid-body collision model as described in
   * http://web.mst.edu/~reflori/be150/Dyn%20Lecture%20Videos/Impact%20Particles%201/Impact%20Particles%201.pdf.
   *
   * Our version deals with normalized dot product projections to switch coordinate frames. Please reference
   * https://en.wikipedia.org/wiki/Dot_product.
   *
   * @protected - can be overridden in subclasses.
   *
   * @param {Ball} ball1 - the first Ball involved in the collision.
   * @param {Ball} ball2 - the second Ball involved in the collision.
   * @param {Vector2} collisionPosition1 - the center-position of the first Ball when it exactly collided with ball2.
   * @param {Vector2} collisionPosition1 - the center-position of the second Ball when it exactly collided with ball1.
   * @param {number} overlappedTime - the time the two Balls have been overlapping each other.
   */
  collideBalls( ball1, ball2 ) {
    // assert && assert( ball1 instanceof Ball, `invalid ball1: ${ball1}` );
    // assert && assert( ball2 instanceof Ball, `invalid ball1: ${ball1}` );
    // assert && assert( collisionPosition1 instanceof Vector2, `invalid collisionPosition1: ${collisionPosition1}` );
    // assert && assert( collisionPosition2 instanceof Vector2, `invalid collisionPosition2: ${collisionPosition2}` );
    // assert && assert( typeof overlappedTime === 'number', `invalid overlappedTime: ${overlappedTime}` );

    const r1 = ball1.position;
    const r2 = ball2.position;

    // Set the Normal vector, called the 'line of impact'. Account for a rare scenario when Balls are placed exactly
    // concentrically on-top of each other and both balls have 0 velocity, resulting in r2 equal to r1.
    !r2.equals( r1 ) ? this.mutableVectors.normal.set( r2 ).subtract( r1 ).normalize() :
                       this.mutableVectors.normal.set( Vector2.X_UNIT );

    // Set the Tangential vector, called the 'plane of contact'.
    this.mutableVectors.tangent.setXY( -this.mutableVectors.normal.y, this.mutableVectors.normal.x );

    // Convenience references to the other known Ball values.
    const m1 = ball1.mass;
    const m2 = ball2.mass;
    const v1 = ball1.velocity;
    const v2 = ball2.velocity;
    const elasticity = this.playArea.elasticity;

    // Reference the 'normal' and 'tangential' components of the Ball velocities. This is a switch in coordinate frames.
    const v1n = v1.dot( this.mutableVectors.normal );
    const v2n = v2.dot( this.mutableVectors.normal );
    const v1t = v1.dot( this.mutableVectors.tangent );
    const v2t = v2.dot( this.mutableVectors.tangent );

    // Compute the 'normal' components of velocities after collision (P for prime = after).
    const v1nP = ( ( m1 - m2 * elasticity ) * v1n + m2 * ( 1 + elasticity ) * v2n ) / ( m1 + m2 );
    const v2nP = ( ( m2 - m1 * elasticity ) * v2n + m1 * ( 1 + elasticity ) * v1n ) / ( m1 + m2 );

    // Change coordinate frames back into the standard x-y coordinate frame.
    const v1xP = this.mutableVectors.tangent.dotXY( v1t, v1nP );
    const v2xP = this.mutableVectors.tangent.dotXY( v2t, v2nP );
    const v1yP = this.mutableVectors.normal.dotXY( v1t, v1nP );
    const v2yP = this.mutableVectors.normal.dotXY( v2t, v2nP );
    ball1.velocity = new Vector2( v1xP, v1yP );
    ball2.velocity = new Vector2( v2xP, v2yP );

    // Adjust the positions of the Ball to take into account their overlapping time and their new velocities.
    // // Get exact positions when the Balls collided by rewinding by the overlapped time.
  }

  /**
   * Reconstructs uniform motion of two colliding Balls that are currently overlapping to compute the elapsed time
   * from the time when the Balls first exactly collided to their overlapped positions. The contact time is positive if
   * the collision occurred in the past and negative if the contact time is in the future (which happens if the
   * simulation is ran in reverse).
   * @private
   *
   * @param {Ball} ball1 - the first Ball involved in the collision
   * @param {Ball} ball2 - the second Ball involved in the collision.
   * @param {boolean} isReversing - indicates if the simulation is being ran in reverse.
   * @returns {number} - in seconds
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
   * NOTE: this method assumes that the border of the PlayArea reflects. Don't call this method if it doesn't.
   *
   * @private
   * @param {boolean} isReversing - indicates if the simulation is being ran in reverse.
   */
  detectBallToBorderCollisions( dt ) {
    // assert && assert( typeof isReversing === 'boolean', `invalid isReversing: ${isReversing}` );

    // Loop through each Balls and check to see if it is colliding with the border.
    this.ballSystem.balls.forEach( ball => {
      const ballPosition = BallUtils.computeUniformMotionBallPosition( ball, dt );
      const positionBounds = this.playArea.bounds.eroded( ball.radius );

      if ( !positionBounds.containsPoint( ballPosition ) ) {

        // The position of a ball with the same radius as the Ball involved in the collision that is closest to the current
        // position of the ball and fully inside of the border. Again, visit the document above for a visual on the
        // geometric representation.
        const closestPoint = positionBounds.closestPointTo( ballPosition );
        const deltaS = this.mutableVectors.deltaS.set( ballPosition ).subtract( closestPoint );

        // Use the formula derived in the document above.
        const overlappedTime = ball.velocity.dot( deltaS ) !== 0 ? deltaS.magnitudeSquared / ball.velocity.dot( deltaS ) : 0;

        // const contactPoint = BallUtils.computeUniformMotionBallPosition( ball, dt - overlappedTime );

        this.collisions.push( new Collision( ball, this.playArea, dt - overlappedTime ) );

      }



      // // If the Ball is outside the bounds of the PlayArea, it is now colliding with the wall.
      // if ( !this.playArea.fullyContainsBall( ball ) ) {

      //   // When a collision is detected, the Ball has already overlapped, so the current position isn't the exact
      //   // position when the ball first collided. Use the overlapped time to find the exact collision position.
      //   const overlappedTime = this.getBallToBorderCollisionOverlapTime( ball, isReversing );

      //   // Get exact position when the Ball collided by rewinding by the overlapped time.
      //   const contactPosition = BallUtils.computeUniformMotionBallPosition( ball, -overlappedTime );

      //   // Forward the rest of the collision response to the collide-ball-with-border method.
      //   this.collideBallWithBorder( ball, contactPosition, overlappedTime );
      // }
    } );
  }

  /**
   * Processes a ball-to-border collision and updates the velocity and the position of the Ball. The collision algorithm
   * follows the standard rigid-body collision model as described in
   * http://web.mst.edu/~reflori/be150/Dyn%20Lecture%20Videos/Impact%20Particles%201/Impact%20Particles%201.pdf.
   * @protected
   *
   * @param {Ball} ball - the Ball involved in the collision.
   * @param {Vector2} collisionPosition - the center-position of the Ball when it exactly collided with the border.
   * @param {number} overlappedTime - the time the Balls has been overlapping each the border.
   */
  collideBallWithBorder( ball  ) {
    // assert && assert( ball instanceof Ball, `invalid ball: ${ball}` );
    // assert && assert( collisionPosition instanceof Vector2, `invalid collisionPosition: ${collisionPosition}` );
    // assert && assert( typeof overlappedTime === 'number', `invalid overlappedTime: ${overlappedTime}` );

    // Convenience reference to the elasticity.
    const elasticity = this.playArea.elasticity;

    // Update the velocity after the collision.
    if ( this.playArea.isBallOnHorizontalBorder( ball ) ) {

      // Left and Right Border wall collisions incur a flip in horizontal velocity.
      ball.xVelocity *= -elasticity;
    }
    if ( this.playArea.isBallOnVerticalBorder( ball ) ) {

      // Top and Bottom Border wall collisions incur a flip in vertical velocity.
      ball.yVelocity *= -elasticity;
    }

    // Record the exact contact position of the collision for sub-classes.
    // this.recordCollisionPosition( ball, collisionPosition, overlappedTime );

    // // Adjust the position of the Ball to take into account its overlapping time and its new velocity.
    // ball.position = ball.velocity.times( overlappedTime ).add( collisionPosition );
  }

  /**
   * Reconstructs uniform motion of a Ball that is currently overlapping with a border to compute the elapsed time
   * from the time when the Ball first exactly collided to its overlapped position. The contact time is positive if the
   * contact time occurred in the past and negative if the contact time is in the future (which happens if the
   * simulation is ran in reverse).
   * @private
   *
   * @param {Ball} ball - the ball involved in the collision
   * @param {boolean} isReversing - indicates if the simulation is being ran in reverse.
   * @returns {number} - in seconds
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