// Copyright 2020, University of Colorado Boulder

/**
 * InelasticCollisionEngine is a CollisionEngine sub-type for the 'Inelastic' screen, which handles all continual
 * ball-to-ball collision responses for perfectly inelastic collisions that 'stick'.
 *
 * Perfectly inelastic collisions that 'stick' are a new feature of the HTML5 version of the simulation, where Balls
 * completely stick together and rotate around the center of mass of the Balls. When a 'sticky' collision between balls
 * occurs, InelasticCollisionEngine will dynamically create a RotatingBallCluster instance. This means that there is a
 * third type of collision that InelasticCollisionEngine deals with - cluster-to-border collisions.
 *
 * ## Rotation-Collision Response
 *
 *  - When a collision between 2 Balls is detected by CollisionEngine, and the collision is a perfectly inelastic
 *    collisions that 'sticks', the collision response is overridden. The velocity of the center-of-mass of the 2
 *    Balls is the same before and after the collision, so there is no need to compute the center-of-mass velocity.
 *    A RotatingBallCluster instance will be created. Currently, the 'Inelastic' screen only has 2 Balls, so the
 *    RotatingBallCluster represents the entire BallSystem.
 *
 *  - Using the conservation of Angular Momentum (L), the InelasticCollisionEngine derives the angular velocity (omega)
 *    of the rotation of the balls relative to the center of mass. See the following for some general background:
 *      + https://en.wikipedia.org/wiki/Angular_momentum#Discussion
 *      + https://en.wikipedia.org/wiki/Angular_momentum#Collection_of_particles
 *      + https://en.wikipedia.org/wiki/Angular_velocity
 *
 * ### Cluster-to-border Collision Detection:
 *
 *  - On the first time-step after a RotatingBallCluster instance has been created, InelasticCollisionEngine must detect
 *    when it will collide with the border (if 'Reflecting Border' is on). There is no closed-form solution to finding
 *    when the cluster will collide.
 *
 *  - The lower-bound of when the cluster will collide with the border is when the bounding circle of the cluster
 *    collides with the border. The upper-bound is when the center-of-mass collides with the border.
 *    InelasticCollisionEngine uses the bisection method to approximate when the cluster exactly collides with the
 *    border. See https://en.wikipedia.org/wiki/Bisection_method.
 *
 * @author Brandon Li
 */

import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabConstants from '../../common/CollisionLabConstants.js';
import CollisionLabUtils from '../../common/CollisionLabUtils.js';
import Ball from '../../common/model/Ball.js';
import Collision from '../../common/model/Collision.js';
import CollisionEngine from '../../common/model/CollisionEngine.js';
import InelasticBallSystem from './InelasticBallSystem.js';
import InelasticCollisionType from './InelasticCollisionType.js';
import InelasticPlayArea from './InelasticPlayArea.js';
import RotatingBallCluster from './RotatingBallCluster.js';

// constants
const TOLERANCE = CollisionLabConstants.ZERO_THRESHOLD;

class InelasticCollisionEngine extends CollisionEngine {

  /**
   * @param {InelasticPlayArea} playArea
   * @param {InelasticBallSystem} ballSystem
   */
  constructor( playArea, ballSystem ) {
    assert && assert( playArea instanceof InelasticPlayArea, `invalid playArea: ${playArea}` );
    assert && assert( ballSystem instanceof InelasticBallSystem, `invalid ballSystem: ${ballSystem}` );

    super( playArea, ballSystem );

    // @private {RotatingBallCluster|null} - the RotatingBallCluster instance if the Balls in the system are being
    //                                       rotated. Since there are only 2 Balls in the 'Inelastic' screen, there can
    //                                       only be 1 RotatingBallCluster instance.
    this.rotatingBallCluster = null;

    // Observe when the InelasticPreset is changed and reset the InelasticCollisionEngine. When the InelasticPreset is
    // changed, Balls are set to different states, meaning existing Collisions may be incorrect and collisions should be
    // re-detected. Link persists for the lifetime of the simulation.
    ballSystem.inelasticPresetProperty.lazyLink( this.reset.bind( this ) );
  }

  /**
   * Resets the InelasticCollisionEngine.
   * @override
   * @public
   *
   * Called when the reset/restart button is pressed or when some 'state' of the simulation changes.
   */
  reset() {
    this.rotatingBallCluster = null;
    super.reset();
  }

  /**
   * Progresses the Balls forwards by the given time-delta, assuming there are no collisions.
   * @protected
   * @override
   *
   * @param {number} dt - time-delta, in seconds.
   * @param {number} elapsedTime - elapsedTime, based on where the Balls are positioned when this method is called.
   */
  progressBalls( dt, elapsedTime ) {
    assert && assert( typeof dt === 'number', `invalid dt: ${dt}` );
    assert && assert( typeof elapsedTime === 'number' && elapsedTime >= 0, `invalid elapsedTime: ${elapsedTime}` );

    // Step the RotatingBallCluster if it exists and update the trailing 'Paths' behind the Balls.
    if ( this.rotatingBallCluster ) {
      this.rotatingBallCluster.step( dt );
      this.ballSystem.updatePaths( elapsedTime + dt );
    }
    else {
      super.progressBalls( dt, elapsedTime );
    }
  }

