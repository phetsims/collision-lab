// Copyright 2019, University of Colorado Boulder

/**
 * Class for the Center of Mass of all Balls
 * @author Martin Veillette
 */

define( require => {
  'use strict';

  // modules
  const collisionLab = require( 'COLLISION_LAB/collisionLab' );
  const Vector2 = require( 'DOT/Vector2' );

  class CenterOfMass {

    /**
     * @param {ObservableArray.<Ball>} balls
     */
    constructor( balls ) {

      // @public read-only - value will be updated later
      this.position = new Vector2( 0, 0 );

      // @public read-only - value will be updated later
      this.velocity = new Vector2( 0, 0 );

      // @private {ObservableArray.<Ball>}
      this.balls = balls;

      // update the center of Mass
      this.update();
    }

    /**
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

      this.position = totalFirstMoment.divideScalar( totalMass );
      this.velocity = totalMomentum.divideScalar( totalMass );
    }

  }

  return collisionLab.register( 'CenterOfMass', CenterOfMass );
} );