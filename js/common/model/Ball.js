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
 *  6. create the trailing path behind the Ball
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
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import Path from './Path.js';

// constants
const CONSTANT_RADIUS = CollisionLabConstants.CONSTANT_RADIUS; // radius of Balls if constant-radius is on, in meters.
const MINOR_GRIDLINE_SPACING = CollisionLabConstants.MINOR_GRIDLINE_SPACING;
const DENSITY = 70; // Uniform Density of Balls if constant-radius is OFF, in kg/m^3.
const PLAY_AREA_BOUNDS = CollisionLabConstants.PLAY_AREA_BOUNDS;

class Ball {

  /**
   * @param {Vector2} initialPosition - starting position of the center of the ball.
   * @param {Vector2} initialVelocity - initial velocity of the center of mass of the ball.
   * @param {number} initialMass - starting mass of the ball, in kg.
   * @param {Property.<boolean>} constantRadiusProperty - whether the ball has a radius independent of mass or not.
   * @param {Property.<boolean>} gridVisibleProperty - indicates if the play-area has a grid.
   * @param {Property.<boolean>} pathVisibleProperty - indicates if the trailing path behind the ball is visible.
   * @param {number} index - the index of the Ball, which indicates which Ball in the system is this Ball. This index
   *                         number is displayed on the Ball, and each Ball within the system has a unique index.
   *                         Indices start from 1 within the system (ie. 1, 2, 3, ...).
   */
  constructor( initialPosition, initialVelocity, initialMass, constantRadiusProperty, gridVisibleProperty, pathVisibleProperty, index ) {
    assert && assert( initialPosition instanceof Vector2, `invalid initialPosition: ${initialPosition}` );
    assert && assert( initialVelocity instanceof Vector2, `invalid initialVelocity: ${initialVelocity}` );
    assert && assert( typeof initialMass === 'number' && initialMass > 0, `invalid initialMass: ${initialMass}` );
    assert && assert( pathVisibleProperty instanceof Property && typeof pathVisibleProperty.value === 'boolean', `invalid initialVelocity: ${pathVisibleProperty}` );
    assert && assert( constantRadiusProperty instanceof Property && typeof constantRadiusProperty.value === 'boolean', `invalid initialVelocity: ${constantRadiusProperty}` );
    assert && assert( gridVisibleProperty instanceof Property && typeof gridVisibleProperty.value === 'boolean', `invalid gridVisibleProperty: ${gridVisibleProperty}` );
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
    // @public (read-only) - Property of the radius of the ball in meters. TODO #50
    this.radiusProperty = new DerivedProperty( [ this.massProperty, constantRadiusProperty ],
      ( mass, constantRadius ) => constantRadius ? CONSTANT_RADIUS : Ball.calculateRadius( mass )
    );

    // @public (read-only) kineticEnergyProperty - Property of the kinetic energy of the ball, in J.
    this.kineticEnergyProperty = new DerivedProperty( [ this.massProperty, this.speedProperty ],
      ( mass, speed ) => 1 / 2 * mass * Math.pow( speed, 2 ),
      { valueType: 'number' } );

    //----------------------------------------------------------------------------------------

    // @public userControlledProperty - indicates if the ball is currently being controlled by the user, either by
    //                                  dragging or editing a value through the Keypad. This is set externally in the
    //                                  view.
    this.userControlledProperty = new BooleanProperty( false );

    // @public (read-only) {Path} - create the trailing 'Path' behind the ball.
    this.path = new Path( this.positionProperty, pathVisibleProperty );

    // @private (read-only) {Property.<number>} - reference to the gridVisibleProperty for use in `dragToPosition()`.
    //                                            Used in the model to determine Ball snapping functionality.
    this.gridVisibleProperty = gridVisibleProperty;
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
    this.userControlledProperty.reset();
    this.path.clear();
  }

