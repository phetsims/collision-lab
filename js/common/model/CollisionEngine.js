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
 *   - Since there are only a maximum of 4 Balls in a PlayArea at a time, there are a maximum of 6 unique pairs of
 *     Balls to check, so a spatial partitioning collision detection optimization is not used.
 *
 * ## Collision response:
 *
 *   - On each time-step, *all* potential collisions are detected at once and encapsulated in a Collision instance. To
 *     fully ensure that collisions are simulated correctly — even with extremely high time-steps — only the first
 *     collision is handled and progressed and all potential collisions afterwards are re-detected. This process is
 *     repeated until there are no collisions detected within the time-step.
 *
 *   - Collision response determines what affect a collision has on a Ball's motion. The algorithms for Ball collisions
 *     were adapted but significantly improved from the flash implementation of
 *     Collision Lab. They follow the standard rigid-body collision model as described in
 *     http://web.mst.edu/~reflori/be150/Dyn%20Lecture%20Videos/Impact%20Particles%201/Impact%20Particles%201.pdf.
 *
 * @author Brandon Li
 * @author Martin Veillette
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
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

    // @public {Collision[]} - collection of the potential Ball collisions on each time step.
    this.potentialCollisions = [];

    // @protected {Object} - mutable Vector2/Bounds2 instances, reused in critical code to reduce memory allocations.
    this.mutables = {
      tangent: new Vector2( 0, 0 ),
      normal: new Vector2( 0, 0 ),
      deltaR: new Vector2( 0, 0 ),
      deltaV: new Vector2( 0, 0 ),
      deltaS: new Vector2( 0, 0 ),
      constrainedBounds: new Bounds2( 0, 0, 0, 0 )
    };

    // @protected - reference to the passed-in parameters.
    this.playArea = playArea;
    this.ballSystem = ballSystem;
    this.elapsedTimeProperty = elapsedTimeProperty;
  }

  /**
   * Steps the CollisionEngine, which initializes both collision detection and responses for every time-step.
   * @public
   *
   * @param {number} dt - time-delta in seconds
   */
  step( dt ) {
    assert && assert( typeof dt === 'number', `invalid dt: ${dt}` );

    // First detect all potential collisions that occur in this time-step at once.
    this.potentialCollisions = []; // Reset potential collisions.
    this.detectBallToBallCollisions( dt );
    this.detectBallToBorderCollisions( dt );

    // To fully ensure that collisions are simulated correctly, handle and progress the next collision and all potential
    // collisions afterwards are re-detected. This process is repeated until there are no collisions detected within the
    // time-step.
    while ( this.potentialCollisions.length && Math.abs( dt ) >= 0 ) {

      // Find and reference the next Collision that will occur of the detected collisions.
      const nextCollision = dt >= 0 ?
        _.minBy( this.potentialCollisions, 'collisionTime' ) :
        _.maxBy( this.potentialCollisions, 'collisionTime' );

      // Progress forwards to the exact point of contact of the nextCollision.
      this.ballSystem.stepUniformMotion( nextCollision.collisionTime );

      // Now that this collision has been progressed, some time of the step has already been handled.
      dt -= nextCollision.collisionTime;

      // Handle the response for the Ball Collision depending on the type of collision.
      nextCollision.collidingObject instanceof Ball ?
        this.handleBallToBallCollision( nextCollision.ball, nextCollision.collidingObject, this.elapsedTimeProperty.value - dt ) :
        this.collideBallWithBorder( nextCollision.ball );

      // Now re-detect all potential collisions from this point forwards for the rest of this time-step.
      this.potentialCollisions = [];
      this.detectBallToBallCollisions( dt );
      this.detectBallToBorderCollisions( dt );
    }

    // Now that there are no more potential collisions detected, progress the Balls forwards for the rest of the step.
    this.ballSystem.stepUniformMotion( dt );
  }

  /**
   * Records the exact position of a collision involving a Ball in its trailing 'path'.
   *
   * When a collision involving a Ball occurs, it often occurs in between time-steps and Balls are set to a different
   * position at the end of the step. However, this brings up issues for Ball Paths, which work by recording
   * the position of a Ball at each frame. Since Ball positions are rarely set to the position where the collision
   * actually occurred, this separation becomes obvious to the user, particularly at high velocities.
   * See https://github.com/phetsims/collision-lab/issues/75.
   *
   * @private
   * @param {Ball} ball - the Ball involved in the collision.
   * @param {Vector2} collisionPosition - the center-position of the Ball when it exactly collided with another object.
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
   * Detects all ball-to-ball collisions of the BallSystem that occur within the passed-in time-step. Ball-to-ball
   * collisions are detected before the collision occurs to avoid tunneling scenarios where Balls would pass through
   * each other with high velocities and/or slow frame rates.
   *
   * Collisions that are detected are added to the potentialCollisions array and the necessary information of each
   * collision is encapsulated in a Collision instance.
   * @private
   *
   * @param {number} dt - time-delta in seconds
   */
  detectBallToBallCollisions( dt ) {
    assert && assert( typeof dt === 'number', `invalid dt: ${dt}` );

    // Loop through each unique possible pair of Balls and check to see if they will collide.
    CollisionLabUtils.forEachPossiblePair( this.ballSystem.balls, ( ball1, ball2 ) => {
      assert && assert( ball1 !== ball2, 'ball cannot collide with itself' );

      /*----------------------------------------------------------------------------*
       * This calculation for detecting if the balls will collide comes from the
       * known fact that when the Balls are exactly colliding, their distance is
       * exactly equal to the sum of their radii.
       *
       * Documenting the derivation was beyond the scope of code comments. Please reference
       * https://github.com/phetsims/collision-lab/blob/master/doc/ball-to-ball-collision-detection.md
       *----------------------------------------------------------------------------*/

      const deltaR = this.mutables.deltaR.set( ball2.position ).subtract( ball1.position );
      const deltaV = this.mutables.deltaV.set( ball2.velocity ).subtract( ball1.velocity ).multiply( Math.sign( dt ) );
      const sumOfRadiiSquared = Math.pow( ball1.radius + ball2.radius, 2 );

      // Solve for the minimum root of the quadratic outlined in the document above.
      const collisionTime = Math.min( ...Utils.solveQuadraticRootsReal(
                                           deltaV.magnitudeSquared,
                                           2 * deltaV.dot( deltaR ),
                                           deltaR.magnitudeSquared - sumOfRadiiSquared ) );

      // If the quadratic root is finite and the collisionTime is within the current time-step period, the collision
      // is detected and should be registered.
      if ( Number.isFinite( collisionTime ) && collisionTime >= 0 && collisionTime <= Math.abs( dt ) ) {

        // Register the collision and encapsulate information in a Collision instance.
        this.potentialCollisions.push( new Collision( ball1, ball2, collisionTime * Math.sign( dt ) ) );
      }
    } );
  }

  /**
   * Responds to and handles a single ball-to-ball collision by updating the velocity of both Balls depending on their
   * orientation and elasticity. The collision algorithm follows the standard rigid-body collision model as described in
   * http://web.mst.edu/~reflori/be150/Dyn%20Lecture%20Videos/Impact%20Particles%201/Impact%20Particles%201.pdf.
   *
   * Our version deals with normalized dot product projections to switch coordinate frames. Please reference
   * https://en.wikipedia.org/wiki/Dot_product.
   *
   * @protected - can be overridden in subclasses.
   *
   * @param {Ball} ball1 - the first Ball involved in the collision.
   * @param {Ball} ball2 - the second Ball involved in the collision.
   * @param {number} time - the elapsed time when the collision occurred.
   */
  handleBallToBallCollision( ball1, ball2, time ) {
    assert && assert( ball1 instanceof Ball, `invalid ball1: ${ball1}` );
    assert && assert( ball2 instanceof Ball, `invalid ball1: ${ball1}` );
    // assert && assert( typeof time === 'number' && time >= 0, `invalid time: ${time}` );
    assert && assert( BallUtils.areBallsTouching( ball1, ball2 ), 'Balls must be touching for a collision response' );

    // Convenience references to known ball values.
    const r1 = ball1.position;
    const r2 = ball2.position;
    const m1 = ball1.mass;
    const m2 = ball2.mass;
    const v1 = ball1.velocity; // before the collision.
    const v2 = ball2.velocity; // before the collision.
    const elasticity = this.playArea.elasticity;

    // Set the Normal vector, called the 'line of impact'. Account for a rare scenario when Balls are placed exactly
    // concentrically on-top of each other and both balls have 0 velocity, resulting in r2 equal to r1.
    !r2.equals( r1 ) ? this.mutables.normal.set( r2 ).subtract( r1 ).normalize() : // TODO: is this case still possible?
                       this.mutables.normal.set( Vector2.X_UNIT );

    // Set the Tangential vector, called the 'plane of contact'.
    this.mutables.tangent.setXY( -this.mutables.normal.y, this.mutables.normal.x );

    // Reference the 'normal' and 'tangential' components of the Ball velocities. This is a switch in coordinate frames.
    const v1n = v1.dot( this.mutables.normal );
    const v2n = v2.dot( this.mutables.normal );
    const v1t = v1.dot( this.mutables.tangent );
    const v2t = v2.dot( this.mutables.tangent );

    // Compute the 'normal' components of velocities after collision (P for prime = after).
    const v1nP = ( ( m1 - m2 * elasticity ) * v1n + m2 * ( 1 + elasticity ) * v2n ) / ( m1 + m2 );
    const v2nP = ( ( m2 - m1 * elasticity ) * v2n + m1 * ( 1 + elasticity ) * v1n ) / ( m1 + m2 );

    // Change coordinate frames back into the standard x-y coordinate frame.
    const v1xP = this.mutables.tangent.dotXY( v1t, v1nP );
    const v2xP = this.mutables.tangent.dotXY( v2t, v2nP );
    const v1yP = this.mutables.normal.dotXY( v1t, v1nP );
    const v2yP = this.mutables.normal.dotXY( v2t, v2nP );
    ball1.velocity = new Vector2( v1xP, v1yP );
    ball2.velocity = new Vector2( v2xP, v2yP );

    // Record the collision in both of the Ball's trailing 'paths'. When a collision involving a Ball occurs, it often occurs in between time-steps and Balls are set to a different
    // position at the end of the step. However, this brings up issues for Ball Paths, which work by recording
    // the position of a Ball at each frame. Since Ball positions are rarely set to the position where the collision
    // actually occurred, this separation becomes obvious to the user, particularly at high velocities.
    // See https://github.com/phetsims/collision-lab/issues/75.
    ball1.path.updatePath( time );
    ball2.path.updatePath( time );
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

    const deltaR = this.mutables.deltaR.set( ball2.position ).subtract( ball1.position );
    const deltaV = this.mutables.deltaV.set( ball2.velocity ).subtract( ball1.velocity );
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
    return;
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
        const deltaS = this.mutables.deltaS.set( ballPosition ).subtract( closestPoint );

        // Use the formula derived in the document above.
        const overlappedTime = ball.velocity.dot( deltaS ) !== 0 ? deltaS.magnitudeSquared / ball.velocity.dot( deltaS ) : 0;

        // const contactPoint = BallUtils.computeUniformMotionBallPosition( ball, dt - overlappedTime );

        this.potentialCollisions.push( new Collision( ball, this.playArea, dt - overlappedTime ) );

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
    const deltaS = this.mutables.deltaS.set( ball.position ).subtract( closestPoint );

    // Use the formula derived in the document above.
    const contactTime = ball.velocity.dot( deltaS ) !== 0 ? deltaS.magnitudeSquared / ball.velocity.dot( deltaS ) : 0;

    assert && assert( Number.isFinite( contactTime ), `invalid contactTime: ${ contactTime }` );
    return contactTime;
  }
}

collisionLab.register( 'CollisionEngine', CollisionEngine );
export default CollisionEngine;