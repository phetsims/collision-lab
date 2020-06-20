// Copyright 2020, University of Colorado Boulder

/**
 * This is a test class for #87. I don't think this will work. But maybe it will, and that would be really nice.
 *
 * @author Brandon Li
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import collisionLab from '../../collisionLab.js';

class CompositeStuckBalls {

  constructor( ball1, ball2, centerOfMassVelocity ) {

    this.centerOfMassPosition = ball1.position.times( ball1.mass ).plus( ball2.position.times( ball2.mass ) ).dividedScalar( ball1.mass + ball2.mass );

    const a = ball1.position.minus( this.centerOfMassPosition ).toVector3().cross( ball1.velocity.minus( centerOfMassVelocity ).timesScalar( ball1.mass ).toVector3() );
    const b = ball2.position.minus( this.centerOfMassPosition ).toVector3().cross( ball2.velocity.minus( centerOfMassVelocity ).timesScalar( ball2.mass ).toVector3() );

    // @private
    this.totalAngularMomentum = a.plus( b );

    // const v1

    // parallel axis theorem
    const momentOfI1 = 2 / 5 * ball1.mass * ( ball1.radius * ball1.radius ) + ball1.mass * ball1.position.minus( this.centerOfMassPosition ).magnitudeSquared;
    const momentOfI2 = 2 / 5 * ball2.mass * ( ball2.radius * ball2.radius ) + ball2.mass * ball2.position.minus( this.centerOfMassPosition ).magnitudeSquared;

    // @private - about center of mass - one system, same axis, add moments.
    this.omega = this.totalAngularMomentum.dividedScalar( momentOfI1 + momentOfI2 );

    this.ball1 = ball1;
    this.ball2 = ball2;
    this.centerOfMassVelocity = centerOfMassVelocity;
  }






  step( dt ) {

    // All in center-of-mass reference frame.
    const r1 = this.ball1.position.minus( this.centerOfMassPosition );
    const r2 = this.ball2.position.minus( this.centerOfMassPosition );
    this.centerOfMassPosition.add( this.centerOfMassVelocity.times( dt ) );
    const r1p = r1.rotate( this.omega.magnitude * dt );
    const r2p = r2.rotate( this.omega.magnitude * dt );
    const v1p = this.omega.cross( r1p.toVector3() ).toVector2();
    const v2p = this.omega.cross( r2p.toVector3() ).toVector2();

    // Back in absolute reference frame.
    this.ball1.position = this.centerOfMassPosition.plus( r1p );
    this.ball2.position = this.centerOfMassPosition.plus( r2p );
    this.ball1.velocity = this.centerOfMassVelocity.plus( v1p );
    this.ball2.velocity = this.centerOfMassVelocity.plus( v2p );

    const momentOfI1 = 1 / 2 * this.ball1.mass * ( this.ball1.radius * this.ball1.radius ) + this.ball1.mass * this.ball1.position.minus( this.centerOfMassPosition ).magnitudeSquared;
    const momentOfI2 = 1 / 2 * this.ball2.mass * ( this.ball2.radius * this.ball2.radius ) + this.ball2.mass * this.ball2.position.minus( this.centerOfMassPosition ).magnitudeSquared;


    // const a = this.ball1.position.minus( this.centerOfMassPosition ).toVector3().cross( this.ball1.velocity.minus( this.centerOfMassVelocity ).timesScalar( this.ball1.mass ).toVector3() );
    // const b = this.ball2.position.minus( this.centerOfMassPosition ).toVector3().cross( this.ball2.velocity.minus( this.centerOfMassVelocity ).timesScalar( this.ball2.mass ).toVector3() );
    const a = this.omega.times( momentOfI1 );
    const b = this.omega.times( momentOfI2 );

    console.log( this.totalAngularMomentum.magnitude, this.totalAngularMomentum.minus( a.plus( b ) ).magnitude );
  }

  freeze() {
    this.ball1.velocity = Vector2.ZERO;
    this.ball2.velocity = Vector2.ZERO;
    this.centerOfMassVelocity.set( Vector2.ZERO );
    this.omega.set( Vector3.ZERO );
  }
}

collisionLab.register( 'CompositeStuckBalls', CompositeStuckBalls );
export default CompositeStuckBalls;