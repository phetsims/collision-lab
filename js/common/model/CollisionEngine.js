// Copyright 2019-2020, University of Colorado Boulder

/**
 * CollisionEngine handles all collision detection and responses of Ball collisions. It is the physics engine that is
 * used for all screens of the 'Collision Lab' simulation.
 *
 * ## Collision detection:
 *
 *   - CollisionEngine deals with two types of collisions: ball-to-ball and ball-to-border collisions. Both of these
 *     collisions are detected *before* the collision occurs to avoid tunneling scenarios where Balls would pass through
 *     each other with high velocities and/or slow frame rates.
 *
 *   - Since there are only a maximum of 4 Balls in a PlayArea at a time, there are a maximum of 6 unique pairs of
 *     Balls to check, so a spatial partitioning collision detection optimization is not used. The algorithm for
 *     detecting ball-to-ball collisions is described in
 *     https://github.com/phetsims/collision-lab/blob/master/doc/algorithms/ball-to-ball-collision-detection.md
 *
 * ## Collision response:
 *
 *   - On each time-step, *all* potential collisions are detected at once and encapsulated in a Collision instance. To
 *     fully ensure that collisions are simulated correctly — even with extremely high time-steps — only the first
 *     collision is handled and progressed and all potential collisions afterwards are re-detected. This process is
 *     repeated until there are no collisions detected within the time-step.
 *
 *   - Collision response determines what affect a collision has on a Ball's motion. The algorithms for Ball collisions
 *     were adapted but significantly improved from the flash implementation of Collision Lab. They follow the standard
 *     rigid-body collision model as described in
 *     http://web.mst.edu/~reflori/be150/Dyn%20Lecture%20Videos/Impact%20Particles%201/Impact%20Particles%201.pdf
 *
 * @author Brandon Li
 * @author Martin Veillette
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
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
   */
  constructor( playArea, ballSystem ) {
    assert && assert( playArea instanceof PlayArea, `invalid playArea: ${playArea}` );
    assert && assert( ballSystem instanceof BallSystem, `invalid ballSystem: ${ballSystem}` );

    // @private {Collision[]} - collection of the potential Ball collisions on each time step.
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
  }

  /**
   * Steps the CollisionEngine, which initializes both collision detection and responses for every time-step.
   * @public
   *
   * @param {number} dt - time-delta in seconds
   * @param {number} elapsedTime - the total elapsed elapsedTime of the simulation, in seconds.
   */
  step( dt, elapsedTime ) {
    assert && assert( typeof dt === 'number', `invalid dt: ${dt}` );
    assert && assert( typeof elapsedTime === 'number' && elapsedTime >= 0, `invalid elapsedTime: ${elapsedTime}` );

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

      // Now that this collision has been progressed, some time of the step has already been handled.
      dt -= nextCollision.collisionTime;

      // Progress forwards to the exact point of contact of the nextCollision.
      this.ballSystem.stepUniformMotion( nextCollision.collisionTime, elapsedTime - dt );

      // Handle the response for the Ball Collision depending on the type of collision.
      nextCollision.collidingObject instanceof Ball ?
        this.handleBallToBallCollision( nextCollision.ball, nextCollision.collidingObject, elapsedTime - dt ) :
        this.collideBallWithBorder( nextCollision.ball, dt );

      // Now re-detect all potential collisions from this point forwards for the rest of this time-step.
      this.potentialCollisions = [];
      this.detectBallToBallCollisions( dt );
      this.detectBallToBorderCollisions( dt );
    }

    // Now that there are no more potential collisions detected, progress the Balls forwards for the rest of the step.
    this.ballSystem.stepUniformMotion( dt, elapsedTime );
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
       * https://github.com/phetsims/collision-lab/blob/master/doc/algorithms/ball-to-ball-collision-detection.md
       *----------------------------------------------------------------------------*/

      const deltaR = this.mutables.deltaR.set( ball2.position ).subtract( ball1.position );
      const deltaV = this.mutables.deltaV.set( ball2.velocity ).subtract( ball1.velocity ).multiply( Math.sign( dt ) );
      const sumOfRadiiSquared = Math.pow( ball1.radius + ball2.radius, 2 );

      // Solve for the possible roots of the quadratic outlined in the document above.
      const possibleRoots = Utils.solveQuadraticRootsReal(
                              deltaV.magnitudeSquared,
                              2 * deltaV.dot( deltaR ),
                              deltaR.magnitudeSquared - sumOfRadiiSquared );

      // The minimum root of the quadratic is when the Balls will first collide.
      const collisionTime = possibleRoots ? Math.min( ...possibleRoots ) : null;

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
   */
  handleBallToBallCollision( ball1, ball2 ) {
    assert && assert( ball1 instanceof Ball, `invalid ball1: ${ball1}` );
    assert && assert( ball2 instanceof Ball, `invalid ball1: ${ball1}` );
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
  }

  /*----------------------------------------------------------------------------*
   * Ball To Border Collisions
   *----------------------------------------------------------------------------*/

  /**
   * Detects all ball-to-border (PlayArea) collisions of the BallSystem that occur within the passed-in time-step.
   * Although tunneling doesn't occur with ball-to-border collisions, collisions are still detected before they occur
   * to mirror the approach for ball-to-ball collisions.
   *
   * Collisions that are detected are added to the potentialCollisions array and the necessary information of each
   * collision is encapsulated in a Collision instance.
   *
   * NOTE: no-op when the PlayArea's border doesn't reflect;
   * @private
   *
   * @param {number} dt - time-delta in seconds
   */
  detectBallToBorderCollisions( dt ) {
    assert && assert( typeof dt === 'number', `invalid dt: ${dt}` );

    // Loop through each Balls and check to see if it will collide with the border.
    this.playArea.reflectsBorder && this.ballSystem.balls.forEach( ball => {

      // Reference the multiplier of the velocity of the Ball. When the sim is being reversed (dt < 0), Balls are
      // essentially moving in the opposite direction of its velocity vector. For calculating if Balls will collide,
      // reverse the velocity of the ball for convenience and reverse the collisionTime back at the end.
      const velocityMultipier = Math.sign( dt );

      // Calculate the time the Ball would collide with each respective border, ignoring all other walls for now.
      const leftCollisionTime = ( this.playArea.left - ball.left ) / ball.xVelocity * velocityMultipier;
      const rightCollisionTime = ( this.playArea.right - ball.right ) / ball.xVelocity * velocityMultipier;
      const bottomCollisionTime = ( this.playArea.bottom - ball.bottom ) / ball.yVelocity * velocityMultipier;
      const topCollisionTime = ( this.playArea.top - ball.top ) / ball.yVelocity * velocityMultipier;

      // Calculate the time the Ball would collide with a horizontal/vertical border.
      const horizontalCollisionTime = Math.max( leftCollisionTime, rightCollisionTime );
      const verticalCollisionTime = Math.max( bottomCollisionTime, topCollisionTime );

      // Solve for the collisionTime, which is the first border (minimum in time) the Ball would collide with.
      const collisionTime = Math.min( horizontalCollisionTime, verticalCollisionTime );


      // If the collisionTime is finite and is within the current time-step period, the collision is registered.
      if ( Number.isFinite( collisionTime ) && collisionTime >= 0 && collisionTime <= Math.abs( dt ) ) {

        // Register the collision and encapsulate information in a Collision instance.
        this.potentialCollisions.push( new Collision( ball, this.playArea, collisionTime * velocityMultipier ) );
      }
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
  collideBallWithBorder( ball, dt ) {
    // assert && assert( ball instanceof Ball, `invalid ball: ${ball}` );
    // assert && assert( collisionPosition instanceof Vector2, `invalid collisionPosition: ${collisionPosition}` );
    // assert && assert( typeof overlappedTime === 'number', `invalid overlappedTime: ${overlappedTime}` );

    // Update the velocity after the collision.
    if ( ( this.playArea.isBallTouchingLeft( ball ) && ball.xVelocity * Math.sign( dt ) < 0 )
      || ( this.playArea.isBallTouchingRight( ball ) && ball.xVelocity * Math.sign( dt ) > 0 ) ) {

      // Left and Right ball-to-border collisions incur a flip in horizontal velocity, scaled by the elasticity.
      ball.xVelocity *= -this.playArea.elasticity;
    }
    if ( ( this.playArea.isBallTouchingBottom( ball ) && ball.yVelocity * Math.sign( dt ) < 0 )
      || ( this.playArea.isBallTouchingTop( ball ) && ball.yVelocity * Math.sign( dt ) > 0 ) ) {

      // Top and Bottom ball-to-border collisions incur a flip in vertical velocity, scaled by the elasticity.
      ball.yVelocity *= -this.playArea.elasticity;
    }
  }
}

collisionLab.register( 'CollisionEngine', CollisionEngine );
export default CollisionEngine;