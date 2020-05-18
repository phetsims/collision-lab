// Copyright 2019-2020, University of Colorado Boulder

/**
 * A Ball is the model for all Balls in all screens. A single Ball is a apart of a isolated system of multiple Balls
 * inside a PlayArea.
 *
 * Primary responsibilities are:
 *  1. center position Property
 *  2. track the mass of the Ball in a Property
 *  3. velocity and momentum vector Properties
 *  4. radius Property to track the inner radius of the Ball
 *  5. track the kinetic energy of the Ball
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
   *                         Indices start from 1 within the system (ie. 1, 2, 3, ...).
   */
  constructor( initialPosition, initialVelocity, initialMass, constantRadiusProperty, index ) {
    assert && assert( initialPosition instanceof Vector2, `invalid initialPosition: ${initialPosition}` );
    assert && assert( initialVelocity instanceof Vector2, `invalid initialVelocity: ${initialVelocity}` );
    assert && assert( typeof initialMass === 'number' && initialMass > 0, `invalid initialMass: ${initialMass}` );
    assert && assert( constantRadiusProperty instanceof Property && typeof constantRadiusProperty.value === 'boolean', `invalid initialVelocity: ${constantRadiusProperty}` );
    assert && assert( typeof index === 'number' && index > 0, `invalid index: ${index}` );

    // @public (read-only) {number} - the unique index of this Ball within a system of multiple Balls.
    this.index = index;

    //----------------------------------------------------------------------------------------

    // @public (read-only) {NumberProperty} - Properties of the Ball's center coordinates, in meters coordinates.
    //                                        Separated into components to individually display each component and to
    //                                        allow the user to individually manipulate.
    this.xPositionProperty = new NumberProperty( initialPosition.x );
    this.yPositionProperty = new NumberProperty( initialPosition.y );

    // @public (read-only) {DerivedProperty.<Vector2>} - Property of the position of the ball, in meter coordinates.
    this.positionProperty = new DerivedProperty( [ this.xPositionProperty, this.yPositionProperty ],
      ( xPosition, yPosition ) => new Vector2( xPosition, yPosition ),
      { valueType: Vector2 } );

    //----------------------------------------------------------------------------------------

    // @public (read-only) {NumberProperty} - the Ball's velocity, in m/s. Separated into components to individually
    //                                        display each component and to allow the user to manipulate separately.
    this.xVelocityProperty = new NumberProperty( initialVelocity.x );
    this.yVelocityProperty = new NumberProperty( initialVelocity.y );

    // @public (read-only) {DerivedProperty.<Vector2>} - Property of the velocity of the ball, in m/s.
    this.velocityProperty = new DerivedProperty( [ this.xVelocityProperty, this.yVelocityProperty ],
      ( xVelocity, yVelocity ) => new Vector2( xVelocity, yVelocity ),
      { valueType: Vector2 } );

    // @public (read-only) {DerivedProperty.<number>} speedProperty - Property of the speed of the ball, in m/s.
    this.speedProperty = new DerivedProperty( [ this.velocityProperty ], _.property( 'magnitude' ) );

    //----------------------------------------------------------------------------------------

    // @public (read-only) {NumberProperty} - mass of the ball, in kg.
    this.massProperty = new NumberProperty( initialMass, { isValidValue: value => value > 0 } );

    // @public (read-only) {DerivedProperty.<Vector2>} - Property of the momentum of the ball, in kg*(m/s).
    this.momentumProperty = new DerivedProperty( [ this.massProperty, this.velocityProperty ],
      ( mass, velocity ) => new Vector2( mass, mass ).componentMultiply( velocity ),
      { valueType: Vector2 } );

    // @public (read-only) {DerivedProperty.<number>} momentumMagnitudeProperty - Property of the momentum, in kg*(m/s).
    this.momentumMagnitudeProperty = new DerivedProperty( [ this.momentumProperty ], _.property( 'magnitude' ) );

    // @public (read-only) {DerivedProperty.<number>} - the Ball's momentum, in kg*m/s. Separated into components to
    //                                                  display individually.
    this.xMomentumProperty = new DerivedProperty( [ this.momentumProperty ], _.property( 'x' ) );
    this.yMomentumProperty = new DerivedProperty( [ this.momentumProperty ], _.property( 'y' ) );

    //----------------------------------------------------------------------------------------

    // Handle the changing radius of the Ball based on the mass
    // @public (read-only) - Property of the radius of the ball in meters
    this.radiusProperty = new DerivedProperty( [ this.massProperty, constantRadiusProperty ],
      ( mass, constantRadius ) => constantRadius ? DEFAULT_RADIUS : 0.15 * Math.pow( mass, 1 / 3 ) // TODO: where does this calculation come from?
    );

    // @public (read-only) kineticEnergyProperty - Property of the kinetic energy of the ball, in J.
    this.kineticEnergyProperty = new DerivedProperty( [ this.massProperty, this.speedProperty ],
      ( mass, speed ) => 1 / 2 * mass * Math.pow( speed, 2 ),
      { valueType: 'number' } );

    // @public isUserControlledProperty - indicates if the ball is currently being controlled by the user.
    this.isUserControlledProperty = new BooleanProperty( false );
  }

  /**
   * Resets this Ball.
   * @public
   */
  reset() {
    this.xPositionProperty.reset();
    this.yPositionProperty.reset();
    this.xVelocityProperty.reset();
    this.yVelocityProperty.reset();
    this.massProperty.reset();
    this.isUserControlledProperty.reset();
  }

  /**
   * snap position to the minor grid-lines. // TODO: should there be a general "drag ball to" method that handles the functionality of grid visible snapping vs non-snapping in the model?
   * @public
   */
  snapPosition() {

    // rounding function to minor grid line tick values
    const round = number => Utils.roundSymmetric( number / MINOR_GRIDLINE_SPACING ) * MINOR_GRIDLINE_SPACING;

    // set new rounded position
    this.xPosition = round( this.xPosition );
    this.yPosition = round( this.yPosition );
  }

  /**
   * Flips the horizontal velocity of the ball up to a scaling factor
   * @public
   * @param {number} scaling
   */
  flipHorizontalVelocity( scaling ) {
    assert && assert( typeof scaling === 'number' && scaling >= 0, `invalid scaling: ${scaling}` );
    this.velocity = new Vector2( -this.velocity.x * scaling, this.velocity.y );
  }

  /**
   * Flips the vertical velocity of the ball up to a scaling factor
   * @public
   * @param {number} scaling
   */
  flipVerticalVelocity( scaling ) {
    assert && assert( typeof scaling === 'number' && scaling >= 0, `invalid scaling: ${scaling}` );
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
   * @public
   * @param {number} dt - time in seconds
   */
  step( dt ) {
    assert && assert( typeof dt === 'number', `invalid dt: ${dt}` );

    this.position = this.position.plus( this.velocity.times( dt ) );
  }

  /*----------------------------------------------------------------------------*
   * Convenience Methods
   *----------------------------------------------------------------------------*/

  /**
   * Gets the Ball's mass, in kg.
   * @public
   * @returns {number} - in kg
   */
  get mass() { return this.massProperty.value; }

  /**
   * Gets the Ball's radius, in kg.
   * @public
   * @returns {number} - in kg
   */
  get radius() { return this.radiusProperty.value; }

  /**
   * Gets the x-coordinate of the center position of the Ball, in meter coordinates.
   * @public
   * @returns {number} - in meter coordinates
   */
  get xPosition() { return this.xPositionProperty.value;}

  /**
   * Sets the x-coordinate of the center position of the Ball, in meter coordinates.
   * @public
   * @returns {number} xPosition - in meter coordinates
   */
  set xPosition( xPosition ) { this.xPositionProperty.value = xPosition; }

  /**
   * Gets the y-coordinate of the center position of the Ball, in meter coordinates.
   * @public
   * @returns {number} - in meter coordinates
   */
  get yPosition() { return this.yPositionProperty.value;}

  /**
   * Sets the y-coordinate of the center position of the Ball, in meter coordinates.
   * @public
   * @returns {number} yPosition - in meter coordinates
   */
  set yPosition( yPosition ) { this.yPositionProperty.value = yPosition; }

  /**
   * Gets the center position of the Ball, in meter coordinates.
   * @public
   * @returns {Vector2} - in meter coordinates
   */
  get position() { return this.positionProperty.value; }

  /**
   * Sets the center position of the Ball, in meter coordinates.
   * @public
   * @returns {Vector2} position - in meter coordinates
   */
  set position( position ) {
    assert && assert( position instanceof Vector2, `invalid position: ${position}` );
    this.xPosition = position.x;
    this.yPosition = position.y;
  }

  /**
   * Gets the x-coordinate of the left side of the ball.
   * @public
   * @returns {number} - in meter coordinates
   */
  get left() { return this.position.x - this.radius; }

  /**
   * Sets the x-coordinate of the left side of the ball.
   * @public
   * @param {number} left - in meter coordinates
   */
  set left( left ) { this.xPosition = left + this.radius; }

  /**
   * Gets the x-coordinate of the right side of the ball.
   * @public
   * @returns {number} - in meter coordinates
   */
  get right() { return this.xPosition + this.radius; }

  /**
   * Sets the x-coordinate of the right side of the ball.
   * @public
   * @param {number} right - in meter coordinates
   */
  set right( right ) { this.xPosition = right - this.radius; }

  /**
   * Gets the y-coordinate of the top side of the ball.
   * @public
   * @returns {number} - in meter coordinates
   */
  get top() { return this.yPosition + this.radius; }

  /**
   * Sets the y-coordinate of the top side of the ball.
   * @public
   * @param {number} top - in meter coordinates
   */
  set top( top ) { this.yPosition = top - this.radius; }

  /**
   * Gets the y-coordinate of the bottom side of the ball.
   * @public
   * @returns {number} - in meter coordinates
   */
  get bottom() { return this.yPosition - this.radius; }

  /**
   * Sets the y-coordinate of the bottom side of the ball.
   * @public
   * @param {number} bottom - in meter coordinates
   */
  set bottom( bottom ) { this.yPosition = bottom + this.radius; }

  /**
   * Gets the horizontal velocity of the ball, in m/s.
   * @public
   * @returns {number} xVelocity, in m/s.
   */
  get xVelocity() { return this.xVelocityProperty.value;}

  /**
   * Sets the horizontal velocity of the ball, in m/s.
   * @public
   * @param {number} xVelocity, in m/s.
   */
  set xVelocity( xVelocity ) { this.xVelocityProperty.value = xVelocity; }

  /**
   * Sets the vertical velocity of the ball, in m/s.
   * @public
   * @returns {number} yVelocity, in m/s.
   */
  get yVelocity() { return this.yVelocityProperty.value;}

  /**
   * Sets the vertical velocity of the ball, in m/s.
   * @public
   * @param {number} yVelocity, in m/s.
   */
  set yVelocity( yVelocity ) { this.yVelocityProperty.value = yVelocity; }

  /**
   * Gets the velocity of the ball, in m/s.
   * @public
   * @returns {Vector2} - in m/s.
   */
  get velocity() { return this.velocityProperty.value; }

  /**
   * Sets the velocity of the ball, in m/s.
   * @public
   * @param {Vector2} velocity, in m/s.
   */
  set velocity( velocity ) {
    assert && assert( velocity instanceof Vector2, `invalid velocity: ${velocity}` );
    this.xVelocity = velocity.x;
    this.yVelocity = velocity.y;
  }

  /**
   * Gets the kinetic energy of this ball, in J.
   * @public
   * @returns {number} - in J.
   */
  get kineticEnergy() { return this.kineticEnergyProperty.value; }

  /**
   * Gets the linear momentum of this ball, in kg * (m/s).
   * @public
   * @returns {Vector2} - in kg * (m/s).
   */
  get momentum() { return this.momentumProperty.value; }
}

collisionLab.register( 'Ball', Ball );
export default Ball;