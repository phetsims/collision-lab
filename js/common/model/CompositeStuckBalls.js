// Copyright 2020, University of Colorado Boulder

/**
 * This is a test class for #87. I don't think this will work. But maybe it will, and that would be rally nice.
 *
 * @author Brandon Li
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import collisionLab from '../../collisionLab.js';

class CompositeStuckBalls {

  constructor( ball1, ball2, centerOfMass ) {
    const a = ball1.position.minus( centerOfMass.position ).crossScalar( ball1.velocity.minus( centerOfMass.velocity ).timesScalar( ball1.mass ) );
    const b = ball2.position.minus( centerOfMass.position ).crossScalar( ball2.velocity.minus( centerOfMass.velocity ).timesScalar( ball2.mass ) );

    // @private
    this.totalAngularMomentum = new Vector3( 0, 0, a + b );

    // parallel axis theorem
    const momentOfI1 = 2 / 5 * ball1.mass * ( ball1.radius * ball1.radius ) + ball1.mass * ball1.position.minus( centerOfMass.position ).magnitudeSquared;
    const momentOfI2 = 2 / 5 * ball2.mass * ( ball2.radius * ball2.radius ) + ball2.mass * ball2.position.minus( centerOfMass.position ).magnitudeSquared;

    // @private - about center of mass - one system, same axis, add moments.
    this.omega = this.totalAngularMomentum.dividedScalar( momentOfI1 + momentOfI2 );

    this.ball1 = ball1;
    this.ball2 = ball2;
    this.centerOfMass = centerOfMass;
  }

  step( dt ) {
    const r1 = this.ball1.position.minus( this.centerOfMass.position );
    const r2 = this.ball2.position.minus( this.centerOfMass.position );
    const v1 = this.omega.cross( r1.toVector3() ).toVector2();
    const v2 = this.omega.cross( r2.toVector3() ).toVector2() ;

    this.ball1.velocity = this.centerOfMass.velocity.plus( v1 );
    this.ball2.velocity = this.centerOfMass.velocity.plus( v2 );

    const a1 = new Vector2( v1.magnitudeSquared / r1.magnitude, 0 ).rotate( r1.angle + Math.PI );
    const a2 = new Vector2( v2.magnitudeSquared / r2.magnitude, 0 ).rotate( r2.angle + Math.PI );


    this.ball1.position = this.ball1.position.plus( this.ball1.velocity.times( dt ) ).plus( a1.times( 0.5 * dt * dt ) );
    this.ball2.position = this.ball2.position.plus( this.ball2.velocity.times( dt ) ).plus( a2.times( 0.5 * dt * dt ) );


    const a = this.ball1.position.minus( this.centerOfMass.position ).crossScalar( this.ball1.velocity.minus( this.centerOfMass.velocity ).timesScalar( this.ball1.mass ) );
    const b = this.ball2.position.minus( this.centerOfMass.position ).crossScalar( this.ball2.velocity.minus( this.centerOfMass.velocity ).timesScalar( this.ball2.mass ) );
    console.log( this.totalAngularMomentum.magnitude - a - b );
  }
}

collisionLab.register( 'CompositeStuckBalls', CompositeStuckBalls );
export default CompositeStuckBalls;