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
  const NumberProperty = require( 'AXON/NumberProperty' );
  const Vector2 = require( 'DOT/Vector2' );
  const Vector2Property = require( 'DOT/Vector2Property' );
  const DerivedProperty = require( 'AXON/DerivedProperty' );

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
      this.radiusProperty = new DerivedProperty( [this.massProperty], mass => 0.15 * Math.pow( this.mass, 1 / 3 ) );

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
     * Gets the velocity of the ball.
     * @public
     * @returns {Vector2}
     */
    get velocity() { return this.positionProperty.value; }

    /**
     * Sets the velocity of the ball.
     * @public
     * @param {Vector2} velocity
     */
    set velocity( velocity ) {
      assert && assert( velocity instanceof Vector2, `invalid velocity: ${velocity}` );
      this.positionProperty.value = velocity;
    }

    /**
     * Gets the kinetic energy of this ball.
     * @returns {number} - Kg * (m/s)^2 = Joules
     * @public
     */
    get kineticEnergy() {
      return 0.5 * this.mass * this.velocity.magnitudeSquared; // KE = (1/2) * m * |v|^2
    }

    /**
     * Gets the linear momentum of this ball.
     * @returns {number} - Kg * (m/s)
     * @public
     */
    get momentum() {
      return this.mass * this.velocity.magnitude; // Momentum = m * v
    }

    /**
     * Disposes this Ball object
     * @public
     */
    dispose() {
      this.disposeBall();
    }

    /**
     * Moves this Ball by one time step.
     * @param {number} dt - time delta, in ps
     * @public
     */
    step( dt ) {
      assert && assert( typeof dt === 'number' && dt > 0, `invalid dt: ${dt}` );

      this.position = new Vector2( this.position.x + dt * this.velocity.x, this.position.y + dt * this.velocity.y );
    }
  }

  return collisionLab.register( 'Ball', Ball );
} );