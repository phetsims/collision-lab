// Copyright 2019, University of Colorado Boulder

/**
 * A Ball is the model for all types of balls.
 *
 * @author Martin Veillette
 * @author Brandon Li
 */

define( require => {
  'use strict';

  // modules
  const collisionLab = require( 'COLLISION_LAB/collisionLab' );
  const DerivedProperty = require( 'AXON/DerivedProperty' );
  const NumberProperty = require( 'AXON/NumberProperty' );
  const Vector2 = require( 'DOT/Vector2' );
  const Vector2Property = require( 'DOT/Vector2Property' );

  class Ball {

    /**
     * @param {number} mass - initial mass of the ball (kg)
     * @param {Vector2} position - initial position of the center of the ball
     * @param {Vector2} velocity - initial velocity of the center of mass of the ball
     */
    constructor( mass, position, velocity ) {

      assert && assert( typeof mass === 'number' && mass > 0, `invalid mass: ${mass}` );
      assert && assert( position instanceof Vector2, `invalid position: ${position}` );
      assert && assert( velocity instanceof Vector2, `invalid velocity: ${velocity}` );

      //----------------------------------------------------------------------------------------

      // @public (read-only) massProperty - Property of the mass of the ball (kg)
      this.massProperty = new NumberProperty( mass );

      // @public (read-only) positionProperty - Property of the center of the ball's position.
      this.positionProperty = new Vector2Property( position );

      // @public (read-only) velocityProperty - Property of the velocity of the center of mass of the ball.
      this.velocityProperty = new Vector2Property( velocity );

      //----------------------------------------------------------------------------------------
      // Handle the changing radius of the Ball based on the mass

      // @public (read-only) - Property of the radius (model) of the ball
      this.radiusProperty = new DerivedProperty( [ this.massProperty ], mass => 0.15 * Math.pow( mass, 1 / 3 ) );

    }

    /**
     * Gets the mass.
     * @public
     * @returns {number}
     */
    get mass() { return this.massProperty.value; }

    /**
     * Sets the mass of the ball.
     * @public
     * @param {number} mass
     */
    set mass( mass ) {
      assert && assert( typeof mass === 'number' && mass > 0, `invalid mass: ${mass}` );
      this.massProperty.value = mass;
    }

    /**
     * Gets the radius.
     * @public
     * @returns {number}
     */
    get radius() { return this.radiusProperty.value; }

    /**
     * Gets the position of the ball.
     * @public
     * @returns {Vector2}
     */
    get position() { return this.positionProperty.value; }

    /**
     * Sets the position of the ball.
     * @public
     * @param {Vector2} position
     */
    set position( position ) {
      assert && assert( position instanceof Vector2, `invalid position: ${position}` );
      this.positionProperty.value = position;
    }

    /**
     * Gets the left bound of the ball
     * @public
     * @returns {number}
     */
    get left() { return this.position.x - this.radius; }

    /**
     * Sets the left bound of the ball
     * @public
     * @param {number} left
     */
    set left( left ) {
      this.position.setX( left + this.radius );
    }

    /**
     * Gets the right bound of the ball.
     * @public
     * @returns {number}
     */
    get right() { return this.position.x + this.radius; }

    /**
     * Sets the left bound of the ball
     * @public
     * @param {number} right
     */
    set right( right ) {
      this.position.setX( right - this.radius );
    }

    /**
     * Gets the top bound of the ball
     * @public
     * @returns {number}
     */
    get top() { return this.position.y + this.radius; }

    /**
     * Sets the top bound of the ball
     * @public
     * @param {number} top
     */
    set top( top ) {
      this.position.setY( top - this.radius );
    }

    /**
     * Gets the bottom bound of the ball.
     * @public
     * @returns {number}
     */
    get bottom() { return this.position.y - this.radius; }

    /**
     * Sets the bottom bound of the ball
     * @public
     * @param {number} bottom
     */
    set bottom( bottom ) {
      this.position.setY( bottom + this.radius );
    }

    /**
     * Gets the first moment of the ball, i.e.  mass* position
     * @public
     * @returns {Vector2}  kg * m
     */
    get firstMoment() { return this.position.times( this.mass ); }

    /**
     * Gets the velocity of the ball.
     * @public
     * @returns {Vector2}
     */
    get velocity() { return this.velocityProperty.value; }

    /**
     * Sets the velocity of the ball.
     * @public
     * @param {Vector2} velocity
     */
    set velocity( velocity ) {
      assert && assert( velocity instanceof Vector2, `invalid velocity: ${velocity}` );
      this.velocityProperty.value = velocity;
    }

    /**
     * Gets the kinetic energy of this ball.
     * @returns {number} - kg * (m/s)^2 = Joules
     * @public
     */
    get kineticEnergy() {
      return 0.5 * this.mass * this.velocity.magnitudeSquared; // KE = (1/2) * m * |v|^2
    }

    /**
     * Gets the linear momentum of this ball.
     * @returns {Vector2} - kg * (m/s)
     * @public
     */
    get momentum() {
      return this.velocity.times( this.mass ); // Momentum = m * v
    }

    /**
     * Resets the ball properties.
     * @public
     */
    reset() {
      this.massProperty.reset();
      this.positionProperty.reset();
      this.velocityProperty.reset();
    }

    /**
     * Flips the horizontal velocity of the ball up to a scaling factor (ranging from 0 to 1)
     * @public
     * @param {number} scaling
     */
    flipHorizontalVelocity( scaling ) {
      assert && assert( typeof scaling === 'number' && scaling >= 0 && scaling <= 1, `invalid dt: ${scaling}` );
      this.velocity.x *= -1 * scaling;
    }

    /**
     * Flips the vertical velocity of the ball up to a scaling factor (ranging from 0 to 1)
     * @public
     * @param {number} scaling
     */
    flipVerticalVelocity( scaling ) {
      assert && assert( typeof scaling === 'number' && scaling >= 0 && scaling <= 1, `invalid dt: ${scaling}` );
      this.velocity.y *= -1 * scaling;
    }

    /**
     * Gets the position of the ball at some time interval dt (assuming ballistic motion)
     * @public
     * @param {number} dt - time step
     * @returns {Vector2}
     */
    getPreviousPosition( dt ) {
      return this.position.minus( this.velocity.times( dt ) );
    }

    /**
     * Moves this Ball by one time step (assuming ballistic motion).
     * @param {number} dt - time in seconds
     * @public
     */
    step( dt ) {
      assert && assert( typeof dt === 'number' && dt > 0, `invalid dt: ${dt}` );

      this.position = this.position.plus( this.velocity.times( dt ) );
    }
  }

  return collisionLab.register( 'Ball', Ball );
} );