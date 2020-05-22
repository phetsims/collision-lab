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
  }

  /*----------------------------------------------------------------------------*
   * Ball To Ball Collisions
   *----------------------------------------------------------------------------*/

  /**
   * A time-discretization approach to detecting and processing ball-ball collisions within a system.
   * This checks to see if a collision has occurred between any two balls in the last time step. If Balls have collided,
   * which is detected if any two balls are on top of each other, then the collision is processed using `collideBalls`.
   * @public
   *
   * See https://en.wikipedia.org/wiki/Collision_detection
   *
   * @param {number} dt - time interval since last step, in seconds.
   */
  handleAllBallToBallCollisions( dt ) {
    assert && assert( typeof dt === 'number', `invalid dt: ${dt}` );

    for ( let i = 0; i < this.balls.length; i++ ) {

      const ball1 = this.balls.get( i );

      for ( let j = i + 1; j < this.balls.length; j++ ) {

        const ball2 = this.balls.get( j );

        assert && assert( ball1 !== ball2, 'ball cannot collide with itself' );

        const distanceBetweenBalls = ball1.position.distance( ball2.position );
        const minimumSeparation = ball1.radius + ball2.radius;

        // If two balls are on top of each other, process the collision.
        if ( distanceBetweenBalls < minimumSeparation ) {
          this.collideBalls( ball1, ball2, dt );
        }
      }
    }
  }

  /**
   * Processes and responds to collision between two balls. Will update the velocity and position of both Balls.
   * @private
   *
   * @param {Ball} ball1 - the first Ball involved in the collision
   * @param {Ball} ball2 - the second Ball involved in the collision.
   * @param {number} dt  - time interval since last step, in seconds.
   */
  collideBalls( ball1, ball2, dt ) {
    assert && assert( ball1 instanceof Ball, `invalid ball1: ${ball1}` );
    assert && assert( ball2 instanceof Ball, `invalid ball1: ${ball1}` );
    assert && assert( typeof dt === 'number', `invalid dt: ${dt}` );

    // When a collision is detected, Balls have already overlapped, so the current positions are not the exact positions
    // when the balls first collided. Use the overlapped time to find the exact collision positions.
    const overlappedTime = this.getBallToBallCollisionOverlapTime( ball1, ball2, dt );

    // Get exact positions when the Balls collided by rewinding.
    const r1 = ball1.getPreviousPosition( overlappedTime );
    const r2 = ball2.getPreviousPosition( overlappedTime );

    const deltaR = r1.minus( r2 );
    const normalizedDeltaR = deltaR.equals( Vector2.ZERO ) ? Vector2.X_UNIT : deltaR.normalized();

    const m1 = ball1.mass;
    const m2 = ball2.mass;
    const v1 = ball1.velocity;
    const v2 = ball2.velocity;

    // Reference the normal and tangential components of initial velocities.
    const v1n = normalizedDeltaR.dot( v1 );
    const v2n = normalizedDeltaR.dot( v2 );
    const v1t = normalizedDeltaR.crossScalar( v1 );
    const v2t = normalizedDeltaR.crossScalar( v2 );

    let e = this.elasticity;
    if ( dt < 0 && this.elasticity > 0 ) { e = 1 / this.elasticity; }

    // Normal components of velocities after collision (P for prime = after)
    const v1nP = ( ( m1 - m2 * e ) * v1n + m2 * ( 1 + e ) * v2n ) / ( m1 + m2 );
    const v2nP = ( ( m2 - m1 * e ) * v2n + m1 * ( 1 + e ) * v1n ) / ( m1 + m2 );

    const isSticky = this.elasticity === 0 && this.isStickyProperty.value;
    const v1tP = isSticky ? ( m1 * v1t + m2 * v2t ) / ( m1 + m2 ) : v1t;
    const v2tP = isSticky ? ( m1 * v1t + m2 * v2t ) / ( m1 + m2 ) : v2t;

    // Normal and tangential component of the velocity after collision
    const v1TN = new Vector2( v1tP, v1nP );
    const v2TN = new Vector2( v2tP, v2nP );

    // Velocity vectors after the collision in the x - y basis
    const v1xP = normalizedDeltaR.crossScalar( v1TN );
    const v1yP = normalizedDeltaR.dot( v1TN );
    const v2xP = normalizedDeltaR.crossScalar( v2TN );
    const v2yP = normalizedDeltaR.dot( v2TN );

    ball1.velocity = new Vector2( v1xP, v1yP );
    ball2.velocity = new Vector2( v2xP, v2yP );

    // Don't allow balls to rebound after collision during time-step of collision. This seems to improve stability.
    ball1.position = r1.plus( ball1.velocity.times( overlappedTime ) );
    ball2.position = r2.plus( ball2.velocity.times( overlappedTime ) );
  }

  /**
   * Reconstructs ballistic motion of two colliding Balls that are overlapping to compute the elapsed time that the
   * 2 colliding Balls were overlapping each other.
   *
   * The contact time is positive if the contact time occurred in the past and negative if the contact time is in the
   * future (which may happened if the simulation is ran in reverse).
   * @private
   *
   * @param {Ball} ball1 - the first Ball involved in the collision
   * @param {Ball} ball2 - the second Ball involved in the collision.
   * @param {number} dt  - time interval since last step, in seconds.
   * @returns {number} contactTime - in seconds
   */
  getBallToBallCollisionOverlapTime( ball1, ball2, dt ) {
    assert && assert( ball1 instanceof Ball, `invalid ball1: ${ball1}` );
    assert && assert( ball2 instanceof Ball, `invalid ball1: ${ball1}` );
    assert && assert( typeof dt === 'number', `invalid dt: ${dt}` );

    let contactTime;

    // Get the position of the Balls in the last time step.
    const r1 = ball1.getPreviousPosition( dt );
    const r2 = ball2.getPreviousPosition( dt );

    // Convenience reference to the velocities of the Balls.
    const v1 = ball1.velocity;
    const v2 = ball2.velocity;

    const deltaR = r2.minus( r1 );
    const deltaV = v2.minus( v1 );

    // The square of center-to-center separation of balls at contact.
    const SRSquared = Math.pow( ball1.radius + ball2.radius, 2 );

    const deltaVSquared = deltaV.magnitudeSquared;
    const deltaRDotDeltaV = deltaR.dot( deltaV );
    const deltaRSquared = deltaR.magnitudeSquared;

    const underSquareRoot = deltaRDotDeltaV * deltaRDotDeltaV - deltaVSquared * ( deltaRSquared - SRSquared );

    // If the collision is super slow, then set collision time equal to the half-way point since last time step
    // of if tiny number precision causes number under square root to be negative.
    if ( deltaVSquared < 1e-7 || underSquareRoot < 0 ) {
      contactTime = 0.5 * ( dt );
    }
    else {

      // the time interval that the collision occurred after the previous time step
      let deltaTimeCorrection;

      if ( dt < 0 ) {
        deltaTimeCorrection = ( -deltaRDotDeltaV + Math.sqrt( underSquareRoot ) ) / deltaVSquared;
      }
      else {
        deltaTimeCorrection = ( -deltaRDotDeltaV - Math.sqrt( underSquareRoot ) ) / deltaVSquared;
      }
      contactTime = dt - deltaTimeCorrection;
    }

    assert && assert( Number.isFinite( contactTime ), `contact time is not finite: ${contactTime}` );
    return contactTime;
  }

  /*----------------------------------------------------------------------------*
   * Ball To Border Collisions
   *----------------------------------------------------------------------------*/

  /**
   * A time-discretization approach to detecting and processing ball-border collisions. This checks to see if a
   * collision has occurred between any balls are overlapping with the border in the last time step, which means the
   * Ball has collided with the border.
   *
   * If a Ball is detected to have collided with the border, then the collision is processed and the velocity and the
   * position of the Ball is updated.
   * @public
   *
   * See https://en.wikipedia.org/wiki/Collision_detection
   *
   * @param {number} dt - time interval since last step, in seconds.
   */
  handleAllBallToBorderCollisions( dt ) {
    assert && assert( typeof dt === 'number', `invalid dt: ${dt}` );

    // Do nothing if the border doesn't reflect Balls, meaning there are no collisions involving the Border.
    if ( !this.reflectingBorderProperty.value ) { return; }

    let elasticity = this.elasticity;
    if ( dt < 0 && this.elasticity > 0 ) {
      elasticity = 1 / this.elasticity;
    }

    this.balls.forEach( ball => {

      // If the Ball is outside the bounds of the PlayArea, it is now colliding with the walls.
      if ( ball.left <= PLAY_AREA_BOUNDS.minX ||
           ball.right >= PLAY_AREA_BOUNDS.maxX ||
           ball.top >= PLAY_AREA_BOUNDS.maxY ||
           ball.bottom <= PLAY_AREA_BOUNDS.minY ) {

        // When a collision is detected, the Ball has already overlapped, so the current positions isn't the exact
        // position when the balls first collided. Use the overlapped time to find the exact collision positions.
        const overlappedTime = this.getBallToBorderCollisionOverlapTime( ball, dt );

        // Get exact position when the Ball collided by rewinding.
        const contactPosition = ball.getPreviousPosition( overlappedTime );

        // Update the velocity after the collision.
        if ( elasticity === 0 && this.isStickyProperty.value ) {

          // If the collision is inelastic and sticky, the Ball has zero velocity after the collision.
          ball.velocity = Vector2.ZERO;
        }
        else {
          if ( ball.left <= PLAY_AREA_BOUNDS.minX || ball.right >= PLAY_AREA_BOUNDS.maxX ) {

            // Left and Right Border wall collisions incur a flip in horizontal velocity.
            ball.flipHorizontalVelocity( elasticity );
          }
          if ( ball.top >= PLAY_AREA_BOUNDS.maxY || ball.bottom <= PLAY_AREA_BOUNDS.minY ) {

            // Top and Bottom Border wall collisions incur a flip in horizontal velocity.
            ball.flipVerticalVelocity( elasticity );
          }
        }

        // Update the position after the collision.
        ball.position = contactPosition.plus( ball.velocity.times( overlappedTime ) );
      }
    } );
  }

  /**
   * Reconstructs ballistic motion of a Ball that is overlapping with a border to compute the elapsed time that the
   * colliding Ball was overlapping with the border.
   *
   * The contact time is positive if the contact time occurred in the past and negative if the contact time is in the
   * future (which may happened if the simulation is ran in reverse).
   * @private
   *
   * @param {Ball} ball - the ball involved in the collision
   * @returns {number} contactTime - in seconds
   */
  getBallToBorderCollisionOverlapTime( ball, dt ) {
    assert && assert( ball instanceof Ball, `invalid Ball: ${ball}` );
    assert && assert( typeof dt === 'number', `invalid dt: ${dt}` );

    // Reference position difference between the current and previous position.
    const deltaR = ball.velocity.timesScalar( dt );

    const erodedBounds = PLAY_AREA_BOUNDS.eroded( ball.radius );

    const closestPoint = erodedBounds.closestPointTo( ball.position );

    const offsetPoint = closestPoint.minus( ball.position );

    let contactTime;
    if ( deltaR.dot( offsetPoint ) === 0 ) {
      contactTime = 0;
    }
    else {
      contactTime = offsetPoint.magnitudeSquared / -deltaR.dot( offsetPoint ) * dt;
    }
    assert && assert( Number.isFinite( contactTime ), `contact time is not finite: ${contactTime}` );
    return contactTime;
  }

  //----------------------------------------------------------------------------------------

  /**
   * Convenience method to get the elasticity of all collisions, as a decimal.
   * @public
   *
   * @returns {number} elasticity
   */
  get elasticity() { return this.elasticityPercentProperty.value / 100; }
}

collisionLab.register( 'CollisionDetector', CollisionDetector );
export default CollisionDetector;