// Copyright 2020, University of Colorado Boulder

/**
 * IntroCollisionEngine is a CollisionEngine sub-type for the 'Inelastic' screen, which handles all continual
 * ball-to-ball collision responses for perfectly inelastic collisions that 'stick'. Perfectly inelastic collisions
 * that 'stick' are a new feature of the HTML5 version of the simulation, where Balls completely stick together and
 * rotate around the center of mass of the Balls, if and only if the collision isn't head-on.
 *
 * Currently, InelasticCollisionEngine only supports rotations of 2 Balls. The elasticity is always perfectly inelastic
 * for the 'Inelastic' screen, which only has 2 Balls. See https://github.com/phetsims/collision-lab/issues/87.
 *
 * ## Collision Response
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

import Vector2 from '../../../../dot/js/Vector2.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabConstants from '../../common/CollisionLabConstants.js';
import Ball from '../../common/model/Ball.js';
import CollisionEngine from '../../common/model/CollisionEngine.js';
import InelasticBallSystem from './InelasticBallSystem.js';
import InelasticCollisionTypes from './InelasticCollisionTypes.js';
import InelasticPlayArea from './InelasticPlayArea.js';

// constants
const EPSILON = CollisionLabConstants.ZERO_THRESHOLD;

class InelasticCollisionEngine extends CollisionEngine {

  /**
   * @param {InelasticPlayArea} playArea
   * @param {InelasticBallSystem} ballSystem
   * @param {Property.<number>} elapsedTimeProperty
   */
  constructor( playArea, ballSystem, elapsedTimeProperty ) {
    assert && assert( playArea instanceof InelasticPlayArea, `invalid playArea: ${playArea}` );
    assert && assert( ballSystem instanceof InelasticBallSystem, `invalid ballSystem: ${ballSystem}` );
    assert && AssertUtils.assertPropertyOf( elapsedTimeProperty, 'number' );

    super( playArea, ballSystem, elapsedTimeProperty );

    //----------------------------------------------------------------------------------------

    // @private {Ball|null} - the Balls that are involved in the rotation. These Balls should not be handled by
    //                        CollisionEngine. Currently, InelasticCollisionEngine only supports handling 2 Balls.
    //                        In the future, this may be changed to an array to consider more Balls in the rotation.
    this.ball1;
    this.ball2;

    // @private {Vector2} - the position of the center of mass of the two balls involved in the collision. This vectors
    //                      is a convenience reference for computations in step(). Mutated on each step() call.
    this.centerOfMassPosition = Vector2.ZERO.copy(); // in meters.

    // @private {number|null} - the angular velocity of the rotation of the two Balls (if they exist) around the center
    //                          of mass, in radians per second. This value is set on each collideBalls() call.
    this.angularVelocity;

    // @private {number|null} - the magnitude of the total angular momentum of the two Balls **relative to the center of
    //                          mass**. This is used for assertions to ensure that angular momentum is conserved.
    this.totalAngularMomentum; // in kg*(m^2/s).

    // @private {Vector2} - the total linear momentum of the two Balls. This is used internally for assertions to ensure
    //                      that linear momentum is conserved.
    this.totalLinearMomentum = Vector2.ZERO.copy(); // in kg*(m/s).

    //----------------------------------------------------------------------------------------

    // Observe when any of the Balls in the system are being user-controlled and reset the InelasticCollisionEngine.
    // Link persists for the lifetime of the sim since InelasticCollisionEngines are never disposed.
    ballSystem.ballSystemUserControlledProperty.link( ballSystemUserControlled => { this.reset(); } );
  }

  //----------------------------------------------------------------------------------------

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
    this.ball1 = null;
    this.ball2 = null;
    this.angularVelocity = null;
    this.totalAngularMomentum = null;
    this.centerOfMassPosition.set( Vector2.ZERO );
    this.totalLinearMomentum.set( Vector2.ZERO );
  }

  /**
   * Returns a boolean that indicates if the InelasticCollisionEngine is handling and responding to a Ball. Balls
   * that are handled by InelasticCollisionEngine should not be handled by CollisionEngine.
   * @public
   *
   * @param {Ball} ball
   * @returns {boolean}
   */
  isRotating( ball ) {
    assert && assert( ball instanceof Ball, `invalid ball: ${ball}` );
    return this.ball1 === ball || this.ball2 === ball;
  }

  /**
   * Called when any of the Balls of the rotation collides with the border of the PlayArea. In this scenario, **both**
   * balls have 0 velocity. See https://github.com/phetsims/collision-lab/issues/87.
   * @public
   */
  collideStickyBallsClusterWithBorder() {
    this.ball1.velocity = Vector2.ZERO;
    this.ball2.velocity = Vector2.ZERO;
    this.reset();
  }

  //----------------------------------------------------------------------------------------

  /**
   * Processes and responds to perfectly inelastic 'stick' collisions between two Balls. In terms of the collision
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
  collideBalls( ball1, ball2, collisionPosition1, collisionPosition2, overlappedTime ) {
    assert && assert( ball1 instanceof Ball, `invalid ball1: ${ball1}` );
    assert && assert( ball2 instanceof Ball, `invalid ball2: ${ball2}` );
    assert && assert( collisionPosition1 instanceof Vector2, `invalid collisionPosition1: ${collisionPosition1}` );
    assert && assert( collisionPosition2 instanceof Vector2, `invalid collisionPosition2: ${collisionPosition2}` );
    assert && assert( typeof overlappedTime === 'number', `invalid overlappedTime: ${overlappedTime}` );
    assert && assert( this.playArea.elasticity === 0 );


    if ( this.playArea.inelasticCollisionType === InelasticCollisionTypes.SLIP ) {

      // Exit
      return super.collideBalls( ball1, ball2, collisionPosition1, collisionPosition2, overlappedTime );
    }


    // Update the internal ball references for the next step calls.
    this.ball1 = ball1;
    this.ball2 = ball2;

    // Set the position of the Balls to the collision positions.
    ball1.position = collisionPosition1;
    ball2.position = collisionPosition2;

    //----------------------------------------------------------------------------------------

    // Update the position of the center of mass of the 2 Balls. This is used as a convenience vector for computations
    // in the step() method.
    this.centerOfMassPosition.set( this.ballSystem.centerOfMass.position );

    //----------------------------------------------------------------------------------------

    // Update the angular and linear momentum reference. Values are the same before and after the collision.
    this.totalAngularMomentum = this.computeAngularMomentum( ball1 ) + this.computeAngularMomentum( ball2 );
    this.totalLinearMomentum.set( ball1.momentum ).add( ball2.momentum );

    // Get the moment of inertia of both Balls, treated as point masses rotating around their center of mass. The reason
    // why we treat the Balls as point masses is because of the formula L = r^2 * m * omega, where r^2 * m is the moment
    // of inertia of a point-mass. See https://en.wikipedia.org/wiki/Angular_momentum#Discussion.
    const I1 = ball1.position.minus( this.centerOfMassPosition ).magnitudeSquared * ball1.mass;
    const I2 = ball2.position.minus( this.centerOfMassPosition ).magnitudeSquared * ball2.mass;

    // Update the angular velocity reference. Formula comes from
    // https://en.wikipedia.org/wiki/Angular_momentum#Collection_of_particles.
    this.angularVelocity = this.totalAngularMomentum / ( I1 + I2 );

    // Consider the time the Balls have been overlapping and start the rotation.
    this.step( overlappedTime );
  }

  /**
   * Steps the InelasticCollisionEngine, which will handle all continual ball-to-ball rotation responses for perfectly
   * inelastic collisions that 'stick'.
   * @public
   *
   * @param {number} dt - time in seconds
   */
  step( dt ) {
    assert && assert( typeof dt === 'number', `invalid dt: ${dt}` );

    // Only handle responses for the Balls that InelasticCollisionEngine is handling.
    if ( this.ball1 && this.ball2 ) {

      // Get the position vectors of Both balls, relative to the center of mass. This is a change in reference frames.
      const r1 = this.ball1.position.minus( this.centerOfMassPosition );
      const r2 = this.ball2.position.minus( this.centerOfMassPosition );

      // Rotate the position vectors to apply uniform circular motion about the center of mass.
      r1.rotate( this.angularVelocity * dt );
      r2.rotate( this.angularVelocity * dt );

      // Compute the velocity of Both balls after this step, relative to the center of mass.
      const v1 = new Vector2( -this.angularVelocity * r1.y, this.angularVelocity * r1.x );
      const v2 = new Vector2( -this.angularVelocity * r2.y, this.angularVelocity * r2.x );

      //----------------------------------------------------------------------------------------

      // Move the center of mass to where it would be in this current frame.
      this.centerOfMassPosition.add( this.ballSystem.centerOfMass.velocity.times( dt ) );

      // Set the position and velocity of the Balls back in the absolute reference frame.
      this.ball1.position = r1.add( this.centerOfMassPosition );
      this.ball2.position = r2.add( this.centerOfMassPosition );
      this.ball1.velocity = v1.add( this.ballSystem.centerOfMass.velocity );
      this.ball2.velocity = v2.add( this.ballSystem.centerOfMass.velocity );

      // If assertions are enabled, then ensure that both linear and angular momentum were conserved in this step.
      if ( assert ) {
        assert( this.ballSystem.centerOfMass.position.equalsEpsilon( this.centerOfMassPosition, EPSILON ) );

        // const totalLinearMomentum = this.ball1.momentum.plus( this.ball2.momentum );
        // const totalAngularMomentum = this.computeAngularMomentum( this.ball1 ) + this.computeAngularMomentum( this.ball2 );
        // assert( Utils.equalsEpsilon( totalAngularMomentum, this.totalAngularMomentum, EPSILON ), 'angular momentum not conserved' );
        // assert( totalLinearMomentum.equalsEpsilon( this.totalLinearMomentum, EPSILON ), 'linear momentum not conserved' );
      }

      // If any of the Balls is now overlapping with the Border and the PlayArea's border reflects, one of the Balls
      // is now colliding with the border.
      if ( this.playArea.reflectsBorder &&
          ( !this.playArea.fullyContainsBall( this.ball1 ) || !this.playArea.fullyContainsBall( this.ball2 ) ) ) {
        this.collideStickyBallsClusterWithBorder();
      }
    }
    else {
      super.step( dt );
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
    assert && assert( this.isRotating( ball ) );

    // Get the position vector (r) and momentum (p) relative to the center-of-mass
    const r = ball.position.minus( this.centerOfMassPosition );
    const p = ball.velocity.minus( this.ballSystem.centerOfMass.velocity ).multiplyScalar( ball.mass );

    // L = r x p (relative to the center-of-mass)
    return r.crossScalar( p );
  }
}

collisionLab.register( 'InelasticCollisionEngine', InelasticCollisionEngine );
export default InelasticCollisionEngine;