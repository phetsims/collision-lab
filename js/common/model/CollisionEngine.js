// Copyright 2019-2022, University of Colorado Boulder

/**
 * CollisionEngine handles all collision detection and responses of Ball collisions. It is the physics engine that is
 * used for all screens of the 'Collision Lab' simulation.
 *
 * ## Collision detection:
 *
 *   - CollisionEngine deals with 2 types of collisions: ball-ball and ball-border collisions. Both of these collisions
 *     are detected *before* the collision occurs to avoid tunneling scenarios where Balls would pass through each
 *     other with high velocities and/or time-steps. The algorithm for detecting ball-ball collisions is described fully
 *     in https://github.com/phetsims/collision-lab/blob/master/doc/algorithms/ball-to-ball-collision-detection.md
 *
 *   - On each time-step, every ball-ball and ball-border combination is encapsulated in a Collision data structure
 *     instance, along with if and when the respective bodies will collide. These Collision instances are saved to
 *     optimize the number of redundant collision-detection checks. On successive time-steps, Collision instances
 *     are only created for ball-ball and ball-border combinations that haven't already been created. Collision
 *     instances are removed when a collision is handled or some other state in the simulation changes.
 *
 * ## Collision response:
 *
 *   - Collision response determines what effect a collision has on a Ball's motion. The algorithms for Ball collisions
 *     were adapted but significantly improved from the flash implementation of Collision Lab. They follow the standard
 *     rigid-body collision model as described in
 *     http://web.mst.edu/~reflori/be150/Dyn%20Lecture%20Videos/Impact%20Particles%201/Impact%20Particles%201.pdf
 *
 *   - On each time-step, after Collisions have been created for every ball-ball and ball-border combination, we check
 *     if any of our 'saved' collisions that have associated collision times are in between the previous and current
 *     step, meaning a collision will occur in this time-step. To fully ensure that collisions are simulated
 *     correctly — even with extremely high time-steps — only the earliest collision is handled and progressed. All
 *     Collision instances that store the involved Ball(s) are removed. This detection-response loop is then repeated
 *     until there are no collisions detected within the time-step.
 *
 * @author Brandon Li
 * @author Martin Veillette
 */

