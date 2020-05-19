// Copyright 2019-2020, University of Colorado Boulder

/**
 * CollisionDetector handles collision all detection and responses for all screens within a PlayArea. Our collision
 * model involves rigid bodies. Once a collision is detected, the appropriate ball models are set to update their
 * new velocity and position.
 *
 * The algorithms for Ball collisions were adapted from the flash implementation of Collision Lab. They follow the
 * standard rigid-body collision model as described in
 * http://web.mst.edu/~reflori/be150/Dyn%20Lecture%20Videos/Impact%20Particles%201/Impact%20Particles%201.pdf.
 *
 * @author Brandon Li
 * @author Martin Veillette
 */

import ObservableArray from '../../../../axon/js/ObservableArray.js';
import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import Ball from './Ball.js';

// constants
const PLAY_AREA_BOUNDS = CollisionLabConstants.PLAY_AREA_BOUNDS;

class CollisionDetector {

  /**
   * @param {ObservableArray.<Ball>} balls - collections of balls
   * @param {Property.<number>} elasticityPercentProperty
   * @param {Property.<boolean>} reflectingBorderProperty
   * @param {Property.<boolean>} isStickyProperty - indicates if inelastic collisions stick or slide.
   */
  constructor( balls, elasticityPercentProperty, reflectingBorderProperty, isStickyProperty ) {
    assert && assert( balls instanceof ObservableArray && balls.count( ball => ball instanceof Ball ) === balls.length, `invalid balls: ${balls}` );
    assert && assert( elasticityPercentProperty instanceof Property, `invalid elasticityPercentProperty: ${elasticityPercentProperty}` );

    // @private {ObservableArray.<balls>}
    this.balls = balls;

    // @private {Property.<number>}
    this.elasticityPercentProperty = elasticityPercentProperty;

    // @private {Property.<boolean>}
    this.reflectingBorderProperty = reflectingBorderProperty;

    // @private {Property.<boolean>}
    this.isStickyProperty = isStickyProperty;

    //----------------------------------------------------------------------------------------

    // @public {boolean} - flag that indicates if
    this.isReversing = false;
  }

  /**
   * @public
   * @param {number} dt  - time interval since last step
   */
  detectCollision( dt ) {

    assert && assert( typeof dt === 'number', `invalid dt: ${dt}` );

    const N = this.balls.length;
    for ( let i = 0; i < N; i++ ) {
      const ball1 = this.balls.get( i );
      for ( let j = i + 1; j < N; j++ ) {

        const ball2 = this.balls.get( j );
        const distance = ball1.position.distance( ball2.position );
        const minimumSeparation = ball1.radius + ball2.radius;
        if ( distance < minimumSeparation ) {
          this.collideBalls( ball1, ball2, dt );
        }
      }
    }
  }

  /**
   * Determines the number of collisions that need to be processed within time interval
   * Used for debugging purposes.
   * @public
   */
  collisionLogger() {

    const N = this.balls.length;

    // array of balls tha need processing in this time interval, initialize to zero
    const collidingBallArray = Array( N - 1 ).fill( 0 );

    for ( let i = 0; i < N; i++ ) {
      const ball1 = this.balls.get( i );

      // determine if ball1 is outside the playArea
      if ( !( PLAY_AREA_BOUNDS.eroded( ball1.radius ).containsPoint( ball1.position ) ) ) {
        collidingBallArray[ i ]++;
      }

      for ( let j = i + 1; j < N; j++ ) {
        const ball2 = this.balls.get( j );
        const distance = ball1.position.distance( ball2.position );
        const minimumSeparation = ball1.radius + ball2.radius;

        // determine if ball1 and ball2 are overlapping
        if ( distance < minimumSeparation ) {
          collidingBallArray[ i ]++;
          collidingBallArray[ j ]++;
        }
      }
    }
    // report if some balls are undergoing multiple collision processes in time interval.
    if ( collidingBallArray.some( value => value > 1 ) ) {
      console.log( collidingBallArray );
    }

  }

