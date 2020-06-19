// Copyright 2020, University of Colorado Boulder

/**
 * This is a test class for #87. I don't think this will work. But maybe it will, and that would be rally nice.
 *
 * @author Brandon Li
 */

import collisionLab from '../../collisionLab.js';

class CompositeStuckBalls {

  constructor( ball1, ball2, centerOfMass ) {
    console.log( 'hereh' );
    const a = ball1.position.minus( centerOfMass.position ).crossScalar( ball1.velocity.minus( centerOfMass.velocity ).timesScalar( ball1.mass ) );
    const b = ball2.position.minus( centerOfMass.position ).crossScalar( ball2.velocity.minus( centerOfMass.velocity ).timesScalar( ball2.mass ) );

    // @private
    this.totalAngularMomentum = a + b;

    // parallel axis theorem
    const momentOfI1 = 2 / 5 * ball1.mass * ( ball1.radius * ball1.radius ) + ball1.mass * ball1.position.minus( centerOfMass.position ).magnitudeSquared;
    const momentOfI2 = 2 / 5 * ball2.mass * ( ball2.radius * ball2.radius ) + ball2.mass * ball2.position.minus( centerOfMass.position ).magnitudeSquared;

    // @private - about center of mass - one system, same axis, add moments.
    this.omega = this.totalAngularMomentum / ( momentOfI1 + momentOfI2 );

    this.ball1 = ball1;
    this.ball2 = ball2;
    this.centerOfMass = centerOfMass;
  }

  step( dt ) {
    this.ball1.velocity = this.centerOfMass.velocity.plus(  this.ball1.position.minus( this.centerOfMass.position ).timesScalar( this.omega ) );
    this.ball2.velocity = this.centerOfMass.velocity.plus(  this.ball2.position.minus( this.centerOfMass.position ).timesScalar( this.omega ) );
    this.ball1.step( dt );
    this.ball2.step( dt );
  }
}

collisionLab.register( 'CompositeStuckBalls', CompositeStuckBalls );
export default CompositeStuckBalls;