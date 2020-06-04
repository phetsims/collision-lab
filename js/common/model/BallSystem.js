// Copyright 2020, University of Colorado Boulder

/**
 * BallSystem is the sub-model for a isolated system of different Ball objects. It is the complete collection
 * of Balls, both inside and outside the PlayArea.
 *
 * BallSystem is mainly responsible for:
 *   - Creating a reference to all possible Balls in prepopulatedBalls.
 *   - Keeping track of the Balls and the number of Balls in the system.
 *   - CenterOfMass model instantiation for the system of Balls.
 *   - Keeping track of the total kinetic energy of the system.
 *   - Tracking if there are any Balls that are being controlled by the user.
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
import merge from '../../../../phet-core/js/merge.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import collisionLab from '../../collisionLab.js';
import Ball from './Ball.js';
import BallState from './BallState.js';
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
    assert && assert( !options || Object.getPrototypeOf( options === Object.prototype ), `invalid options: ${options}` );
    assert && assert( !options || !options.numberOfBallsRange || options.numberOfBallsRange instanceof RangeWithValue );

    options = merge( {

      // {RangeWithValue} - the range of the number of Balls in the system.
      numberOfBallsRange: new RangeWithValue( 1, 5, 2 )

    }, options );

    // @public (read-only) {Range} - reference to the range of the number of balls.
    this.numberOfBallsRange = options.numberOfBallsRange;

    //----------------------------------------------------------------------------------------

    // @public {BooleanProperty} - indicates if Ball sizes (radii) are constant (ie. independent of mass). This Property
    //                             is manipulated externally in the view.
    this.isBallConstantSizeProperty = new BooleanProperty( false );

    // @public {BooleanProperty} - indicates if the center of mass is visible. This is in the model since CenterOfMass
    //                             PathDataPoints are only recorded if this is true and are cleared when set to false.
    this.centerOfMassVisibleProperty = new BooleanProperty( false );

    // @public (read-only) {Balls[]} - an array of all possible balls. Balls are created at the start of the Simulation
    //                                 and are never disposed. However, these Balls are NOT necessarily the Balls
    //                                 currently within the system. This is just used so that the same Ball
    //                                 instances are added with the same number of balls.
    this.prepopulatedBalls = initialBallStates.map( ( ballState, index ) => new Ball(
      ballState,
      this.isBallConstantSizeProperty,
      playArea.gridVisibleProperty,
      index + 1, {
        dimensions: playArea.dimensions,
        bounds: playArea.bounds
      } ) );

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

    // Observe when the number of Balls is manipulated by the user and if so, add or remove the correct number of Balls
    // to match the numberOfBallsProperty's value.
    //
    // The same Balls are added with the same numberOfBalls value. Link is never disposed as BallSystems's are never
    // disposed.
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
        // Remove the correct number of Balls from the end of the Balls ObservableArray.
        while ( this.balls.length !== numberOfBalls ) {
          this.balls.pop();
        }
      }
    } );

    //----------------------------------------------------------------------------------------

    // @public (read-only) {CenterOfMass} - the center of mass of the system of Balls.
    this.centerOfMass = new CenterOfMass(
      this.prepopulatedBalls,
      this.balls,
      this.centerOfMassVisibleProperty
    );

    // @public {DerivedProperty.<number>} - the total kinetic energy of the system of balls.
    //
    // For the dependencies, we use:
    //  - The KE Properties of the prepopulatedBalls. Only the balls in the system are used in the calculation.
    //  - numberOfBallsProperty, since removing or adding a Ball changes the total kinetic energy of the system.
    //
    // This DerivedProperty is never disposed and lasts for the lifetime of the sim.
    this.totalKineticEnergyProperty = new DerivedProperty(
      [ this.numberOfBallsProperty, ...this.prepopulatedBalls.map( ball => ball.kineticEnergyProperty ) ],
      () => {
        return _.sum( this.balls.map( ball => ball.kineticEnergy ) );
      }, {
        valueType: 'number',
        isValidValue: value => value >= 0
      } );

    //----------------------------------------------------------------------------------------

    // @public {DerivedProperty.<boolean>} - indicates if there are any Balls that are being controlled by the user. Use
    //                                       the userControlledProperty of all possible Balls as dependencies to update
    //                                       but only the Balls in the system are used in the calculation.
    this.ballSystemUserControlledProperty = new DerivedProperty(
      this.prepopulatedBalls.map( ball => ball.userControlledProperty ),
      () => this.balls.some( ball => ball.userControlledProperty.value ), {
        valueType: 'boolean'
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
   * Resets the BallSystem.
   * @public
   */
  reset() {
    this.prepopulatedBalls.forEach( ball => { ball.reset(); } ); // Reset All Possible Balls.
    this.isBallConstantSizeProperty.reset();
    this.centerOfMassVisibleProperty.reset();
  }

  /**
   * Restarts the BallSystem.
   * @public
   *
   * See https://github.com/phetsims/collision-lab/issues/76 for context on the differences between reset and restart.
   */
  restart() {
    this.balls.forEach( ball => ball.restart() );
  }

  /**
   * Saves the states of All of the Balls in the system for the next restart() call. This is called when the user
   * presses the play button
   * @public
   *
   * See https://github.com/phetsims/collision-lab/issues/76.
   */
  saveBallStates() {

    // Save the state of each Ball in the BallSystem.
    this.balls.forEach( ball => {
      ball.saveState();
    } );
  }
}
collisionLab.register( 'BallSystem', BallSystem );
export default BallSystem;