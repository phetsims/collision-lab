// Copyright 2019-2020, University of Colorado Boulder

/**
 * CollisionEngine handles all collision detection and responses of Ball collisions. It is the physics engine that is
 * used for all screens of the 'Collision Lab' simulation.
 *
 * ## Collision detection:
 *
 *   - CollisionEngine deals with 2 types of collisions: ball-ball and ball-border collisions. Both of these collisions
 *     are detected *before* the collision occurs to avoid tunneling scenarios where Balls would pass through each
 *     other with high velocities and/or time-steps. The algorithm for detecting ball-to-ball collisions is described
 *     in https://github.com/phetsims/collision-lab/blob/master/doc/algorithms/ball-to-ball-collision-detection.md
 *
 *   - On each time-step, every ball-ball and ball-border combination is encapsulated in a Collision data-structure
 *     instance, along with if and when the respective bodies will collide. These Collision instances are saved to
 *     optimize the number of redundant collision-detection checks. On successive time-steps, Collision instances
 *     are only created for ball-ball and ball-border combinations that haven't already been created. Collision
 *     instances are removed when a collision is handled or some other state in the simulation changes.
 *
 * ## Collision response:
 *
 *   - Collision response determines what affect a collision has on a Ball's motion. The algorithms for Ball collisions
 *     were adapted but significantly improved from the flash implementation of Collision Lab. They follow the standard
 *     rigid-body collision model as described in
 *     http://web.mst.edu/~reflori/be150/Dyn%20Lecture%20Videos/Impact%20Particles%201/Impact%20Particles%201.pdf
 *
 *   - On each time-step, after Collisions have been created for every ball-ball and ball-border combination, we check
 *     if any of our 'saved' collisions that have associated collision-times are in between the previous and current
 *     step, meaning a collision will occur in this time-step. To fully ensure that collisions are simulated
 *     correctly — even with extremely high time-steps — only the earliest collision is handled and progressed. All
 *     Collision instances that store the involved Ball(s) are removed. This detection-response is then repeated until
 *     there are no collisions detected within the time-step.
 *
 * @author Brandon Li
 * @author Martin Veillette
 */

