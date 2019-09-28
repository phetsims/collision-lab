// Copyright 2019, University of Colorado Boulder

/**
 *
 * CollisionDetector handles collision detection and response for all screens. Our collision model involves
 * rigid bodies. Once a collision is detected, the appropriate ball models are set to update their new velocity
 * and position.
 *
 * The algorithms for particle-particle collisions and particle-container collisions were adapted from the flash
 * implementation of Collision Lab. They follow the standard rigid-body collision model as described in (e.g.)
 * http://web.mst.edu/~reflori/be150/Dyn%20Lecture%20Videos/Impact%20Particles%201/Impact%20Particles%201.pdf.
 *
 * @author Brandon Li
 * @author Martin Veillette
 */

define( require => {
  'use strict';

  // modules
  const Ball = require( 'COLLISION_LAB/common/model/Ball' );
  const collisionLab = require( 'COLLISION_LAB/collisionLab' );
  const NumberProperty = require( 'AXON/NumberProperty' );
  const ObservableArray = require( 'AXON/ObservableArray' );
  // const PlayArea = require( 'COLLISION_LAB/common/model/PlayArea' );
  const Vector2 = require( 'DOT/Vector2' );

  class CollisionDetector {

    /**
     * @param {Bounds2} bounds - the PlayArea inside which collision occur
     * @param {ObservableArray.<Ball>} balls - collections of balls
     * @param {NumberProperty} elasticityProperty
     * @param {Object} [options]
     */
    constructor( bounds, balls, elasticityProperty, options ) {

      // assert && assert( playArea instanceof PlayArea, `invalid playArea: ${playArea}` );
      assert && assert( balls instanceof ObservableArray && _.every( balls.getArray(), ball => ball instanceof Ball ) );
      assert && assert( elasticityProperty instanceof NumberProperty, `invalid elasticityProperty: ${elasticityProperty}` );

      // @private
      this.balls = balls;

      this.nbrCollisionsInThisTimeStep = 0;

      this.elasticityProperty = elasticityProperty;

      this.isReversing = false;
    }

    /**
     *
     */
    detectCollision( lastTime, time ) {
      const N = this.balls.length;
      for ( let i = 0; i < N; i++ ) {
        const ball1 = this.balls.get( i );
        for ( let j = i + 1; j < N; j++ ) {

          const ball2 = this.balls.get( j );
          const distance = ball1.position.distance( ball2.position );
          const minimumSeparation = ball1.radius + ball2.radius;
          if ( distance < minimumSeparation ) {
            this.nbrCollisionsInThisTimeStep += 1;
            this.collideBalls( ball1, ball2, lastTime, time );
            this.colliding = true;
          }
        }
      }
    }

    /**
     *
     * @param {Ball} ball1
     * @param {Ball} ball2
     * @param {number} lastTime
     * @param {number} time - current time
     */
    collideBalls( ball1, ball2, lastTime, time ) {
      //Balls have already overlapped, so currently have incorrect positions

      const e = this.elasticityProperty.value;

      const tC = this.getContactTime( ball1, ball2, lastTime, time );

      const delTBefore = tC - lastTime;
      const delTAfter = time - tC;


      const v1x = ball1.velocity.x;
      const v2x = ball2.velocity.x;
      const v1y = ball1.velocity.y;
      const v2y = ball2.velocity.y;

      //get positions at tC:
      // should be OLD

      const r1 = ball1.getPreviousPosition( time - lastTime );
      const r2 = ball2.getPreviousPosition( time - lastTime );

      const x1 = r1.x + v1x * delTBefore;
      const x2 = r2.x + v2x * delTBefore;
      const y1 = r1.y + v1y * delTBefore;
      const y2 = r2.y + v2y * delTBefore;

      const delX = x2 - x1;
      const delY = y2 - y1;
      const d = Math.sqrt( delX * delX + delY * delY );

      //normal and tangential components of initial velocities
      const v1n = ( 1 / d ) * ( v1x * delX + v1y * delY );
      const v2n = ( 1 / d ) * ( v2x * delX + v2y * delY );
      const v1t = ( 1 / d ) * ( -v1x * delY + v1y * delX );
      const v2t = ( 1 / d ) * ( -v2x * delY + v2y * delX );
      const m1 = ball1.mass;
      const m2 = ball2.mass;

      //normal components of velocities after collision (P for prime = after)
      const v1nP = ( ( m1 - m2 * e ) * v1n + m2 * ( 1 + e ) * v2n ) / ( m1 + m2 );
      const v2nP = ( e + 0.000001 ) * ( v1n - v2n ) + v1nP;  //changed from 0.0000001
      const v1xP = ( 1 / d ) * ( v1nP * delX - v1t * delY );
      const v1yP = ( 1 / d ) * ( v1nP * delY + v1t * delX );
      const v2xP = ( 1 / d ) * ( v2nP * delX - v2t * delY );
      const v2yP = ( 1 / d ) * ( v2nP * delY + v2t * delX );
      ball1.velocity = new Vector2( v1xP, v1yP );
      ball2.velocity = new Vector2( v2xP, v2yP );

      //Don't allow balls to rebound after collision during timestep of collision
      //this seems to improve stability
      const newX1 = x1 + v1xP * delTAfter;
      const newY1 = y1 + v1yP * delTAfter;
      const newX2 = x2 + v2xP * delTAfter;
      const newY2 = y2 + v2yP * delTAfter;

      ball1.position = new Vector2( newX1, newY1 );
      ball2.position = new Vector2( newX2, newY2 );

    }

    /**
     * Gets contact time between balls i and j
     * @param {Ball} ball1
     * @param {Ball} ball2
     * @param {number} lastTime
     * @param {number} time - current time
     * @returns {number} contactTime in seconds
     */
    getContactTime( ball1, ball2, lastTime, time ) {

      let tC = 0;  //contact time

      const r1 = ball1.getPreviousPosition( time - lastTime );
      const r2 = ball2.getPreviousPosition( time - lastTime );

      const v1 = ball1.velocity;
      const v2 = ball2.velocity;
      const deltaR = r2.minus( r1 );
      const deltaV = v2.minus( v1 );
      const R1 = ball1.radius;
      const R2 = ball2.radius;


      const SRSquared = Math.pow( R1 + R2, 2 );		//square of center-to-center separation of balls at contact
      const deltaVSquared = deltaV.magnitudeSquared;
      const deltaRDotDeltaV = deltaR.dot( deltaV );
      const deltaRSquared = deltaR.magnitudeSquared;


      const underSqRoot = deltaRDotDeltaV * deltaRDotDeltaV - deltaVSquared * ( deltaRSquared - SRSquared );
      //if collision is superslow, then set collision time = half-way point since last time step
      //of if tiny number precision causes number under square root to be negative

      if ( deltaVSquared < 0.000000001 || underSqRoot < 0 ) {
        tC = lastTime + 0.5 * ( time - lastTime );
      }
      else { //if collision is normal
        let delT;
        if ( this.isReversing ) {
          delT = ( -deltaRDotDeltaV + Math.sqrt( deltaRDotDeltaV * deltaRDotDeltaV - deltaVSquared * ( deltaRSquared - SRSquared ) ) ) / deltaVSquared;
        }
        else {
          delT = ( -deltaRDotDeltaV - Math.sqrt( deltaRDotDeltaV * deltaRDotDeltaV - deltaVSquared * ( deltaRSquared - SRSquared ) ) ) / deltaVSquared;
        }
        tC = lastTime + delT;
      }

      return tC;
    }//end getContactTime()
  }

  return collisionLab.register( 'CollisionDetector', CollisionDetector );
} );