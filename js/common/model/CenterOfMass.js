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

class CenterOfMass {

  /**
   * @param {ObservableArray.<Ball>} balls
   */
  constructor( balls ) {
    assert && assert( balls instanceof ObservableArray && balls.count( ball => ball instanceof Ball ) === balls.length, `invalid balls: ${balls}` );

    //----------------------------------------------------------------------------------------

    // @public (read-only) {Property.<null|Vector2>} - Property of the position of the ball, in meter coordinates.
    //                                                 If null, the center of mass doesn't exist.
    this.positionProperty = new Property( null, { isValidValue: value => ( value === null || value instanceof Vector2 ) } );

    // @public (read-only) {Property.<null|Vector2>} - Property of the velocity of the ball, in meter per second.
    //                                                 If null, the center of mass doesn't exist.
    this.velocityProperty = new Property( null, { isValidValue: value => ( value === null || value instanceof Vector2 ) } );

    //----------------------------------------------------------------------------------------

    // Convenience function that computes the total mass of the Balls.
    const getTotalMass = () => balls.reduce( 0, ( accumulator, ball ) => accumulator + ball.mass );

    // Define a function to update the position of the center of mass.
    const updatePosition = () => {
      if ( balls.length === 0 ) {

        // Set the position to null if there are no Balls since the center of mass doesn't exist.
        this.positionProperty.value = null;
      }
      else {

        // Determine the total first moment (mass * position) of the system.
        const totalFirstMoment = balls.reduce( Vector2.ZERO.copy(), ( accumulator, ball ) => {
          return accumulator.add( ball.position.times( ball.mass ) );
        } );

        // The position of the center of mass is the total first moment divided by the total mass.
        this.positionProperty.value = totalFirstMoment.dividedScalar( getTotalMass() );
      }
    };

    // Define a function to update the velocity of the center of mass.
    const updateVelocity = () => {
      if ( balls.length === 0 ) {

        // Set the velocity to null if there are no Balls since the center of mass doesn't exist.
        this.velocityProperty.value = null;
      }
      else {

        // Determine the total momentum of the system.
        const totalMomentum = balls.reduce( Vector2.ZERO.copy(), ( accumulator, ball ) => {
          return accumulator.add( ball.momentum );
        } );

        // The velocity of the center of mass is the total momentum divided by the total mass.
        this.velocityProperty.value = totalMomentum.dividedScalar( getTotalMass() );
      }
    };

    // Observe when Balls are added to the system. Link is never removed since the CenterOfMass is never disposed.
    balls.addItemAddedListener( addedBall => {

      // Update the position and velocity of the center of mass. Link removed when the Ball is removed from the system.
      addedBall.positionProperty.link( updatePosition );
      addedBall.velocityProperty.link( updateVelocity );

      // Observe when the ball is removed to unlink listeners.
      const removeBallListener = removedBall => {

        if ( removedBall === addedBall ) {

          // Recompute the position and velocity of the center of mass now that there is one less Ball in the system.
          updatePosition();
          updateVelocity();

          // Unlink the listener attached to the removedBall.
          removedBall.positionProperty.unlink( updatePosition );
          removedBall.velocityProperty.unlink( updateVelocity );

          balls.removeItemRemovedListener( removeBallListener );
        }
      };
      balls.addItemRemovedListener( removeBallListener );
    } );
  }
}

collisionLab.register( 'CenterOfMass', CenterOfMass );
export default CenterOfMass;