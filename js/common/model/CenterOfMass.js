// Copyright 2019-2020, University of Colorado Boulder

/**
 * The model representation for the center of mass of a system of Balls.
 *
 * Primary responsibilities are:
 *  1. Track the position of the center of mass.
 *  2. Track the velocity of the center of mass.
 *  3. Create the trailing path behind the center of mass.
 *
 * CenterOfMasses are created at the start of the sim and are never disposed, so no dispose method is necessary.
 *
 * @author Brandon Li
 * @author Martin Veillette
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import ObservableArray from '../../../../axon/js/ObservableArray.js';
import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import isArray from '../../../../phet-core/js/isArray.js';
import collisionLab from '../../collisionLab.js';
import Ball from './Ball.js';
import Path from './Path.js';

class CenterOfMass {

  /**
   * @param {Balls[]} prepopulatedBalls - an array of All possible balls in the system.
   * @param {ObservableArray.<Ball>} balls - the balls in the system. Must belong in prepopulatedBalls.
   * @param {Property.<boolean>} centerOfMassVisibleProperty - indicates if the center of mass is currently visible.
   *                                                           This is needed for performance; the position, velocity,
   *                                                           and path are only updated if this is true.
   * @param {Property.<boolean>} pathVisibleProperty
   */
  constructor( prepopulatedBalls, balls, centerOfMassVisibleProperty, pathVisibleProperty ) {
    assert && assert( isArray( prepopulatedBalls ), `invalid prepopulatedBalls: ${ prepopulatedBalls }` );
    assert && assert( balls instanceof ObservableArray && balls.count( ball => ball instanceof Ball ) === balls.length, `invalid balls: ${balls}` );
    assert && assert( centerOfMassVisibleProperty instanceof Property && typeof centerOfMassVisibleProperty.value === 'boolean', `invalid centerOfMassVisibleProperty: ${centerOfMassVisibleProperty}` );
    assert && assert( pathVisibleProperty instanceof Property && typeof pathVisibleProperty.value === 'boolean', `invalid pathVisibleProperty: ${pathVisibleProperty}` );

    // @public (read-only) {Path} - create the trailing 'Path' behind the CenterOfMass.
    this.path = new Path( pathVisibleProperty );

    // @private {ObservableArray.<Ball>} - reference the balls that were passed in.
    this.balls = balls;

    // @private {Property.<boolean>} - reference the centerOfMassVisibleProperty that was passed in.
    this.centerOfMassVisibleProperty = centerOfMassVisibleProperty;

    //----------------------------------------------------------------------------------------

    // Gather the massProperty, positionProperty, and velocityProperty of ALL possible balls into their respective
    // arrays.
    const ballMassProperties = prepopulatedBalls.map( ball => ball.massProperty );
    const ballPositionProperties = prepopulatedBalls.map( ball => ball.positionProperty );
    const ballVelocityProperties = prepopulatedBalls.map( ball => ball.velocityProperty );

    // @public (read-only) {DerivedProperty.<Vector2>} - Property of the position of the COM, in meter coordinates.
    //
    // For the dependencies, we use:
    //  - centerOfMassVisibleProperty; for performance reasons, the COM position isn't calculated if it isn't visible.
    //  - The position Properties of the prepopulatedBalls. Only the balls in the play-area are used in the calculation.
    //  - The mass Properties of the prepopulatedBalls. Only the balls in the play-area are used in the calculation.
    //  - balls.lengthProperty, since removing or adding a Ball changes the position of the COM.
    //
    // This DerivedProperty is never disposed and lasts for the lifetime of the sim.
    this.positionProperty = new DerivedProperty(
      [ centerOfMassVisibleProperty, ...ballMassProperties, ...ballPositionProperties, balls.lengthProperty ],
      centerOfMassVisible => {
        return centerOfMassVisible ? this.computePosition() : this.position; // Don't recompute if not visible.
      }, {
        valueType: Vector2
      } );

    //----------------------------------------------------------------------------------------

    // @public (read-only) {DerivedProperty.<Vector2>} - Property of the velocity of the COM, in meters per second.
    //
    // For the dependencies, we use:
    //  - centerOfMassVisibleProperty; for performance reasons, the COM velocity isn't calculated if it isn't visible.
    //  - The velocity Properties of the prepopulatedBalls. Only the balls in the play-area are used in the calculation.
    //  - The mass Properties of the prepopulatedBalls. Only the balls in the play-area are used in the calculation.
    //  - balls.lengthProperty, since removing or adding a Ball changes the velocity of the COM.
    //
    // This DerivedProperty is never disposed and lasts for the lifetime of the sim.
    this.velocityProperty = new DerivedProperty(
      [ centerOfMassVisibleProperty, ...ballMassProperties, ...ballVelocityProperties, balls.lengthProperty ],
      centerOfMassVisible => {
        return centerOfMassVisible ? this.computeVelocity() : this.velocity; // Don't recompute if not visible.
      }, {
        valueType: Vector2
      } );
  }

  /**
   * Resets this CenterOfMass (particularly its trailing Path).
   * @public
   */
  reset() {
    this.path.clear();
  }

  /**
   * Updates the path of the center of mass. If the path is not visible, nothing happens.
   * @public
   *
   * @param {number} elapsedTime - the total elapsed elapsedTime of the simulation, in seconds.
   */
  updatePath( elapsedTime ) {
    if ( this.centerOfMassVisibleProperty.value ) {
      this.path.updatePath( this.position, elapsedTime );
    }
  }

  /**
   * Gets the position of the center of mass, in meter coordinates.
   * @public
   *
   * @returns {Vector2} - in meter coordinates
   */
  get position() {
    return this.positionProperty ? this.positionProperty.value : this.computePosition();
  }

  /**
   * Gets the velocity of the center of mass, in meter per second.
   * @public
   *
   * @returns {Vector2} - in meter per second
   */
  get velocity() {
    return this.velocityProperty ? this.velocityProperty.value : this.computeVelocity();
  }

  /*----------------------------------------------------------------------------*
   * Private facing.
   *----------------------------------------------------------------------------*/

  /**
   * Computes the total mass of the Balls in the system.
   * @private
   *
   * @returns {number} - in kg.
   */
  computeTotalBallMasses() {
    let totalMass = 0;

    this.balls.forEach( ball => {
      totalMass += ball.mass;
    } );
    return totalMass;
  }

  /**
   * Computes the position of the center of mass. Called when the position of one of the Balls in the system
   * is changing or when Balls are added/removed from the system.
   * @private
   *
   * @returns {Vector2} - in meter coordinates.
   */
  computePosition() {

    // Determine the total first moment (mass * position) of the system.
    const totalFirstMoment = Vector2.ZERO.copy();
    this.balls.forEach( ball => {
      totalFirstMoment.add( ball.position.times( ball.mass ) );
    } );

    // The position of the center of mass is the total first moment divided by the total mass.
    return totalFirstMoment.dividedScalar( this.computeTotalBallMasses() );
  }

  /**
   * Computes the velocity of the center of mass. Called when the position of one of the Balls in the system
   * is changing or when Balls are added/removed from the system.
   * @private
   *
   * @returns {Vector2} - in meter per second.
   */
  computeVelocity() {

    // Determine the total momentum of the system.
    const totalMomentum = this.balls.reduce( Vector2.ZERO.copy(), ( accumulator, ball ) => {
      return accumulator.add( ball.momentum );
    } );

    // The velocity of the center of mass is the total momentum divided by the total mass.
    return totalMomentum.dividedScalar( this.computeTotalBallMasses() );
  }
}

collisionLab.register( 'CenterOfMass', CenterOfMass );
export default CenterOfMass;