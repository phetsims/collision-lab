// Copyright 2019, University of Colorado Boulder

/**
 * CollisionDetector handles collision detection and response for all screens. Our collision model involves
 * rigid bodies. Once a collision is detected, the appropriate ball models are set to update their new velocity
 * and position.
 *
 * The algorithms for particle-particle collisions were adapted from the flash
 * implementation of Collision Lab. They follow the standard rigid-body collision model as described in (e.g.)
 * http://web.mst.edu/~reflori/be150/Dyn%20Lecture%20Videos/Impact%20Particles%201/Impact%20Particles%201.pdf.
 *
 * @author Brandon Li
 * @author Martin Veillette
 */

define( require => {
  'use strict';

  // modules
  // const PlayArea = require( 'COLLISION_LAB/common/model/PlayArea' );
  const Ball = require( 'COLLISION_LAB/common/model/Ball' );
  const collisionLab = require( 'COLLISION_LAB/collisionLab' );
  const NumberProperty = require( 'AXON/NumberProperty' );
  const ObservableArray = require( 'AXON/ObservableArray' );
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
      assert && assert( balls instanceof ObservableArray
      && balls.count( ball => ball instanceof Ball ) === balls.length, `invalid balls: ${balls}` );
      assert && assert( elasticityProperty instanceof NumberProperty, `invalid elasticityProperty: ${elasticityProperty}` );
      assert && assert( !options || Object.getPrototypeOf( options ) === Object.prototype,
        `Extra prototype on Options: ${options}` );

      // @private
      this.bounds = bounds;

      // @private
      this.balls = balls;

      // @private
      this.nbrCollisionsInThisTimeStep = 0;

      // @private
      this.elasticityProperty = elasticityProperty;

      // @private
      this.isReversing = false;

    }

    /**
     * @public
     * @param {number} lastTime  - time of previous step
     * @param {number} time - current time
     */
    detectCollision( lastTime, time ) {

      assert && assert( typeof lastTime === 'number', `invalid lastTime: ${lastTime}` );
      assert && assert( typeof time === 'number', `invalid time: ${time}` );

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
     * Process the collision updating the velocities and positions of ball 1 and ball 2
     * @private
     * @param {Ball} ball1
     * @param {Ball} ball2
     * @param {number} lastTime  - time of previous step
     * @param {number} time - current time
     */
    collideBalls( ball1, ball2, lastTime, time ) {

      assert && assert( _.every( [ball1, ball2], ball => ball instanceof Ball ) );
      assert && assert( typeof lastTime === 'number', `invalid lastTime: ${lastTime}` );
      assert && assert( typeof time === 'number', `invalid time: ${time}` );

      const e = this.elasticityProperty.value;

      // Balls have already overlapped, so currently have incorrect positions
      // find time of the collision
      const contactTime = this.getContactTime( ball1, ball2, lastTime, time );

      // time to rewind the positions to
      const offsetTime = time - contactTime;

      // get positions at time of collision, rewind position time.
      const r1 = ball1.getPreviousPosition( offsetTime );
      const r2 = ball2.getPreviousPosition( offsetTime );

      const deltaR = r1.minus( r2 );
      const normalizedDeltaR = deltaR.normalized();

      const m1 = ball1.mass;
      const m2 = ball2.mass;
      const v1 = ball1.velocity;
      const v2 = ball2.velocity;

      // normal and tangential components of initial velocities

      const v1n = normalizedDeltaR.dot( v1 );
      const v2n = normalizedDeltaR.dot( v2 );
      const v1t = normalizedDeltaR.crossScalar( v1 );
      const v2t = normalizedDeltaR.crossScalar( v2 );

      // normal components of velocities after collision (P for prime = after)
      const v1nP = ( ( m1 - m2 * e ) * v1n + m2 * ( 1 + e ) * v2n ) / ( m1 + m2 );
      const v2nP = ( ( m2 - m1 * e ) * v2n + m1 * ( 1 + e ) * v1n ) / ( m1 + m2 );

      // normal and tangential component of the velocity after collision
      const v1TN = new Vector2( v1t, v1nP );
      const v2TN = new Vector2( v2t, v2nP );

      // velocity vectors after the collision in the x - y basis
      const v1xP = normalizedDeltaR.crossScalar( v1TN );
      const v1yP = normalizedDeltaR.dot( v1TN );
      const v2xP = normalizedDeltaR.crossScalar( v2TN );
      const v2yP = normalizedDeltaR.dot( v2TN );

      ball1.velocity = new Vector2( v1xP, v1yP );
      ball2.velocity = new Vector2( v2xP, v2yP );

      // Don't allow balls to rebound after collision during timestep of collision
      // this seems to improve stability
      ball1.position = r1.plus( ball1.velocity.times( offsetTime ) );
      ball2.position = r2.plus( ball2.velocity.times( offsetTime ) );

    }

    /**
     * Gets contact time between ball 1 and ball 2
     * @private
     * @param {Ball} ball1
     * @param {Ball} ball2
     * @param {number} lastTime - time of previous step
     * @param {number} time - current time
     * @returns {number} contactTime in seconds
     */
    getContactTime( ball1, ball2, lastTime, time ) {

      assert && assert( _.every( [ball1, ball2], ball => ball instanceof Ball ) );
      assert && assert( typeof lastTime === 'number', `invalid lastTime: ${lastTime}` );
      assert && assert( typeof time === 'number', `invalid time: ${time}` );

      let contactTime = 0;  //contact time

      // get previous positions
      const r1 = ball1.getPreviousPosition( time - lastTime );
      const r2 = ball2.getPreviousPosition( time - lastTime );

      // velocities
      const v1 = ball1.velocity;
      const v2 = ball2.velocity;

      const deltaR = r2.minus( r1 );
      const deltaV = v2.minus( v1 );

      // TODO: some of these steps need more documentation

      // square of center-to-center separation of balls at contact
      const SRSquared = Math.pow( ball1.radius + ball2.radius, 2 );


      const deltaVSquared = deltaV.magnitudeSquared;
      const deltaRDotDeltaV = deltaR.dot( deltaV );
      const deltaRSquared = deltaR.magnitudeSquared;

      const underSquareRoot = deltaRDotDeltaV * deltaRDotDeltaV - deltaVSquared * ( deltaRSquared - SRSquared );

      // if collision is superslow, then set collision time = half-way point since last time step
      // of if tiny number precision causes number under square root to be negative
      if ( deltaVSquared < 1e-7 || underSquareRoot < 0 ) {
        contactTime = lastTime + 0.5 * ( time - lastTime );
      }
      else { // if collision is normal

        // the time interval that the collision occurred after lastTime
        let deltaT;
        if ( this.isReversing ) {
          deltaT = ( -deltaRDotDeltaV + Math.sqrt( underSquareRoot ) ) / deltaVSquared;
        }
        else {
          deltaT = ( -deltaRDotDeltaV - Math.sqrt( underSquareRoot ) ) / deltaVSquared;
        }
        contactTime = lastTime + deltaT;
      }

      return contactTime;
    }

    /**
     * Detects and handles ball-border collisions. A collision occurred if a ball contacted a wall on
     * its way to its current location. The appropriate velocity component is then updated  and the
     * ball is positioned within the bounds.
     * @public
     */
    doBallBorderCollisions() {

      // TODO: the position could be more precise if the timing of the collision was determined.
      this.balls.forEach( ball => {

        // left and right walls
        if ( ball.left <= this.bounds.minX ) {
          ball.flipHorizontalVelocity( this.elasticityProperty.value );
          ball.left = this.bounds.minX;
        }
        else if ( ball.right >= this.bounds.maxX ) {
          ball.flipHorizontalVelocity( this.elasticityProperty.value );
          ball.right = this.bounds.maxX;
        }

        // top and bottom walls
        if ( ball.top >= this.bounds.maxY ) {
          ball.flipVerticalVelocity( this.elasticityProperty.value );
          ball.top = this.bounds.maxY;
        }
        else if ( ball.bottom <= this.bounds.minY ) {
          ball.flipVerticalVelocity( this.elasticityProperty.value );
          ball.bottom = this.bounds.minY;
        }
      } );
    }
  }

  return collisionLab.register( 'CollisionDetector', CollisionDetector );
} );
