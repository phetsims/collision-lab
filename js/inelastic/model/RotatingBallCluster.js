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

import Vector2 from '../../../../dot/js/Vector2.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import collisionLab from '../../collisionLab.js';
import Ball from '../../common/model/Ball.js';
import BallState from '../../common/model/BallState.js';
import CenterOfMass from '../../common/model/CenterOfMass.js';

class RotatingBallCluster {

  /**
   * @param {Ball[]} balls - an array of the Balls within the rotating ball cluster.
   * @param {number} angularVelocity - the angular velocity of the rotation, in radians per second.
   * @param {CenterOfMass} centerOfMass - the center of mass of the cluster of balls.
   */
  constructor( balls, angularVelocity, centerOfMass ) {
    assert && AssertUtils.assertArrayOf( balls, Ball );
    assert && assert( typeof angularVelocity === 'number', `invalid angularVelocity: ${angularVelocity}` );
    assert && assert( centerOfMass instanceof CenterOfMass, `invalid centerOfMass: ${centerOfMass}` );

    // @private {Ball[]} - reference to the passed-in balls.
    this.balls = balls;

    // @private {number} - reference to the passed-in angularVelocity.
    this.angularVelocity = angularVelocity;

    // @private {CenterOfMass} - reference to the passed-in centerOfMass.
    this.centerOfMass = centerOfMass;
  }

  /**
   * Gets the radius of the bounding circle of the entire RotatingBallCluster, in meters.
   * @public
   *
   * @returns {number}
   */
  getBoundingCircleRadius() {
    return Math.max( ...this.balls.map( ball => ball.positionProperty.value.distance( this.centerOfMass.positionProperty.value ) + ball.radiusProperty.value ) );
  }

  /**
   * Moves every Ball in the cluster by one time-step, 'rotating' each ball around the center-of-mass of the cluster.
   * @public
   *
   * @param {number} dt - time-delta in seconds.
   */
  step( dt ) {
    assert && assert( typeof dt === 'number', `invalid dt: ${dt}` );

    // The angular displacement of each Ball relative to the center of mass.
    const changeInAngle = this.angularVelocity * dt;

    // Get the states of the Balls after the rotation occurs.
    const rotationStates = this.getSteppedRotationStates( dt );

    this.balls.forEach( ball => {

      // Set the state of each Ball.
      ball.setState( rotationStates.get( ball ) );

      // Rotate the balls around their centers to provide a more realistic rotation experience. See
      // https://github.com/phetsims/collision-lab/issues/87
      ball.rotationProperty.value += changeInAngle;
    } );
  }

  /**
   * Creates BallStates that describe the state of each Ball after being 'rotated' for dt seconds. The position and
   * velocity of each Ball generally changes, but the mass does not. The position/velocity of each ball is calculated by
   * changing reference frames to the centerOfMass and applying standard uniform circular motion equations.
   * @public
   *
   * @param {number} dt - time-delta, in seconds.
   * @returns {Map.<Ball, BallState>} - maps Ball to a BallState instance.
   */
  getSteppedRotationStates( dt ) {
    assert && assert( typeof dt === 'number', `invalid dt: ${dt}` );

    // The resulting Map that maps each Ball to a BallState instance.
    const ballToRotationStates = new Map();

    // The angular displacement of each Ball relative to the center of mass.
    const changeInAngle = this.angularVelocity * dt;

    // Compute the position/velocity of the center-of-mass **after** the rotation.
    const centerOfMassPosition = this.centerOfMass.velocityProperty.value.times( dt ).add( this.centerOfMass.positionProperty.value );
    const centerOfMassVelocity = this.centerOfMass.velocityProperty.value;

    this.balls.forEach( ball => {

      // Get the position vector of the Ball, relative to the center of mass. This is a change in reference frames.
      const position = ball.positionProperty.value.minus( this.centerOfMass.positionProperty.value );

      // Rotate the position vector to apply uniform circular motion about the center of mass.
      position.rotate( changeInAngle );

      // Compute the velocity of Both balls after this step, relative to the center of mass. The velocity is the
      // cross product of the angular velocity (vector) and the position vector after the rotation. See
      // https://en.wikipedia.org/wiki/Circular_motion#Velocity.
      const velocity = new Vector2( -this.angularVelocity * position.y, this.angularVelocity * position.x );

      // Compute the position and velocity of the Balls back in the absolute reference frame, creating a BallState
      // instance to hold onto the vectors.
      const ballState = new BallState(
        position.add( centerOfMassPosition ),
        velocity.add( centerOfMassVelocity ),
        ball.massProperty.value
      );

      // Map each Ball to the BallState instance.
      ballToRotationStates.set( ball, ballState );
    } );

    return ballToRotationStates;
  }
}

collisionLab.register( 'RotatingBallCluster', RotatingBallCluster );
export default RotatingBallCluster;