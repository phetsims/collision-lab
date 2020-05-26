// Copyright 2019-2020, University of Colorado Boulder

/**
 * The model representation for the center of mass of a system of Balls.
 *
 * Primary responsibilities are:
 *  1. Track the position of the center of mass.
 *  2. Track the velocity of the center of mass.
 *
 * CenterOfMasses are created at the start of the sim and are never disposed, so no dispose method is necessary.
 *
 * @author Brandon Li
 * @author Martin Veillette
 */

import ObservableArray from '../../../../axon/js/ObservableArray.js';
import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import collisionLab from '../../collisionLab.js';
import Ball from './Ball.js';
import Path from './Path.js';

class CenterOfMass {

  /**
   * @param {ObservableArray.<Ball>} balls
   * @param {Property.<boolean>} centerOfMassVisibleProperty - indicates if the center of mass is currently visible.
   *                                                           This is needed for performance; the position, velocity,
   *                                                           and path are only updated if this is true.
   * @param {Property.<boolean>} pathVisibleProperty
   *
   */
  constructor( balls, centerOfMassVisibleProperty, pathVisibleProperty ) {
    assert && assert( balls instanceof ObservableArray && balls.count( ball => ball instanceof Ball ) === balls.length, `invalid balls: ${balls}` );
    assert && assert( centerOfMassVisibleProperty instanceof Property && typeof centerOfMassVisibleProperty.value === 'boolean', `invalid centerOfMassVisibleProperty: ${centerOfMassVisibleProperty}` );
    assert && assert( pathVisibleProperty instanceof Property && typeof pathVisibleProperty.value === 'boolean', `invalid pathVisibleProperty: ${pathVisibleProperty}` );

    // @public (read-only) {Vector2Property} - Property of the position of the ball, in meter coordinates. To be
    //                                         updated later.
    this.positionProperty = new Vector2Property( Vector2.ZERO );

    // @public (read-only) {Vector2Property} - Property of the velocity of the ball, in meter per second. To be
    //                                         updated later.
    this.velocityProperty = new Vector2Property( Vector2.ZERO );

    // @public (read-only) {Path} - create the trailing 'Path' behind the CenterOfMass. It is updated externally.
    this.path = new Path( this.positionProperty, pathVisibleProperty );

    // @private {ObservableArray.<Ball>} - reference the balls that were passed in.
    this.balls = balls;

    // @private {Property.<boolean>} - reference the centerOfMassVisibleProperty that was passed in.
    this.centerOfMassVisibleProperty = centerOfMassVisibleProperty;

    //----------------------------------------------------------------------------------------

    // Register the Balls that are already in the system.
    balls.forEach( this.registerAddedBall.bind( this ) );

    // Observe when Balls are added to the system and register the added Ball. Listener is never removed as
    // CenterOfMasses are never disposed.
    balls.addItemAddedListener( this.registerAddedBall.bind( this ) );

    // Observe when the centerOfMassVisibleProperty is set to false to clear the Paths of the center of mass. Also
    // observe when the centerOfMassVisibleProperty is set to true to re-update the position and velocity.
    // Link lasts for the lifetime of the simulation.
    centerOfMassVisibleProperty.lazyLink( centerOfMassVisible => {
      if ( !centerOfMassVisible ) {
        this.path.clear();
      }
      else {
        this.updatePosition();
        this.updateVelocity();
      }
    } );
  }

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
   * Registers a new Ball by adding the appropriate links to update the CenterOfMass's position and velocity. This is
   * generally invoked when Balls are added to the system, meaning the Center of Mass needs to be updated. Will also
   * ensure that links are removed if the Ball is removed from the play-area system.
   * @private
   *
   * @param {Ball} ball
   */
  registerAddedBall( ball ) {
    assert && assert( ball instanceof Ball, `invalid ball: ${ball}` );

    // Observe when the ball's position or mass changes and update the position of the center-of-mass.
    // Multilink is disposed when the Ball is removed from the system.
    const updatePositionMultilink = Property.multilink( [ ball.positionProperty, ball.massProperty ], () => {
      this.updatePosition();
    } );

    // Observe when the ball's velocity or mass changes and update the velocity of the center-of-mass.
    // Multilink is disposed when the Ball is removed from the system.
    const updateVelocityMultilink = Property.multilink( [ ball.velocityProperty, ball.massProperty ], () => {
      this.updateVelocity();
    } );

    // Observe when the ball is removed from the system to unlink listeners.
    const removeBallListener = removedBall => {
      if ( ball === removedBall ) {

        // Recompute the position and velocity of the center of mass now that there is one less Ball in the system.
        this.updatePosition();
        this.updateVelocity();

        // Unlink listeners
        Property.unmultilink( updatePositionMultilink );
        Property.unmultilink( updateVelocityMultilink );
        this.balls.removeItemRemovedListener( removeBallListener );
      }
    };
    this.balls.addItemRemovedListener( removeBallListener );
  }

  /**
   * Updates the position Property of the center of mass. Called when the position of one of the Balls in the system
   * is changing or when Balls are added/removed from the system. For performance reasons, this is a no-op if the
   * center-of-mass is not visible, but this should be called again when set back to true.
   * @private
   *
   * @returns {number} - in kg.
   */
  updatePosition() {

    // Do nothing if the center-of-mass is not visible.
    if ( !this.centerOfMassVisibleProperty.value ) { return; /* do nothing */ }

    // Determine the total first moment (mass * position) of the system.
    const totalFirstMoment = Vector2.ZERO.copy();
    this.balls.forEach( ball => {
      totalFirstMoment.add( ball.position.times( ball.mass ) );
    } );

    // The position of the center of mass is the total first moment divided by the total mass.
    this.positionProperty.value = totalFirstMoment.dividedScalar( this.computeTotalBallMasses() );
  }

  /**
   * Updates the velocity Property of the center of mass. Called when the velocity of one of the Balls in the system
   * is changing or when Balls are added/removed from the system. For performance reasons, this is a no-op if the
   * center-of-mass is not visible, but this should be called again when set back to true.
   * @private
   *
   * @returns {number} - in kg.
   */
   updateVelocity() {

    // Do nothing if the center-of-mass is not visible.
    if ( !this.centerOfMassVisibleProperty.value ) { return; /* do nothing */ }

    // Determine the total momentum of the system.
    const totalMomentum = this.balls.reduce( Vector2.ZERO.copy(), ( accumulator, ball ) => {
      return accumulator.add( ball.momentum );
    } );

    // The velocity of the center of mass is the total momentum divided by the total mass.
    this.velocityProperty.value = totalMomentum.dividedScalar( this.computeTotalBallMasses() );
  }

  /**
   * Updates the path of the center of mass. If the path is not visible, nothing happens.
   * @public
   *
   * @param {number} elapsedTime - the total elapsed elapsedTime of the simulation, in seconds.
   */
  updatePath( elapsedTime ) {
    if ( this.centerOfMassVisibleProperty.value ) {
      this.path.updatePath( elapsedTime );
    }
  }
}

collisionLab.register( 'CenterOfMass', CenterOfMass );
export default CenterOfMass;