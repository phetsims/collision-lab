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
 *  - Using the conservation of Angular Momentum, the InelasticRotationEngine derives the angular velocity (omega) of
 *    the rotation of the balls (relative to the center of mass). See the following links for some general background:
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

class InelasticRotationEngine {

  constructor() {

    // @private {Ball|null} - the Balls that are involved in the rotation. These Balls should not be handled by
    //                        CollisionEngine. Currently, InelasticRotationEngine only supports handling 2 Balls.
    //                        In the future, this may be changed to an array to consider more Balls in the rotation.
    this.ball1;
    this.ball2;

    // @private {Vector2} - the position/velocity of the center of mass of the two balls involved in the collision.
    //                      These vectors are convenience references for computations in step(). The velocity is mutated
    //                      on each registerStickyCollision() call, and the position is mutated on each step() call.
    this.centerOfMassPosition = Vector2.ZERO.copy(); // in meters.
    this.centerOfMassVelocity = Vector2.ZERO.copy(); // in meters per second.

    // @private {number} - the angular velocity of the rotation of the two Balls, if they exist, around the center of
    //                     mass, in radians per second. This value is set on each registerStickyCollision() call.
    this.angularVelocity = 0;

    // @private {number} - the magnitude of the total angular momentum of the two Balls **relative to the center of
    //                     mass**. This is used internally for assertions to ensure that angular momentum is conserved.
    this.totalAngularMomentum = 0;
  }


  registerStickyCollision( ball1, ball2 ) {

    // Convenience references to the other known Ball values.
    const m1 = ball1.mass;
    const m2 = ball2.mass;
    const v1t = ball1.velocity.dot( tangent );
    const v2t = ball2.velocity.dot( tangent );
    const centerOFMassVel = ( m1 * v1t + m2 * v2t ) / ( m1 + m2 );

    ball1.position = r1;
    ball2.position = r2;

    this.compositeStuckBall = new CompositeStuckBalls( ball1, ball2, new Vector2( v1xP, v1yP ) );
      this.compositeStuckBall.step( overlappedTime );





    const a = ball1.position.minus( this.centerOfMassPosition ).toVector3().cross( ball1.velocity.minus( centerOfMassVelocity ).timesScalar( ball1.mass ).toVector3() );
    const b = ball2.position.minus( this.centerOfMassPosition ).toVector3().cross( ball2.velocity.minus( centerOfMassVelocity ).timesScalar( ball2.mass ).toVector3() );



    // const v1

    // parallel axis theorem ?
    const momentOfI1 = 2 / 5 * ball1.mass * ( ball1.radius * ball1.radius ) + ball1.mass * ball1.position.minus( this.centerOfMassPosition ).magnitudeSquared;
    const momentOfI2 = 2 / 5 * ball2.mass * ( ball2.radius * ball2.radius ) + ball2.mass * ball2.position.minus( this.centerOfMassPosition ).magnitudeSquared;

    // @private - about center of mass - one system, same axis, add moments.
    this.omega = this.totalAngularMomentum.dividedScalar( momentOfI1 + momentOfI2 );

    this.ball1 = ball1;
    this.ball2 = ball2;
    this.centerOfMassVelocity = centerOfMassVelocity;
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