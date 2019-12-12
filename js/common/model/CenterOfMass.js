// Copyright 2019, University of Colorado Boulder

/**
 * Class for the Center of Mass of all Balls
 * @author Martin Veillette
 */

define( require => {
  'use strict';

  // modules
  const Ball = require( 'COLLISION_LAB/common/model/Ball' );
  const collisionLab = require( 'COLLISION_LAB/collisionLab' );
  const DerivedProperty = require( 'AXON/DerivedProperty' );
  const ObservableArray = require( 'AXON/ObservableArray' );
  const Vector2 = require( 'DOT/Vector2' );
  const Vector2Property = require( 'DOT/Vector2Property' );

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
      this.isDefinedProperty = new DerivedProperty( [balls.lengthProperty], length => {
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
            return accumulator.plus( ball.firstMoment );
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

  return collisionLab.register( 'CenterOfMass', CenterOfMass );
} );