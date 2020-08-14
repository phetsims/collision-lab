// Copyright 2020, University of Colorado Boulder

/**
 * InelasticCollisionEngine is a CollisionEngine sub-type for the 'Inelastic' screen, which handles all continual
 * ball-to-ball collision responses for perfectly inelastic collisions that 'stick'.
 *
 * Perfectly inelastic collisions that 'stick' are a new feature of the HTML5 version of the simulation, where Balls
 * completely stick together and rotate around the center of mass of the Balls, if the collision isn't head-on.
 * Perfectly inelastic collisions that 'slip' behaves like the standard rigid-body collision model of CollisionEngine,
 * the super-type. This, InelasticCollisionEngine will forward all 'slipping' collisions to the super-class and will
 * only handle responses to 'sticking' collisions.
 *
 * Currently, InelasticCollisionEngine only supports rotations of 2 Balls. For the 'Inelastic' screen, the elasticity is
 * always perfectly inelastic and there are only 2 Balls. See https://github.com/phetsims/collision-lab/issues/87.
 *
 * ## Rotation-Collision Response
 *
 *  - When a collision between the 2 Balls is detected by CollisionEngine, and the collision is a perfectly inelastic
 *    collisions that 'sticks', the collision response is overridden. The velocity of the center-of-mass of the 2
 *    Balls is the same before and after the collision, so there is no need to compute the center-of-mass velocity.
 *
 *  - Using the conservation of Angular Momentum (L), the InelasticCollisionEngine derives the angular velocity (omega)
 *    of the rotation of the balls relative to the center of mass. See the following for some general background:
 *      + https://en.wikipedia.org/wiki/Angular_momentum#Discussion
 *      + https://en.wikipedia.org/wiki/Angular_momentum#Collection_of_particles
 *      + https://en.wikipedia.org/wiki/Angular_velocity
 *
 *  - Then, on each step of the simulation, the Balls are rotated around the center of mass. The
 *    InelasticCollisionEngine changes reference frames to the center of mass of the 2 Balls. From there, standard
 *    uniform circular motion equations are used to compute the new velocity and position of each Ball. See:
 *      + https://en.wikipedia.org/wiki/Frame_of_reference
 *      + https://en.wikipedia.org/wiki/Circular_motion#Uniform_circular_motion
 *
 * @author Brandon Li
 */

import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import collisionLab from '../../collisionLab.js';
import Ball from '../../common/model/Ball.js';
import CollisionEngine from '../../common/model/CollisionEngine.js';
import InelasticBallSystem from './InelasticBallSystem.js';
import InelasticCollisionType from './InelasticCollisionType.js';
import InelasticPlayArea from './InelasticPlayArea.js';
import RotatingBallCluster from './RotatingBallCluster.js';
import Collision from '../../common/model/Collision.js';

class InelasticCollisionEngine extends CollisionEngine {

  /**
   * @param {InelasticPlayArea} playArea
   * @param {InelasticBallSystem} ballSystem
   */
  constructor( playArea, ballSystem ) {
    assert && assert( playArea instanceof InelasticPlayArea, `invalid playArea: ${playArea}` );
    assert && assert( ballSystem instanceof InelasticBallSystem, `invalid ballSystem: ${ballSystem}` );

    super( playArea, ballSystem );

    //----------------------------------------------------------------------------------------

    // @private {RotatingBallCluster} - indicates if the 2 Balls in the system are currently being rotated (handled) by this class.
    //                      If this is false, the collision response is forwarded to the super-class.
    this.rotatingBallCluster = null;

    // Observe when any of the Balls in the system are being user-controlled or when the InelasticPreset is changed and
    // reset the InelasticCollisionEngine. Multilink persists for the lifetime of the sim since
    // InelasticCollisionEngines are never disposed.
    Property.multilink( [
      ballSystem.inelasticPresetProperty,
      playArea.inelasticCollisionTypeProperty
    ], this.reset.bind( this ) );
  }

  /**
   * Resets the InelasticCollisionEngine to its factory state.
   * @public
   *
   * This is invoked in the following scenarios:
   *   - the reset all button is pressed.
   *   - the restart button is pressed.
   *   - when any of the Balls involved in the rotation is user controlled, either by dragging or from the Keypad.
   *   - when any of the Balls involved in the rotation collides with the border of the PlayArea.
   *   - when the elasticity changes.
   * See https://github.com/phetsims/collision-lab/issues/87.
   */
  reset() {
    this.rotatingBallCluster = null;
    super.reset();
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

    // CollisionEngine only deals with uniformly moving Balls, but sub-types might not (for the 'Inelastic' screen).
    if ( this.rotatingBallCluster ) {
      this.rotatingBallCluster.step( dt );
      this.ballSystem.updatePaths( elapsedTime + dt );
    }
    else {
      this.ballSystem.stepUniformMotion( dt, elapsedTime + dt );
    }
  }

  /**
   * Detects all ball-ball and ball-border collisions that have not already been detected.
   * @protected - can be overridden in subclasses.
   *
   * @param {number} elapsedTime - elapsedTime, based on where the Balls are positioned when this method is called.
   */
  detectAllCollisions( elapsedTime ) {
    assert && assert( typeof elapsedTime === 'number' && elapsedTime >= 0, `invalid elapsedTime: ${elapsedTime}` );

    if ( !this.rotatingBallCluster ) {
      // CollisionEngine only deals with detecting 2 types of collisions, but sub-types might not ('Inelastic' screen).
      this.detectBallToBallCollisions( elapsedTime );
      this.detectBallToBorderCollisions( elapsedTime );
    }
    else {
      this.detectBallClusterToBorderCollision( elapsedTime );
    }
  }

