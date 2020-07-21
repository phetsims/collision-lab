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
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabConstants from '../../common/CollisionLabConstants.js';
import Ball from '../../common/model/Ball.js';
import CollisionEngine from '../../common/model/CollisionEngine.js';
import InelasticBallSystem from './InelasticBallSystem.js';
import InelasticCollisionType from './InelasticCollisionType.js';
import InelasticPlayArea from './InelasticPlayArea.js';

// constants
const EPSILON = CollisionLabConstants.ZERO_THRESHOLD;

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

    // @private {boolean} - indicates if the 2 Balls in the system are currently being rotated (handled) by this class.
    //                      If this is false, the collision response is forwarded to the super-class.
    this.isRotatingBalls = false;

    // @private {Vector2} - the position of the center of mass of the two balls involved in the collision. This vectors
    //                      is a convenience reference for computations in step(). Mutated on each step() call.
    this.centerOfMassPosition = Vector2.ZERO.copy(); // in meters.

    // @private {number|null} - the angular velocity of the rotation of the two Balls (if they are being rotated) around
    //                          the center of mass, in radians per second. This value is set on each handleBallToBallCollision() call.
    this.angularVelocity;

    // @private {number|null} - the magnitude of the total angular momentum of the two Balls **relative to the center of
    //                          mass**. This is used for assertions to verify that angular momentum is conserved.
    this.totalAngularMomentum; // in kg*(m^2/s).

    // @private {Vector2} - the total linear momentum of the two Balls. This is used internally for assertions to verify
    //                      that linear momentum is conserved at all points in the rotation.
    this.totalLinearMomentum = Vector2.ZERO.copy(); // in kg*(m/s).

    //----------------------------------------------------------------------------------------

    // Observe when any of the Balls in the system are being user-controlled or when the InelasticPreset is changed and
    // reset the InelasticCollisionEngine. Multilink persists for the lifetime of the sim since
    // InelasticCollisionEngines are never disposed.
    Property.multilink( [ ballSystem.ballSystemUserControlledProperty, ballSystem.inelasticPresetProperty ], () => {
      this.reset();
    } );
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
    this.isRotatingBalls = false;
    this.angularVelocity = null;
    this.totalAngularMomentum = null;
    this.centerOfMassPosition.set( Vector2.ZERO );
    this.totalLinearMomentum.set( Vector2.ZERO );
  }

  /**
   * Steps the InelasticCollisionEngine.
   * @public
   *
   * @param {number} dt - time in seconds
   */
  step( dt ) {

    // If we are currently handling the 2 Balls in the system, rotate the Balls around the center of mass. This
    // overrides the collision response of the super-class.
    if ( this.isRotatingBalls ) {
      this.rotateBalls( dt );

      // Handle scenario where Balls are rotated into the border.
      this.playArea.reflectsBorder && this.handleBallToBorderCollisions( dt < 0 );
    }
    else {

      // Forward the collision-response to the super-class.
      super.step( dt );
    }
  }

  //----------------------------------------------------------------------------------------

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
   * @param {Vector2} collisionPosition1 - the center-position of the first Ball when it exactly collided with ball2.
   * @param {Vector2} collisionPosition1 - the center-position of the second Ball when it exactly collided with ball1.
   * @param {number} overlappedTime - the time the two Balls have been overlapping each other.
   */
  handleBallToBallCollision( ball1, ball2, collisionPosition1, collisionPosition2, overlappedTime ) {
    assert && assert( ball1 instanceof Ball, `invalid ball1: ${ball1}` );
    assert && assert( ball2 instanceof Ball, `invalid ball2: ${ball2}` );
    assert && assert( collisionPosition1 instanceof Vector2, `invalid collisionPosition1: ${collisionPosition1}` );
    assert && assert( collisionPosition2 instanceof Vector2, `invalid collisionPosition2: ${collisionPosition2}` );
    assert && assert( typeof overlappedTime === 'number', `invalid overlappedTime: ${overlappedTime}` );
    assert && assert( this.playArea.elasticity === 0, 'must be perfectly inelastic for Inelastic screen' );
    assert && assert( this.ballSystem.balls.length === 2, 'InelasticCollisionEngine only supports collisions of 2 Balls' );

    // Handle collisions that 'stick'.
    if ( this.playArea.inelasticCollisionType === InelasticCollisionType.STICK ) {

      // Set the isRotatingBalls flag to true.
      this.isRotatingBalls = true;

      // Set the position of the Balls to the collision positions.
      ball1.position = collisionPosition1;
      ball2.position = collisionPosition2;

      // Update the position of the center of mass of the 2 Balls. This is used as a convenience vector for computations
      // in the step() method.
      this.centerOfMassPosition.set( this.ballSystem.centerOfMass.position );

      // Update the angular and linear momentum reference. Values are the same before and after the collision.
      this.totalAngularMomentum = this.computeAngularMomentum( ball1 ) + this.computeAngularMomentum( ball2 );
      this.totalLinearMomentum.set( ball1.momentum ).add( ball2.momentum );

      // Get the moment of inertia of both Balls, treated as point masses rotating around their center of mass. The
      // reason why we treat the Balls as point masses is because of the formula L = r^2 * m * omega, where r^2 * m is
      // the moment of inertia of a point-mass. See https://en.wikipedia.org/wiki/Angular_momentum#Discussion.
      const I1 = ball1.position.minus( this.centerOfMassPosition ).magnitudeSquared * ball1.mass;
      const I2 = ball2.position.minus( this.centerOfMassPosition ).magnitudeSquared * ball2.mass;

      // Update the angular velocity reference. Formula comes from
      // https://en.wikipedia.org/wiki/Angular_momentum#Collection_of_particles.
      this.angularVelocity = this.totalAngularMomentum / ( I1 + I2 );

      // Consider the time the Balls have been overlapping and start the rotation.
      this.rotateBalls( overlappedTime );
    }
    else {

      // Forward the collision-response to the super-class.
      super.handleBallToBallCollision( ball1, ball2, collisionPosition1, collisionPosition2, overlappedTime );
    }
  }

  /**
   * A time-discretization approach to rotating a Ball cluster that is stuck together because of a perfectly inelastic
   * collisions that 'sticks'. This is called on each step of the simulation, where the Balls are rotated around the
   * center of mass. The InelasticCollisionEngine changes reference frames to the center of mass of the 2 Balls. From
   * there, standard uniform circular motion equations are used to compute the new velocity and position of each Ball.
   *
   * NOTE: this method assumes that the InelasticCollisionEngine is rotating the balls of the system. Don't call this
   *       method if it isn't.
   *
   * @private
   * @param {number} dt - time in seconds
   */
  rotateBalls( dt ) {
    assert && assert( typeof dt === 'number', `invalid dt: ${dt}` );
    assert && assert( this.isRotatingBalls );
    assert && assert( this.ballSystem.balls.length === 2, 'InelasticCollisionEngine only supports collisions of 2 Balls' );

    // Convenience reference to the 2 Balls involved in the rotation.
    const ball1 = this.ballSystem.balls.get( 0 );
    const ball2 = this.ballSystem.balls.get( 1 );

    // Get the position vectors of Both balls, relative to the center of mass. This is a change in reference frames.
    const r1 = ball1.position.minus( this.centerOfMassPosition );
    const r2 = ball2.position.minus( this.centerOfMassPosition );
    const changeInAngle = this.angularVelocity * dt;

    // Rotate the position vectors to apply uniform circular motion about the center of mass.
    r1.rotate( changeInAngle );
    r2.rotate( changeInAngle );

    // Rotate the balls around their centers to provide a more realistic rotation experience. See
    // https://github.com/phetsims/collision-lab/issues/87
    ball1.rotationProperty.value += changeInAngle;
    ball2.rotationProperty.value += changeInAngle;

    // Compute the velocity of Both balls after this step, relative to the center of mass.
    const v1 = new Vector2( -this.angularVelocity * r1.y, this.angularVelocity * r1.x );
    const v2 = new Vector2( -this.angularVelocity * r2.y, this.angularVelocity * r2.x );

    //----------------------------------------------------------------------------------------

    // Move the center of mass to where it would be in this current frame.
    this.centerOfMassPosition.add( this.ballSystem.centerOfMass.velocity.times( dt ) );
    const centerOfMassVelocity = this.ballSystem.centerOfMass.velocity;

    // Set the position and velocity of the Balls back in the absolute reference frame.
    ball1.position = r1.add( this.centerOfMassPosition );
    ball2.position = r2.add( this.centerOfMassPosition );
    ball1.velocity = v1.add( centerOfMassVelocity );
    ball2.velocity = v2.add( centerOfMassVelocity );

    // If assertions are enabled, then verify that both linear and angular momentum were conserved in this step.
    if ( assert ) {

      const totalLinearMomentum = ball1.momentum.plus( ball2.momentum );
      const totalAngularMomentum = this.computeAngularMomentum( ball1 ) + this.computeAngularMomentum( ball2 );

      assert( Utils.equalsEpsilon( totalAngularMomentum, this.totalAngularMomentum, EPSILON ), 'angular momentum not conserved' );
      assert( totalLinearMomentum.equalsEpsilon( this.totalLinearMomentum, EPSILON ), 'linear momentum not conserved' );
    }
  }

  /**
   * Processes ball-to-border collisions. Overridden to respond to ball-border collisions that 'stick'. If a Ball that
   * is rotating hits the border, then all Balls in the cluster have 0 velocity. When a Ball that is not rotating that
   * hits the border, and the collision is 'sticky', then the Ball has 0 velocity. Otherwise, the collision response is
   * forwarded to the super-class.
   *
   * @override
   * @protected
   *
   * @param {Ball} ball - the Ball involved in the collision.
   * @param {Vector2} collisionPosition - the center-position of the Ball when it exactly collided with the border.
   * @param {number} overlappedTime - the time the Balls has been overlapping each the border.
   */
  collideBallWithBorder( ball, collisionPosition, overlappedTime ) {
    assert && assert( ball instanceof Ball, `invalid ball: ${ball}` );
    assert && assert( collisionPosition instanceof Vector2, `invalid collisionPosition: ${collisionPosition}` );
    assert && assert( typeof overlappedTime === 'number', `invalid overlappedTime: ${overlappedTime}` );
    assert && assert( this.playArea.elasticity === 0, 'must be perfectly inelastic for Inelastic screen' );
    assert && assert( this.ballSystem.balls.length === 2, 'InelasticCollisionEngine only supports collisions of 2 Balls' );

    // Handle collisions that 'stick'.
    if ( this.playArea.inelasticCollisionType === InelasticCollisionType.STICK ) {

      // Get the balls that are colliding with the border.
      const collidingBalls = this.ballSystem.balls.filter( ball => !this.playArea.fullyContainsBall( ball ) );

      // If a Ball that is rotating hits the border, then all Balls in the cluster have 0 velocity.
      if ( this.isRotatingBalls && collidingBalls.length ) {

        // When a collision is detected, the Ball has already overlapped, so the current position isn't the exact
        // position when the ball first collided. However, the overlappedTime passed-in is NOT correct for balls that
        // are rotating, since it assumes that Balls are undergoing uniform-motion.
        //
        // We discussed overriding the getBallToBorderCollisionOverlapTime for this class and computing a new overlapped
        // time for rotating Balls. However, we could formulate a solution, and decided to translate the Ball cluster
        // inwards as an approximation. See https://github.com/phetsims/collision-lab/issues/117.
        //
        // To translate the Balls inwards, we use the same visuals described for finding the overlapping time between
        // the Ball and the border. See
        // https://github.com/phetsims/collision-lab/blob/master/doc/images/ball-to-border-time-of-impact-derivation.pdf
        const closestPoint = this.playArea.bounds.eroded( ball.radius ).closestPointTo( ball.position );
        const deltaS = this.mutableVectors.deltaS.set( ball.position ).subtract( closestPoint );

        this.ballSystem.balls.forEach( ball => {

          // Translate the Ball inwards so that the cluster is inside the PlayArea.
          ball.position = ball.position.minus( deltaS );

          // Set the velocity of the Balls to 0.
          ball.velocity = Vector2.ZERO;
        } );
        this.reset();
      }
      else {

        // Otherwise, if a Ball that is not rotating that hits the border, and the collision is 'sticky', then the Ball
        // has 0 velocity
        collidingBalls.forEach( ball => { ball.velocity = Vector2.ZERO; } );

        // Adjust the position of the Ball to take into account its overlapping time.
        ball.position = collisionPosition;
      }
    }
    else {

      // Forward the collision-response to the super-class.
      super.collideBallWithBorder( ball, collisionPosition, overlappedTime );
    }
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
}

collisionLab.register( 'InelasticCollisionEngine', InelasticCollisionEngine );
export default InelasticCollisionEngine;