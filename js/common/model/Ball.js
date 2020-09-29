// Copyright 2019-2020, University of Colorado Boulder

/**
 * A Ball is the model for a single spherical moving object that appears in all screens. Each Ball is a apart of a
 * isolated system of multiple Balls in a BallSystem. Balls are implemented to work generally for both 1D and 2D
 * screens.
 *
 * Primary responsibilities are:
 *   - Center-position Property.
 *   - Mass Property.
 *   - Velocity and Momentum Properties.
 *   - Radius Property.
 *   - Dragging, user-control, restarting, etc.
 *   - Creating the trailing 'Path' behind the Ball.
 *
 * For the 'Collision Lab' sim, the same Ball instances are used with the same number of Balls. See BallSystem for more
 * context. Thus, Balls are created at the start of the sim and persist for the lifetime of the sim, so no dispose
 * method is necessary.
 *
 * @author Brandon Li
 * @author Martin Veillette
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import CollisionLabUtils from '../CollisionLabUtils.js';
import BallState from './BallState.js';
import BallUtils from './BallUtils.js';
import CollisionLabPath from './CollisionLabPath.js';
import PlayArea from './PlayArea.js';

class Ball {

  /**
   * @param {BallState} initialBallState - starting state of the Ball.
   * @param {PlayArea} playArea - the PlayArea instance, which may or may not 'contain' this Ball.
   * @param {Property.<boolean>} isConstantSizeProperty - indicates if the Ball's radius is independent of mass.
   * @param {Property.<boolean>} pathsVisibleProperty - indicates if the Ball's trailing 'Path' is visible.
   * @param {number} index - the index of the Ball, which indicates which Ball in the system is this Ball. This index
   *                         number is displayed on the Ball, and each Ball within the system has a unique index.
   *                         Indices start from 1 within the system (ie. 1, 2, 3, ...).
   */
  constructor( initialBallState, playArea, isConstantSizeProperty, pathsVisibleProperty, index ) {
    assert && assert( initialBallState instanceof BallState, `invalid initialBallState: ${initialBallState}` );
    assert && assert( playArea instanceof PlayArea, `invalid playArea: ${playArea}` );
    assert && AssertUtils.assertPropertyOf( isConstantSizeProperty, 'boolean' );
    assert && AssertUtils.assertPropertyOf( pathsVisibleProperty, 'boolean' );
    assert && AssertUtils.assertPositiveInteger( index );

    // @public {Property.<Vector2>} - Property of the center-position of the Ball, in meters.
    this.positionProperty = new Vector2Property( initialBallState.position, {
      useDeepEquality: true
    } );

    // @public {Property.<Vector2>} - Property of the velocity of the Ball, in m/s.
    this.velocityProperty = new Vector2Property( initialBallState.velocity, {
      useDeepEquality: true
    } );

    // @public {Property.<number>} speedProperty - Property of the speed of the Ball, in m/s.
    this.speedProperty = new DerivedProperty( [ this.velocityProperty ], velocity => velocity.magnitude, {
      isValidValue: value => value >= 0,
      valueType: 'number'
    } );

    //----------------------------------------------------------------------------------------

    // @public (read-only) {Property.<number>} - Property of the mass of the Ball, in kg. Manipulated in the view.
    this.massProperty = new NumberProperty( initialBallState.mass, { range: CollisionLabConstants.MASS_RANGE } );

    // @public {Property.<Vector2>} - Property of the momentum of the Ball, in kg*(m/s).
    this.momentumProperty = new DerivedProperty( [ this.massProperty, this.velocityProperty ],
      ( mass, velocity ) => velocity.timesScalar( mass ),
      { valueType: Vector2 } );

    // @public {Property.<number>} - the momentum, in kg*m/s. Separated into components to display individually.
    this.xMomentumProperty = new DerivedProperty( [ this.momentumProperty ], momentum => momentum.x );
    this.yMomentumProperty = new DerivedProperty( [ this.momentumProperty ], momentum => momentum.y );

    // @public {Property.<number>} - magnitude of this Ball's momentum, kg*(m/s).
    this.momentumMagnitudeProperty = new DerivedProperty( [ this.momentumProperty ], momentum => momentum.magnitude, {
      isValidValue: value => value >= 0,
      valueType: 'number'
    } );

    //----------------------------------------------------------------------------------------

    // @public {Property.<number>} - Property of the radius of the Ball, in meters.
    this.radiusProperty = new DerivedProperty( [ this.massProperty, isConstantSizeProperty ],
      BallUtils.calculateBallRadius,
      { valueType: 'number', isValidValue: value => value > 0 } );

    // @public {Property.<number>} - Property of the rotation of the Ball relative to its own center, in radians. This is
    //                            used for 'sticky' collisions in the 'Inelastic' screen.
    this.rotationProperty = new NumberProperty( 0 );

    // @public {Property.<boolean>} - indicates if ANY part of the Ball is inside the PlayArea's bounds.
    this.insidePlayAreaProperty = new DerivedProperty( [ this.positionProperty, this.radiusProperty ],
      () => playArea.containsAnyPartOfBall( this ),
      { valueType: 'boolean' } );

    // @public (read-only) {CollisionLabPath} - the trailing 'Path' behind the Ball.
    this.path = new CollisionLabPath( this.positionProperty, pathsVisibleProperty );

    //----------------------------------------------------------------------------------------

    // @public {Property.<boolean>} - indicates if the Ball's mass is being manipulated by the user. Set in the view.
    this.massUserControlledProperty = new BooleanProperty( false );

    // @public {Property.<boolean>} - indicates if the Ball's position is being manipulated by the user. Set in the view.
    this.xPositionUserControlledProperty = new BooleanProperty( false );
    this.yPositionUserControlledProperty = new BooleanProperty( false );

    // @public {Property.<boolean>} - indicates if the Ball's velocity is being manipulated by the user. Set in the view.
    this.xVelocityUserControlledProperty = new BooleanProperty( false );
    this.yVelocityUserControlledProperty = new BooleanProperty( false );

    // @public {Property.<boolean>} - indicates if the Ball is being controlled by the user in any way, either by
    //                                       dragging or through the Keypad.
    this.userControlledProperty = new DerivedProperty( [ this.massUserControlledProperty,
      this.xPositionUserControlledProperty,
      this.yPositionUserControlledProperty,
      this.xVelocityUserControlledProperty,
      this.yVelocityUserControlledProperty
    ], ( ...userControlledValues ) => userControlledValues.some( _.identity ), {
      valueType: 'boolean'
    } );

    //----------------------------------------------------------------------------------------

    // @public (read-only) {number} - the unique index of this Ball within a system of multiple Balls.
    this.index = index;

    // @private {BallState} - the state to set this Ball to when the restart button is pressed.
    this.restartState = initialBallState;

    // @public (read-only) {PlayArea} - reference to the passed-in PlayArea.
    this.playArea = playArea;
  }

  /**
   * Resets this Ball to its factory settings. Called when the reset-all button is pressed.
   * @public
   */
  reset() {
    this.positionProperty.reset();
    this.velocityProperty.reset();
    this.massProperty.reset();
    this.rotationProperty.reset();
    this.path.clear();
    this.massUserControlledProperty.reset();
    this.xPositionUserControlledProperty.reset();
    this.yPositionUserControlledProperty.reset();
    this.xVelocityUserControlledProperty.reset();
    this.yVelocityUserControlledProperty.reset();
    this.saveState();
  }

  /**
   * Restarts this Ball. Called when the restart button is pressed.
   * @public
   *
   * See https://github.com/phetsims/collision-lab/issues/76 for context on the differences between reset and restart.
   */
  restart() {
    this.setState( this.restartState );

    // Setting the state resets the trailing 'Path' and the rotation of the Ball.
    this.path.clear();
    this.rotationProperty.reset();
  }

  /**
   * Moves the ball by some time step, assuming that the Ball isn't accelerating and is in uniform motion.
   * @public
   *
   * @param {number} dt - time in seconds
   */
  stepUniformMotion( dt ) {
    assert && assert( typeof dt === 'number', `invalid dt: ${dt}` );

    // Since velocity is the first derivative of position, and the ball isn't accelerating, we can solely multiply
    // the velocity by the delta-time to get the displacement.
    this.position = this.velocity.times( dt ).add( this.position );
  }

  /**
   * Saves the state of the Ball in our restartState reference for the next restart() call.
   * @public
   *
   * This is called when the user presses the play button. See https://github.com/phetsims/collision-lab/issues/76.
   */
  saveState() { this.restartState = new BallState( this.position, this.velocity, this.mass ); }

  /**
   * Sets the Properties of this Ball to match the passed-in BallState.
   * @public
   *
   * @param {BallState} ballState
   */
  setState( ballState ) {
    assert && assert( ballState instanceof BallState, `invalid ballState: ${ballState}` );
    this.position = ballState.position;
    this.velocity = ballState.velocity;
    this.mass = ballState.mass;
  }

  /**
   * Invoked from the view when the Ball is dragged to a different position. Attempts to position the Ball at the
   * passed in position but ensures the Ball is inside the PlayArea's Bounds.
   *
   * If the grid is visible, the Ball will also snap to the nearest grid-line.
   * If the PlayArea is 1D, the Ball's y-position will be kept at 0.
   *
   * @public
   * @param {Vector2} position - the attempted drag position, in model units, of the center of the Ball.
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
      correctedPosition = CollisionLabUtils.roundVectorToNearest(
        BallUtils.getBallGridSafeConstrainedBounds( this.playArea.bounds, this.radius ).closestPointTo( position ),
        CollisionLabConstants.MINOR_GRIDLINE_SPACING
      );
    }

    // If the PlayArea is 1D, ensure that the y-position of the Ball is set to 0.
    ( this.playArea.dimension === PlayArea.Dimension.ONE ) && correctedPosition.setY( 0 );

    // Finally, set the position of the Ball to the corrected position.
    this.position = correctedPosition;
    assert && assert( this.playArea.fullyContainsBall( this ) );
  }

  /*----------------------------------------------------------------------------*
   * Convenience Methods
   *----------------------------------------------------------------------------*/

  /**
   * ES5 getters for the location of the edges of the Ball, in meters.
   * @public
   *
   * @returns {number} - in meters.
   */
  get left() { return this.position.x - this.radius; }
  get right() { return this.position.x + this.radius; }
  get top() { return this.position.y + this.radius; }
  get bottom() { return this.position.y - this.radius; }

  /**
   * Gets the Ball's mass, in kg.
   * @public
   *
   * @returns {number} - in kg
   */
  get mass() { return this.massProperty.value; }

  /**
   * Gets the Ball's radius, in meters.
   * @public
   *
   * @returns {number} - in meters
   */
  get radius() { return this.radiusProperty.value; }

  /**
   * Gets the center-position of the Ball, in meters.
   * @public
   *
   * @returns {Vector2} - in meters
   */
  get position() { return this.positionProperty.value; }

  /**
   * Gets the velocity of the Ball, in m/s.
   * @public
   *
   * @returns {Vector2} - in m/s.
   */
  get velocity() { return this.velocityProperty.value; }

  /**
   * ES5 getters of the components of this Ball's velocity, in m/s.
   * @public
   *
   * @returns {number} - in m/s.
   */
  get xVelocity() { return this.velocity.x; }
  get yVelocity() { return this.velocity.y; }

  /**
   * Gets the linear momentum of this Ball, in kg*(m/s).
   * @public
   *
   * @returns {Vector2} - in kg*(m/s).
   */
  get momentum() { return this.momentumProperty.value; }

  //----------------------------------------------------------------------------------------

  /**
   * Sets the Ball's mass, in kg.
   * @public
   *
   * @param {number} mass - in kg
   */
  set mass( mass ) { this.massProperty.value = mass; }

  /**
   * Sets the center-position of the Ball, in meters.
   * @public
   *
   * @param {Vector2} position - in meters
   */
  set position( position ) {
    assert && assert( position instanceof Vector2, `invalid position: ${position}` );

    this.positionProperty.value = position;
  }

  /**
   * Sets the x-position of the Ball, in meters.
   * @public
   *
   * @param {number} xPosition - in meters
   */
  set xPosition( xPosition ) { this.position = this.position.copy().setX( xPosition ); }

  /**
   * Sets the y-position of the Ball, in meters.
   * @public
   *
   * @param {number} yPosition - in meters
   */
  set yPosition( yPosition ) { this.position = this.position.copy().setY( yPosition ); }

  /**
   * Sets the velocity of the Ball, in m/s.
   * @public
   *
   * @param {Vector2} velocity - in m/s.
   */
  set velocity( velocity ) { this.velocityProperty.value = velocity; }

  /**
   * Sets the horizontal velocity of the Ball, in m/s.
   * @public
   *
   * @param {number} xVelocity - in m/s.
   */
  set xVelocity( xVelocity ) {
    this.velocity = this.velocity.copy().setX( CollisionLabUtils.clampDown( xVelocity, CollisionLabConstants.MIN_VELOCITY ) );
  }

  /**
   * Sets the vertical velocity of the Ball, in m/s.
   * @public
   *
   * @param {number} yVelocity - in m/s.
   */
  set yVelocity( yVelocity ) {
    this.velocity = this.velocity.copy().setY( CollisionLabUtils.clampDown( yVelocity, CollisionLabConstants.MIN_VELOCITY ) );
  }
}

collisionLab.register( 'Ball', Ball );
export default Ball;