import Multilink from '../../../../axon/js/Multilink.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
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

    // @protected {Array.<Collision>} - collection of Ball collisions that may or may not occur. Some Collisions instances
    //                              will not have an associated "time" which indicates that a Collision will not occur.
    //                              See the comment at the top for a high level overview of how this set is used.
    this.collisions = [];
    this.nextCollisions = []; // Minimizing GC by using a persistent array
    this.collisionsToDispose = [];

    // @private {Property.<number>} - the 'direction' of the progression of the current time-step of the sim, where:
    //                               1 means the sim is being progressed forwards in the current time-step, (dt > 0).
    //                              -1 means the sim is being progressed backwards in the current time-step, (dt < 0)
    this.timeStepDirectionProperty = new NumberProperty( 1, { numberType: 'Integer' } );

    // @protected - reference to the passed-in parameters.
    this.playArea = playArea;
    this.ballSystem = ballSystem;

    // @private {Vector2} - mutable Vector2 instances, reused in critical code to reduce memory allocations.
    this.deltaR = new Vector2( 0, 0 );
    this.deltaV = new Vector2( 0, 0 );

    // Observe when some 'state' in the simulation that invalidates our Collision instances changes. This occurs when a
    // Ball is user-controlled, when the number of Balls in the system changes, when the 'Constant' size checkbox is
    // toggled, or when the 'direction' of time progression changes. In all of these scenarios, existing Collisions may
    // be incorrect and collisions should be re-detected. Multilink persists for the lifetime of the simulation.
    Multilink.lazyMultilink( [
      ballSystem.ballSystemUserControlledProperty,
      ballSystem.numberOfBallsProperty,
      ballSystem.ballsConstantSizeProperty,
      this.timeStepDirectionProperty
    ], this.reset.bind( this ) );

    // Observe when the PlayArea's reflectingBorderProperty changes, meaning existing Collisions that involve the
    // PlayArea may be incorrect and collisions should be re-detected. Link persists for the lifetime of the simulation.
    playArea.reflectingBorderProperty.lazyLink( () => this.invalidateCollisions( playArea ) );
  }

  /**
   * Resets the CollisionEngine. This removes all 'saved' Collision instances.
   * @public
   *
   * Called when the reset/restart button is pressed or when some 'state' of the simulation changes.
   */
  reset() {
    while ( this.collisions.length ) {
      this.collisionsToDispose.push( this.collisions.pop() );
    }
  }

  /**
   * Steps the CollisionEngine, which initializes both collision detection and responses for a given time-step. See
   * the comment at the top of this file for a high-level overview of the collision detection-response loop.
   * @public
   *
   * @param {number} dt - time-delta of this step, in seconds.
   * @param {number} elapsedTime - elapsedTime, based on where the Balls are positioned when this method is called.
   * @param {number} [maxIterations] - max number of iterations in the detection-response loop. Once this number is
   *                                   reached, collision-response is considered to be finished for the step.
   */
  step( dt, elapsedTime, maxIterations = 2000 ) {
    assert && assert( typeof dt === 'number', `invalid dt: ${dt}` );
    assert && assert( typeof elapsedTime === 'number' && elapsedTime >= 0, `invalid elapsedTime: ${elapsedTime}` );

    sceneryLog && sceneryLog.Sim && sceneryLog.Sim( `step dt:${dt}, elapsedTime:${elapsedTime}, maxIterations:${maxIterations}` );
    sceneryLog && sceneryLog.Sim && sceneryLog.push();

    let iterations = 0;
    while ( iterations++ < maxIterations ) {
      sceneryLog && sceneryLog.Sim && sceneryLog.Sim( `iteration ${iterations} dt:${dt}, elapsedTime:${elapsedTime}` );
      sceneryLog && sceneryLog.Sim && sceneryLog.push();

      sceneryLog && sceneryLog.Sim && this.ballSystem.balls.forEach( ball => {
        sceneryLog.Sim( `#${ball.index} velocity:${ball.velocityProperty.value.toString()}` );
      } );

      // First detect all potential collisions that have not already been detected.
      this.timeStepDirectionProperty.value = Math.sign( dt );
      this.detectAllCollisions( elapsedTime );

      if ( sceneryLog && sceneryLog.Sim ) {
        this.collisions.forEach( collision => {
          sceneryLog.Sim( `${collision.inRange( elapsedTime, elapsedTime + dt ) ? '[in-step] ' : ''}${collision.time} ${collision}` );
        } );
      }

      // Get all Collisions that have a collision 'time' in this time-step. Rolled back to simple logic for performance
      // and memory characteristics
      // If there are collisions within the given time-step, only handle and progress the 'earliest' collision.
      // Find and reference the next Collision that will occur of the collisions that will occur in this step.
      this.nextCollisions.length = 0;
      let bestPotentialCollisionTime = elapsedTime + dt * ( 1 + 1e-7 );
      for ( let i = this.collisions.length - 1; i >= 0; i-- ) {
        const collision = this.collisions[ i ];
        if ( collision.inRange( elapsedTime, bestPotentialCollisionTime ) ) {
          if ( collision.time !== bestPotentialCollisionTime ) {
            bestPotentialCollisionTime = collision.time;
            this.nextCollisions.length = 0;
          }
          this.nextCollisions.push( collision );
        }
      }

      if ( !this.nextCollisions.length ) {

        sceneryLog && sceneryLog.Sim && sceneryLog.Sim( 'no collisions in step' );

        // If there are no collisions within this step, the Balls are in uniform motion for the entirety of this step.
        // The recursive process is stopped and the Balls are stepped uniformly to the end of the time-step.
        this.progressBalls( dt, elapsedTime );

        sceneryLog && sceneryLog.Sim && sceneryLog.pop();
        break;
      }
      else {
        // Reference when the collision will occur (in terms of both elapsedTime and a time-delta, respectively).
        const collisionTime = Math.max( 0, bestPotentialCollisionTime );
        const timeUntilCollision = collisionTime - elapsedTime;

        sceneryLog && sceneryLog.Sim && sceneryLog.Sim( `collision in step in ${timeUntilCollision}` );

        // Progress forwards to the exact point of contact of the collision.
        this.progressBalls( timeUntilCollision, elapsedTime );

        // Handle the response for the Collision depending on the type of collision.
        for ( let i = this.nextCollisions.length - 1; i >= 0; i-- ) {
          this.handleCollision( this.nextCollisions[ i ], dt );
        }

        // Continue on to the next iteration
        dt -= timeUntilCollision;
        elapsedTime = collisionTime;
      }

      while ( this.collisionsToDispose.length ) {
        this.collisionsToDispose.pop().dispose();
      }

      sceneryLog && sceneryLog.Sim && sceneryLog.pop();
    }

    sceneryLog && sceneryLog.Sim && sceneryLog.pop();
  }

  /**
   * Whether there already exists a collision between the two bodies.
   * @public
   *
   * @param {Object} body1
   * @param {Object} body2
   * @returns {boolean}
   */
  hasCollisionBetween( body1, body2 ) {
    for ( let i = this.collisions.length - 1; i >= 0; i-- ) {
      if ( this.collisions[ i ].includesBodies( body1, body2 ) ) {
        return true;
      }
    }
    return false;
  }

  /**
   * Progresses the Balls forwards by the given time-delta, assuming there are no collisions.
   * @protected - can be overridden in subclasses.
   *
   * @param {number} dt - time-delta, in seconds.
   * @param {number} elapsedTime - elapsedTime, based on where the Balls are positioned when this method is called.
   */
  progressBalls( dt, elapsedTime ) {
    assert && assert( typeof dt === 'number', `invalid dt: ${dt}` );
    assert && assert( typeof elapsedTime === 'number' && elapsedTime >= 0, `invalid elapsedTime: ${elapsedTime}` );

    sceneryLog && sceneryLog.Sim && sceneryLog.Sim( 'CollisionEngine.progressBalls' );
    sceneryLog && sceneryLog.Sim && sceneryLog.push();

    // CollisionEngine only deals with uniformly moving Balls, but sub-types might not (for the 'Inelastic' screen).
    this.ballSystem.stepUniformMotion( dt, elapsedTime + dt );

    sceneryLog && sceneryLog.Sim && sceneryLog.pop();
  }

  /**
   * Detects all ball-ball and ball-border collisions that have not already been detected.
   * @protected - can be overridden in subclasses.
   *
   * @param {number} elapsedTime - elapsedTime, based on where the Balls are positioned when this method is called.
   */
  detectAllCollisions( elapsedTime ) {
    assert && assert( typeof elapsedTime === 'number' && elapsedTime >= 0, `invalid elapsedTime: ${elapsedTime}` );

    // CollisionEngine only deals with detecting 2 types of collisions, but sub-types might not ('Inelastic' screen).
    this.detectBallToBallCollisions( elapsedTime );
    this.detectBallToBorderCollisions( elapsedTime );
  }

  /**
   * Handles all Collisions by calling a response algorithm, dispatched by the type of bodies involved in the Collision.
   * @protected - can be overridden in subclasses.
   *
   * @param {Collision} collision - the Collision instance.
   * @param {number} dt
   */
  handleCollision( collision, dt ) {
    assert && assert( collision instanceof Collision, `invalid collision: ${collision}` );

    sceneryLog && sceneryLog.Sim && sceneryLog.Sim( 'CollisionEngine.handleCollision' );
    sceneryLog && sceneryLog.Sim && sceneryLog.push();

    // CollisionEngine only deals with detecting 2 types of collisions, but sub-types might not ('Inelastic' screen).
    collision.includes( this.playArea ) ?
    this.handleBallToBorderCollision( collision.body2 === this.playArea ? collision.body1 : collision.body2, dt ) :
    this.handleBallToBallCollision( collision.body1, collision.body2, dt );

    sceneryLog && sceneryLog.Sim && sceneryLog.pop();
  }

  /**
   * Remove all collisions that involves the passed-in body.
   * @protected
   *
   * @param {Object} body
   */
  invalidateCollisions( body ) {
    assert && assert( body instanceof Object, `invalid body: ${body}` );

    for ( let i = this.collisions.length - 1; i >= 0; i-- ) {
      const collision = this.collisions[ i ];

      if ( collision.includes( body ) ) {
        this.collisions.splice( i, 1 );
        this.collisionsToDispose.push( collision );
      }
    }
  }

  /*----------------------------------------------------------------------------*
   * Ball To Ball Collisions
   *----------------------------------------------------------------------------*/

  /**
   * Detects all ball-to-ball collisions of the BallSystem that haven't already occurred. Ball-to-ball collisions are
   * detected before the collision occurs to avoid tunneling scenarios. For newly detected collisions, necessary
   * information is encapsulated in a Collision instance.
   * @private
   *
   * @param {number} elapsedTime - elapsedTime, based on where the Balls are positioned when this method is called.
   */
  detectBallToBallCollisions( elapsedTime ) {
    assert && assert( typeof elapsedTime === 'number' && elapsedTime >= 0, `invalid elapsedTime: ${elapsedTime}` );

    sceneryLog && sceneryLog.Sim && sceneryLog.Sim( 'detectBallToBallCollisions' );
    sceneryLog && sceneryLog.Sim && sceneryLog.push();

    // Loop through each unique possible pair of Balls.
    for ( let i = 1; i < this.ballSystem.balls.length; i++ ) {
      const ball1 = this.ballSystem.balls[ i ];
      for ( let j = 0; j < i; j++ ) {
        const ball2 = this.ballSystem.balls[ j ];

        assert && assert( ball1 !== ball2, 'ball cannot collide with itself' );

        // Only detect new ball-ball collisions if it hasn't already been detected.
        if ( this.hasCollisionBetween( ball1, ball2 ) ) {
          continue;
        }

        // Reference the multiplier of the velocity of the Ball. When the sim is being reversed, Balls are essentially
        // moving in the opposite direction of its velocity vector. For calculating if Balls will collide, reverse the
        // velocity of the ball for convenience and reverse the collisionTime back at the end.
        const velocityMultiplier = this.timeStepDirectionProperty.value;

        /*----------------------------------------------------------------------------*
         * This calculation for detecting if the balls will collide comes from the
         * known fact that when the Balls are exactly colliding, their distance is
         * exactly equal to the sum of their radii.
         *
         * Documenting the derivation was beyond the scope of code comments. Please reference
         * https://github.com/phetsims/collision-lab/blob/master/doc/algorithms/ball-to-ball-collision-detection.md
         *----------------------------------------------------------------------------*/

        this.deltaR.set( ball2.positionProperty.value ).subtract( ball1.positionProperty.value );
        this.deltaV.set( ball2.velocityProperty.value ).subtract( ball1.velocityProperty.value ).multiply( velocityMultiplier );
        const sumOfRadiiSquared = ( ball1.radiusProperty.value + ball2.radiusProperty.value ) ** 2;

        const relativeDotProduct = this.deltaV.dot( this.deltaR );

        const isEffectivelyParallel = Math.abs( relativeDotProduct ) < 1e-11;

        // Solve for the possible roots of the quadratic outlined in the document above.
        const possibleRoots = Utils.solveQuadraticRootsReal(
          this.deltaV.magnitudeSquared,
          relativeDotProduct * 2,
          CollisionLabUtils.clampDown( this.deltaR.magnitudeSquared - sumOfRadiiSquared ) );

        // The minimum root of the quadratic is when the Balls will first collide.
        const root = possibleRoots ? Math.min( ...possibleRoots ) : null;

        // If the quadratic root is finite and the collisionTime is positive, the collision is detected and should be
        // registered.
        const collisionTime = ( Number.isFinite( root ) && root >= 0 && !isEffectivelyParallel ) ? elapsedTime + root * velocityMultiplier : null;

        const collision = Collision.createFromPool( ball1, ball2, collisionTime );

        sceneryLog && sceneryLog.Sim && sceneryLog.Sim( `adding collision ${collision} root:${root} ${this.deltaV.dot( this.deltaR )}` );

        // Register the collision and encapsulate information in a Collision instance.
        this.collisions.push( collision );
      }
    }

    sceneryLog && sceneryLog.Sim && sceneryLog.pop();
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
   * @param {number} dt
   */
  handleBallToBallCollision( ball1, ball2, dt ) {
    assert && assert( ball1 instanceof Ball, `invalid ball1: ${ball1}` );
    assert && assert( ball2 instanceof Ball, `invalid ball1: ${ball1}` );

    sceneryLog && sceneryLog.Sim && sceneryLog.Sim( `CollisionEngine.handleBallToBallCollision #${ball1.index} #${ball2.index}` );
    sceneryLog && sceneryLog.Sim && sceneryLog.push();

    // Convenience references to known ball values.
    const m1 = ball1.massProperty.value;
    const m2 = ball2.massProperty.value;
    let elasticity = this.playArea.getElasticity();

    assert && assert( dt >= 0 || elasticity > 0, 'We cannot step backwards with zero elasticity' );

    if ( dt < 0 ) {
      elasticity = 1 / elasticity;
    }

    sceneryLog && sceneryLog.Sim && sceneryLog.Sim( `ball1 v: ${ball1.velocityProperty.value}` );
    sceneryLog && sceneryLog.Sim && sceneryLog.Sim( `ball2 v: ${ball2.velocityProperty.value}` );

    // Set the Normal and Tangential vector, called the 'line of impact' and 'plane of contact' respectively.
    const normal = ball2.positionProperty.value.minus( ball1.positionProperty.value ).normalize();
    const tangent = new Vector2( -normal.y, normal.x );

    sceneryLog && sceneryLog.Sim && sceneryLog.Sim( `normal ${normal}` );
    sceneryLog && sceneryLog.Sim && sceneryLog.Sim( `tangent ${tangent}` );

    // Reference the 'normal' and 'tangential' components of the Ball velocities. This is a switch in coordinate frames.
    const v1n = ball1.velocityProperty.value.dot( normal );
    const v2n = ball2.velocityProperty.value.dot( normal );
    const v1t = ball1.velocityProperty.value.dot( tangent );
    const v2t = ball2.velocityProperty.value.dot( tangent );

    sceneryLog && sceneryLog.Sim && sceneryLog.Sim( `m1 ${m1}` );
    sceneryLog && sceneryLog.Sim && sceneryLog.Sim( `m2 ${m2}` );
    sceneryLog && sceneryLog.Sim && sceneryLog.Sim( `v1n ${v1n}` );
    sceneryLog && sceneryLog.Sim && sceneryLog.Sim( `v1t ${v1t}` );
    sceneryLog && sceneryLog.Sim && sceneryLog.Sim( `v2n ${v2n}` );
    sceneryLog && sceneryLog.Sim && sceneryLog.Sim( `v2t ${v2t}` );
    sceneryLog && sceneryLog.Sim && sceneryLog.Sim( `elasticity ${elasticity}` );

    // Compute the 'normal' components of velocities after collision (P for prime = after).
    let v1nP = ( ( m1 - m2 * elasticity ) * v1n + m2 * ( 1 + elasticity ) * v2n ) / ( m1 + m2 );
    let v2nP = ( ( m2 - m1 * elasticity ) * v2n + m1 * ( 1 + elasticity ) * v1n ) / ( m1 + m2 );

    // Remove negligible normal velocities to prevent oscillations,
    // see https://github.com/phetsims/collision-lab/issues/171
    if ( Math.abs( v1nP ) < 1e-8 ) { v1nP = 0; }
    if ( Math.abs( v2nP ) < 1e-8 ) { v2nP = 0; }

    sceneryLog && sceneryLog.Sim && sceneryLog.Sim( `v1nP ${v1nP}` );
    sceneryLog && sceneryLog.Sim && sceneryLog.Sim( `v2nP ${v2nP}` );

    // Change coordinate frames back into the standard x-y coordinate frame.
    const v1xP = tangent.dotXY( v1t, v1nP );
    const v2xP = tangent.dotXY( v2t, v2nP );
    const v1yP = normal.dotXY( v1t, v1nP );
    const v2yP = normal.dotXY( v2t, v2nP );
    ball1.velocityProperty.value = normal.setXY( v1xP, v1yP );
    ball2.velocityProperty.value = tangent.setXY( v2xP, v2yP );

    sceneryLog && sceneryLog.Sim && sceneryLog.Sim( `ball1 v: ${ball1.velocityProperty.value}` );
    sceneryLog && sceneryLog.Sim && sceneryLog.Sim( `ball2 v: ${ball2.velocityProperty.value}` );

    // Remove all collisions that involves either of the Balls.
    this.invalidateCollisions( ball1 );
    this.invalidateCollisions( ball2 );

    sceneryLog && sceneryLog.Sim && sceneryLog.pop();
  }

  /*----------------------------------------------------------------------------*
   * Ball To Border Collisions
   *----------------------------------------------------------------------------*/

  /**
   * Detects all ball-to-border collisions of the BallSystem that haven't already occurred. Although tunneling doesn't
   * occur with ball-to-border collisions, collisions are still detected before they occur to mirror the approach for
   * ball-to-ball collisions. For newly detected collisions, information is encapsulated in a Collision instance.
   * NOTE: no-op when the PlayArea's border doesn't reflect.
   * @private
   *
   * @param {number} elapsedTime - elapsedTime, based on where the Balls are positioned when this method is called.
   */
  detectBallToBorderCollisions( elapsedTime ) {
    assert && assert( typeof elapsedTime === 'number' && elapsedTime >= 0, `invalid elapsedTime: ${elapsedTime}` );

    sceneryLog && sceneryLog.Sim && sceneryLog.Sim( 'detectBallToBorderCollisions' );
    sceneryLog && sceneryLog.Sim && sceneryLog.push();

    if ( this.playArea.reflectingBorderProperty.value ) {
      for ( let i = this.ballSystem.balls.length - 1; i >= 0; i-- ) {
        const ball = this.ballSystem.balls[ i ];

        // Only detect new ball-border collisions if it hasn't already been detected.
        if ( !this.hasCollisionBetween( ball, this.playArea ) ) {

          // Calculate when the Ball will collide with the border.
          const collisionTime = this.getBorderCollisionTime( ball.positionProperty.value, ball.velocityProperty.value, ball.radiusProperty.value, elapsedTime );

          const collision = Collision.createFromPool( ball, this.playArea, collisionTime );

          sceneryLog && sceneryLog.Sim && sceneryLog.Sim( `adding collision ${collision}` );

          // Register the collision and encapsulate information in a Collision instance.
          this.collisions.push( collision );
        }
      }
    }

    sceneryLog && sceneryLog.Sim && sceneryLog.pop();
  }

  /**
   * Calculates when some Ball will collide with the PlayArea's border. Instead of passing in a Ball instance, key
   * attributes of the Ball are passed-in. This API is required for sub-classes (see InelasticCollisionEngine).
   * @protected
   *
   * @param {Vector2} position - the position of the Ball.
   * @param {Vector2} velocity - the velocity of the Ball.
   * @param {number} radius - the radius of the Ball.
   * @param {number} elapsedTime - elapsedTime, based on where the Ball is positioned when this method is called.
   */
  getBorderCollisionTime( position, velocity, radius, elapsedTime ) {
    assert && assert( position instanceof Vector2, `invalid position: ${position}` );
    assert && assert( velocity instanceof Vector2, `invalid velocity: ${velocity}` );
    assert && assert( typeof radius === 'number', `invalid radius: ${radius}` );
    assert && assert( typeof elapsedTime === 'number' && elapsedTime >= 0, `invalid elapsedTime: ${elapsedTime}` );

    // Reference the multiplier of the velocity of the Ball. When the sim is being reversed (dt < 0), Balls are
    // essentially moving in the opposite direction of its velocity vector. For calculating if Balls will collide,
    // reverse the velocity of the ball for convenience and reverse the collisionTime back at the end.
    const velocityMultipier = this.timeStepDirectionProperty.value;

    // Reference quantities of the Ball.
    const left = position.x - radius;
    const right = position.x + radius;
    const top = position.y + radius;
    const bottom = position.y - radius;
    const xVelocity = velocity.x * velocityMultipier;
    const yVelocity = velocity.y * velocityMultipier;

    // Calculate the time the Ball would collide with each respective border, ignoring all other walls for now.
    const leftCollisionTime = CollisionLabUtils.clampDown( this.playArea.left - left ) / xVelocity;
    const rightCollisionTime = CollisionLabUtils.clampDown( this.playArea.right - right ) / xVelocity;
    const bottomCollisionTime = CollisionLabUtils.clampDown( this.playArea.bottom - bottom ) / yVelocity;
    const topCollisionTime = CollisionLabUtils.clampDown( this.playArea.top - top ) / yVelocity;

    // Calculate the time the Ball would collide with a horizontal/vertical border.
    const horizontalCollisionTime = Math.max( leftCollisionTime, rightCollisionTime );
    const verticalCollisionTime = Math.max( bottomCollisionTime, topCollisionTime );
    const possibleCollisionTimes = [ horizontalCollisionTime, verticalCollisionTime ].filter( Number.isFinite );

    // Solve for the timeUntilCollision, which is the first border (minimum in time) the Ball would collide with.
    const timeUntilCollision = Math.min( ...possibleCollisionTimes ) * velocityMultipier;

    return possibleCollisionTimes.length ? elapsedTime + timeUntilCollision : null;
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
   * @param {number} dt
   */
  handleBallToBorderCollision( ball, dt ) {
    assert && assert( ball instanceof Ball, `invalid ball: ${ball}` );

    sceneryLog && sceneryLog.Sim && sceneryLog.Sim( `CollisionEngine.handleBallToBorderCollision #${ball.index}` );
    sceneryLog && sceneryLog.Sim && sceneryLog.push();

    // Reference the multiplier of the velocity of the Ball. When the sim is being reversed (dt < 0), Balls are
    // essentially moving in the opposite direction of its velocity vector. This is used to determine the direction
    // that the Ball is moving towards; even if a Ball is touching a side(s) of the border, it's velocity doesn't change
    // unless it is moving towards that respective side.
    const velocityMultiplier = this.timeStepDirectionProperty.value;

    let elasticity = this.playArea.getElasticity();

    assert && assert( dt >= 0 || elasticity > 0, 'We cannot step backwards with zero elasticity' );

    if ( dt < 0 ) {
      elasticity = 1 / elasticity;
    }

    // Update the velocity after the collision.
    if ( ( this.playArea.isBallTouchingLeft( ball ) && ball.velocityProperty.value.x * velocityMultiplier < 0 ) ||
         ( this.playArea.isBallTouchingRight( ball ) && ball.velocityProperty.value.x * velocityMultiplier > 0 ) ) {

      sceneryLog && sceneryLog.Sim && sceneryLog.Sim( `#${ball.index} border X bounce` );

      // Left and Right ball-to-border collisions incur a flip in horizontal velocity, scaled by the elasticity.
      ball.setXVelocity( -ball.velocityProperty.value.x * elasticity );
    }
    if ( ( this.playArea.isBallTouchingBottom( ball ) && ball.velocityProperty.value.y * velocityMultiplier < 0 ) ||
         ( this.playArea.isBallTouchingTop( ball ) && ball.velocityProperty.value.y * velocityMultiplier > 0 ) ) {

      sceneryLog && sceneryLog.Sim && sceneryLog.Sim( `#${ball.index} border Y bounce` );

      // Top and Bottom ball-to-border collisions incur a flip in vertical velocity, scaled by the elasticity.
      ball.setYVelocity( -ball.velocityProperty.value.y * elasticity );
    }

    // Remove all collisions that involves the involved Ball.
    this.invalidateCollisions( ball );

    sceneryLog && sceneryLog.Sim && sceneryLog.pop();
  }
}

collisionLab.register( 'CollisionEngine', CollisionEngine );
export default CollisionEngine;
