// Copyright 2019-2020, University of Colorado Boulder

/**
 * PlayArea is the model for the PlayArea system of different Ball objects, intended to be sub-classed.
 *
 * PlayArea is mainly responsible for:
 *   - Keeping track of the number of Balls within the PlayArea system.
 *   - Tracking if there are any Balls that are being controlled by the user.
 *   - Keeping track of the total kinetic energy of all the Balls in the PlayArea.
 *   - Stepping each Ball at each step call.
 *   - CenterOfMass model instantiation for the system of Balls
 *
 * PlayArea is created at the start of the sim and is never disposed, so no dispose method is necessary.
 *
 * @author Brandon Li
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import ObservableArray from '../../../../axon/js/ObservableArray.js';
import Property from '../../../../axon/js/Property.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import Ball from './Ball.js';
import CenterOfMass from './CenterOfMass.js';
import TotalKineticEnergyProperty from './TotalKineticEnergyProperty.js';

class PlayArea {

  /**
   * @param {Property.<number>} numberOfBallsProperty - the number of Balls in the PlayArea system.
   * @param {Property.<boolean>} constantRadiusProperty - indicates if Ball radii should be constant.
   * @param {Property.<boolean>} gridVisibleProperty - indicates if the play-area has a grid.
   */
  constructor( numberOfBallsProperty, constantRadiusProperty, gridVisibleProperty ) {
    assert && assert( numberOfBallsProperty instanceof Property && typeof numberOfBallsProperty.value === 'number', `invalid numberOfBallsProperty: ${numberOfBallsProperty}` );
    assert && assert( constantRadiusProperty instanceof Property && typeof constantRadiusProperty.value === 'boolean', `invalid constantRadiusProperty: ${constantRadiusProperty}` );
    assert && assert( gridVisibleProperty instanceof Property && typeof gridVisibleProperty.value === 'boolean', `invalid gridVisibleProperty: ${gridVisibleProperty}` );

    //----------------------------------------------------------------------------------------

    // @private {Balls[]} - an array of all possible balls. Balls are created at the start of the Simulation and are
    //                      never disposed. However, these Balls are NOT necessarily the Balls currently within the
    //                      PlayArea system. That is determined by the `this.balls` declaration below. This is just used
    //                      so that the same Ball instances are added with the same number of balls.
    this.prepopulatedBalls = CollisionLabConstants.DEFAULT_BALL_SETTINGS.map( ( ballSettings, index ) => new Ball(
      ballSettings.position,
      ballSettings.velocity,
      ballSettings.mass,
      constantRadiusProperty,
      gridVisibleProperty,
      index + 1
    ) );

    // @public (read-only) {ObservableArray.<Ball>} - an array of the system of Balls within the PlayArea. Balls
    //                                                **must** be from `this.prepopulatedBalls`.
    this.balls = new ObservableArray();

    //----------------------------------------------------------------------------------------

    // @public (read-only) {BooleanProperty} - indicates if there are any Balls that are being controlled by the user.
    this.playAreaUserControlledProperty = new BooleanProperty( false );

    // Loop through each prepopulatedBall. Balls in the PlayArea system (in `this.balls`) must Balls be from
    // the prepopulatedBalls array, so this accounts for all possible Balls.
    this.prepopulatedBalls.forEach( prepopulatedBall => {

      // Observe when the user is controlling the Ball. Link is never disposed as PlayAreas nor Balls are ever disposed.
      prepopulatedBall.userControlledProperty.link( () => {

        // Determine if any of the balls, within the system, are being controlled by the user.
        this.playAreaUserControlledProperty.value = this.balls.some( ball => ball.userControlledProperty.value );
      } );
    } );

    //----------------------------------------------------------------------------------------

    // @public
    this.totalKineticEnergyProperty = new TotalKineticEnergyProperty( this.balls );

    // @public (read-only)
    this.centerOfMass = new CenterOfMass( this.balls );

    //----------------------------------------------------------------------------------------

    // Observe when the number of Balls is manipulated by the user and if so, add or remove the correct number of Balls
    // to match the numberOfBallsProperty's value.
    //
    // The same Balls are added with the same numberOfBalls value. Link is never disposed as PlayArea's are never
    // disposed.
    numberOfBallsProperty.link( ( numberOfBalls, previousNumberOfBalls ) => {
      const difference = numberOfBalls - ( previousNumberOfBalls || 0 );

      if ( difference < 0 ) {
        // Remove the correct number of Balls.
        this.balls.splice( previousNumberOfBalls + difference, Math.abs( difference ) );
      }
      else {
        // Add the correct number of Balls, referencing an index of the prepopulatedBalls so that the same Balls are
        // added with the same numberOfBalls value.
        for ( let i = ( previousNumberOfBalls || 0 ); i < numberOfBalls; i++ ) {
          this.balls.push( this.prepopulatedBalls[ i ] );
        }
      }
    } );
  }

  /**
   * Resets the model
   * @public
   */
  reset() {
    this.prepopulatedBalls.forEach( ball => ball.reset() ); // Reset All Possible Balls.
    this.totalKineticEnergyProperty.reset();
  }

  /**
   * Steps the position of the balls.
   * @public
   * @param {number} dt
   */
  step( dt ) {
    assert && assert( typeof dt === 'number', `invalid dt: ${dt}` );

    // Updates the position and velocity of each ball.
    this.balls.forEach( ball => {
      ball.step( dt );
    } );
  }

  /**
   * Clear the trace 'paths' of the Balls and the CenterOfMass. This is called when the 'path' Checkbox is unchecked.
   * @public
   */
  clearPaths() {
    this.balls.forEach( ball => ball.clearDataPoints() );
    this.centerOfMass.clearDataPoints();
  }

  /**
   * Records and updates the current DataPoinnts of the Balls and CenterOfMass for the trace 'paths'.
   * Called when the 'Path' Checkbox is checked on each step.
   * @public
   *
   * @param {number} time - the total elapsed time of the simulation, in seconds.
   */
  updatePathDataPoints( time ) {
    this.balls.forEach( ball => ball.updateDataPoints( time ) );
    this.centerOfMass.updateDataPoints( time );
  }
}

collisionLab.register( 'PlayArea', PlayArea );
export default PlayArea;