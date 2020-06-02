// Copyright 2020, University of Colorado Boulder

/**
 * BallSystem is a sub-model of PlayArea for a system of different Ball objects.
 *
 * BallSystem is mainly responsible for:
 *   - Keeping track the Balls and the  number of Balls in the system.
 *   - Tracking if there are any Balls that are being controlled by the user.
 *   - Keeping track of the total kinetic energy of the system.
 *   - Stepping each Ball at each step call.
 *   - CenterOfMass model instantiation for the system of Balls
 *
 * Each PlayArea contains a single BallSystem, meaning they are created at the start of the sim. BallSystems are never
 * disposed, so no dispose method is necessary and links are left as-is.
 *
 * @author Brandon Li
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import ObservableArray from '../../../../axon/js/ObservableArray.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabUtils from '../CollisionLabUtils.js';
import Ball from './Ball.js';
import CenterOfMass from './CenterOfMass.js';

class BallSystem {

  /**
   * @param {Ball[]} prepopulatedBalls - array of ALL possible balls, sorted by their indices. The Balls in the system
   *                                     come from this array. The same number of Balls uses the same Ball instances.
   * @param {Property.<number>} numberOfBallsProperty - the number of Balls in the PlayArea system.
   * @param {Bounds2} playAreaBounds - the model Bounds of the PlayArea
   * @param {Property.<boolean>} pathVisibleProperty - indicates if trailing paths are visible.
   * @param {Property.<boolean>} centerOfMassVisibleProperty - indicates if the center of mass is currently visible.
   */
  constructor( prepopulatedBalls,
               numberOfBallsProperty,
               playAreaBounds,
               pathVisibleProperty,
               centerOfMassVisibleProperty ) {

    assert && assert( CollisionLabUtils.consistsOf( prepopulatedBalls, Ball ), `invalid prepopulatedBalls: ${ prepopulatedBalls }` );
    assert && CollisionLabUtils.assertPropertyTypeof( numberOfBallsProperty, 'number' );
    assert && assert( playAreaBounds instanceof Bounds2, `invalid playAreaBounds: ${playAreaBounds}` );
    assert && CollisionLabUtils.assertPropertyTypeof( pathVisibleProperty, 'number' );
    assert && CollisionLabUtils.assertPropertyTypeof( centerOfMassVisibleProperty, 'boolean' );

    //----------------------------------------------------------------------------------------

    // @public (read-only) {ObservableArray.<Ball>} - an array of the balls currently within the system. Balls
    //                                                **must** be from prepopulatedBalls array. Its length should
    //                                                match the numberOfBallsProperty's value.
    this.balls = new ObservableArray();

    // Observe when the number of Balls is manipulated by the user and if so, add or remove the correct number of Balls
    // to match the numberOfBallsProperty's value.
    //
    // The same Balls are added with the same numberOfBalls value. Link is never disposed as BallSystems's are never
    // disposed.
    numberOfBallsProperty.link( numberOfBalls => {

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
        while ( this.balls !== numberOfBalls ) {
          this.balls.pop();
        }
      }
    } );

    //----------------------------------------------------------------------------------------

    // @public {DerivedProperty.<number>} - the total kinetic energy of the system of balls.
    //
    // For the dependencies, we use:
    //  - The KE Properties of the prepopulatedBalls. Only the balls in the play-area are used in the calculation.
    //  - numberOfBallsProperty, since removing or adding a Ball changes the total kinetic energy of the system.
    //
    // This DerivedProperty is never disposed and lasts for the lifetime of the sim.
    this.totalKineticEnergyProperty = new DerivedProperty(
      [ numberOfBallsProperty, ...this.prepopulatedBalls.map( ball => ball.kineticEnergyProperty ) ],
      () => {
        return _.sum( this.balls.map( ball => ball.kineticEnergy ) );
      }, {
        valueType: 'number',
        isValidValue: value => value >= 0
      } );

    //----------------------------------------------------------------------------------------

    // @public (read-only) {CenterOfMass} - the center of mass of the system of Balls
    this.centerOfMass = new CenterOfMass(
      prepopulatedBalls,
      this.balls,
      playAreaBounds,
      centerOfMassVisibleProperty,
      pathVisibleProperty
    );
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
    this.centerOfMass.reset();
  }

  /**
   * Restarts the BallSystem.
   * @public
   *
   * See https://github.com/phetsims/collision-lab/issues/76 for context on the differences between reset and restart.
   */
  restart() {
    this.balls.forEach( ball => ball.restart() );
    this.centerOfMass.path.clear();
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

  /**
   * Updates the trailing 'Paths' of all Balls in the system and the CenterOfMass.
   * @public
   *
   * @param {number} elapsedTime - the total elapsed time of the simulation, in seconds.
   */
  updatePaths( elapsedTime ) {
    assert && assert( typeof elapsedTime === 'number' && elapsedTime >= 0, `invalid elapsedTime: ${elapsedTime}` );

    this.balls.forEach( ball => ball.updatePath( elapsedTime ) );
    this.centerOfMass.updatePath( elapsedTime );
  }
}
collisionLab.register( 'BallSystem', BallSystem );
export default BallSystem;