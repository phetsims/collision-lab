// Copyright 2019-2020, University of Colorado Boulder

/**
 * A Ball is the model for all types of balls.
 *
 * @author Martin Veillette
 * @author Brandon Li
 */

define( require => {
  'use strict';

  // modules
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const collisionLab = require( 'COLLISION_LAB/collisionLab' );
  const CollisionLabConstants = require( 'COLLISION_LAB/common/CollisionLabConstants' );
  const DerivedProperty = require( 'AXON/DerivedProperty' );
  const NumberProperty = require( 'AXON/NumberProperty' );
  const Property = require( 'AXON/Property' );
  const Utils = require( 'DOT/Utils' );
  const Vector2 = require( 'DOT/Vector2' );
  const Vector2Property = require( 'DOT/Vector2Property' );

  // constants
  const DEFAULT_RADIUS = CollisionLabConstants.DEFAULT_RADIUS; // in meters
  const MINOR_GRIDLINE_SPACING = CollisionLabConstants.MINOR_GRIDLINE_SPACING;

  class Ball {

    /**
     * @param {number} index - index of the ball
     * @param {number} mass - initial mass of the ball (kg)
     * @param {Vector2} position - initial position of the center of the ball
     * @param {Vector2} velocity - initial velocity of the center of mass of the ball
     * @param {Property.<boolean>} constantRadiusProperty - whether the ball has a radius independent of mass or not
     */
    constructor( index, mass, position, velocity, constantRadiusProperty ) {

      assert && assert( typeof index === 'number' && index > 0, `invalid index: ${index}` );
      assert && assert( typeof mass === 'number' && mass > 0, `invalid mass: ${mass}` );
      assert && assert( position instanceof Vector2, `invalid position: ${position}` );
      assert && assert( velocity instanceof Vector2, `invalid velocity: ${velocity}` );
      assert && assert( constantRadiusProperty instanceof Property && typeof constantRadiusProperty.value === 'boolean',
        `invalid velocity: ${constantRadiusProperty}` );

      //----------------------------------------------------------------------------------------

      // @public (read-only)
      this.index = index;

      // @public (read-only) massProperty - Property of the mass of the ball (kg)
      this.massProperty = new NumberProperty( mass );

      // @public (read-only) positionProperty - Property of the center of the ball's position.
      this.positionXProperty = new NumberProperty( position.x );
      this.positionYProperty = new NumberProperty( position.y );

      // @public (read-only) velocityProperty - Property of the velocity of the center of mass of the ball.
      this.velocityXProperty = new NumberProperty( velocity.x );
      this.velocityYProperty = new NumberProperty( velocity.y );

      // @public isUserControlledProperty - Property of the velocity of the center of mass of the ball.
      this.isUserControlledProperty = new BooleanProperty( false );

      // since ball.positionProperty is a derived property, we cannot use in the dragListener
      this.positionProperty = new Vector2Property( position );

      // this.positionProperty.link( position => {
      //   this.positionXProperty.value = position.x;
      //   this.positionYProperty.value = position.y;
      // } );

      this.positionXProperty.link( positionX => {
        this.positionProperty.value = new Vector2( positionX, this.positionProperty.value.y );
      } );

      // since ball.positionProperty is a derived property, we cannot use in the dragListener
      this.velocityProperty = new Vector2Property( velocity );

      // this.velocityProperty.link( velocity => {
      //   this.velocityXProperty.value = velocity.x;
      //   this.velocityYProperty.value = velocity.y;
      // } );

      // @public (read-only) velocityProperty - Property of the velocity of the center of mass of the ball.
      this.momentumXProperty = new DerivedProperty( [this.massProperty, this.velocityXProperty],
        ( mass, velocityX ) => velocityX * mass );
      this.momentumYProperty = new DerivedProperty( [this.massProperty, this.velocityYProperty],
        ( mass, velocityY ) => velocityY * mass );

      // @public (read-only)  momentumProperty - Property of the momentum of the ball in kg m/s
      this.velocityDerivedProperty = new DerivedProperty( [this.velocityXProperty, this.velocityYProperty],
        ( velocityX, velocityY ) => new Vector2( velocityX, velocityY ) );

      // @public (read-only)  momentumProperty - Property of the momentum of the ball in kg m/s
      this.positionDerivedProperty = new DerivedProperty( [this.positionXProperty, this.positionYProperty],
        ( positionX, positionY ) => new Vector2( positionX, positionY ) );

      // @public (read-only) {Property.<number>}  speedProperty - Property of the speed in m/s
      this.speedProperty = new DerivedProperty( [this.velocityXProperty, this.velocityYProperty],
        ( velocityX, velocityY ) => Math.sqrt( velocityX * velocityX + velocityY * velocityY ) );

      // @public (read-only)  momentumProperty - Property of the momentum of the ball in kg m/s
      this.momentumProperty = new DerivedProperty( [this.massProperty, this.velocityXProperty, this.velocityYProperty],
        ( mass, velocityX, velocityY ) => new Vector2( mass * velocityX, mass * velocityY ) );

      // @public (read-only) {Property.<number>} momentumMagnitudeProperty - Property of the momentum in kg m/s
      this.momentumMagnitudeProperty = new DerivedProperty( [this.massProperty, this.velocityXProperty, this.velocityYProperty],
        ( mass, velocityX, velocityY ) => mass * Math.sqrt( velocityX * velocityX + velocityY * velocityY ) );

      // @public (read-only)  kineticEnergyProperty - Property of the kinetic energy of the ball in Joule
      this.kineticEnergyProperty = new DerivedProperty( [this.massProperty, this.velocityXProperty, this.velocityYProperty],
        ( mass, velocityX, velocityY ) => 1 / 2 * mass * ( velocityX * velocityX + velocityY * velocityY ) );

      // Handle the changing radius of the Ball based on the mass
      // @public (read-only) - Property of the radius of the ball in meters
      this.radiusProperty = new DerivedProperty( [this.massProperty, constantRadiusProperty],
        ( mass, constantRadius ) => constantRadius ? DEFAULT_RADIUS : 0.15 * Math.pow( mass, 1 / 3 )
      );

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
     * Gets the horizontal position of the ball.
     * @public
     * @returns {number} positionX
     */
    get positionX() { return this.positionXProperty.value;}

    /**
     * Sets the horizontal position of the ball.
     * @public
     * @param {number} positionX
     */
    set positionX( positionX ) {
      assert && assert( Number.isFinite( positionX ), `invalid x-position: ${positionX}` );
      this.positionXProperty.value = positionX;
    }

    /**
     * Gets the vertical position of the ball.
     * @public
     * @returns {number} positionY
     */
    get positionY() { return this.positionYProperty.value;}

    /**
     * Sets the vertical position of the ball.
     * @public
     * @param {number} positionY
     */
    set positionY( positionY ) {
      assert && assert( Number.isFinite( positionY ), `invalid x-position: ${positionY}` );
      this.positionYProperty.value = positionY;
    }

    /**
     * Gets the position of the ball.
     * @public
     * @returns {Vector2}
     */
    get position() { return this.positionDerivedProperty.value; }

    /**
     * Sets the position of the ball.
     * @public
     * @param {Vector2} position
     */
    set position( position ) {
      assert && assert( position instanceof Vector2, `invalid position: ${position}` );
      assert && assert( Number.isFinite( position.x ), `invalid x-position: ${position.x}` );
      assert && assert( Number.isFinite( position.y ), `invalid y-position: ${position.y}` );

      // this.positionProperty.value = position;
      // this.positionXProperty.value = position.x;
      // this.positionYProperty.value = position.y;
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
      assert && assert( typeof left === 'number', `invalid left: ${left}` );
      this.positionX = left + this.radius;
    }

    /**
     * Gets the right bound of the ball.
     * @public
     * @returns {number}
     */
    get right() { return this.positionX + this.radius; }

    /**
     * Sets the left bound of the ball
     * @public
     * @param {number} right
     */
    set right( right ) {
      assert && assert( typeof right === 'number', `invalid right: ${right}` );
      this.positionX = right - this.radius;
    }

    /**
     * Gets the top bound of the ball
     * @public
     * @returns {number}
     */
    get top() { return this.positionY + this.radius; }

    /**
     * Sets the top bound of the ball
     * @public
     * @param {number} top
     */
    set top( top ) {
      assert && assert( typeof top === 'number', `invalid top: ${top}` );
      this.positionY = top - this.radius;
    }

    /**
     * Gets the bottom bound of the ball.
     * @public
     * @returns {number}
     */
    get bottom() { return this.positionY - this.radius; }

    /**
     * Sets the bottom bound of the ball
     * @public
     * @param {number} bottom
     */
    set bottom( bottom ) {
      assert && assert( typeof bottom === 'number', `invalid bottom: ${bottom}` );
      this.positionY = bottom + this.radius;
    }

    /**
     * Gets the first moment of the ball, i.e.  mass* position
     * @public
     * @returns {Vector2}  kg * m
     */
    get firstMoment() { return this.position.times( this.mass ); }


    /**
     * Gets the horizontal velocity of the ball.
     * @public
     * @returns {number} velocityX
     */
    get velocityX() { return this.velocityXProperty.value;}

    /**
     * Sets the horizontal velocity of the ball.
     * @public
     * @param {number} velocityX
     */
    set velocityX( velocityX ) {
      assert && assert( Number.isFinite( velocityX ), `invalid x-velocity: ${velocityX}` );
      this.velocityXProperty.value = velocityX;
    }

    /**
     * Gets the vertical velocity of the ball.
     * @public
     * @returns {number} velocityY
     */
    get velocityY() { return this.velocityYProperty.value;}

    /**
     * Sets the vertical velocity of the ball.
     * @public
     * @param {number} velocityY
     */
    set velocityY( velocityY ) {
      assert && assert( Number.isFinite( velocityY ), `invalid y-velocity: ${velocityY}` );
      this.velocityYProperty.value = velocityY;
    }

    /**
     * Gets the velocity of the ball.
     * @public
     * @returns {Vector2}
     */
    get velocity() { return this.velocityDerivedProperty.value; }

    /**
     * Sets the velocity of the ball.
     * @public
     * @param {Vector2} velocity
     */
    set velocity( velocity ) {
      assert && assert( velocity instanceof Vector2, `invalid velocity: ${velocity}` );
      // this.velocityX = velocity.x;
      // this.velocityY = velocity.y;
      this.velocityProperty.value = velocity;
    }

    /**
     * Gets the kinetic energy of this ball.
     * @returns {number} - kg * (m/s)^2 = Joules
     * @public
     */
    get kineticEnergy() {
      return this.kineticEnergyProperty.value; // KE = (1/2) * m * |v|^2
    }

    /**
     * Gets the linear momentum of this ball.
     * @returns {Vector2} - kg * (m/s)
     * @public
     */
    get momentum() {
      return this.momentumProperty.value; // Momentum = m * v
    }

    /**
     * Resets the ball properties.
     * @public
     */
    reset() {
      this.massProperty.reset();
      this.positionXProperty.reset();
      this.positionYProperty.reset();
      this.velocityXProperty.reset();
      this.velocityYProperty.reset();
      this.isUserControlledProperty.reset();
    }

    /**
     * snap position to the minor gridlines
     * @public
     */
    snapPosition() {

      // rounding function to minor grid line tick values
      const round = number => Utils.roundSymmetric( number / MINOR_GRIDLINE_SPACING ) * MINOR_GRIDLINE_SPACING;

      // set new rounded position
      this.positionX = round( this.positionX );
      this.positionY = round( this.positionY );
    }

    /**
     * Flips the horizontal velocity of the ball up to a scaling factor
     * @public
     * @param {number} scaling
     */
    flipHorizontalVelocity( scaling ) {
      assert && assert( typeof scaling === 'number' && scaling >= 0, `invalid dt: ${scaling}` );
      this.velocity = new Vector2( -this.velocity.x * scaling, this.velocity.y );
    }

    /**
     * Flips the vertical velocity of the ball up to a scaling factor
     * @public
     * @param {number} scaling
     */
    flipVerticalVelocity( scaling ) {
      assert && assert( typeof scaling === 'number' && scaling >= 0, `invalid dt: ${scaling}` );
      this.velocity = new Vector2( this.velocity.x, -this.velocity.y * scaling );
    }

    /**
     * Gets the position of the ball at some time interval dt (assuming ballistic motion)
     * @public
     * @param {number} dt - time step
     * @returns {Vector2}
     */
    getPreviousPosition( dt ) {
      assert && assert( typeof dt === 'number', `invalid dt: ${dt}` );
      return this.position.minus( this.velocity.times( dt ) );
    }

    /**
     * Moves this Ball by one time step (assuming ballistic motion).
     * @param {number} dt - time in seconds
     * @public
     */
    step( dt ) {
      assert && assert( typeof dt === 'number', `invalid dt: ${dt}` );

      this.position = this.position.plus( this.velocity.times( dt ) );
    }
  }

  return collisionLab.register( 'Ball', Ball );
} )
;