  /**
   * Handles all Collision by calling a response algorithm, dispatched by the type of bodies involved in the Collision.
   * @protected - can be overridden in subclasses.
   *
   * @param {Collision} collision - the Collision instance.
   */
  handleCollision( collision ) {
    assert && assert( collision instanceof Collision, `invalid collision: ${collision}` );

    if ( this.rotatingBallCluster ) {
      // CollisionEngine only deals with detecting 2 types of collisions, but sub-types might not ('Inelastic' screen).
      this.handleBallClusterToBorderCollision( collision.time );
      return;
    }

    // CollisionEngine only deals with detecting 2 types of collisions, but sub-types might not ('Inelastic' screen).
    collision.includes( this.playArea ) ?
          this.handleBallToBorderCollision( collision.body2 === this.playArea ? collision.body1 : collision.body2 ) :
          this.handleBallToBallCollision( collision.body1, collision.body2, collision.time );
  }

  //----------------------------------------------------------------------------------------

  /**
   * Detects all ball-to-ball collisions of the BallSystem that occur within the passed-in time-step. Overridden to do
   * nothing if the Balls in the 'Inelastic' screen are currently being rotated. Otherwise, the collision-detection
   * algorithms are forwarded to the super-type.
   *
   * @override
   * @protected
   *
   * @param {number} dt - time-delta in seconds
   */
  detectBallToBallCollisions( dt ) {
    assert && assert( typeof dt === 'number', `invalid dt: ${dt}` );

    !this.rotatingBallCluster && super.detectBallToBallCollisions( dt );
  }

  /**
   * Computes the angular momentum of a Ball relative to the center-of-mass of the 2 Balls that are being rotated,
   * using the L = r x p formula described in https://en.wikipedia.org/wiki/Angular_momentum#Discussion.
   * The Ball must be one of the two Balls that the InelasticCollisionEngine is handling.
   * @private
   *
   * @param {Ball} ball
   * @returns {number} - in kg*(m^2/s).
   */
  computeAngularMomentum( ball ) {
    assert && assert( ball instanceof Ball, `invalid ball: ${ball}` );
    assert && assert( this.isRotatingBalls );

    // Get the position vector (r) and momentum (p) relative to the center-of-mass
    const r = ball.position.minus( this.centerOfMassPosition );
    const p = ball.velocity.minus( this.ballSystem.centerOfMass.velocity ).multiplyScalar( ball.mass );

    // L = r x p (relative to the center-of-mass)
    return r.crossScalar( p );
  }

  /**
   * Processes and responds to a collision between two balls. Overridden to respond to perfectly inelastic 'stick'
   * collisions between two Balls. If the collision isn't a 'sticking' collision, the response is forwarded to the
   * super-class. Otherwise, this method is responsible for computing the total momentum and the angular velocity.
   *
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

    // Handle collisions that 'stick'.
    if ( this.playArea.inelasticCollisionType === InelasticCollisionType.STICK ) {

      // Get the moment of inertia of both Balls, treated as point masses rotating around their center of mass. The
      // reason why we treat the Balls as point masses is because of the formula L = r^2 * m * omega, where r^2 * m is
      // the moment of inertia of a point-mass. See https://en.wikipedia.org/wiki/Angular_momentum#Discussion.
      const I1 = ball1.position.minus( this.centerOfMassPosition ).magnitudeSquared * ball1.mass;
      const I2 = ball2.position.minus( this.centerOfMassPosition ).magnitudeSquared * ball2.mass;

      const totalAngularMomentum = this.computeAngularMomentum( ball1 ) + this.computeAngularMomentum( ball2 );

      // Update the angular velocity reference. Formula comes from
      // https://en.wikipedia.org/wiki/Angular_momentum#Collection_of_particles.
      const angularVelocity = totalAngularMomentum / ( I1 + I2 );

      // Set the isRotatingBalls flag to true.
      this.rotatingBallCluster = new RotatingBallCluster( [ ball1, ball2 ], angularVelocity, this.ballSystem.centerOfMass );

      // Remove all collisions that involves either of the Balls.
      this.collisions.forEach( collision => collision.includesEither( ball1, ball2 ) &&
                                            this.collisions.delete( collision ) );
      // // Update the position of the center of mass of the 2 Balls. This is used as a convenience vector for computations
      // // in the step() method.
      // this.centerOfMassPosition.set( this.ballSystem.centerOfMass.position );

      // // Update the angular and linear momentum reference. Values are the same before and after the collision.
      // this.totalLinearMomentum.set( ball1.momentum ).add( ball2.momentum );

    }
    else {

      // Forward the collision-response to the super-class.
      super.handleBallToBallCollision( ball1, ball2 );
    }
  }

  /**
   * Processes a ball-to-border collision and updates the velocity and the position of the Ball. Overridden to respond
   * to perfectly inelastic 'stick' collisions. If the collision isn't a 'sticking' collision, the response is forwarded
   * to the super-class.
   *
   * @override
   * @protected
   *
   * @param {Ball} ball - the Ball involved in the collision.
   * @param {number} dt - time-delta in seconds
   */
  handleBallToBorderCollision( ball, dt ) {
    assert && assert( ball instanceof Ball, `invalid ball: ${ball}` );
    assert && assert( typeof dt === 'number', `invalid dt: ${dt}` );

    if ( this.playArea.inelasticCollisionType === InelasticCollisionType.STICK ) {

      // Set the velocity of the Ball to 0.
      ball.velocity = Vector2.ZERO;

      this.collisions.forEach( collision => collision.includes( ball ) && this.collisions.delete( collision ) );
    }
    else {
      super.handleBallToBorderCollision( ball, dt );
    }
  }
}

collisionLab.register( 'InelasticCollisionEngine', InelasticCollisionEngine );
export default InelasticCollisionEngine;