  /**
   * Detects all ball-ball, ball-border, and cluster-border collisions that have not already been detected.
   * @protected
   * @override
   *
   * @param {number} elapsedTime - elapsedTime, based on where the Balls are positioned when this method is called.
   */
  detectAllCollisions( elapsedTime ) {
    assert && assert( typeof elapsedTime === 'number' && elapsedTime >= 0, `invalid elapsedTime: ${elapsedTime}` );

    // Detect cluster-border collisions if the RotatingBallCluster exists.
    if ( this.rotatingBallCluster ) {
      this.detectBallClusterToBorderCollision( elapsedTime );
    }
    else {
      super.detectAllCollisions( elapsedTime );
    }
  }

  /**
   * Handles all Collisions by calling a response algorithm, dispatched by the type of bodies involved in the Collision.
   * @protected
   * @override
   *
   * @param {Collision} collision - the Collision instance.
   */
  handleCollision( collision ) {
    assert && assert( collision instanceof Collision, `invalid collision: ${collision}` );

    // Handle cluster-border collisions if the collision involves the rotatingBallCluster.
    if ( this.rotatingBallCluster && collision.includes( this.rotatingBallCluster ) ) {
      this.handleBallClusterToBorderCollision( collision );
    }
    else {
      super.handleCollision( collision );
    }
  }

  //----------------------------------------------------------------------------------------

  /**
   * Processes and responds to a collision between two balls. Overridden to respond to perfectly inelastic 'stick'
   * collisions between two Balls, in which this method will create and reference a RotatingBallCluster instance.
   * @override
   * @protected
   *
   * @param {Ball} ball1 - the first Ball involved in the collision.
   * @param {Ball} ball2 - the second Ball involved in the collision.
   */
  handleBallToBallCollision( ball1, ball2 ) {
    assert && assert( ball1 instanceof Ball, `invalid ball1: ${ball1}` );
    assert && assert( ball2 instanceof Ball, `invalid ball2: ${ball2}` );
    assert && assert( this.playArea.elasticity === 0, 'must be perfectly inelastic for Inelastic screen' );
    assert && assert( this.ballSystem.balls.length === 2, 'InelasticCollisionEngine only supports collisions of 2 Balls' );

    super.handleBallToBallCollision( ball1, ball2 );

    // Handle collisions that 'stick'.
    if ( this.playArea.inelasticCollisionType === InelasticCollisionType.STICK ) {

      // Get the moment of inertia of both Balls, treated as point masses rotating around their center of mass. The
      // reason why we treat the Balls as point masses is because of the formula L = r^2 * m * omega, where r^2 * m is
      // the moment of inertia of a point-mass. See https://en.wikipedia.org/wiki/Angular_momentum#Discussion.
      const I1 = ball1.position.minus( this.ballSystem.centerOfMass.position ).magnitudeSquared * ball1.mass;
      const I2 = ball2.position.minus( this.ballSystem.centerOfMass.position ).magnitudeSquared * ball2.mass;

      // Update the angular velocity reference. Formula comes from
      // https://en.wikipedia.org/wiki/Angular_momentum#Collection_of_particles.
      const angularVelocity = this.ballSystem.getTotalAngularMomentum() / ( I1 + I2 );

      // Create and reference a RotatingBallCluster instance. Since there are only 2 Balls in the 'Inelastic' screen,
      // the RotatingBallCluster represents the entire BallSystem.
      this.rotatingBallCluster = new RotatingBallCluster(
        this.ballSystem.balls,
        angularVelocity,
        this.ballSystem.centerOfMass
      );
    }
  }

  /**
   * Processes a ball-to-border collision and updates the velocity and the position of the Ball. Overridden to respond
   * to perfectly inelastic 'stick' collisions, in which the Ball's velocity is set to 0.
   * @override
   * @protected
   *
   * @param {Ball} ball - the Ball involved in the collision.
   * @param {number} dt - time-delta in seconds
   */
  handleBallToBorderCollision( ball ) {
    assert && assert( ball instanceof Ball, `invalid ball: ${ball}` );
    super.handleBallToBorderCollision( ball );

    // Handle collisions that 'stick'.
    if ( this.playArea.inelasticCollisionType === InelasticCollisionType.STICK ) {

      // Set the velocity of the Ball to 0.
      ball.velocity = Vector2.ZERO;
    }
  }

  /*----------------------------------------------------------------------------*
   * Rotating Ball Cluster to Border Collisions
   *----------------------------------------------------------------------------*/

