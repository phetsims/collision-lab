// Copyright 2019-2020, University of Colorado Boulder

/**
 * The model representation for the center of mass of a system of Balls.
 *
 * Primary responsibilities are:
 *  1. Track the position of the center of mass, if it exists.
 *  2. Track the velocity of the center of mass, if it exists.
 *
 * @author Brandon Li
 * @author Martin Veillette
 */

import ObservableArray from '../../../../axon/js/ObservableArray.js';
import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import collisionLab from '../../collisionLab.js';
import Ball from './Ball.js';
import MovingObject from './MovingObject.js';

class CenterOfMass extends MovingObject {

  /**
   * @param {ObservableArray.<Ball>} balls
   */
  constructor( balls ) {
    assert && assert( balls instanceof ObservableArray && balls.count( ball => ball instanceof Ball ) === balls.length, `invalid balls: ${balls}` );

    super();
    //----------------------------------------------------------------------------------------

    // @public (read-only) {Property.<null|Vector2>} - Property of the position of the ball, in meter coordinates.
    //                                                 If null, the center of mass doesn't exist.
    this.positionProperty = new Property( null, { isValidValue: value => ( value === null || value instanceof Vector2 ) } );

    // @public (read-only) {Property.<null|Vector2>} - Property of the velocity of the ball, in meter per second.
    //                                                 If null, the center of mass doesn't exist.
    this.velocityProperty = new Property( null, { isValidValue: value => ( value === null || value instanceof Vector2 ) } );

    // @private {ObservableArray.<Ball>} - reference the balls that were passed in.
    this.balls = balls;

    //----------------------------------------------------------------------------------------

    // Observe when Balls are added to the system. Link is never removed since the CenterOfMass is never disposed.
    balls.addItemAddedListener( ball => {

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
          balls.removeItemRemovedListener( removeBallListener );
        }
      };
      balls.addItemRemovedListener( removeBallListener );
    } );
  }

  /**
   * Indicates if the center of mass is currently defined.
   * @public
   *
   * @returns {boolean}
   */
  get isDefined() { return this.balls.length !== 0; }

  /**
   * Gets the center position of the CenterOfMass, in meter coordinates.
   * @public
   * @override
   * @returns {Vector2} - in meter coordinates
   */
  get position() { return this.positionProperty.value; }

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
   * Updates the position Property of the center of mass. Called when the position of one of the Balls in the system
   * is changing or when Balls are added/removed from the system.
   * @private
   *
   * @returns {number} - in kg.
   */
  updatePosition() {
    if ( !this.isDefined ) {

      // Set the position to null if there are no Balls since the center of mass doesn't exist.
      this.positionProperty.value = null;
    }
    else {

      // Determine the total first moment (mass * position) of the system.
      const totalFirstMoment = Vector2.ZERO.copy();
      this.balls.forEach( ball => {
        totalFirstMoment.add( ball.position.times( ball.mass ) );
      } );

      // The position of the center of mass is the total first moment divided by the total mass.
      this.positionProperty.value = totalFirstMoment.dividedScalar( this.computeTotalBallMasses() );
    }
  }

  /**
   * Updates the velocity Property of the center of mass. Called when the velocity of one of the Balls in the system
   * is changing or when Balls are added/removed from the system.
   * @private
   *
   * @returns {number} - in kg.
   */
   updateVelocity() {
    if ( !this.isDefined ) {

      // Set the velocity to null if there are no Balls since the center of mass doesn't exist.
      this.velocityProperty.value = null;
    }
    else {

      // Determine the total momentum of the system.
      const totalMomentum = this.balls.reduce( Vector2.ZERO.copy(), ( accumulator, ball ) => {
        return accumulator.add( ball.momentum );
      } );

      // The velocity of the center of mass is the total momentum divided by the total mass.
      this.velocityProperty.value = totalMomentum.dividedScalar( this.computeTotalBallMasses() );
    }
  }
}

collisionLab.register( 'CenterOfMass', CenterOfMass );
export default CenterOfMass;