// Copyright 2019-2020, University of Colorado Boulder

/**
 * A Ball is the model for all Balls in all screens. A single Ball is a apart of a isolated system of multiple Balls
 * inside a PlayArea.
 *
 * Primary responsibilities are:
 *  1. center position Property
 *  2. velocity and momentum vector Properties
 *  3. radius Property to track the inner radius of the Ball
 *  4. track the kinetic energy of the Ball
 *
 * Balls are created at the start of the sim and are never disposed, so no dispose method is necessary.
 *
 * @author Brandon Li
 * @author Martin Veillette
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabConstants from '../CollisionLabConstants.js';

// constants
const DEFAULT_RADIUS = CollisionLabConstants.DEFAULT_RADIUS; // in meters
const MINOR_GRIDLINE_SPACING = CollisionLabConstants.MINOR_GRIDLINE_SPACING;

class Ball {

  /**
   * @param {Vector2} initialPosition - starting position of the center of the ball
   * @param {Vector2} initialVelocity - initial velocity of the center of mass of the ball
   * @param {number} initialMass - starting mass of the ball, in kg
   * @param {Property.<boolean>} constantRadiusProperty - whether the ball has a radius independent of mass or not
   * @param {number} index - the index of the Ball, which indicates which Ball in the system is this Ball. This index
   *                         number is displayed on the Ball, and each Ball within the system has a unique index.
   *                         Indices start from 1 within the system (i.e. 1, 2, 3, ...).
   */
  constructor( initialPosition, initialVelocity, initialMass, constantRadiusProperty, index ) {
    assert && assert( initialPosition instanceof Vector2, `invalid initialPosition: ${initialPosition}` );
    assert && assert( initialVelocity instanceof Vector2, `invalid initialVelocity: ${initialVelocity}` );
    assert && assert( typeof initialMass === 'number' && initialMass > 0, `invalid initialMass: ${initialMass}` );
    assert && assert( constantRadiusProperty instanceof Property && typeof constantRadiusProperty.value === 'boolean', `invalid initialVelocity: ${constantRadiusProperty}` );
    assert && assert( typeof index === 'number' && index > 0, `invalid index: ${index}` );

    //----------------------------------------------------------------------------------------

    // @public (read-only) {number} - the unique index of this Ball within a system of multiple Balls.
    this.index = index;

    // @public (read-only) massProperty - Property of the mass of the ball, in kg.
    this.massProperty = new NumberProperty( initialMass );

    // @public (read-only) Property of the center of the ball's coordinates, in meters.
    this.positionXProperty = new NumberProperty( initialPosition.x );
    this.positionYProperty = new NumberProperty( initialPosition.y );

    // @public (read-only) velocityProperty - Property of the velocity's coordinate of the ball, in m/s.
    this.velocityXProperty = new NumberProperty( initialVelocity.x );
    this.velocityYProperty = new NumberProperty( initialVelocity.y );

    // @public isUserControlledProperty - Is the ball controlled by the user.
    this.isUserControlledProperty = new BooleanProperty( false );

    // @public position of the ball for DragListener
    this.positionProperty = new Vector2Property( initialPosition );

    // @public velocity of the ball for DragListener
    this.velocityProperty = new Vector2Property( initialVelocity );

    // @public (read-only) Property of the momentum components of the center of mass of the ball.
    this.momentumXProperty = new DerivedProperty( [ this.massProperty, this.velocityXProperty ],
      ( mass, velocityX ) => velocityX * mass );
    this.momentumYProperty = new DerivedProperty( [ this.massProperty, this.velocityYProperty ],
      ( mass, velocityY ) => velocityY * mass );

    // @public (read-only) - {Property.<Vector2>} Property of the velocity of the ball m/s
    this.velocityDerivedProperty = new DerivedProperty( [ this.velocityXProperty, this.velocityYProperty ],
      ( velocityX, velocityY ) => new Vector2( velocityX, velocityY ) );

    // @public (read-only)  momentumProperty - Property of the position of the ball in m
    this.positionDerivedProperty = new DerivedProperty( [ this.positionXProperty, this.positionYProperty ],
      ( positionX, positionY ) => new Vector2( positionX, positionY ) );

    // @public (read-only) {Property.<number>}  speedProperty - Property of the speed in m/s
    this.speedProperty = new DerivedProperty( [ this.velocityXProperty, this.velocityYProperty ],
      ( velocityX, velocityY ) => Math.sqrt( velocityX * velocityX + velocityY * velocityY ) );

    // @public (read-only)  momentumProperty - Property of the momentum of the ball in kg m/s
    this.momentumProperty = new DerivedProperty( [ this.massProperty, this.velocityXProperty, this.velocityYProperty ],
      ( mass, velocityX, velocityY ) => new Vector2( mass * velocityX, mass * velocityY ) );

    // @public (read-only) {Property.<number>} momentumMagnitudeProperty - Property of the momentum in kg m/s
    this.momentumMagnitudeProperty = new DerivedProperty( [ this.massProperty, this.velocityXProperty, this.velocityYProperty ],
      ( mass, velocityX, velocityY ) => mass * Math.sqrt( velocityX * velocityX + velocityY * velocityY ) );

    // @public (read-only)  kineticEnergyProperty - Property of the kinetic energy of the ball in Joule
    this.kineticEnergyProperty = new DerivedProperty( [ this.massProperty, this.velocityXProperty, this.velocityYProperty ],
      ( mass, velocityX, velocityY ) => 1 / 2 * mass * ( velocityX * velocityX + velocityY * velocityY ) );

    // Handle the changing radius of the Ball based on the mass
    // @public (read-only) - Property of the radius of the ball in meters
    this.radiusProperty = new DerivedProperty( [ this.massProperty, constantRadiusProperty ],
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

collisionLab.register( 'Ball', Ball );
export default Ball;