  /**
   * Detects the cluster-to-border collision of the rotatingBallCluster if it hasn't already been detected. Although
   * tunneling doesn't occur with cluster-to-border collisions, collisions are still detected before they occur to
   * mirror the approach in the super-class. For newly detected collisions, information is encapsulated in a Collision
   * instance. NOTE: no-op when the PlayArea's border doesn't reflect.
   * @private
   *
   * @param {number} elapsedTime - elapsedTime, based on where the Balls are positioned when this method is called.
   */
  detectBallClusterToBorderCollision( elapsedTime ) {
    assert && assert( typeof elapsedTime === 'number' && elapsedTime >= 0, `invalid elapsedTime: ${elapsedTime}` );
    assert && assert( this.rotatingBallCluster, 'cannot call willClusterCollideWithBorderAt' );

    // No-op if the PlayArea's border doesn't reflect or the cluster-to-border collision has already been detected or
    // if any of the Balls are outside of the PlayArea.
    if ( !this.playArea.reflectsBorder ||
         CollisionLabUtils.any( this.collisions, collision => collision.includes( this.rotatingBallCluster ) ) ||
         this.rotatingBallCluster.balls.some( ball => !this.playArea.fullyContainsBall( ball ) ) ) {
      return; /** do nothing **/
    }

    // Handle degenerate case where the cluster is already colliding with the border.
    if ( this.willClusterCollideWithBorderAt( 0 ) === 0 ) {
      return this.collisions.add( new Collision( this.rotatingBallCluster, this.playArea, elapsedTime ) );
    }

    // Get the lower-bound of when the cluster will collide with the border, which is when bounding circle of the
    // cluster collides with the border.
    const minCollisionTime = this.getBorderCollisionTime( this.ballSystem.centerOfMass.position,
                                                          this.ballSystem.centerOfMass.velocity,
                                                          this.rotatingBallCluster.boundingCircleRadius,
                                                          elapsedTime );

    // Get the upper-bound of when the cluster will collide with the border, which is when the center-of-mass collides
    // with the border.
    const maxCollisionTime = this.getBorderCollisionTime( this.ballSystem.centerOfMass.position,
                                                          this.ballSystem.centerOfMass.velocity,
                                                          0,
                                                          elapsedTime );

    // Use the bisection method to approximate when the cluster exactly collides with the border.
    const collisionTime = CollisionLabUtils.bisection( time => this.willClusterCollideWithBorderAt( time - elapsedTime ), minCollisionTime, maxCollisionTime );

    // Register the collision and encapsulate information in a Collision instance.
    this.collisions.add( new Collision( this.rotatingBallCluster, this.playArea, collisionTime ) );
  }

  /**
   * Indicates if the rotatingBallCluster will approximately collide with the border at some passed-in time-delta OR if
   * it is an over/under estimate. If any of the Balls in cluster are overlapping (more than some threshold), then the
   * dt is considered an overestimate. Likewise, if none of the balls are overlapping, the dt is an underestimate. If
   * any of the Balls are tangentially touching the side of the PlayArea, it is considered to be 'close enough'.
   * @private
   *
   * @param {number} dt
   * @returns {number} - Returns -1 if the passed-in time is an underestimate,
   *                              0 if the passed-in time is considered 'close enough'
   *                              1 if the passed-in time is an overestimate.
   */
  willClusterCollideWithBorderAt( dt ) {
    assert && assert( typeof dt === 'number' && dt >= 0, `invalid dt: ${dt}` );
    assert && assert( this.rotatingBallCluster, 'cannot call willClusterCollideWithBorderAt' );
    assert && assert( this.playArea.reflectsBorder, 'cannot call willClusterCollideWithBorderAt' );

    // Get the states of the Balls after the time-delta.
    const rotationStates = this.rotatingBallCluster.getSteppedRotationStates( dt );

    // Flags that track the number of Balls in the cluster that are overlapping and tangentially touching the border.
    let overlapping = 0;
    let touching = 0;

    this.rotatingBallCluster.balls.forEach( ball => {

      // Position of the Ball after the time-delta.
      const position = rotationStates.get( ball ).position;
      const left = position.x - ball.radius;
      const right = position.x + ball.radius;
      const top = position.y + ball.radius;
      const bottom = position.y - ball.radius;

      if ( Utils.equalsEpsilon( left, this.playArea.left, TOLERANCE ) ||
           Utils.equalsEpsilon( right, this.playArea.right, TOLERANCE ) ||
           Utils.equalsEpsilon( top, this.playArea.top, TOLERANCE ) ||
           Utils.equalsEpsilon( bottom, this.playArea.bottom, TOLERANCE ) ) {
        touching += 1;
      }
      else if ( left < this.playArea.left ||
                right > this.playArea.right ||
                bottom < this.playArea.bottom ||
                top > this.playArea.top ) {
        overlapping += 1;
      }
    } );

    return overlapping ? 1 : ( touching ? 0 : -1 );
  }

  // @private
  handleBallClusterToBorderCollision() {
    this.ballSystem.balls.forEach( ball => {
      ball.velocity = Vector2.ZERO;
    } );

    this.invalidateCollisions( this.rotatingBallCluster );
    this.rotatingBallCluster = null;
  }
}

collisionLab.register( 'InelasticCollisionEngine', InelasticCollisionEngine );
export default InelasticCollisionEngine;