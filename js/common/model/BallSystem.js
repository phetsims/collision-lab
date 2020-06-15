// Copyright 2020, University of Colorado Boulder

/**
 * BallSystem is the sub-model for a isolated system of different Ball objects. It is the complete collection
 * of Balls, both inside and outside the PlayArea.
 *
 * BallSystem is mainly responsible for:
 *   - Keeping track of the system of Balls and the number of Balls in the system.
 *   - Creating a reference to all possible Balls in prepopulatedBalls. The same Ball instances are used with the same
 *     number of Balls, so Balls are created here at the start of the sim.
 *   - CenterOfMass model instantiation for the system of Balls.
 *   - Keeping track of the total kinetic energy of the system.
 *   - Tracking if there are any Balls that are being controlled by the user.
 *   - Tracking if the Balls in the system are inside of the PlayArea.
 *   - Moving Balls away from other Balls that overlap with it after the user manipulates the position or radius.
 *
 * BallSystems are created at the start of the sim and are never disposed, so no dispose method is necessary and links
 * are left as-is.
 *
 * @author Brandon Li
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import ObservableArray from '../../../../axon/js/ObservableArray.js';
import RangeWithValue from '../../../../dot/js/RangeWithValue.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabUtils from '../CollisionLabUtils.js';
import Ball from './Ball.js';
import BallState from './BallState.js';
import BallUtils from './BallUtils.js';
import CenterOfMass from './CenterOfMass.js';
import PlayArea from './PlayArea.js';

class BallSystem {

  /**
   * @param {BallState[]} initialBallStates - the initial BallStates of ALL possible Balls in the system.
   * @param {PlayArea} playArea
   * @param {Object} [options]
   */
  constructor( initialBallStates, playArea, options ) {
    assert && AssertUtils.assertArrayOf( initialBallStates, BallState );
    assert && assert( playArea instanceof PlayArea, `invalid playArea: ${playArea}` );
    assert && assert( !options || !options.numberOfBallsRange || options.numberOfBallsRange instanceof RangeWithValue );

    options = merge( {

      // {RangeWithValue} - the range of the number of Balls in the system.
      numberOfBallsRange: new RangeWithValue( 1, 4, 2 )

    }, options );

    //----------------------------------------------------------------------------------------

    // Ensure a consistent configuration of initialBallStates and numberOfBallsRange.
    assert && assert( options.numberOfBallsRange.max === initialBallStates.length );
    assert && playArea.dimensions === 1 && assert( _.every( initialBallStates, ballState => ballState.position.y === 0 && ballState.velocity.y === 0 ) );

    // @public (read-only) {Range} - reference to the numeric Range of the number of balls in the system.
    this.numberOfBallsRange = options.numberOfBallsRange;

    // @private {PlayArea} - reference to the passed-in playArea.
    this.playArea = playArea;

    // @public {BooleanProperty} - indicates if Ball sizes (radii) are constant (ie. independent of mass). This Property
    //                             is manipulated externally in the view.
    this.ballsConstantSizeProperty = new BooleanProperty( false );

    // @public {BooleanProperty} - indicates if the center of mass is visible. This is in the model for performance as
    //                             the position and the velocity of the CenterOfMass are only updated if this is true.
    //                             Also used in sub-classes for other performance optimizations.
    this.centerOfMassVisibleProperty = new BooleanProperty( false );

    // @public (read-only) {Balls[]} - an array of all possible balls. Balls are created at the start of the Simulation
    //                                 and are never disposed. However, these Balls are NOT necessarily the Balls
    //                                 currently within the system. This is just used so that the same Ball
    //                                 instances are used with the same number of balls.
    this.prepopulatedBalls = initialBallStates.map( ( ballState, index ) => new Ball(
      ballState,
      this.ballsConstantSizeProperty,
      playArea,
      index + 1
    ) );

    //----------------------------------------------------------------------------------------

    // @public {NumberProperty} - Property of the number of Balls in the system. This Property is manipulated
    //                            externally in the view.
    this.numberOfBallsProperty = new NumberProperty( options.numberOfBallsRange.defaultValue, {
      numberType: 'Integer',
      range: options.numberOfBallsRange
    } );

    // @public (read-only) {ObservableArray.<Ball>} - an array of the balls currently within the system. Balls
    //                                                **must** be from prepopulatedBalls. Its length should
    //                                                match the numberOfBallsProperty's value.
    this.balls = new ObservableArray();

    // Observe when the number of Balls is manipulated by the user and, if so, add or remove the correct number of Balls
    // to match the numberOfBallsProperty's value.
    //
    // The same Balls are in the system with the same numberOfBalls value. Link is never disposed as BallSystems
    // are never disposed.
    this.numberOfBallsProperty.link( numberOfBalls => {

      // If the numberOfBalls is greater than the balls in the system, Balls need to be added to the system.
      if ( numberOfBalls > this.balls.length ) {

        // Add the correct number of Balls, referencing an index of the prepopulatedBalls so that the same Balls are
        // added with the same numberOfBalls value.
        for ( let i = this.balls.length; i < numberOfBalls; i++ ) {
          this.balls.push( this.prepopulatedBalls[ i ] );
        }
      }
      else {

        // Otherwise, the number of balls in the system is greater than numberOfBalls, meaning Balls need to be removed.
        // Remove the correct number of Balls from the end of the system.
        while ( this.balls.length !== numberOfBalls ) {
          this.balls.pop();
        }
      }

      // Ensure Balls are in ascending order by their indices if assertions are enabled.
      assert && assert( CollisionLabUtils.isSorted( this.balls.map( _.property( 'index' ) ) ) );
    } );

    //----------------------------------------------------------------------------------------

    // @public (read-only) {CenterOfMass} - the center of mass of the system of Balls.
    this.centerOfMass = new CenterOfMass(
      this.prepopulatedBalls,
      this.balls,
      this.centerOfMassVisibleProperty
    );

    // @public (read-only) {DerivedProperty.<number>} - the total kinetic energy of the system of balls.
    //
    // For the dependencies, we use:
    //  - The KE Properties of the prepopulatedBalls. However, only the balls in the system are used in the calculation.
    //  - balls.lengthProperty, since removing or adding a Ball changes the total kinetic energy of the system.
    //
    // This DerivedProperty is never disposed and lasts for the lifetime of the sim.
    this.totalKineticEnergyProperty = new DerivedProperty(
      [ this.balls.lengthProperty, ...this.prepopulatedBalls.map( ball => ball.kineticEnergyProperty ) ],
      () =>  _.sum( this.balls.map( ball => ball.kineticEnergy ) ), {
        valueType: 'number',
        isValidValue: value => value >= 0
      } );

    //----------------------------------------------------------------------------------------

    // @public (read-only) {DerivedProperty.<boolean>} - indicates if there are any Balls that are being controlled.
    //                                                   Uses the userControlledProperty of all possible Balls as
    //                                                   dependencies but only the Balls in the system are considered.
    this.ballSystemUserControlledProperty = new DerivedProperty(
      this.prepopulatedBalls.map( ball => ball.userControlledProperty ),
      () => this.balls.some( ball => ball.userControlledProperty.value ), {
        valueType: 'boolean'
      } );

    // @public (read-only) {DerivedProperty.<boolean>} - indicates if all of the Balls in the system are NOT inside of
    //                                                   the PlayArea. Uses the insidePlayAreaProperty of all possible
    //                                                   Balls but only the Balls in the system are considered.
    this.ballsNotInsidePlayAreaProperty = new DerivedProperty(
      [ ...this.prepopulatedBalls.map( ball => ball.insidePlayAreaProperty ), this.balls.lengthProperty ],
      () => this.balls.count( ball => !ball.insidePlayAreaProperty.value ) === this.balls.length, {
        valueType: 'boolean'
      } );
  }

  /**
   * Resets the BallSystem.
   * @public
   *
   * Called when the reset-all button is pressed.
   */
  reset() {
    this.ballsConstantSizeProperty.reset();
    this.centerOfMassVisibleProperty.reset();
    this.numberOfBallsProperty.reset();
    this.prepopulatedBalls.forEach( ball => { ball.reset(); } ); // Reset All Possible Balls.
  }

  /**
   * Restarts the BallSystem.
   * @public
   *
   * See https://github.com/phetsims/collision-lab/issues/76 for context on the differences between reset and restart.
   */
  restart() {
    this.balls.forEach( ball => {
      ball.restart();
    } );
  }

  /**
   * Steps the BallSystem by stepping the position of the Balls.
   * @public
   *
   * @param {number} dt - in seconds
   */
  step( dt ) {
    assert && assert( typeof dt === 'number', `invalid dt: ${dt}` );

    // Step each Ball in the BallSystem.
    this.balls.forEach( ball => {
      ball.step( dt );
    } );
  }

  /**
   * Moves the passed-in Ball away from the other Balls in the system that overlap with it. See
   * https://github.com/phetsims/collision-lab/issues/100. Does nothing if the Ball isn't overlapping with any other
   * Balls.
   *
   * This feature was modified from the flash version; the ball that the user is dragging will get "bumped" away, and
   * won’t affect the position of the other balls.
   *
   * This is generally called when the user is **finished** controlling the radius or the position of the Ball, either
   * through the Keypad or by dragging the Ball. We decided it was most natural and smooth to 'bump' Balls away after
   * the user interaction. It was also decided that Balls that are bumped away must still be inside the PlayArea.
   *
   * @public
   * @param {Ball} ball - the Ball that was just user-controlled.
   */
  moveBallAwayFromOtherBalls( ball ) {
    assert && assert( ball instanceof Ball && this.balls.contains( ball ), `invalid ball: ${ball}` );

    // Flag that points to the first Ball that overlaps with the passed-in Ball. Will be null if no other balls
    // are overlapping with the passed-in Ball.
    let overlappingBall = BallUtils.getOverlappingBall( ball, this.balls );

    // Array of the overlapingBalls that we have bumped away from. This is used to break infinite loops.
    const bumpedAwayFromBalls = [];

    // We use a while loop to fully ensure that the Ball isn't overlapping with any other Balls in scenarios where
    // Ball is bumped to a position where it overlaps with another Ball. No matter what,
    // every Ball has a place where it is fully inside the PlayArea.
    while ( overlappingBall ) {

      // DirectionVector, which is the unit vector from the center of the colliding Ball that points in the direction of
      // the passed-in Ball. Account for a scenario when Balls are placed exactly concentrically on-top of each other.
      const directionVector = !ball.position.equals( overlappingBall.position ) ?
                                ball.position.minus( overlappingBall.position ).normalize() :
                                Vector2.X_UNIT.copy();

      // Bump the Ball from the overlappingBall, using the directionVector,
      BallUtils.bumpBallFromOverlappingBall( ball, overlappingBall, directionVector );

      // If the Ball isn't fully inside the PlayArea, or if this Ball has been bumped away from the overlappingBall
      // before, reverse the directionVector and attempt to bump the Ball again.
      if ( !this.playArea.fullyContainsBall( ball ) || _.includes( bumpedAwayFromBalls, overlappingBall ) ) {
        BallUtils.bumpBallFromOverlappingBall( ball, overlappingBall, directionVector.rotated( Math.PI ) );
      }

      // If, at this point, the Ball still isn't fully inside the PlayArea, we have to bump the Ball in a different
      // direction. Rotate the directionVector in increments of Math.PI / 2.
      while ( !this.playArea.fullyContainsBall( ball ) ) {
        BallUtils.bumpBallFromOverlappingBall( ball, overlappingBall, directionVector.rotate( Math.PI / 2 ) );
      }

      // Sanity check.
      assert && assert( BallUtils.getOverlappingBall( ball, this.balls ) !== overlappingBall );

      // Recompute the overlappingBall for the next iteration.
      bumpedAwayFromBalls.push( overlappingBall );
      overlappingBall = BallUtils.getOverlappingBall( ball, this.balls );
    }

    // Sanity check.
    assert && assert( !BallUtils.getOverlappingBall( ball, this.balls ) && this.playArea.fullyContainsBall( ball ) );
  }

  /**
   * Saves the states of all of the Balls in the system for the next restart() call. This is called when the user
   * presses the play button.
   * @public
   *
   * See https://github.com/phetsims/collision-lab/issues/76.
   */
  saveBallStates() {

    // Save the state of each Ball in the BallSystem that are inside the PlayArea.
    this.balls.forEach( ball => {
      ball.insidePlayAreaProperty.value && ball.saveState();
    } );
  }
}
collisionLab.register( 'BallSystem', BallSystem );
export default BallSystem;