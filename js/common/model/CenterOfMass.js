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

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import ObservableArray from '../../../../axon/js/ObservableArray.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import collisionLab from '../../collisionLab.js';
import Ball from './Ball.js';

class CenterOfMass {

  /**
   * @param {ObservableArray.<Ball>} balls
   */
  constructor( balls ) {

    assert && assert( balls instanceof ObservableArray
    && balls.count( ball => ball instanceof Ball ) === balls.length, `invalid balls: ${balls}` );

    //----------------------------------------------------------------------------------------

    // @public Center of Mass position - value will be updated later
    this.positionProperty = new Vector2Property( Vector2.ZERO );

    // @public Center Of Mass Velocity - value will be updated later
    this.velocityProperty = new Vector2Property( Vector2.ZERO );

    // @public {Property.<boolean>} - are the position and velocity of the center of mass mathematically well defined
    // center of mass is not defined when there are no balls
    this.isDefinedProperty = new DerivedProperty( [ balls.lengthProperty ], length => {
        return length > 0;
      }
    );

    // function that determines the total mass of all the balls
    const getTotalMass = () => {
      return balls.reduce( 0, ( accumulator, ball ) => {
        return accumulator + ball.mass;
      } );
    };

    // define a function to update the position of the center of mass
    const updatePosition = () => {
      if ( balls.length === 0 ) {

        // set the position to zero if there are no balls
        // slight abuse of Vector2 since technically the center of mass does not exist, but we will handle this
        // case through isDefinedProperty
        this.positionProperty.value = Vector2.ZERO;
      }
      else {

        // {Vector2} determine the total first moment (Mass*position) of the system
        const totalFirstMoment = balls.reduce( Vector2.ZERO, ( accumulator, ball ) => {
          return accumulator.plus( ball.position.times( ball.mass ) );
        } );

        this.positionProperty.value = totalFirstMoment.dividedScalar( getTotalMass() );
      }
    };

    // define a function to update the velocity of the center of mass
    const updateVelocity = () => {

      if ( balls.length === 0 ) {

        // assign a velocity of zero when there are no balls present.
        this.velocityProperty.value = Vector2.ZERO;
      }
      else {

        // {Vector2} determine the total momentum of the system
        const totalMomentum = balls.reduce( Vector2.ZERO, ( accumulator, ball ) => {
          return accumulator.plus( ball.momentum );
        } );

        this.velocityProperty.value = totalMomentum.dividedScalar( getTotalMass() );
      }

    };


    // create a listener that will listen to the addition of a new ball
    const addItemAddedBallListener = addedBall => {

      // update the position and velocity of the center of mass
      addedBall.positionProperty.link( updatePosition );
      addedBall.velocityProperty.link( updateVelocity );

      // Observe when the ball is removed to unlink listeners
      const removeBallListener = removedBall => {

        // update the position and velocity of the center of mass
        // since it will change when removing a ball
        updatePosition();
        updateVelocity();

        if ( removedBall === addedBall ) {

          // unlink the listener attached to the removedBall.
          removedBall.positionProperty.unlink( updatePosition );
          removedBall.velocityProperty.unlink( updateVelocity );

          balls.removeItemRemovedListener( removeBallListener );
        }
      };
      balls.addItemRemovedListener( removeBallListener );
    };

    balls.addItemAddedListener( addItemAddedBallListener );
  }

}

collisionLab.register( 'CenterOfMass', CenterOfMass );
export default CenterOfMass;