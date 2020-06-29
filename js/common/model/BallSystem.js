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
 *   - Tracking the visibility of trailing 'Paths' in a Property.
 *   - Tracking if there are any Balls that are being controlled by the user.
 *   - Tracking if the Balls in the system are inside of the PlayArea.
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
   * @param {Property.<number>} elapsedTimeProperty
   * @param {Object} [options]
   */
  constructor( initialBallStates, playArea, elapsedTimeProperty, options ) {
    assert && AssertUtils.assertArrayOf( initialBallStates, BallState );
    assert && assert( playArea instanceof PlayArea, `invalid playArea: ${playArea}` );
    assert && AssertUtils.assertPropertyOf( elapsedTimeProperty, 'number' );

    options = merge( {

      // {RangeWithValue} - the range of the number of Balls in the system.
      numberOfBallsRange: new RangeWithValue( 1, 4, 2 ),

      // {boolean} - indicates if the Paths are visible initially.
      pathVisibleInitially: false

    }, options );

    assert && assert( options.numberOfBallsRange.max === initialBallStates.length );

    //----------------------------------------------------------------------------------------

    // @public (read-only) {Range} - reference to the numeric Range of the number of balls in the system.
    this.numberOfBallsRange = options.numberOfBallsRange;

    // @public {BooleanProperty} - indicates if Ball sizes (radii) are constant (ie. independent of mass). This Property
    //                             is manipulated externally in the view.
    this.ballsConstantSizeProperty = new BooleanProperty( false );

    // @public {BooleanProperty} - indicates if the center of mass is visible. This is in the model for performance as
    //                             the position and the velocity of the CenterOfMass are only updated if this is true.
    //                             Additionally, PathDataPoints of the CenterOfMass are only recorded if this is true.
    this.centerOfMassVisibleProperty = new BooleanProperty( false );

    // @public {BooleanProperty} - indicates if the Ball and center of mass trailing paths are visible. This is in the
    //                             model since paths only show the path of the moving object after the visibility
    //                             checkbox is checked and are empty when false.
    this.pathsVisibleProperty = new BooleanProperty( options.pathVisibleInitially );

    //----------------------------------------------------------------------------------------

    // @public (read-only) {Balls[]} - an array of all possible balls. Balls are created at the start of the Simulation
    //                                 and are never disposed. However, these Balls are NOT necessarily the Balls
    //                                 currently in the system. This is just used so that the same Ball instances are
    //                                 used with the same number of balls.
    this.prepopulatedBalls = initialBallStates.map( ( ballState, index ) => new Ball(
      ballState,
      playArea,
      this.ballsConstantSizeProperty,
      this.pathsVisibleProperty,
      elapsedTimeProperty,
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
    //                                                **must** be from prepopulatedBalls. Its length should match the
    //                                                numberOfBallsProperty's value.
    this.balls = new ObservableArray();

    // Observe when the number of Balls is manipulated by the user and, if so, add or remove the correct number of Balls
    // to match the numberOfBallsProperty's value. The same Balls are in the system with the same number of Balls value.
    // Link is never disposed as BallSystems are never disposed.
    this.numberOfBallsProperty.link( this.updateBalls.bind( this ) );

    //----------------------------------------------------------------------------------------

    // @public (read-only) {CenterOfMass} - the center of mass of the system of Balls.
    this.centerOfMass = new CenterOfMass(
      this.prepopulatedBalls,
      this.balls,
      this.centerOfMassVisibleProperty,
      this.pathsVisibleProperty,
      elapsedTimeProperty,
      playArea.bounds
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
      () =>  _.sum( this.balls.map( ball => ball.kineticEnergyProperty.value ) ), {
        valueType: 'number',
        isValidValue: value => value >= 0
      } );

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
      [ this.balls.lengthProperty, ...this.prepopulatedBalls.map( ball => ball.insidePlayAreaProperty ) ],
      length => this.balls.count( ball => !ball.insidePlayAreaProperty.value ) === length, {
        valueType: 'boolean'
      } );

    //----------------------------------------------------------------------------------------

    // Observe when Balls are removed from the system and clear their trailing Paths. Listener lasts for the life-time
    // of the simulation since BallSystems are never disposed.
    this.balls.addItemRemovedListener( ball => {
      ball.path.clear();
    } );

    // Observe when the user is controlling any of the Balls to clear the trailing Path of the CenterOfMass. See
    // https://github.com/phetsims/collision-lab/issues/61#issuecomment-634404105. Link lasts for the life-time of
    // the sim as PlayAreas are never disposed.
    this.ballSystemUserControlledProperty.lazyLink( ballSystemUserControlled => {
      if ( ballSystemUserControlled ) {
        this.balls.filter( ball => ball.userControlledProperty.value ).forEach( ball => { ball.path.clear(); } );
        this.centerOfMass.path.clear();
      }
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
    this.pathsVisibleProperty.reset();
    this.numberOfBallsProperty.reset();
    this.prepopulatedBalls.forEach( ball => { ball.reset(); } ); // Reset All Possible Balls.
    this.centerOfMass.reset();
  }

  /**
   * Updates the Balls in the BallSystem to match the numberOfBallsProperty's value. If the Balls are out of sync, this
   * method will add or remove (but not dispose) the correct number of Balls from the system.
   * @private
   *
   * Called when the user changes the number of balls in the system.
   * @returns {[type]} [description]
   */
  updateBalls() {

    // If the number of balls is greater than the Balls currently in the system, Balls need to be added to the system.
    if ( this.numberOfBallsProperty.value > this.balls.length ) {

      // Add the correct number of Balls, referencing an index of the prepopulatedBalls so that the same Balls are
      // added with the same numberOfBallsProperty value.
      for ( let i = this.balls.length; i < this.numberOfBallsProperty.value; i++ ) {
        this.balls.push( this.prepopulatedBalls[ i ] );
      }
    }
    else {

      // Otherwise, the number of balls in the system is greater than numberOfBallsProperty value, meaning Balls need
      // to be removed. Remove the correct number of Balls from the end of the system.
      while ( this.balls.length !== this.numberOfBallsProperty.value ) {
        this.balls.pop();
      }
    }

    // Ensure Balls are in ascending order by their indices if assertions are enabled.
    assert && assert( CollisionLabUtils.isSortedBy( this.balls, _.property( 'index' ) ) );
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

    // Reset the center-of-mass.
    this.centerOfMass.reset();
  }

  /**
   * Bumps a ball way from the other Balls in the system that it is currently overlapping with. The 'bumped' ball
   * will be placed to a position adjacent to the other Balls. This method does nothing if the Ball isn't overlapping
   * with any other Balls. See https://github.com/phetsims/collision-lab/issues/100.
   *
   * This is called when the user is finished controlling the radius or the position of the Ball, either through the
   * Keypad or by dragging the Ball, that now overlaps with another Ball. It was decided that it was most natural and
   * smooth to 'bump' Balls away after the user interaction, instead of continually invoking this method as the user
   * is dragging the ball. Only the ball that the user was controlling will get 'Bumped' away, and won't affect the
   * position of the other Balls.
   *
   * Rather than observing when specific user-controlled properties are set to false to invoke this method, it is
   * instead invoked in the view. We do this because, currently, the model pauses the sim when the user is controlling
   * a Ball and plays the sim again when the user is finished. This is achieved through axon Properties. However, Balls
   * should be 'bumped' away **before** playing the model, which can be guaranteed by bumping first then setting the
   * specific user-controlled Properties to false without depending on the order of listeners.
   *
   * @public
   * @param {Ball} ball - the Ball that was just user-controlled and should be 'bumped' away.
   */
  bumpBallAwayFromOtherBalls( ball ) {
    assert && assert( ball instanceof Ball && this.balls.contains( ball ), `invalid ball: ${ball}` );

    // Flag that points to the closest Ball that overlaps with the passed-in Ball. Will be undefined if no other balls
    // are overlapping with the passed-in Ball.
    let overlappingBall = BallUtils.getClosestOverlappingBall( ball, this.balls );

    // Array of the overlappingBalls that we have 'bumped' away from. This is used to break infinite loops.
    const bumpedAwayFromBalls = [];

    // We use a while loop to fully ensure that the Ball isn't overlapping with any other Balls in scenarios where Balls
    // are placed in the middle of a cluster, and 'bumping' a Ball may lead to it overlapping with another Ball.
    while ( overlappingBall ) {

      // Get the DirectionVector, which is the unit vector from the center of the overlappingBall that points in the
      // direction of the passed-in Ball. Account for a scenario when Balls are placed exactly concentrically on-top of
      // each other.
      const directionVector = !ball.position.equals( overlappingBall.position ) ?
                                ball.position.minus( overlappingBall.position ).normalize() :
                                Vector2.X_UNIT.copy();

      // If we have already bumped away from the overlappingBall, reverse the directionVector.
      bumpedAwayFromBalls.includes( overlappingBall ) && directionVector.multiply( -1 );

      // Move the Ball next to the overlappingBall, using the directionVector.
      BallUtils.moveBallNextToBall( ball, overlappingBall, directionVector );

      // Recompute the overlappingBall for the next iteration.
      bumpedAwayFromBalls.push( overlappingBall );
      overlappingBall = BallUtils.getClosestOverlappingBall( ball, this.balls );
    }

    // Sanity check that the Ball is now not overlapping with any other Balls.
    assert && assert( !BallUtils.getClosestOverlappingBall( ball, this.balls ) );
  }

  /**
   * Saves the states of all the Balls in the system that are fully inside of the PlayArea for the next restart() call.
   * This is called when the user presses the play button.
   * @public
   *
   * See https://github.com/phetsims/collision-lab/issues/76.
   */
  saveBallStates() {

    // Save the state of each Ball in the BallSystem that is fully inside the PlayArea.
    this.balls.forEach( ball => {
      ball.insidePlayAreaProperty.value && ball.saveState();
    } );
  }
}
collisionLab.register( 'BallSystem', BallSystem );
export default BallSystem;