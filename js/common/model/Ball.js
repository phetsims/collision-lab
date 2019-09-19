// Copyright 2019, University of Colorado Boulder

/**
 * Ball object
 * @author Martin Veillette
 */
define( require => {
  'use strict';

  // modules
  const collisionLab = require( 'COLLISION_LAB/collisionLab' );
  const TwoVector = require( 'COLLISION_LAB/common/model/TwoVector' );

  /**
   * @constructor
   */
  class Ball {

    /**
     * @param {number} mass
     * @param {TwoVector} position
     * @param {TwoVector} velocity
     */
    constructor( mass, position, velocity ) {

      this.setBall(mass, position, velocity);
    }

    // @public resets the model
    reset() {
      //TODO Reset things here.
    }

    //following to used to reset existing ball object to initial configuration in Model

    /**
     *
     * @param {number}mass
     * @param {TwoVector} position
     * @param {TwoVector} velocity
     */
    setBall( mass, position, velocity ) {
      this.mass = mass;
      this.radius = 0.15 * Math.pow( this.mass, 1 / 3 );
      this.position = position;
      this.velocity = velocity;
      this.momentum = new TwoVector( this.mass * this.velocity.getX(), this.mass * this.velocity.getY() );
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
     * Resets position to position at previous timestep
     */
    backupOneStep() {
      this.position.setXY( this.position.getXLast(), this.position.getYLast() );
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
     * Get the momentum of the ball
     * @returns {TwoVector}
     */
    getMomentum() {
      this.momentum.setXY( this.mass * this.velocity.getX(), this.mass * this.velocity.getY() );
      return this.momentum;
    }

    /**
     *  Gets the kinetic energy of the ball
     * @returns {number}
     */
    getKE() {
      const speed = this.velocity.getMagnitude();
      return 0.5 * this.mass * speed * speed;
    }

    /**
     * Reverses the velocity of the ball
     */
    reverseVelocity() {
      this.velocity.flipVector();
    }

  }

  return collisionLab.register( 'Ball', Ball );
} );