  /**
   * Process the collision updating the velocities and positions of ball 1 and ball 2
   * @private
   * @param {Ball} ball1
   * @param {Ball} ball2
   * @param {number} deltaTime  - time interval since last step
   */
  collideBalls( ball1, ball2, deltaTime ) {

    assert && assert( _.every( [ ball1, ball2 ], ball => ball instanceof Ball ) );
    assert && assert( typeof deltaTime === 'number', `invalid deltaTime: ${deltaTime}` );

    // Balls have already overlapped, so currently have incorrect positions
    // find time of the collision such that we can rewind the positions to this time
    const offsetTime = -this.getContactTime( ball1, ball2, deltaTime );

    // get positions at time of collision, rewind position time.
    const r1 = ball1.getPreviousPosition( offsetTime );
    const r2 = ball2.getPreviousPosition( offsetTime );

    const deltaR = r1.minus( r2 );
    const normalizedDeltaR = deltaR.equals( Vector2.ZERO ) ? Vector2.X_UNIT : deltaR.normalized();

    const m1 = ball1.mass;
    const m2 = ball2.mass;
    const v1 = ball1.velocity;
    const v2 = ball2.velocity;

    // normal and tangential components of initial velocities

    const v1n = normalizedDeltaR.dot( v1 );
    const v2n = normalizedDeltaR.dot( v2 );
    const v1t = normalizedDeltaR.crossScalar( v1 );
    const v2t = normalizedDeltaR.crossScalar( v2 );

    let e = ( this.elasticityPercentProperty.value / 100 );
    if ( this.isReversing && ( this.elasticityPercentProperty.value / 100 ) > 0 ) {
      e = 1 / ( this.elasticityPercentProperty.value / 100 );
    }

    // normal components of velocities after collision (P for prime = after)
    const v1nP = ( ( m1 - m2 * e ) * v1n + m2 * ( 1 + e ) * v2n ) / ( m1 + m2 );
    const v2nP = ( ( m2 - m1 * e ) * v2n + m1 * ( 1 + e ) * v1n ) / ( m1 + m2 );

    const isSticky = ( this.elasticityPercentProperty.value / 100 ) === 0 && this.isStickyProperty.value;
    const v1tP = isSticky ? ( m1 * v1t + m2 * v2t ) / ( m1 + m2 ) : v1t;
    const v2tP = isSticky ? ( m1 * v1t + m2 * v2t ) / ( m1 + m2 ) : v2t;

    // normal and tangential component of the velocity after collision
    const v1TN = new Vector2( v1tP, v1nP );
    const v2TN = new Vector2( v2tP, v2nP );

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
   * Gets the contact time between ball 1 and ball 2
   * At t=0, (now) the ball1 and ball2 are overlapping whereas they were not at t=-deltaTime beforehand
   * This algorithm reconstruct the ballistic motion to determines the contact
   * time (measured from present time t=0) where the two balls started to make contact with one another
   * The contact time is negative if the contact time occurred in the past and positive if the contact time is on the future
   * (which may happened if the simulation is ran in reversed)
   * @private
   * @param {Ball} ball1
   * @param {Ball} ball2
   * @param {number} deltaTime  - time interval since last step
   * @returns {number} contactTime - in seconds
   */
  getContactTime( ball1, ball2, deltaTime ) {

    assert && assert( _.every( [ ball1, ball2 ], ball => ball instanceof Ball ) );
    assert && assert( typeof deltaTime === 'number', `invalid deltaTime: ${deltaTime}` );

    let contactTime;  // contact time (in seconds) of the collision,

    // get previous positions
    const r1 = ball1.getPreviousPosition( deltaTime );
    const r2 = ball2.getPreviousPosition( deltaTime );

    // velocities
    const v1 = ball1.velocity;
    const v2 = ball2.velocity;

    const deltaR = r2.minus( r1 );
    const deltaV = v2.minus( v1 );

    // square of center-to-center separation of balls at contact
    const SRSquared = Math.pow( ball1.radius + ball2.radius, 2 );

    const deltaVSquared = deltaV.magnitudeSquared;
    const deltaRDotDeltaV = deltaR.dot( deltaV );
    const deltaRSquared = deltaR.magnitudeSquared;

    const underSquareRoot = deltaRDotDeltaV * deltaRDotDeltaV - deltaVSquared * ( deltaRSquared - SRSquared );

    // if collision is superslow, then set collision time = half-way point since last time step
    // of if tiny number precision causes number under square root to be negative
    if ( deltaVSquared < 1e-7 || underSquareRoot < 0 ) {
      contactTime = -0.5 * ( deltaTime );
    }
    else { // if collision is normal

      // the time interval that the collision occurred after the previous time step
      let deltaTimeCorrection;

      if ( this.isReversing ) {
        deltaTimeCorrection = ( -deltaRDotDeltaV + Math.sqrt( underSquareRoot ) ) / deltaVSquared;
      }
      else {
        deltaTimeCorrection = ( -deltaRDotDeltaV - Math.sqrt( underSquareRoot ) ) / deltaVSquared;
      }
      contactTime = -deltaTime + deltaTimeCorrection;
    }

    assert && assert( Number.isFinite( contactTime ), `contact time is not finite: ${contactTime}` );
    return contactTime;
  }

  /**
   * Detects and handles ball-border collisions. A collision occurred if a ball contacted a wall on
   * its way to its current position. The appropriate velocity component is then updated  and the
   * ball is positioned within the bounds.
   * @public
   */
  doBallBorderCollisions() {


    if ( this.reflectingBorderProperty.value ) {
      this.balls.forEach( ball => {

        let elasticity = ( this.elasticityPercentProperty.value / 100 );
        if ( this.isReversing && ( this.elasticityPercentProperty.value / 100 ) > 0 ) {
          elasticity = 1 / ( this.elasticityPercentProperty.value / 100 );
        }

        // left and right walls
        if ( ball.left <= PLAY_AREA_BOUNDS.minX ) {
          ball.flipHorizontalVelocity( elasticity );
          ball.left = PLAY_AREA_BOUNDS.minX;
        }
        else if ( ball.right >= PLAY_AREA_BOUNDS.maxX ) {
          ball.flipHorizontalVelocity( elasticity );
          ball.right = PLAY_AREA_BOUNDS.maxX;
        }

        // top and bottom walls
        if ( ball.top >= PLAY_AREA_BOUNDS.maxY ) {
          ball.flipVerticalVelocity( elasticity );
          ball.top = PLAY_AREA_BOUNDS.maxY;
        }
        else if ( ball.bottom <= PLAY_AREA_BOUNDS.minY ) {
          ball.flipVerticalVelocity( elasticity );
          ball.bottom = PLAY_AREA_BOUNDS.minY;
        }
      } );
    }
  }

  /**
   * Detects and handles ball-border collisions. A collision occurred if a ball contacted a wall on
   * its way to its current position. The appropriate velocity component is then updated  and the
   * ball is positioned within the bounds.
   * @param {number} deltaTime  - time interval since last step
   * @public
   */
  doBallBorderCollisionsImproved( deltaTime ) {

    if ( this.reflectingBorderProperty.value ) {

      let elasticity = ( this.elasticityPercentProperty.value / 100 );
      if ( this.isReversing && ( this.elasticityPercentProperty.value / 100 ) > 0 ) {
        elasticity = 1 / ( this.elasticityPercentProperty.value / 100 );
      }

      this.balls.forEach( ball => {

        //TODO: consolidate  the if statements
        // left and right walls
        if ( ball.left <= PLAY_AREA_BOUNDS.minX || ball.right >= PLAY_AREA_BOUNDS.maxX ) {

          const offsetTime = -this.getWallContactTime( ball, deltaTime );

          // get positions at time of collision, rewind position time.
          const contactPosition = ball.getPreviousPosition( offsetTime );

          if ( ( this.elasticityPercentProperty.value / 100 ) === 0 && this.isStickyProperty.value ) {
            ball.velocity = Vector2.ZERO;
          }
          else {
            ball.flipHorizontalVelocity( elasticity );
          }

          ball.position = contactPosition.plus( ball.velocity.times( offsetTime ) );

        }

        // top and bottom walls
        if ( ball.top >= PLAY_AREA_BOUNDS.maxY || ball.bottom <= PLAY_AREA_BOUNDS.minY ) {

          const offsetTime = -this.getWallContactTime( ball, deltaTime );

          // get positions at time of collision, rewind position time.
          const contactPosition = ball.getPreviousPosition( offsetTime );

          if ( ( this.elasticityPercentProperty.value / 100 ) === 0 && this.isStickyProperty.value ) {
            ball.velocity = Vector2.ZERO;
          }
          else {
            ball.flipVerticalVelocity( elasticity );
          }

          ball.position = contactPosition.plus( ball.velocity.times( offsetTime ) );

        }
      } );
    }
  }

  /**
   * Gets the contact time between ball and wall
   * @private
   * @param {Ball} ball
   * @param {number} deltaTime  - time interval since last step
   * @returns {number} contactTime - in seconds
   */
  getWallContactTime( ball, deltaTime ) {

    assert && assert( ball instanceof Ball, `invalid Ball: ${ball}` );
    assert && assert( typeof deltaTime === 'number', `invalid deltaTime: ${deltaTime}` );

    // get position difference between current and previous position
    const deltaR = ball.velocity.timesScalar( deltaTime );

    const erodedBounds = PLAY_AREA_BOUNDS.eroded( ball.radius );

    const closestPoint = erodedBounds.closestPointTo( ball.position );

    const offsetPoint = closestPoint.minus( ball.position );

    let contactTime;
    if ( deltaR.dot( offsetPoint ) === 0 ) {
      contactTime = 0;
    }
    else {
      contactTime = offsetPoint.magnitudeSquared / deltaR.dot( offsetPoint ) * deltaTime;
    }
    assert && assert( Number.isFinite( contactTime ), `contact time is not finite: ${contactTime}` );
    return contactTime;
  }
}

collisionLab.register( 'CollisionDetector', CollisionDetector );
export default CollisionDetector;
