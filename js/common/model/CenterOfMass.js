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

      // @public - value will be updated later
      this.positionProperty = new Vector2Property( Vector2.ZERO );

      // @public - value will be updated later
      this.velocityProperty = new Vector2Property( Vector2.ZERO );

      // @private {ObservableArray.<Ball>}
      this.balls = balls;

      // update the center of Mass
      this.update();
    }

    /**
     * Updates the value of the center of mass position and velocity
     * @public
     */
    update() {
      let totalMass = 0;
      let totalFirstMoment = new Vector2( 0, 0 );
      let totalMomentum = new Vector2( 0, 0 );

      this.balls.forEach( ball => {
        totalMass += ball.mass;
        totalFirstMoment = totalFirstMoment.plus( ball.firstMoment );
        totalMomentum = totalMomentum.plus( ball.momentum );
      } );

      if ( this.balls.length > 0 ) {
        this.positionProperty.value = totalFirstMoment.divideScalar( totalMass );
        this.velocityProperty.value = totalMomentum.divideScalar( totalMass );
      }
    }

  }

  return collisionLab.register( 'CenterOfMass', CenterOfMass );
} );