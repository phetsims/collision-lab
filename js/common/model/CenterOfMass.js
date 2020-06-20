// Copyright 2019-2020, University of Colorado Boulder

/**
 * CenterOfMass is the model representation for the center of mass (COM) of a system of Balls. Each BallSystem has one
 * and only one CenterOfMass instance. CenterOfMasses are created at the start of the sim and are never disposed,
 * so no dispose method is necessary.
 *
 * Primary responsibilities are:
 *  1. Track the position of the center of mass in meters.
 *  2. Track the velocity of the center of mass, in m/s.
 *  3. Track the speed of the center of mass, in m/s.
 *
 * NOTE: CenterOfMasses are designed and implemented to be minimally invasive to optimize the performance of the
 *       simulation. The position and velocity (and speed) are not re-updated when the CenterOfMass isn't visible and
 *       are only recalculated when its visibility is set to true.
 *
 * @author Brandon Li
 * @author Martin Veillette
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import collisionLab from '../../collisionLab.js';
import Ball from './Ball.js';

class CenterOfMass {

  /**
   * @param {Balls[]} prepopulatedBalls - an array of All possible balls in the system.
   * @param {ObservableArray.<Ball>} balls - the balls in the system. Must belong in prepopulatedBalls.
   * @param {Property.<number>} numberOfBallsProperty
   * @param {Property.<boolean>} centerOfMassVisibleProperty - indicates if the center of mass is currently visible.
   *                                                           This is needed for performance; the position and velocity
   *                                                           are only updated if this is true.
   */
  constructor( prepopulatedBalls, balls, centerOfMassVisibleProperty ) {
    assert && AssertUtils.assertArrayOf( prepopulatedBalls, Ball );
    assert && AssertUtils.assertObservableArrayOf( balls, Ball );
    assert && AssertUtils.assertPropertyOf( centerOfMassVisibleProperty, 'boolean' );

    //----------------------------------------------------------------------------------------

    // @private {ObservableArray.<Ball>} - reference to the balls that were passed in.
    this.balls = balls;

    // Gather the massProperty, positionProperty, and velocityProperty of ALL possible balls into their respective
    // arrays. We use these as dependencies for the Properties below. This does not hinder the performance of the
    // simulation since Balls NOT in the system are not stepped and their Properties don't change.
    const ballMassProperties = prepopulatedBalls.map( ball => ball.massProperty );
    const ballPositionProperties = prepopulatedBalls.map( ball => ball.positionProperty );
    const ballVelocityProperties = prepopulatedBalls.map( ball => ball.velocityProperty );

    // @public (read-only) {DerivedProperty.<Vector2>} - Property of the position of the COM, in meter coordinates.
    //
    // For the dependencies, we use:
    //  - centerOfMassVisibleProperty - for performance reasons, the COM position isn't calculated if it isn't visible.
    //  - position Properties of the prepopulatedBalls. Only the balls in the play-area are used in the calculation.
    //  - mass Properties of the prepopulatedBalls. Only the balls in the play-area are used in the calculation.
    //  - balls.lengthProperty - since removing or adding a Ball changes the position of the COM.
    //
    // This DerivedProperty is never disposed and persists for the lifetime of the sim.
    this.positionProperty = new DerivedProperty(
      [ centerOfMassVisibleProperty, ...ballMassProperties, ...ballPositionProperties, balls.lengthProperty ],
      centerOfMassVisible => {
        return centerOfMassVisible ? CenterOfMass.computePosition( balls ) : this.position;
      }, {
        valueType: Vector2
      } );

    //----------------------------------------------------------------------------------------

    // @public (read-only) {DerivedProperty.<Vector2>} - Property of the velocity of the COM, in meters per second.
    //
    // For the dependencies, we use:
    //  - centerOfMassVisibleProperty - for performance reasons, the COM velocity isn't calculated if it isn't visible.
    //  - velocity Properties of the prepopulatedBalls. Only the balls in the play-area are used in the calculation.
    //  - mass Properties of the prepopulatedBalls. Only the balls in the play-area are used in the calculation.
    //  - balls.lengthProperty - since removing or adding a Ball changes the velocity of the COM.
    //
    // This DerivedProperty is never disposed and persists for the lifetime of the sim.
    this.velocityProperty = new DerivedProperty(
      [ centerOfMassVisibleProperty, ...ballMassProperties, ...ballVelocityProperties, balls.lengthProperty ],
      centerOfMassVisible => {
        return centerOfMassVisible ? CenterOfMass.computeVelocity( balls ) : this.velocity;
      }, {
        valueType: Vector2
      } );

    // @public (read-only) {DerivedProperty.<number>} speedProperty - Property of the speed of the Ball, in m/s.
    this.speedProperty = new DerivedProperty( [ this.velocityProperty ], _.property( 'magnitude' ) );
  }

  /**
   * Gets the position of the center of mass, in meter coordinates.
   * @public
   *
   * @returns {Vector2} - in meter coordinates.
   */
  get position() {
    return this.positionProperty ? this.positionProperty.value : CenterOfMass.computePosition( this.balls );
  }

  /**
   * Gets the velocity of the center of mass, in meters per second.
   * @public
   *
   * @returns {Vector2} - in meters per second.
   */
  get velocity() {
    return this.velocityProperty ? this.velocityProperty.value : CenterOfMass.computeVelocity( this.balls );
  }

  /*----------------------------------------------------------------------------*
   * Static Methods.
   *----------------------------------------------------------------------------*/

  /**
   * Computes the total mass of the Balls in the system.
   * @private
   *
   * @param {ObservableArray.<Ball>|Ball[]} balls - the balls in the system.
   * @returns {number} - in kg.
   */
  static computeTotalBallSystemMass( balls ) {
    let totalMass = 0;

    balls.forEach( ball => {
      totalMass += ball.mass;
    } );
    return totalMass;
  }

  /**
   * Computes the position of the center of mass. Normally called when the position of one of the Balls in the system
   * is changing or when Balls are added/removed from the system.
   * @public
   *
   * @param {ObservableArray.<Ball>|Ball[]} balls - the balls in the system.
   * @returns {Vector2} - in meter coordinates.
   */
  static computePosition( balls ) {

    // Determine the total first moment (mass * position) of the system.
    const totalFirstMoment = Vector2.ZERO.copy();
    balls.forEach( ball => {
      totalFirstMoment.add( ball.position.times( ball.mass ) );
    } );

    // The position of the center of mass is the total first moment divided by the total mass.
    // See https://en.wikipedia.org/wiki/Center_of_mass#A_system_of_particles for background on this formula.
    return totalFirstMoment.dividedScalar( CenterOfMass.computeTotalBallSystemMass( balls ) );
  }

  /**
   * Computes the velocity of the center of mass. Called when the momentum of one of the Balls in the system
   * is changing or when Balls are added/removed from the system.
   * @public
   *
   * @param {ObservableArray.<Ball>|Ball[]} balls - the balls in the system.
   * @returns {Vector2} - in meters per second.
   */
  static computeVelocity( balls ) {

    // Determine the total momentum of the system.
    const totalMomentum = Vector2.ZERO.copy();
    balls.forEach( ball => {
      totalMomentum.add( ball.momentum );
    } );

    // The velocity of the center of mass is the total momentum divided by the total mass.
    return totalMomentum.dividedScalar( CenterOfMass.computeTotalBallSystemMass( balls ) );
  }
}

collisionLab.register( 'CenterOfMass', CenterOfMass );
export default CenterOfMass;