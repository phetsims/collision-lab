// Copyright 2020-2022, University of Colorado Boulder

/**
 * BallSystem is the model for an isolated system of different Ball objects. It is the complete collection of Balls,
 * both inside and outside the PlayArea.
 *
 * BallSystem is responsible for:
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
import createObservableArray from '../../../../axon/js/createObservableArray.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import RangeWithValue from '../../../../dot/js/RangeWithValue.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import pairs from '../../../../phet-core/js/pairs.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
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

    options = merge( {

      // {RangeWithValue} - the range of the number of Balls in the system.
      numberOfBallsRange: new RangeWithValue( 1, 4, 2 ),

      // {boolean} - indicates if the trailing 'Paths' are visible initially.
      pathsVisibleInitially: false

    }, options );

    assert && assert( options.numberOfBallsRange.max === initialBallStates.length );

    // @private {PlayArea}
    this.playArea = playArea;

    //----------------------------------------------------------------------------------------

    // @public (read-only) {Range} - reference to the numeric Range of the number of balls in the system.
    this.numberOfBallsRange = options.numberOfBallsRange;

    // @public {Property.<boolean>} - indicates if Ball sizes (radii) are constant (ie. independent of mass). This Property
    //                             is manipulated externally in the view.
    this.ballsConstantSizeProperty = new BooleanProperty( false );

    // @public {Property.<boolean>} - indicates if the Ball and center of mass trailing 'paths' are visible. This is in the
    //                             model since paths only show the path of the moving object after the visibility
    //                             checkbox is checked and are empty when false.
    this.pathsVisibleProperty = new BooleanProperty( options.pathsVisibleInitially );

    // @public {Property.<boolean>} - indicates if the center of mass is visible. This is in the model since the
    //                             CenterOfMass's trailing 'Path' is empty if this is false and PathDataPoints for
    //                             the CenterOfMass are only recorded if this is true and paths are visible.
    this.centerOfMassVisibleProperty = new BooleanProperty( false );

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
      index + 1
    ) );

    //----------------------------------------------------------------------------------------

    // @public {Property.<number>} - Property of the number of Balls in the system. This Property is manipulated
    //                            externally in the view.
    this.numberOfBallsProperty = new NumberProperty( options.numberOfBallsRange.defaultValue, {
      numberType: 'Integer',
      range: options.numberOfBallsRange
    } );

    // @public (read-only) {ObservableArrayDef.<Ball>} - an array of the balls currently within the system. Balls **must** be
    //                                          from prepopulatedBalls. Its length should match the
    //                                          numberOfBallsProperty's value.
    this.balls = createObservableArray( { valueType: Ball } );

    // Observe when the number of Balls is manipulated by the user and, if so, add or remove the correct number of Balls
    // to match the numberOfBallsProperty's value. The same Balls are in the system with the same number of Balls value.
    // Link is never disposed as BallSystems are never disposed.
    this.numberOfBallsProperty.link( this.updateBalls.bind( this ) );

    this.numberOfBallsProperty.lazyLink( ( newQuantity, oldQuantity ) => {
      if ( newQuantity > oldQuantity ) {
        this.balls.slice( oldQuantity ).forEach( ball => this.bumpBallAwayFromOthers( ball ) );
        this.tryToSaveBallStates();
      }
    } );

    //----------------------------------------------------------------------------------------

    // @public (read-only) {CenterOfMass} - the center of mass of the system of Balls.
    this.centerOfMass = new CenterOfMass(
      this.prepopulatedBalls,
      this.balls,
      this.centerOfMassVisibleProperty,
      this.pathsVisibleProperty
    );

    // @public {Property.<number>} - the total kinetic energy of the system of balls.
    //
    // For the dependencies, we use:
    //  - mass and velocity Properties of the all Balls. Only the balls in the system are used for the calculation.
    //  - balls.lengthProperty, since removing or adding a Ball changes the total kinetic energy of the system.
    //
    // This DerivedProperty is never disposed and lasts for the lifetime of the sim.
    this.totalKineticEnergyProperty = new DerivedProperty( [ this.balls.lengthProperty,
      ...this.prepopulatedBalls.map( ball => ball.massProperty ),
      ...this.prepopulatedBalls.map( ball => ball.velocityProperty )
    ], () => BallUtils.getTotalKineticEnergy( this.balls ), {
      valueType: 'number',
      isValidValue: value => value >= 0
    } );

    // @public {Property.<boolean>} - indicates if there are any Balls that are being controlled. Uses the
    //                                       userControlledProperty of all possible Balls as dependencies but only the
    //                                       Balls in the system are considered in the derivation function.
    this.ballSystemUserControlledProperty = new DerivedProperty(
      this.prepopulatedBalls.map( ball => ball.userControlledProperty ),
      () => this.balls.some( ball => ball.userControlledProperty.value ), {
        valueType: 'boolean'
      } );

    // @public {Property.<boolean>} - indicates if all of the Balls in the system are NOT inside of the PlayArea.
    //                                       Uses the insidePlayAreaProperty of all possible Balls but only the Balls in
    //                                       the system are considered in the derivation function.
    this.ballsNotInsidePlayAreaProperty = new DerivedProperty(
      [ this.balls.lengthProperty, ...this.prepopulatedBalls.map( ball => ball.insidePlayAreaProperty ) ],
      length => this.balls.every( ball => !ball.insidePlayAreaProperty.value ), {
        valueType: 'boolean'
      } );

    //----------------------------------------------------------------------------------------

    // Observe when Balls are removed from the system and clear their trailing Paths. Listener lasts for the life-time
    // of the simulation since BallSystems are never disposed.
    this.balls.elementRemovedEmitter.addListener( ball => {
      ball.path.clear();
      this.tryToSaveBallStates();
    } );

    // Observe when Balls are added to the system and save the states of all balls in the system. Listener lasts for the
    // life-time of the simulation since BallSystems are never disposed.
    this.balls.elementAddedEmitter.addListener( ball => {
      this.balls.every( ball => ball.insidePlayAreaProperty.value ) && this.balls.forEach( ball => ball.saveState() );
      this.tryToSaveBallStates();
    } );

    // Observe when the user is done controlling any of the Balls to:
    //   1. Save the states of all Balls if every ball is inside the PlayArea's bounds.
    //   2. Clear the trailing Paths of all Balls and the Path of the CenterOfMass.
    //   3. Reset the rotation of Balls relative to their centers.
    //
    // Link lasts for the life-time of the sim as BallSystems are never disposed.
    this.ballSystemUserControlledProperty.lazyLink( this.tryToSaveBallStates.bind( this ) );
    playArea.elasticityPercentProperty.lazyLink( this.tryToSaveBallStates.bind( this ) );

    this.ballsConstantSizeProperty.lazyLink( () => {
      this.balls.forEach( ball => this.bumpBallAwayFromOthers( ball ) );
      this.tryToSaveBallStates();
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
   * Moves every Ball currently in the system by one time-step, assuming that the Ball is in uniform-motion.
   * @public
   *
   * @param {number} dt - time in seconds
   * @param {number} elapsedTime - the total elapsed elapsedTime of the simulation, in seconds.
   */
  stepUniformMotion( dt, elapsedTime ) {
    assert && assert( typeof dt === 'number', `invalid dt: ${dt}` );
    assert && assert( typeof elapsedTime === 'number' && elapsedTime >= 0, `invalid elapsedTime: ${elapsedTime}` );

    for ( let i = 0; i < this.balls.length; i++ ) {
      this.balls[ i ].stepUniformMotion( dt );
    }

    // Update the trailing 'Paths' of all Balls in the system and the CenterOfMass.
    this.updatePaths( elapsedTime );
  }

  /**
   * Attempts to save ball states
   * @private
   */
  tryToSaveBallStates() {
    if ( !this.ballSystemUserControlledProperty.value && this.balls.every( ball => ball.insidePlayAreaProperty.value ) ) {
      this.balls.forEach( ball => {

        // Save the state of each Ball.
        ball.insidePlayAreaProperty.value && ball.saveState();
        ball.path.clear();
        ball.rotationProperty.reset();
      } );
      this.centerOfMass.path.clear();
    }
  }

  /**
   * Updates the trailing 'Paths' of all Balls in the system and the trailing 'Path' of the CenterOfMass.
   * @public
   *
   * @param {number} elapsedTime - the total elapsed elapsedTime of the simulation, in seconds.
   */
  updatePaths( elapsedTime ) {
    assert && assert( typeof elapsedTime === 'number' && elapsedTime >= 0, `invalid elapsedTime: ${elapsedTime}` );

    for ( let i = 0; i < this.balls.length; i++ ) {
      this.balls[ i ].path.updatePath( elapsedTime );
    }
    this.centerOfMass.path.updatePath( elapsedTime );
  }

  /**
   * @public
   *
   * @param {Ball} ball
   */
  bumpBallIntoPlayArea( ball ) {
    // Don't bump balls into the play area if there is no reflecting border, see
    // https://github.com/phetsims/collision-lab/issues/206
    if ( this.playArea.reflectingBorderProperty.value ) {
      ball.positionProperty.value = ball.playArea.bounds.eroded( ball.radiusProperty.value ).closestPointTo( ball.positionProperty.value );
    }

    this.tryToSaveBallStates();
  }

  /**
   * Bumps a ball way from the other balls/borders in the system that it is currently overlapping with. The 'bumped'
   * ball will be placed to a position adjacent to the other Balls. This method does nothing if the Ball isn't
   * overlapping with anything. See https://github.com/phetsims/collision-lab/issues/100 and
   * https://github.com/phetsims/collision-lab/issues/167.
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
  bumpBallAwayFromOthers( ball ) {
    assert && assert( ball instanceof Ball && this.balls.includes( ball ), `invalid ball: ${ball}` );

    this.bumpBallIntoPlayArea( ball );

    // Flag that points to the closest Ball that overlaps with the passed-in Ball. Will be undefined if no other balls
    // are overlapping with the passed-in Ball.
    let overlappingBall = BallUtils.getClosestOverlappingBall( ball, this.balls );

    // Array of the overlappingBalls that we have 'bumped' away from. This is used to break infinite loops.
    const bumpedAwayFromBalls = [];

    let count = 0;

    // We use a while loop to fully ensure that the Ball isn't overlapping with any other Balls in scenarios where Balls
    // are placed in the middle of a cluster, and 'bumping' a Ball may lead to it overlapping with another Ball.
    while ( overlappingBall ) {

      // Get the DirectionVector, which is the unit vector from the center of the overlappingBall that points in the
      // direction of the passed-in Ball. Account for a scenario when Balls are placed exactly concentrically on-top of
      // each other.
      const directionVector = !ball.positionProperty.value.equals( overlappingBall.positionProperty.value ) ?
                              ball.positionProperty.value.minus( overlappingBall.positionProperty.value ).normalize() :
                              Vector2.X_UNIT.copy();

      // Round the direction vector to match the displayed value on drag-release. See
      // https://github.com/phetsims/collision-lab/issues/136.
      CollisionLabUtils.roundUpVectorToNearest( directionVector, 10 ** -CollisionLabConstants.DISPLAY_DECIMAL_PLACES );

      // If we have already bumped away from the overlappingBall, reverse the directionVector.
      bumpedAwayFromBalls.includes( overlappingBall ) && directionVector.multiply( -1 );

      // If trying each side of the ball doesn't work (because they might be both overlapping with a border), try
      // a random direction.
      if ( bumpedAwayFromBalls.length > 5 ) {
        if ( ball.positionProperty.value.y === 0 ) {
          directionVector.setXY( dotRandom.nextBoolean() ? 1 : -1, 0 );
        }
        else {
          directionVector.rotate( 2 * Math.PI * dotRandom.nextDouble() );
        }
      }

      // Move the Ball next to the overlappingBall, using the directionVector.
      BallUtils.moveBallNextToBall( ball, overlappingBall, directionVector );

      this.bumpBallIntoPlayArea( ball );

      // Recompute the overlappingBall for the next iteration.
      bumpedAwayFromBalls.push( overlappingBall );
      overlappingBall = BallUtils.getClosestOverlappingBall( ball, this.balls );

      if ( overlappingBall && ++count > 10 ) {
        this.repelBalls();
        overlappingBall = false;
      }
    }

    // Sanity check that the Ball is now not overlapping with any other Balls.
    assert && assert( !BallUtils.getClosestOverlappingBall( ball, this.balls ) );

    this.tryToSaveBallStates();
  }

  /**
   * Causes all balls to repel from each other, while staying inside the boundaries.
   * @private
   */
  repelBalls() {
    let hadOverlap = true;

    const ballPairs = pairs( this.balls );

    while ( hadOverlap ) {
      hadOverlap = false;

      ballPairs.forEach( pair => {
        if ( BallUtils.areBallsOverlapping( pair[ 0 ], pair[ 1 ] ) ) {
          hadOverlap = true;

          const directionVector = !pair[ 0 ].positionProperty.value.equals( pair[ 1 ].positionProperty.value ) ?
                                  pair[ 0 ].positionProperty.value.minus( pair[ 1 ].positionProperty.value ).normalize() :
                                  Vector2.X_UNIT.copy();

          let pair0Position = pair[ 0 ].positionProperty.value.plus(
            // Slow bump away
            directionVector.timesScalar( 0.05 )
          );
          let pair1Position = pair[ 1 ].positionProperty.value.plus(
            // Slow bump away
            directionVector.timesScalar( -0.05 )
          );

          // Don't bump balls into the play area if there is no reflecting border, see
          // https://github.com/phetsims/collision-lab/issues/206
          if ( this.playArea.reflectingBorderProperty.value ) {
            pair0Position = pair[ 0 ].playArea.bounds.eroded( pair[ 0 ].radiusProperty.value ).closestPointTo( pair0Position );
            pair1Position = pair[ 1 ].playArea.bounds.eroded( pair[ 1 ].radiusProperty.value ).closestPointTo( pair1Position );
          }

          pair[ 0 ].positionProperty.value = pair0Position;
          pair[ 1 ].positionProperty.value = pair1Position;
        }
      } );
    }
  }

  /**
   * Updates the Balls in the BallSystem to match the numberOfBallsProperty's value. If the Balls are out of sync, this
   * method will add or remove (but not dispose) the correct number of Balls from the system.
   * @private
   *
   * Called when the user changes the number of balls in the system.
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

    // Verify that Balls are in ascending order by their indices, if assertions are enabled.
    assert && assert( CollisionLabUtils.isSorted( this.balls, ball => ball.index ) );
  }
}

collisionLab.register( 'BallSystem', BallSystem );
export default BallSystem;
