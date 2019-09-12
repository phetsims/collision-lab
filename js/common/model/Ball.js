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

      this.mass = mass;
      this.radius = 0.15 * Math.pow( this.mass, 1 / 3 );
      this.position = position;
      this.velocity = velocity;
      this.momentum = new TwoVector( this.mass * this.velocity.getX(), this.mass * this.velocity.getY() );

    }

    // @public resets the model
    reset() {
      //TODO Reset things here.
    }

    //following to used to reset existing ball object to initial configuration in Model
    setBall( mass, position, velocity ) {
      this.mass = mass;
      this.radius = 0.15 * Math.pow( this.mass, 1 / 3 );
      this.position = position;
      this.velocity = velocity;
      this.momentum = new TwoVector( this.mass * this.velocity.getX(), this.mass * this.velocity.getY() );
    }

    setMass( mass ) {
      this.mass = mass;
      this.radius = 0.15 * Math.pow( this.mass, 1 / 3 );
    }

    //reset position to position at previous timestep
    backupOneStep() {
      this.position.setXY( this.position.getXLast(), this.position.getYLast() );
    }

    getMass() {
      return this.mass;
    }

    getRadius() {
      return this.radius;
    }

    getMomentum() {
      this.momentum.setXY( this.mass * this.velocity.getX(), this.mass * this.velocity.getY() );
      return this.momentum;
    }

    getKE() {
      const speed = this.velocity.getMagnitude();
      return 0.5 * this.mass * speed * speed;
    }

    reverseVelocity() {
      this.velocity.flipVector();
    }

  }

  return collisionLab.register( 'Ball', Ball );
} );




