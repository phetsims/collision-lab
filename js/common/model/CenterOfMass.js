// Copyright 2019-2021, University of Colorado Boulder

/**
 * CenterOfMass is the model representation for the center of mass (COM) of a system of Balls. Each BallSystem has one
 * and only one CenterOfMass instance. CenterOfMasses are created at the start of the sim and are never disposed,
 * so no dispose method is necessary.
 *
 * Primary responsibilities are:
 *  1. Track the position of the center of mass in meters.
 *  2. Track the velocity of the center of mass, in m/s.
 *  3. Track the speed of the center of mass, in m/s.
 *  4. Create the trailing 'Path' behind the CenterOfMass.
 *
 * @author Brandon Li
 * @author Martin Veillette
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import collisionLab from '../../collisionLab.js';
import Ball from './Ball.js';
import CollisionLabPath from './CollisionLabPath.js';

const scratchVector = new Vector2( 0, 0 );

class CenterOfMass {

  /**
   * @param {Balls[]} prepopulatedBalls - an array of All possible balls in the system.
   * @param {ObservableArrayDef.<Ball>} balls - the balls in the system. Must belong in prepopulatedBalls.
   * @param {Property.<boolean>} centerOfMassVisibleProperty - indicates if the center of mass is currently visible.
   *                                                           Needed since the CenterOfMass's trailing 'Path' is empty
   *                                                           if this is false and can only be updated if this is true.
   * @param {Property.<boolean>} pathsVisibleProperty - indicates if the 'Path' checkbox is checked.
   */
  constructor( prepopulatedBalls, balls, centerOfMassVisibleProperty, pathsVisibleProperty ) {
    assert && AssertUtils.assertArrayOf( prepopulatedBalls, Ball );
    assert && assert( Array.isArray( balls ) ) && AssertUtils.assertArrayOf( balls, Ball );
    assert && AssertUtils.assertPropertyOf( centerOfMassVisibleProperty, 'boolean' );
    assert && AssertUtils.assertPropertyOf( pathsVisibleProperty, 'boolean' );

    //----------------------------------------------------------------------------------------

    // @private {ObservableArrayDef.<Ball>} - reference to the balls that were passed in.
    this.balls = balls;

    // Gather the massProperty, positionProperty, and velocityProperty of ALL possible balls into their respective
    // arrays. We use these as dependencies for the Properties below. This does not hinder the performance of the
    // simulation since Balls NOT in the system are not stepped and their Properties don't change.
    const ballMassProperties = prepopulatedBalls.map( ball => ball.massProperty );
    const ballPositionProperties = prepopulatedBalls.map( ball => ball.positionProperty );
    const ballVelocityProperties = prepopulatedBalls.map( ball => ball.velocityProperty );

    // @public {Property.<Vector2>} - Property of the position of the COM, in meter coordinates.
    //
    // For the dependencies, we use:
    //  - position Properties of the prepopulatedBalls. Only the balls in the BallSystem are used in the calculation.
    //  - mass Properties of the prepopulatedBalls. Only the balls in the BallSystem are used in the calculation.
    //  - balls.lengthProperty - since removing or adding a Ball changes the position of the COM.
    //
    // This DerivedProperty is never disposed and persists for the lifetime of the sim.
    this.positionProperty = new DerivedProperty(
      [ ...ballMassProperties, ...ballPositionProperties, balls.lengthProperty ],
      () => this.computePosition(), {
        valueType: Vector2
      } );

    // @public {Property.<Vector2>} - Property of the velocity of the COM, in meters per second.
    //
    // For the dependencies, we use:
    //  - velocity Properties of the prepopulatedBalls. Only the balls in the BallSystem are used in the calculation.
    //  - mass Properties of the prepopulatedBalls. Only the balls in the BallSystem are used in the calculation.
    //  - balls.lengthProperty - since removing or adding a Ball changes the velocity of the COM.
    //
    // This DerivedProperty is never disposed and persists for the lifetime of the sim.
    this.velocityProperty = new DerivedProperty(
      [ ...ballMassProperties, ...ballVelocityProperties, balls.lengthProperty ],
      () => this.computeVelocity(), {
        valueType: Vector2
      } );

    // @public {Property.<number>} speedProperty - Property of the speed of the Ball, in m/s.
    this.speedProperty = new DerivedProperty( [ this.velocityProperty ], velocity => velocity.magnitude );

    //----------------------------------------------------------------------------------------

    // Get the Property that indicates if the CenterOfMass's Path is visible, which occurs when both the CenterOfMass
    // and Paths are visible. DerivedProperty is never disposed since CenterOfMasses are never disposed.
    const centerOfMassPathVisibleProperty = new DerivedProperty( [ pathsVisibleProperty, centerOfMassVisibleProperty ],
      ( centerOfMassVisible, pathVisible ) => centerOfMassVisible && pathVisible, {
        valueType: 'boolean'
      } );

    // @public (read-only) {CollisionLabPath} - the trailing 'Path' behind the CenterOfMass.
    this.path = new CollisionLabPath( this.positionProperty, centerOfMassPathVisibleProperty );
  }

  /**
   * Resets the CenterOfMass.
   * @public
   *
   * Called when the reset-all button is pressed.
   */
  reset() {
    this.path.clear();
  }

  /*----------------------------------------------------------------------------*
   * Private Methods.
   *----------------------------------------------------------------------------*/

  /**
   * Computes the total mass of the Balls in the system.
   * @private
   *
   * @returns {number} - in kg.
   */
  computeTotalBallSystemMass() {
    return _.sumBy( this.balls, ball => ball.massProperty.value );
  }

  /**
   * Computes the position of the center of mass. Normally called when the position of one of the Balls in the system
   * is changing or when Balls are added/removed from the system.
   * @public
   *
   * @returns {Vector2} - in meter coordinates.
   */
  computePosition() {

    // Determine the total first moment (mass * position) of the system.
    const totalFirstMoment = Vector2.ZERO.copy();
    this.balls.forEach( ball => {
      totalFirstMoment.add( scratchVector.set( ball.positionProperty.value ).multiply( ball.massProperty.value ) );
    } );

    // The position of the center of mass is the total first moment divided by the total mass.
    // See https://en.wikipedia.org/wiki/Center_of_mass#A_system_of_particles for background on this formula.
    return totalFirstMoment.dividedScalar( this.computeTotalBallSystemMass() );
  }

  /**
   * Computes the velocity of the center of mass. Called when the momentum of one of the Balls in the system
   * is changing or when Balls are added/removed from the system.
   * @public
   *
   * @returns {Vector2} - in meters per second.
   */
  computeVelocity() {

    // Determine the total momentum of the system.
    const totalMomentum = Vector2.ZERO.copy();
    this.balls.forEach( ball => {
      totalMomentum.add( ball.momentumProperty.value );
    } );

    // The velocity of the center of mass is the total momentum divided by the total mass.
    return totalMomentum.dividedScalar( this.computeTotalBallSystemMass() );
  }
}

collisionLab.register( 'CenterOfMass', CenterOfMass );
export default CenterOfMass;