  /**
   * Invoked from the view when the Ball is dragged. Attempts to position the Ball at the passed in position but
   * ensures the Ball is inside the PlayArea's Bounds.
   *
   * If the grid is visible, the Ball will also snap to the nearest grid-line.
   * @public
   *
   * @param {Vector} position - the position of the Center of the Ball to drag to
   */
  dragToPosition( position ) {
    assert && assert( position instanceof Vector2, `invalid position: ${position}` );

    if ( !this.gridVisibleProperty.value ) {

      // Ensure that the ball's position is inside of the PlayArea bounds eroded by the radius, to ensure that the
      // entire Ball is inside the PlayArea.
      this.position = PLAY_AREA_BOUNDS.eroded( this.radius ).closestPointTo( position );
    }
    else {

      // Ensure that the ball's position is inside of the grid-safe bounds, which is rounded to the nearest grid-line.
      this.position = this.getGridSafeConstrainedBounds().closestPointTo( position )
        .dividedScalar( MINOR_GRIDLINE_SPACING )
        .roundSymmetric()
        .timesScalar( MINOR_GRIDLINE_SPACING );
    }

    // Clear the trailing path of the Ball when it is dragged to a different location.
    this.path.clear();
  }

  /**
   * Compute the Bounds of the center position of the Ball such that the position is both on a grid-line and inside the
   * PlayArea bounds. This bounds is used when dragging with the grid visible to ensure that the Ball isn't snapped to a
   * position that makes part of the ball out of bounds. Also used for ranges in the Keypad.
   * @public
   *
   * @returns {Bounds2}
   */
  getGridSafeConstrainedBounds() {

    // Compute the constrainedRadius, which is the amount to erode the PlayArea Bounds to ensure that the Ball is fully
    // inside of the PlayArea.T his value is the radius rounded up to the nearest grid-line spacing value. This is so
    // that the minimum/maximum values of the constrainedBounds are on a grid-line.
    const roundedUpRadius = Math.ceil( this.radius / MINOR_GRIDLINE_SPACING ) * MINOR_GRIDLINE_SPACING;

    // Compute the Bounds of the Ball's center position. The center must be within the roundedUpRadius meters of the
    // edges of the PlayArea's Bounds so that the entire Ball is inside of the PlayArea and on a grid-line.
    return PLAY_AREA_BOUNDS.eroded( roundedUpRadius );
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

  /**
   * Updates the path of the Ball. Mainly here to have parallel structure with CenterOfMass.
   * @public
   *
   * @param {number} elapsedTime - the total elapsed elapsedTime of the simulation, in seconds.
   */
  updatePath( elapsedTime ) {
    this.path.updatePath( elapsedTime );
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
  get xPosition() { return this.xPositionProperty.value; }

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
  get yPosition() { return this.yPositionProperty.value; }

  /**
   * Sets the y-coordinate of the center position of the Ball, in meter coordinates.
   * @public
   * @returns {number} yPosition - in meter coordinates
   */
  set yPosition( yPosition ) { this.yPositionProperty.value = yPosition; }

  /**
   * Gets the center position of the Ball, in meter coordinates.
   * @public
   * @override
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
  get xVelocity() { return this.xVelocityProperty.value; }

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
  get yVelocity() { return this.yVelocityProperty.value; }

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

  /**
   * Gets the largest editable Range of the Center x-position of this ball so that the Ball is kept in the play-area.
   * @public
   * @returns {Range}
   */
  get xPositionRange() { return new Range( PLAY_AREA_BOUNDS.minX + this.radius, PLAY_AREA_BOUNDS.maxX - this.radius ); }

  /**
   * Gets the largest editable Range of the Center y-position of this ball so that the Ball is kept in the play-area.
   * @public
   * @returns {Range}
   */
  get yPositionRange() { return new Range( PLAY_AREA_BOUNDS.minY + this.radius, PLAY_AREA_BOUNDS.maxY - this.radius ); }

  /**
   * Calculates the radius of a Ball when constant-radius mode is off. This calculation comes from
   * the mass and the density (uniform) of the Ball.
   *
   * Volume = 4/3 PI * Radius^3
   * => Density = Mass / Volume
   * => Radius = (3 / 4 * Mass / Density / PI ) ^ 1/3
   * @public
   *
   * @param {number} mass - in kg
   */
  static calculateRadius( mass ) {
    assert && assert( typeof mass === 'number', `invalid mass: ${mass}` );

    return Math.pow( ( 3 * mass / DENSITY ) / ( 4 * Math.PI ), 1 / 3 );
  }
}

collisionLab.register( 'Ball', Ball );
export default Ball;