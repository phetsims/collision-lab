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
  const Vector2Property = require( 'DOT/Vector2Property' );

  class Ball {

    /**
     * @param {number} mass - initial mass of the ball (kg)
     * @param {Vector2} position - initial position of the center of the ball
     * @param {Vector2} velocity - initial velocity of the center of mass of the ball
     */
    constructor( mass, position, velocity ) {

      // @public (read-only) massProperty - Property of the mass of the ball (kg)
      this.massProperty = new NumberProperty( mass );

      // @public (read-only) positionPropety - Property of the center of the ball's position.
      this.positionPropety = new Vector2Property( position );

      // @public (read-only) velocityProperty - Property of the velocity of the center of mass of the ball.
      this.velocityProperty = new Vector2Property( velocity );

      //----------------------------------------------------------------------------------------
      // Handle the changing radius of the Ball based on the mass

      // @public (read-only) - Property of the radius (model) of the ball set to an arbitrary number (to be updated)
      this.radiusProperty = new NumberProperty( 0 );

      const updateRadiusListener = mass => {
        // The radius of the ball is a function of the mass
        this.radius = 0.15 * Math.pow( this.mass, 1 / 3 );
      }
      this.massProperty.link( updateRadiusListener );

      //----------------------------------------------------------------------------------------
      // Handle dispose
      this.disposeBall = () => {
        this.massProperty.unlink( this.radiusProperty );
      }
    }

    /**
     * Sets the mass of the ball.
     * @public
     * @param {number} mass
     */
    set mass( mass ) {
      this.massProperty.vaue = mass;
    }

    /**
     * Gets the mass.
     * @public
     * @returns {number}
     */
    get mass() { return this.massProperty.value; }

    /**
     * time steps for ballistic (unimpeded) motion
     * @param {number} dt
     */
    step( dt ) {
      // TODO
      // this.positionPropety.value.add( this.velocity.timesScalar( dt ) );
    }
  }

  return collisionLab.register( 'Ball', Ball );
} );