// Copyright 2019-2020, University of Colorado Boulder

/**
 * A Ball is the model for a single spherical moving object and appears in all screens. Each Ball is a apart of a
 * isolated system of multiple Balls within a PlayArea. Balls are implemented to work for both 1D and 2D screens.
 *
 * Primary responsibilities are:
 *   1. Center position Property
 *   2. Track the Mass of the Ball in a Property
 *   3. Velocity and Momentum vector Properties
 *   4. Radius Property
 *   5. Track the kinetic energy of the Ball
 *   7. dragging, user-control, restarting, etc.
 *
 * Balls are created at the start of the sim and are never disposed, so no dispose method is necessary.
 *
 * @author Brandon Li
 * @author Martin Veillette
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import BallState from './BallState.js';
import BallUtils from './BallUtils.js';
import PlayArea from './PlayArea.js';

class Ball {

  /**
   * @param {BallState} initialBallState - starting state of the Ball. Will be mutated for restarting purposes.
   * @param {Property.<boolean>} isConstantSizeProperty - indicates if the Ball's radius is independent of mass.
   * @param {Property.<boolean>} gridVisibleProperty - indicates if the PlayArea's grid is visible.
   * @param {number} index - the index of the Ball, which indicates which Ball in the system is this Ball. This index
   *                         number is displayed on the Ball, and each Ball within the system has a unique index.
   *                         Indices start from 1 within the system (ie. 1, 2, 3, ...).
   * @param {Object} [options]
   */
  constructor( initialBallState, isConstantSizeProperty, gridVisibleProperty, index, options ) {
    assert && assert( initialBallState instanceof BallState, `invalid initialBallState: ${initialBallState}` );
    assert && AssertUtils.assertPropertyOf( isConstantSizeProperty, 'boolean' );
    assert && AssertUtils.assertPropertyOf( gridVisibleProperty, 'boolean' );
    assert && assert( typeof index === 'number' && index > 0 && index % 1 === 0, `invalid index: ${index}` );
    assert && assert( !options || Object.getPrototypeOf( options === Object.prototype ), `invalid options: ${options}` );

    options = merge( {

      // {number} - the dimensions of the PlayArea that contains the Ball. Either 1 or 2.
      dimensions: 2,

      // {Bounds2} - the bounds of the PlayArea, in meters.
      bounds: PlayArea.DEFAULT_BOUNDS

    }, options );

    //----------------------------------------------------------------------------------------

    // @public {NumberProperty} - Properties of the Ball's center coordinates, in meters. Separated into components to
    //                            individually display each component and to allow the user to individually manipulate.
    this.xPositionProperty = new NumberProperty( initialBallState.position.x );
    this.yPositionProperty = new NumberProperty( initialBallState.position.y );

    // @public (read-only) {DerivedProperty.<Vector2>} - Property of the position of the Ball, in meters.
    this.positionProperty = new DerivedProperty( [ this.xPositionProperty, this.yPositionProperty ],
      ( xPosition, yPosition ) => new Vector2( xPosition, yPosition ),
      { valueType: Vector2 } );

    // @public (read-only) {NumberProperty} - Property of the mass of the Ball, in kg. Manipulated in the view.
    this.massProperty = new NumberProperty( initialBallState.mass, { range: CollisionLabConstants.MASS_RANGE } );

    //----------------------------------------------------------------------------------------

    // @public {NumberProperty} - the Ball's velocity, in m/s. Separated into components to individually display each
    //                            component and to allow the user to manipulate separately.
    this.xVelocityProperty = new NumberProperty( initialBallState.velocity.x );
    this.yVelocityProperty = new NumberProperty( initialBallState.velocity.y );

    // @public (read-only) {DerivedProperty.<Vector2>} - Property of the velocity of the Ball, in m/s.
    this.velocityProperty = new DerivedProperty( [ this.xVelocityProperty, this.yVelocityProperty ],
      ( xVelocity, yVelocity ) => new Vector2( xVelocity, yVelocity ),
      { valueType: Vector2 } );

    // @public (read-only) {DerivedProperty.<number>} speedProperty - Property of the speed of the Ball, in m/s.
    this.speedProperty = new DerivedProperty( [ this.velocityProperty ], _.property( 'magnitude' ) );

    //----------------------------------------------------------------------------------------

    // @public (read-only) {DerivedProperty.<Vector2>} - Property of the momentum of the Ball, in kg*(m/s).
    this.momentumProperty = new DerivedProperty( [ this.massProperty, this.velocityProperty ],
      ( mass, velocity ) => velocity.timesScalar( mass ),
      { valueType: Vector2 } );

    // @public (read-only) {DerivedProperty.<number>} - magnitude of this Balls momentum, kg*(m/s).
    this.momentumMagnitudeProperty = new DerivedProperty( [ this.momentumProperty ], _.property( 'magnitude' ) );

    // @public (read-only) {DerivedProperty.<number>} - the Ball's momentum, in kg*(m/s). Separated into components to
    //                                                  display individually.
    this.xMomentumProperty = new DerivedProperty( [ this.momentumProperty ], _.property( 'x' ) );
    this.yMomentumProperty = new DerivedProperty( [ this.momentumProperty ], _.property( 'y' ) );

    //----------------------------------------------------------------------------------------

    // @public (read-only) {DerivedProperty.<number>} - Property of the radius of the Ball, in meters.
    this.radiusProperty = new DerivedProperty( [ this.massProperty, isConstantSizeProperty ],
      ( mass, isConstantSize ) => BallUtils.calculateBallRadius( mass, isConstantSize ),
      { valueType: 'number', isValidValue: value => value > 0 } );

    // @public (read-only) {DerivedProperty.<number>} - Property of the kinetic energy of the Ball, in J.
    this.kineticEnergyProperty = new DerivedProperty( [ this.massProperty, this.speedProperty ],
      ( mass, speed ) => BallUtils.calculateBallKineticEnergy( this ),
      { valueType: 'number', isValidValue: value => value >= 0 } );

    // @public {BooleanProperty} - indicates if the Ball is currently being controlled by the user, either by dragging
    //                             or editing a value through the Keypad. This is set externally in the view.
    this.userControlledProperty = new BooleanProperty( false );

    //----------------------------------------------------------------------------------------

    // @public (read-only) {number} - the unique index of this Ball within a system of multiple Balls.
    this.index = index;

    // @private {BallState} - reference the initialBallState, which will track our restarting state. See BallState.js
    this.restartState = initialBallState;

    // @private {Property.<number>} - reference to the gridVisibleProperty for use in `dragToPosition()`.
    //                                Used in the model to determine Ball snapping functionality.
    this.gridVisibleProperty = gridVisibleProperty;

    // @public (read-only) {number} - reference to the dimensions of the PlayArea that contains the Ball.
    this.dimensions = options.dimensions;

    // @public (read-only) {Bounds} - reference to the passed-in PlayArea Bounds.
    this.bounds = options.bounds;

    //----------------------------------------------------------------------------------------

    // Ensure that our yPosition and yVelocity is always 0 for 1D screens.
    assert && this.dimensions === 1 && this.yVelocityProperty.link( yVelocity => assert( yVelocity === 0 ) );
    assert && this.dimensions === 1 && this.yPositionProperty.link( yPosition => assert( yPosition === 0 ) );
  }

  /**
   * Resets this Ball to factory settings. Called when the reset-all button is pressed.
   * @public
   */
  reset() {
    this.xPositionProperty.reset();
    this.yPositionProperty.reset();
    this.xVelocityProperty.reset();
    this.yVelocityProperty.reset();
    this.massProperty.reset();
    this.userControlledProperty.reset();
  }

  /**
   * Restarts this Ball. Called when the restart button is pressed.
   * @public
   *
   * See https://github.com/phetsims/collision-lab/issues/76 for context on the differences between reset and restart.
   */
  restart() {
    this.position = this.restartState.position;
    this.velocity = this.restartState.velocity;
    this.mass = this.restartState.mass;
  }

  /**
   * Moves this Ball by one time step (assuming ballistic motion).
   * @public
   * @param {number} dt - time in seconds
   */
  step( dt ) {
    assert && assert( typeof dt === 'number', `invalid dt: ${dt}` );

    this.position = BallUtils.computeBallPosition( this, dt );
  }

  /**
   * Invoked from the view when the Ball is dragged to a different position. Attempts to position the Ball at the
   * passed in position but ensures the Ball is inside the PlayArea's Bounds.
   *
   * If the grid is visible, the Ball will also snap to the nearest grid-line.
   * @public
   *
   * @param {Vector} position - the position of the Center of the Ball to drag to
   */
  dragToPosition( position ) {
    assert && assert( position instanceof Vector2, `invalid position: ${position}` );

    // Reference to the corrected position to drag the Ball to.
    let correctedPosition;

    if ( !this.gridVisibleProperty.value ) {

      // Ensure that the Ball's position is inside of the PlayArea bounds eroded by the radius, to ensure that the
      // entire Ball is inside the PlayArea.
      correctedPosition = this.bounds.eroded( this.radius ).closestPointTo( position );
    }
    else {

      // Ensure that the Ball's position is inside of the grid-safe bounds, which is rounded to the nearest grid-line.
      correctedPosition = BallUtils.getBallGridSafeConstrainedBounds( this.bounds, this.radius )
        .closestPointTo( position )
        .dividedScalar( CollisionLabConstants.MINOR_GRIDLINE_SPACING )
        .roundSymmetric()
        .timesScalar( CollisionLabConstants.MINOR_GRIDLINE_SPACING );
    }

    // If the dimensions is 1D, ensure that the y-position of the Ball is 0.
    ( this.dimensions === 1 ) && correctedPosition.setY( 0 );

    // Set the position of the Ball to the correct position.
    this.position = correctedPosition;
  }

  /**
   * Saves the state of the Ball in our restartState reference for the next restart() call. This is called when the user
   * presses the play button. See https://github.com/phetsims/collision-lab/issues/76.
   * @public
   */
  saveState() {
    this.restartState.saveState( this.position, this.velocity, this.mass );
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
   * Sets the Ball's mass, in kg.
   * @public
   * @param {number} mass - in kg
   */
  set mass( mass ) { this.massProperty.value = mass; }

  /**
   * Gets the Ball's radius, in meters.
   * @public
   * @returns {number} - in meters
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
   * @param {number} xPosition - in meter coordinates
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
   * @param {number} yPosition - in meter coordinates
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
   * @param {Vector2} position - in meter coordinates
   */
  set position( position ) {
    assert && assert( position instanceof Vector2, `invalid position: ${position}` );
    this.xPosition = position.x;
    this.yPosition = position.y;
  }

  /**
   * Gets the x-coordinate of the left side of the Ball.
   * @public
   * @returns {number} - in meter coordinates
   */
  get left() { return this.position.x - this.radius; }

  /**
   * Gets the x-coordinate of the right side of the Ball.
   * @public
   * @returns {number} - in meter coordinates
   */
  get right() { return this.xPosition + this.radius; }

  /**
   * Gets the y-coordinate of the top side of the Ball.
   * @public
   * @returns {number} - in meter coordinates
   */
  get top() { return this.yPosition + this.radius; }

  /**
   * Gets the y-coordinate of the bottom side of the Ball.
   * @public
   * @returns {number} - in meter coordinates
   */
  get bottom() { return this.yPosition - this.radius; }

  /**
   * Gets the horizontal velocity of the Ball, in m/s.
   * @public
   * @returns {number} xVelocity, in m/s.
   */
  get xVelocity() { return this.xVelocityProperty.value; }

  /**
   * Sets the horizontal velocity of the Ball, in m/s.
   * @public
   * @param {number} xVelocity, in m/s.
   */
  set xVelocity( xVelocity ) { this.xVelocityProperty.value = xVelocity; }

  /**
   * Sets the vertical velocity of the Ball, in m/s.
   * @public
   * @returns {number} yVelocity, in m/s.
   */
  get yVelocity() { return this.yVelocityProperty.value; }

  /**
   * Sets the vertical velocity of the Ball, in m/s.
   * @public
   * @param {number} yVelocity, in m/s.
   */
  set yVelocity( yVelocity ) { this.yVelocityProperty.value = yVelocity; }

  /**
   * Gets the velocity of the Ball, in m/s.
   * @public
   * @returns {Vector2} - in m/s.
   */
  get velocity() { return this.velocityProperty.value; }

  /**
   * Sets the velocity of the Ball, in m/s.
   * @public
   * @param {Vector2} velocity, in m/s.
   */
  set velocity( velocity ) {
    assert && assert( velocity instanceof Vector2, `invalid velocity: ${velocity}` );
    this.xVelocity = velocity.x;
    this.yVelocity = velocity.y;
  }

  /**
   * Gets the kinetic energy of this Ball, in J.
   * @public
   * @returns {number} - in J.
   */
  get kineticEnergy() { return this.kineticEnergyProperty.value; }

  /**
   * Gets the linear momentum of this Ball, in kg*(m/s).
   * @public
   * @returns {Vector2} - in kg*(m/s).
   */
  get momentum() { return this.momentumProperty.value; }
}

collisionLab.register( 'Ball', Ball );
export default Ball;