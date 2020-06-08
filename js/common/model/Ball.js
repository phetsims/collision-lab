// Copyright 2019-2020, University of Colorado Boulder

/**
 * A Ball is the model for a single spherical moving object and appears in all screens. Each Ball is a apart of a
 * isolated system of multiple Balls in BallSystem. Balls are implemented to work generally for both 1D and 2D
 * screens.
 *
 * Primary responsibilities are:
 *   - Center-position Property.
 *   - Track the Mass of the Ball in a Property.
 *   - Velocity and Momentum vector Properties.
 *   - Radius Property.
 *   - Track the kinetic energy of the Ball.
 *   - Dragging, user-control, restarting, etc.
 *
 * For the 'Collision Lab' sim, the same Ball instances are used with the same number of Balls. Thus, Balls are created
 * at the start of the sim and persist for the lifetime of the sim, so no dispose method is necessary.
 *
 * @author Brandon Li
 * @author Martin Veillette
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
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
   * @param {PlayArea} playArea - the PlayArea instance, which may or may not 'contain' this Ball.
   * @param {number} index - the index of the Ball, which indicates which Ball in the system is this Ball. This index
   *                         number is displayed on the Ball, and each Ball within the system has a unique index.
   *                         Indices start from 1 within the system (ie. 1, 2, 3, ...).
   */
  constructor( initialBallState, isConstantSizeProperty, playArea, index ) {
    assert && assert( initialBallState instanceof BallState, `invalid initialBallState: ${initialBallState}` );
    assert && AssertUtils.assertPropertyOf( isConstantSizeProperty, 'boolean' );
    assert && assert( playArea instanceof PlayArea, `invalid playArea: ${playArea}` );
    assert && assert( typeof index === 'number' && index > 0 && index % 1 === 0, `invalid index: ${index}` );

    //----------------------------------------------------------------------------------------

    // @public {NumberProperty} - Properties of the Ball's center coordinates, in meters. Separated into components to
    //                            individually display each component and to allow the user to manipulate separately.
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

    // @public (read-only) {DerivedProperty.<boolean>} - indicates if any part of the Ball is inside the PlayArea,
    //                                                   regardless of whether or not the Ball is in the BallSystem.
    this.insidePlayAreaProperty = new DerivedProperty( [ this.positionProperty ],
      () => playArea.containsAnyPartOfBall( this ),
      { valueType: 'boolean' } );

    //----------------------------------------------------------------------------------------

    // @public (read-only) {PlayArea} - reference to the passed-in PlayArea
    this.playArea = playArea;

    // @public (read-only) {number} - the unique index of this Ball within a system of multiple Balls.
    this.index = index;

    // @private {BallState} - reference the initialBallState, which will track our restarting state. See BallState.js
    this.restartState = initialBallState;

    // Ensure that our yPosition and yVelocity is always 0 for 1D screens. Persists for the lifetime of the sim.
    assert && this.playArea.dimensions === 1 && this.yVelocityProperty.link( yVelocity => assert( yVelocity === 0 ) );
    assert && this.playArea.dimensions === 1 && this.yPositionProperty.link( yPosition => assert( yPosition === 0 ) );
  }

  /**
   * Resets this Ball to its factory settings. Called when the reset-all button is pressed.
   * @public
   */
  reset() {
    this.xPositionProperty.reset();
    this.yPositionProperty.reset();
    this.massProperty.reset();
    this.xVelocityProperty.reset();
    this.yVelocityProperty.reset();
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
   * Moves this Ball by one time step, assuming it isn't accelerating or colliding with other Balls. If this isn't the
   * case, its motion is corrected in CollisionEngine.js
   * @public
   *
   * @param {number} dt - time in seconds
   */
  step( dt ) {
    assert && assert( typeof dt === 'number', `invalid dt: ${dt}` );

    this.position = BallUtils.computeBallPosition( this, dt );
  }

  /**
   * Saves the state of the Ball in our restartState reference for the next restart() call.
   * @public
   *
   * This is called when the user presses the play button. See https://github.com/phetsims/collision-lab/issues/76.
   */
  saveState() { this.restartState.saveState( this.position, this.velocity, this.mass ); }

  /**
   * Invoked from the view when the Ball is dragged to a different position. Attempts to position the Ball at the
   * passed in position but ensures the Ball is inside the PlayArea's Bounds.
   *
   * If the grid is visible, the Ball will also snap to the nearest grid-line.
   * If the PlayArea is 1D, the Ball's y-position will be set to 0.
   *
   * @public
   * @param {Vector} position - the attempted drag position, in model units, of the center of the Ball.
   */
  dragToPosition( position ) {
    assert && assert( position instanceof Vector2, `invalid position: ${position}` );

    // Flag that references the corrected position of the attempted drag position of the Ball.
    let correctedPosition;

    if ( !this.playArea.gridVisibleProperty.value ) {

      // Ensure that the Ball's position is inside of the PlayArea's bounds, eroded by the radius to ensure that the
      // entire Ball is inside the PlayArea.
      correctedPosition = this.playArea.bounds.eroded( this.radius ).closestPointTo( position );
    }
    else {

      // Ensure that the Ball's position is inside of the grid-safe bounds, which is rounded inwards to the nearest
      // grid-line to ensure that the Ball is both inside the PlayArea and snapped to a grid-line.
      correctedPosition = BallUtils.getBallGridSafeConstrainedBounds( this.playArea.bounds, this.radius )
        .closestPointTo( position )
        .dividedScalar( CollisionLabConstants.MINOR_GRIDLINE_SPACING )
        .roundSymmetric()
        .timesScalar( CollisionLabConstants.MINOR_GRIDLINE_SPACING );
    }

    // If the PlayArea is 1D, ensure that the y-position of the Ball is set to 0.
    ( this.playArea.dimensions === 1 ) && correctedPosition.setY( 0 );

    // Finally, set the position of the Ball to the corrected position.
    this.position = correctedPosition;
  }

  /*----------------------------------------------------------------------------*
   * Convenience Methods
   *----------------------------------------------------------------------------*/

  /**
   * Gets the Ball's mass, in kg.
   * @public
   *
   * @returns {number} - in kg
   */
  get mass() { return this.massProperty.value; }

  /**
   * Sets the Ball's mass, in kg.
   * @public
   *
   * @param {number} mass - in kg
   */
  set mass( mass ) { this.massProperty.value = mass; }

  /**
   * Gets the Ball's radius, in meters.
   * @public
   *
   * @returns {number} - in meters
   */
  get radius() { return this.radiusProperty.value; }

  /**
   * Gets the center position of the Ball, in meters.
   * @public
   *
   * @returns {Vector2} - in meters
   */
  get position() { return this.positionProperty.value; }

  /**
   * Sets the center position of the Ball, in meters.
   * @public
   *
   * @param {Vector2} position - in meters
   */
  set position( position ) {
    assert && assert( position instanceof Vector2, `invalid position: ${position}` );
    this.xPositionProperty.value = position.x;
    this.yPositionProperty.value = position.y;
  }

  /**
   * Gets the x-coordinate of the left side of the Ball.
   * @public
   *
   * @returns {number} - in meters
   */
  get left() { return this.position.x - this.radius; }

  /**
   * Gets the x-coordinate of the right side of the Ball.
   * @public
   *
   * @returns {number} - in meters
   */
  get right() { return this.position.x + this.radius; }

  /**
   * Gets the y-coordinate of the top side of the Ball.
   * @public
   *
   * @returns {number} - in meters
   */
  get top() { return this.position.y + this.radius; }

  /**
   * Gets the y-coordinate of the bottom side of the Ball.
   * @public
   *
   * @returns {number} - in meters
   */
  get bottom() { return this.position.y - this.radius; }

  /**
   * Gets the horizontal velocity of the Ball, in m/s.
   * @public
   *
   * @returns {number} xVelocity, in m/s.
   */
  get xVelocity() { return this.xVelocityProperty.value; }

  /**
   * Sets the horizontal velocity of the Ball, in m/s.
   * @public
   *
   * @param {number} xVelocity, in m/s.
   */
  set xVelocity( xVelocity ) { this.xVelocityProperty.value = xVelocity; }

  /**
   * Sets the vertical velocity of the Ball, in m/s.
   * @public
   *
   * @returns {number} yVelocity, in m/s.
   */
  get yVelocity() { return this.yVelocityProperty.value; }

  /**
   * Sets the vertical velocity of the Ball, in m/s.
   * @public
   *
   * @param {number} yVelocity, in m/s.
   */
  set yVelocity( yVelocity ) { this.yVelocityProperty.value = yVelocity; }

  /**
   * Gets the velocity of the Ball, in m/s.
   * @public
   *
   * @returns {Vector2} - in m/s.
   */
  get velocity() { return this.velocityProperty.value; }

  /**
   * Sets the velocity of the Ball, in m/s.
   * @public
   *
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
   *
   * @returns {number} - in J.
   */
  get kineticEnergy() { return this.kineticEnergyProperty.value; }

  /**
   * Gets the linear momentum of this Ball, in kg*(m/s).
   * @public
   *
   * @returns {Vector2} - in kg*(m/s).
   */
  get momentum() { return this.momentumProperty.value; }
}

collisionLab.register( 'Ball', Ball );
export default Ball;