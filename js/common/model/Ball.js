// Copyright 2019, University of Colorado Boulder

/**
 * Ball object
 * @author Martin Veillette
 */
define( require => {
  'use strict';

  // modules
  const collisionLab = require( 'COLLISION_LAB/collisionLab' );

  /**
   * @constructor
   */
  class Ball {

    /**
     * @param {number} mass
     * @param {Vector2} position
     * @param {Vector2} velocity
     */
    constructor( mass, position, velocity ) {

      this.setBall( mass, position, velocity );
    }

    /**
     * Sets the parameter for the ball
     * @param {number} mass
     * @param {Vector2} position
     * @param {Vector2} velocity
     */
    setBall( mass, position, velocity ) {
      this.setMass( mass );
      this.position = position;
      this.velocity = velocity;
    }

    /**
     * Sets the mass of the ball
     * @param {number} mass
     */
    setMass( mass ) {
      this.mass = mass;
      this.radius = 0.15 * Math.pow( this.mass, 1 / 3 );
    }

    /**
     * Gets the mass of ball
     * @returns {number}
     */
    getMass() {
      return this.mass;
    }

    /**
     * Gets the radius of the ball
     * @returns {number}
     */
    getRadius() {
      return this.radius;
    }

    /**
     * Gets the momentum of the ball
     * @returns {Vector2}
     */
    getMomentum() {
      return this.velocity.timesScalar( this.mass );
    }

    /**
     * Gets the first moment of the ball (position times mass)
     * @returns {Vector2}
     */
    getFirstMoment() {
      return this.position.timesScalar( this.mass );
    }

    /**
     * Gets the kinetic energy of the ball
     * @returns {number}
     */
    getKE() {
      return 0.5 * this.mass * this.velocity.getMagnitudeSquared();
    }

    /**
     * Reverses the velocity of the ball
     */
    reverseVelocity() {
      this.velocity.multiplyScalar( -1 );
    }

    /**
     * time steps for ballistic (unimpeded) motion
     * @param {number} dt
     */
    step( dt ) {
      this.position.add( this.velocity.timesScalar( dt ) );
    }
  }

  return collisionLab.register( 'Ball', Ball );
} );




