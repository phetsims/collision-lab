// Copyright 2019-2020, University of Colorado Boulder

/**
 * InelasticRotationEngine handles all continual ball-to-ball collision responses for perfectly inelastic collisions
 * that 'stick'. Perfectly inelastic collisions that 'stick' are a new feature of the HTML5 version of the simulation,
 * where Balls completely stick together and rotate around the center of mass of the cluster of Balls, if and only if
 * the collision is not head-on.
 *
 * Currently, InelasticRotationEngine only supports rotations of 2 Balls. If the elasticity is set to perfectly
 * inelastic collision that is sticky, there must only be 2 Balls in the BallSystem. See
 * https://github.com/phetsims/collision-lab/issues/87.
 *
 * ## Collision Response
 *
 *  - When a collision between the 2 Balls is detected (by CollisionEngine), and the collision is a perfectly inelastic
 *    collisions that 'sticks', the first calculation that InelasticRotationEngine computes is the velocity of the
 *    center of mass of 2 balls. We use the equation described in
 *    https://en.wikipedia.org/wiki/Inelastic_collision#Perfectly_inelastic_collision.
 *
 *  - Using the conservation of Angular Momentum (L), the InelasticRotationEngine derives the angular velocity (omega)
 *    of the rotation of the balls (relative to the center of mass). See the following for some general background:
 *      + https://en.wikipedia.org/wiki/Angular_momentum#Discussion
 *      + https://en.wikipedia.org/wiki/Angular_momentum#Collection_of_particles
 *      + https://en.wikipedia.org/wiki/Angular_velocity
 *
 *  - Then, on each step of the simulation, the Balls are rotated around the center of mass. The InelasticRotationEngine
 *    changes reference frames to the center of mass of the 2 Balls. From there, standard uniform circular motion
 *    equations are used to compute the new velocity and position of each Ball. See:
 *      + https://en.wikipedia.org/wiki/Frame_of_reference
 *      + https://en.wikipedia.org/wiki/Circular_motion#Uniform_circular_motion
 *
 * @author Brandon Li
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import collisionLab from '../../collisionLab.js';
import Ball from './Ball.js';
import CenterOfMass from './CenterOfMass.js';

class InelasticRotationEngine {

  constructor() {

    // @private {Ball|null} - the Balls that are involved in the rotation. These Balls should not be handled by
    //                        CollisionEngine. Currently, InelasticRotationEngine only supports handling 2 Balls.
    //                        In the future, this may be changed to an array to consider more Balls in the rotation.
    this.ball1;
    this.ball2;

    // @private {Vector2} - the position/velocity of the center of mass of the two balls involved in the collision.
    //                      These vectors are convenience references for computations in step(). The velocity is mutated
    //                      on each handleStickyCollision() call, and the position is mutated on each step() call.
    this.centerOfMassPosition = Vector2.ZERO.copy(); // in meters.
    this.centerOfMassVelocity = Vector2.ZERO.copy(); // in meters per second.

    // @private {number|null} - the angular velocity of the rotation of the two Balls, if they exist, around the center
    //                          of mass, in radians per second. This value is set on each handleStickyCollision() call.
    this.angularVelocity;

    //----------------------------------------------------------------------------------------

    // @private {number|null} - the magnitude of the total angular momentum of the two Balls **relative to the center of
    //                          mass**. This is used for assertions to ensure that angular momentum is conserved.
    this.totalAngularMomentum; // in kg*(m^2/s).

    // @private {Vector2} - the total linear momentum of the two Balls. This is used internally for assertions to ensure
    //                      that linear momentum is conserved.
    this.totalLinearMomentum = Vector2.ZERO.copy(); // in kg*(m/s).
  }

  //----------------------------------------------------------------------------------------

  /**
   * Returns a boolean that indicates if the InelasticRotationEngine is handling and responding to a Ball. Balls
   * that are handled by InelasticRotationEngine should not be handled by CollisionEngine.
   * @public
   *
   * @param {Ball} ball
   * @returns {boolean}
   */
  isHandling( ball ) {
    assert && assert( ball instanceof Ball, `invalid ball: ${ball}` );
    return this.ball1 === ball || this.ball2 === ball;
  }

  /**
   * Computes the angular momentum of a Ball relative to the center-of-mass of the 2 Balls that are being rotated,
   * using the L = r x p formula described in https://en.wikipedia.org/wiki/Angular_momentum#Discussion.
   * The Ball must be one of the two Balls that the InelasticRotationEngine is handling.
   * @private
   *
   * @param {Ball} ball
   * @returns {number} - in kg*(m^2/s).
   */
  computeAngularMomentum( ball ) {
    assert && assert( ball instanceof Ball, `invalid ball: ${ball}` );
    assert && assert( this.isHandling( ball ) );

    // Get the position vector (r) and momentum (p) relative to the center-of-mass
    const r = ball.position.minus( this.centerOfMassPosition );
    const p = ball.velocity.minus( this.centerOfMassVelocity ).multiplyScalar( ball.mass );

    // L = r x p (relative to the center-of-mass)
    return r.crossScalar( p );
  }

  //----------------------------------------------------------------------------------------

  /**
   * Processes and responds to perfectly inelastic 'stick' collision between two Balls. In terms of the collision
   * response described at the top of this file, this method is responsible for computing the velocity of the
   * center of mass of the two balls, the total angular momentum, and the angular velocity.
   * @public
   *
   * @param {Ball} ball1 - the first Ball involved in the collision.
   * @param {Ball} ball2 - the second Ball involved in the collision.
   * @param {Vector2} collisionPosition1 - the exact position of where the first Ball collided with the second Ball.
   * @param {Vector2} collisionPosition2 - the exact position of where the second Ball collided with the first Ball.
   * @param {number} overlappedTime - the time the two Balls have been overlapping each other.
   */
  handleStickyCollision( ball1, ball2, collisionPosition1, collisionPosition2, overlappedTime ) {
    assert && assert( ball1 instanceof Ball, `invalid ball1: ${ball1}` );
    assert && assert( ball2 instanceof Ball, `invalid ball2: ${ball2}` );
    assert && assert( collisionPosition1 instanceof Vector2, `invalid collisionPosition1: ${collisionPosition1}` );
    assert && assert( collisionPosition2 instanceof Vector2, `invalid collisionPosition2: ${collisionPosition2}` );
    assert && assert( typeof overlappedTime === 'number', `invalid overlappedTime: ${overlappedTime}` );

    // Update the internal ball references for the next step calls.
    this.ball1 = ball1;
    this.ball2 = ball2;

    // Set the position of the Balls to the collision positions.
    ball1.position = collisionPosition1;
    ball2.position = collisionPosition2;

    //----------------------------------------------------------------------------------------

    // Compute the velocity of the center of mass of the 2 Balls. The calculation is an vector extension of the formula
    // described in https://en.wikipedia.org/wiki/Inelastic_collision#Perfectly_inelastic_collision..
    this.centerOfMassVelocity.set( ball1.momentum ).add( ball2.momentum ).divideScalar( ball1.mass + ball2.mass );

    // Update the position of the center of mass of the 2 Balls. This is used as a convenience vector for computations
    // in the step() method.
    this.centerOfMassPosition.set( CenterOfMass.computePosition( [ ball1, ball2 ] ) );

    //----------------------------------------------------------------------------------------

    // Update the angular momentum reference.
    this.totalAngularMomentum = this.computeAngularMomentum( ball1 ) + this.computeAngularMomentum( ball2 );

    // Get the moment of inertia of both Balls, treated as point masses rotating around the center of mass. The reason
    // why we treat the Balls as point masses is because of the formula L = r^2 * m * omega, where r^2 * m is the moment
    // of inertia of a point-mass. See in https://en.wikipedia.org/wiki/Angular_momentum#Discussion.
    const I1 = ball1.position.minus( this.centerOfMassPosition ).magnitudeSquared * ball1.mass;
    const I2 = ball2.position.minus( this.centerOfMassPosition ).magnitudeSquared * ball2.mass;

    // Update the angular velocity reference. Formula comes from
    // https://en.wikipedia.org/wiki/Angular_momentum#Collection_of_particles.
    this.angularVelocity = this.totalAngularMomentum / ( I1 + I2 );
  }





  step( dt ) {

    // All in center-of-mass reference frame.
    const r1 = this.ball1.position.minus( this.centerOfMassPosition );
    const r2 = this.ball2.position.minus( this.centerOfMassPosition );
    this.centerOfMassPosition.add( this.centerOfMassVelocity.times( dt ) );
    const r1p = r1.rotate( this.omega.magnitude * dt );
    const r2p = r2.rotate( this.omega.magnitude * dt );
    const v1p = this.omega.cross( r1p.toVector3() ).toVector2();
    const v2p = this.omega.cross( r2p.toVector3() ).toVector2();

    // Back in absolute reference frame.
    this.ball1.position = this.centerOfMassPosition.plus( r1p );
    this.ball2.position = this.centerOfMassPosition.plus( r2p );
    this.ball1.velocity = this.centerOfMassVelocity.plus( v1p );
    this.ball2.velocity = this.centerOfMassVelocity.plus( v2p );

    const momentOfI1 = 1 / 2 * this.ball1.mass * ( this.ball1.radius * this.ball1.radius ) + this.ball1.mass * this.ball1.position.minus( this.centerOfMassPosition ).magnitudeSquared;
    const momentOfI2 = 1 / 2 * this.ball2.mass * ( this.ball2.radius * this.ball2.radius ) + this.ball2.mass * this.ball2.position.minus( this.centerOfMassPosition ).magnitudeSquared;


    // const a = this.ball1.position.minus( this.centerOfMassPosition ).toVector3().cross( this.ball1.velocity.minus( this.centerOfMassVelocity ).timesScalar( this.ball1.mass ).toVector3() );
    // const b = this.ball2.position.minus( this.centerOfMassPosition ).toVector3().cross( this.ball2.velocity.minus( this.centerOfMassVelocity ).timesScalar( this.ball2.mass ).toVector3() );
    const a = this.omega.times( momentOfI1 );
    const b = this.omega.times( momentOfI2 );

    console.log( this.totalAngularMomentum.magnitude, this.totalAngularMomentum.minus( a.plus( b ) ).magnitude );
  }

  freeze() {
    this.ball1.velocity = Vector2.ZERO;
    this.ball2.velocity = Vector2.ZERO;
    this.centerOfMassVelocity.set( Vector2.ZERO );
    this.omega.set( Vector3.ZERO );
  }
  step() {

  }

  reset() {

  }

  isHandling() {
    return false;
  }

  handleClusterToBorderCollisions() {

  }

  handleClusterToClusterCollisions() {
    assert( false )
  }
}

collisionLab.register( 'InelasticRotationEngine', InelasticRotationEngine );
export default InelasticRotationEngine;