import Property from '../../../../axon/js/Property.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabUtils from '../CollisionLabUtils.js';
import Ball from './Ball.js';
import BallSystem from './BallSystem.js';
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

    // @private {Set.<Collision>} - collection of Ball collisions that may occur.
    this.collisions = new Set();

    // @private {Set.<Collision>} - collection of Ball collisions that will not occur.
    this.blacklistedCollisions = new Set();

    // @protected {Object} - mutable Vector2 instances, reused in critical code to reduce memory allocations.
    this.mutableVectors = {
      tangent: new Vector2( 0, 0 ),
      normal: new Vector2( 0, 0 ),
      deltaR: new Vector2( 0, 0 ),
      deltaV: new Vector2( 0, 0 ),
      deltaS: new Vector2( 0, 0 )
    };

    // @protected - reference to the passed-in parameters.
    this.playArea = playArea;
    this.ballSystem = ballSystem;

    // Observe when any of the Balls in the system are being user-controlled or when the number of Balls in the system
    // changes and reset the CollisionEngine. Multilink persists for the lifetime of the sim since
    // BallSystems/CollisionEngines are never disposed.
    Property.lazyMultilink( [ ballSystem.ballSystemUserControlledProperty, ballSystem.numberOfBallsProperty ],
      this.reset.bind( this ) );
  }

  /**
   * Resets the CollisionEngine.
   * @public
   *
   * This is invoked in the following scenarios:
   *   - The reset all button is pressed.
   *   - The restart button is pressed.
   *   - When any of the Balls of the system are user-controlled.
   *   - When Balls are added or removed from the system.
   */
  reset() {
    this.collisions.clear();
    this.blacklistedCollisions.clear();
  }

  /**
   * Steps the CollisionEngine, which initializes both collision detection and responses for a given time-step.
   *
   * To fully ensure that collisions are simulated correctly, this method will only handle and progress the first
   * detected collision. It will then recursively call itself with a smaller step-size to re-detect all potential
   * collisions. This recursive process is repeated until there are no collisions detected within a given time-step.
   *
   * @public
   * @param {number} dt - time-delta in seconds
   * @param {number} elapsedTime - the total elapsed elapsedTime of the simulation, in seconds.
   */
  step( dt, elapsedTime ) {
    assert && assert( typeof dt === 'number', `invalid dt: ${dt}` );
    assert && assert( typeof elapsedTime === 'number' && elapsedTime >= 0, `invalid elapsedTime: ${elapsedTime}` );

    // First detect all potential collisions that occur within this time-step at once.
    this.detectBallToBallCollisions( dt, elapsedTime );
    this.detectBallToBorderCollisions( dt, elapsedTime );

    if ( !CollisionLabUtils.any( this.collisions, collision => elapsedTime - collision.time <= dt && elapsedTime - collision.time >= 0  ) ) {

      // If there are no collisions detected, the Balls are in uniform motion for the rest of
      // this time-step. The recursive process is stopped and the Balls are stepped uniformly to the end of the
      // time-step.
      return this.ballSystem.stepUniformMotion( dt, elapsedTime ); // return for TCO supported browsers.
    }
    else {

      // If there are collisions detected within the given time-step, only handle and progress the first collision.
      // Find and reference the next Collision that will occur of the detected collisions.
      const nextCollisions = dt >= 0 ?
        CollisionLabUtils.getMinValuesOf( this.collisions, collision => collision.time ) :
        CollisionLabUtils.getMaxValuesOf( this.collisions, collision => collision.time );


      const delta = dt - ( elapsedTime - nextCollisions[ 0 ].time );

      // Progress forwards to the exact point of contact of the nextCollision.
      this.ballSystem.stepUniformMotion( dt - ( elapsedTime - nextCollisions[ 0 ].time ), nextCollisions[ 0 ].time );

      nextCollisions.forEach( collision => {

        // Handle the response for the Ball Collision depending on the type of collision.
        collision.collidingObject instanceof Ball ?
          this.handleBallToBallCollision( collision.ball, collision.collidingObject, collision.time ) :
          this.handleBallToBorderCollision( collision.ball, dt );
      } );

      // Recursively call step() with a smaller step-size to re-detect all potential collisions afterwards.
      return this.step( dt - delta, elapsedTime ); // return for TCO supported browsers.
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
   * Collisions that are detected are added to the collisions array and the necessary information of each
   * collision is encapsulated in a Collision instance.
   * @protected - can be overridden in subclasses
   *
   * @param {number} dt - time-delta in seconds
   */
  detectBallToBallCollisions( dt, elapsedTime ) {
    assert && assert( typeof dt === 'number', `invalid dt: ${dt}` );

    // Loop through each unique possible pair of Balls and check to see if they will collide.
    CollisionLabUtils.forEachPossiblePair( this.ballSystem.balls, ( ball1, ball2 ) => {
      assert && assert( ball1 !== ball2, 'ball cannot collide with itself' );
      if ( CollisionLabUtils.any( this.collisions, collision => collision.includes( ball1 ) && collision.includes( ball2 ) ) ) {
        return;
      }
      if ( CollisionLabUtils.any( this.blacklistedCollisions, collision => collision.includes( ball1 ) && collision.includes( ball2 ) ) ) {
        return;
      }

      /*----------------------------------------------------------------------------*
       * This calculation for detecting if the balls will collide comes from the
       * known fact that when the Balls are exactly colliding, their distance is
       * exactly equal to the sum of their radii.
       *
       * Documenting the derivation was beyond the scope of code comments. Please reference
       * https://github.com/phetsims/collision-lab/blob/master/doc/algorithms/ball-to-ball-collision-detection.md
       *----------------------------------------------------------------------------*/

      const deltaR = this.mutableVectors.deltaR.set( ball2.position ).subtract( ball1.position );
      const deltaV = this.mutableVectors.deltaV.set( ball2.velocity ).subtract( ball1.velocity ).multiply( Math.sign( dt ) );
      const sumOfRadiiSquared = ( ball1.radius + ball2.radius ) ** 2;
      let c = deltaR.magnitudeSquared - sumOfRadiiSquared;
      const scratchVector = new Vector2( 0, 0 );
      const travellingTowardsEachOther = () => {
        if ( !ball1.velocity.equals( Vector2.ZERO ) && !ball2.velocity.equals( Vector2.ZERO ) ) {
          if ( scratchVector.set( ball1.velocity ).normalize().multiply( ball1.radius + ball2.radius ).add( ball1.position ).equalsEpsilon( ball2.position, 1E-5 ) ) {
            return true;
          }
          if ( scratchVector.set( ball2.velocity ).normalize().multiply( ball1.radius + ball2.radius ).add( ball2.position ).equalsEpsilon( ball1.position, 1E-5 ) ) {
            return true;
          }
          return false;
        }
        else if ( !ball1.velocity.equals( Vector2.ZERO ) ) {
          return scratchVector.set( ball1.velocity ).normalize().multiply( ball1.radius + ball2.radius ).add( ball1.position ).equalsEpsilon( ball2.position, 1E-5 );
        }
        else if ( !ball2.velocity.equals( Vector2.ZERO ) ) {
          return scratchVector.set( ball2.velocity ).normalize().multiply( ball1.radius + ball2.radius ).add( ball2.position ).equalsEpsilon( ball1.position, 1E-5 );
        }
        else {
          return false;
        }
      };
      const h = travellingTowardsEachOther();


      if ( this.playArea.elasticity !== 1 && Utils.equalsEpsilon( c, 0, 1E-8 ) && c < 0 && h ) { c = -c; }

      // Solve for the possible roots of the quadratic outlined in the document above.
      const possibleRoots = Utils.solveQuadraticRootsReal(
                              deltaV.magnitudeSquared,
                              2 * deltaV.dot( deltaR ),
                              c );

      // The minimum root of the quadratic is when the Balls will first collide.
      const collisionTime = possibleRoots ? Math.min( ...possibleRoots ) : null;

      // If the quadratic root is finite and the collisionTime is within the current time-step period, the collision
      // is detected and should be registered.
      if ( Number.isFinite( collisionTime ) && collisionTime >= 0 ) {

        // Register the collision and encapsulate information in a Collision instance.
        this.collisions.add( new Collision( ball1, ball2, elapsedTime - dt + collisionTime * Math.sign( dt ) ) );
      }
      else {
        this.blacklistedCollisions.add( new Collision( ball1, ball2, -100 ) );
      }
      // else if ( this.playArea.elasticity !== 1 && Number.isFinite( collisionTime ) && collisionTime <= Math.abs( dt ) && h ) {
      //   const elapsedTimeOfCollision = elapsedTime - dt + collisionTime;

      //   if ( elapsedTimeOfCollision >= 0 ) {
      //     // Register the collision and encapsulate information in a Collision instance.
      //     this.collisions.add( new Collision( ball1, ball2, elapsedTime - dt + collisionTime * Math.sign( dt ) ) );
      //   }
      // }
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
   * @param {number} elapsedTimeOfCollision - used in sub-classes.
   */
  handleBallToBallCollision( ball1, ball2, elapsedTimeOfCollision ) {
    assert && assert( ball1 instanceof Ball, `invalid ball1: ${ball1}` );
    assert && assert( ball2 instanceof Ball, `invalid ball1: ${ball1}` );
    assert && assert( typeof elapsedTimeOfCollision === 'number', `invalid elapsedTimeOfCollision: ${elapsedTimeOfCollision}` );
    // assert && assert( BallUtils.areBallsTouching( ball1, ball2 ), 'Balls must be touching for a collision response' );

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
    !r2.equals( r1 ) ? this.mutableVectors.normal.set( r2 ).subtract( r1 ).normalize() : // TODO: is this case still possible?
                       this.mutableVectors.normal.set( Vector2.X_UNIT );

    // Set the Tangential vector, called the 'plane of contact'.
    this.mutableVectors.tangent.setXY( -this.mutableVectors.normal.y, this.mutableVectors.normal.x );

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


    this.collisions.forEach( collision => {
      if ( collision.includes( ball1 ) || collision.includes( ball2 ) ) {
        this.collisions.delete( collision );
      }
    } );
    this.blacklistedCollisions.forEach( collision => {
      if ( collision.includes( ball1 ) || collision.includes( ball2 ) ) {
        this.blacklistedCollisions.delete( collision );
      }
    } );
  }

  /*----------------------------------------------------------------------------*
   * Ball To Border Collisions
   *----------------------------------------------------------------------------*/

  /**
   * Detects all ball-to-border (PlayArea) collisions of the BallSystem that occur within the passed-in time-step.
   * Although tunneling doesn't occur with ball-to-border collisions, collisions are still detected before they occur
   * to mirror the approach for ball-to-ball collisions.
   *
   * Collisions that are detected are added to the collisions array and the necessary information of each
   * collision is encapsulated in a Collision instance.
   *
   * NOTE: no-op when the PlayArea's border doesn't reflect;
   * @private
   *
   * @param {number} dt - time-delta in seconds
   */
  detectBallToBorderCollisions( dt, elapsedTime ) {
    assert && assert( typeof dt === 'number', `invalid dt: ${dt}` );

    // Loop through each Balls and check to see if it will collide with the border.
    this.playArea.reflectsBorder && this.ballSystem.balls.forEach( ball => {

      if ( CollisionLabUtils.any( this.collisions, collision => collision.ball === ball && collision.collidingObject === this.playArea ) ) {
        return;
      }

      if ( CollisionLabUtils.any( this.blacklistedCollisions, collision => collision.ball === ball && collision.collidingObject === this.playArea ) ) {
        return;
      }
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
      const possibleCollisionTimes = [ horizontalCollisionTime, verticalCollisionTime ].filter( Number.isFinite );

      // Solve for the collisionTime, which is the first border (minimum in time) the Ball would collide with.
      const collisionTime = Math.min( ...possibleCollisionTimes );

      // If the collisionTime is finite and is within the current time-step period, the collision is registered.
      if ( possibleCollisionTimes.length && collisionTime >= 0 ) {

        // Register the collision and encapsulate information in a Collision instance.
        this.collisions.add( new Collision( ball, this.playArea, elapsedTime - dt + collisionTime * velocityMultipier ) );
      }
      else {
        this.blacklistedCollisions.add( new Collision( ball, this.playArea, -100 ) );
      }
      // else if ( this.playArea.elasticity !== 1 && Number.isFinite( collisionTime ) && collisionTime <= Math.abs( dt ) && this.playArea.isBallTouchingSide( ball ) ) {
      //   const elapsedTimeOfCollision = elapsedTime - dt + collisionTime;

      //   if ( elapsedTimeOfCollision >= 0 ) {

      //     // Register the collision and encapsulate information in a Collision instance.
      //     this.collisions.add( new Collision( ball, this.playArea, collisionTime * Math.sign( dt ) ) );
      //   }
      // }
    } );
  }

  /**
   * Responds to and handles a single ball-to-border collision by updating the velocity of the Balls depending on its
   * orientation relative to the border. The collision algorithm follows the standard rigid-body collision model
   * described in
   * http://web.mst.edu/~reflori/be150/Dyn%20Lecture%20Videos/Impact%20Particles%201/Impact%20Particles%201.pdf.
   *
   * @protected - can be overridden in subclasses.
   *
   * @param {Ball} ball - the Ball involved in the collision.
   * @param {number} dt - time-delta in seconds
   */
  handleBallToBorderCollision( ball, dt ) {
    assert && assert( ball instanceof Ball, `invalid ball: ${ball}` );
    assert && assert( typeof dt === 'number', `invalid dt: ${dt}` );

    // Reference the multiplier of the velocity of the Ball. When the sim is being reversed (dt < 0), Balls are
    // essentially moving in the opposite direction of its velocity vector. This is used to determine the direction
    // that the Ball is moving towards; even if a Ball is touching a side(s) of the border, it's velocity doesn't change
    // unless it is moving towards that respective side.
    const velocityMultipier = Math.sign( dt );

    // Update the velocity after the collision.
    if ( ( this.playArea.isBallTouchingLeft( ball ) && ball.xVelocity * velocityMultipier < 0 ) ||
         ( this.playArea.isBallTouchingRight( ball ) && ball.xVelocity * velocityMultipier > 0 ) ) {

      // Left and Right ball-to-border collisions incur a flip in horizontal velocity, scaled by the elasticity.
      ball.xVelocity *= -this.playArea.elasticity;
    }
    if ( ( this.playArea.isBallTouchingBottom( ball ) && ball.yVelocity * velocityMultipier < 0 ) ||
         ( this.playArea.isBallTouchingTop( ball ) && ball.yVelocity * velocityMultipier > 0 ) ) {

      // Top and Bottom ball-to-border collisions incur a flip in vertical velocity, scaled by the elasticity.
      ball.yVelocity *= -this.playArea.elasticity;
    }


    this.collisions.forEach( collision => {
      if ( collision.includes( ball ) ) {
        this.collisions.delete( collision );
      }
    } );

    this.blacklistedCollisions.forEach( collision => {
      if ( collision.includes( ball ) ) {
        this.blacklistedCollisions.delete( collision );
      }
    } );
  }
}

collisionLab.register( 'CollisionEngine', CollisionEngine );
export default CollisionEngine;