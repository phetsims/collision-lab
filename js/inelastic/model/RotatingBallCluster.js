// Copyright 2020, University of Colorado Boulder

/**
 * RotatingBallCluster is a data structure that represents a 'stuck' cluster of Balls, where each ball is rotating
 * around the center-of-mass of the cluster of Balls. As of now, there are no ball-to-cluster collisions, meaning
 * RotatingBallClusters are immutable (balls can't be added).
 *
 * Perfectly inelastic collisions that 'stick' are a new feature of the HTML5 version of the simulation. They happen
 * only for the 'Inelastic' screen. When a 'sticky' collision between balls occurs, InelasticCollisionEngine will
 * dynamically create a RotatingBallCluster instance, holding onto the balls involved in the rotation, the angular
 * velocity of the rotation, and the center of mass of the cluster.
 *
 * RotatingBallCluster is also responsible for 'stepping' (rotating) the position/velocity of the Balls on each
 * time-step. It is implemented by changing reference frames to the center of mass and applying the standard
 * uniform circular motion equations to compute the new velocity and position of each Ball. See:
 *   + https://en.wikipedia.org/wiki/Frame_of_reference
 *   + https://en.wikipedia.org/wiki/Circular_motion#Uniform_circular_motion
 *
 * @author Brandon Li
 */

import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabConstants from '../../common/CollisionLabConstants.js';
import Ball from '../../common/model/Ball.js';

// constants
const EPSILON = CollisionLabConstants.ZERO_THRESHOLD;

class RotatingBallCluster {

  constructor( balls, angularVelocity, centerOfMass ) {

    // @private
    this.balls = balls;
    this.angularVelocity = angularVelocity;
    this.centerOfMass = centerOfMass;

    // // @private {Vector2} - the position of the center of mass of the two balls involved in the collision. This vectors
    // //                      is a convenience reference for computations in step(). Mutated on each step() call.
    // this.centerOfMass.position = Vector2.ZERO.copy(); // in meters.
      // this.centerOfMass.position.set( this.centerOfMass.position );

      // // Update the angular and linear momentum reference. Values are the same before and after the collision.
      // this.totalAngularMomentum = this.computeAngularMomentum( ball1 ) + this.computeAngularMomentum( ball2 );
      // this.totalLinearMomentum.set( ball1.momentum ).add( ball2.momentum );

  }

  // @public
  computeOrientations( dt ) {

    const result = new Map();
    this.balls.forEach( ball => {
      const r = ball.position.minus( this.centerOfMass.position );
      const changeInAngle = this.angularVelocity * dt;
      r.rotate( changeInAngle );

      const v = new Vector2( -this.angularVelocity * r.y, this.angularVelocity * r.x );

      // Move the center of mass to where it would be in this current frame.
      const centerOfMassPositionP = this.centerOfMass.position.plus( this.centerOfMass.velocity.times( dt ) );

      result.set( ball, {
        position: r.add( centerOfMassPositionP ),
        velocity: v.add( this.centerOfMass.velocity )
      } );

    } );
    return result;
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
  step( dt ) {
    assert && assert( typeof dt === 'number', `invalid dt: ${dt}` );
    // assert && assert( this.ballSystem.balls.length === 2, 'InelasticCollisionEngine only supports collisions of 2 Balls' );

    const orientations = this.computeOrientations( dt );
    orientations.forEach( ( value, key ) => {
      key.position = value.position;
      key.velocity = value.velocity;
      key.rotationProperty.value += this.angularVelocity * dt;
    } );

    // // Convenience reference to the 2 Balls involved in the rotation.
    // const ball1 = this.balls[ 0 ];
    // const ball2 = this.balls[ 1 ];

    // // Get the position vectors of Both balls, relative to the center of mass. This is a change in reference frames.
    // const r1 = ball1.position.minus( this.centerOfMass.position );
    // const r2 = ball2.position.minus( this.centerOfMass.position );
    // const changeInAngle = this.angularVelocity * dt;

    // // Rotate the position vectors to apply uniform circular motion about the center of mass.
    // r1.rotate( changeInAngle );
    // r2.rotate( changeInAngle );

    // // Rotate the balls around their centers to provide a more realistic rotation experience. See
    // // https://github.com/phetsims/collision-lab/issues/87
    // ball1.rotationProperty.value += changeInAngle;
    // ball2.rotationProperty.value += changeInAngle;

    // // Compute the velocity of Both balls after this step, relative to the center of mass.
    // const v1 = new Vector2( -this.angularVelocity * r1.y, this.angularVelocity * r1.x );
    // const v2 = new Vector2( -this.angularVelocity * r2.y, this.angularVelocity * r2.x );

    // //----------------------------------------------------------------------------------------

    // // Move the center of mass to where it would be in this current frame.
    // const centerOfMassPosition = this.centerOfMass.position.plus( this.centerOfMass.velocity.times( dt ) );
    // const centerOfMassVelocity = this.centerOfMass.velocity;

    // // Set the position and velocity of the Balls back in the absolute reference frame.
    // ball1.position = r1.add( centerOfMassPosition );
    // ball2.position = r2.add( centerOfMassPosition );
    // ball1.velocity = v1.add( centerOfMassVelocity );
    // ball2.velocity = v2.add( centerOfMassVelocity );

    // // If assertions are enabled, then verify that both linear and angular momentum were conserved in this step.
    // if ( assert ) {

    //   const totalLinearMomentum = ball1.momentum.plus( ball2.momentum );
    //   const totalAngularMomentum = this.computeAngularMomentum( ball1 ) + this.computeAngularMomentum( ball2 );

    //   assert( Utils.equalsEpsilon( totalAngularMomentum, this.totalAngularMomentum, EPSILON ), 'angular momentum not conserved' );
    //   assert( totalLinearMomentum.equalsEpsilon( this.totalLinearMomentum, EPSILON ), 'linear momentum not conserved' );
    // }
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
    // assert && assert( ball instanceof Ball, `invalid ball: ${ball}` );
    // assert && assert( this.isRotatingBalls );

    // // Get the position vector (r) and momentum (p) relative to the center-of-mass
    // const r = ball.position.minus( this.centerOfMass.position );
    // const p = ball.velocity.minus( this.centerOfMass.velocity ).multiplyScalar( ball.mass );

    // // L = r x p (relative to the center-of-mass)
    // return r.crossScalar( p );
  }
}

collisionLab.register( 'RotatingBallCluster', RotatingBallCluster );
export default RotatingBallCluster;