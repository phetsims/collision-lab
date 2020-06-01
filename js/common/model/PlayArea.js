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

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import ObservableArray from '../../../../axon/js/ObservableArray.js';
import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import isArray from '../../../../phet-core/js/isArray.js';
import merge from '../../../../phet-core/js/merge.js';
import collisionLab from '../../collisionLab.js';
import Ball from './Ball.js';
import BallState from './BallState.js';
import CenterOfMass from './CenterOfMass.js';

class PlayArea {

  /**
   * @param {BallState[]} initialBallStates - the initial BallStates of ALL possible Balls in the system.
   * @param {Property.<number>} numberOfBallsProperty - the number of Balls in the PlayArea system.
   * @param {Property.<boolean>} constantRadiusProperty - indicates if Ball radii should be constant.
   * @param {Property.<boolean>} gridVisibleProperty - indicates if the play-area has a grid.
   * @param {Property.<boolean>} pathVisibleProperty - indicates if trailing paths are visible.
   * @param {Property.<boolean>} centerOfMassVisibleProperty - indicates if the center of mass is currently visible.
   * @param {Object} [options]
   */
  constructor( initialBallStates,
               numberOfBallsProperty,
               constantRadiusProperty,
               gridVisibleProperty,
               pathVisibleProperty,
               centerOfMassVisibleProperty,
               options ) {
    assert && assert( isArray( initialBallStates ) && _.every( initialBallStates, ballState => ballState instanceof BallState ), `invalid initialBallStates: ${ initialBallStates }` );
    assert && assert( numberOfBallsProperty instanceof Property && typeof numberOfBallsProperty.value === 'number', `invalid numberOfBallsProperty: ${numberOfBallsProperty}` );
    assert && assert( constantRadiusProperty instanceof Property && typeof constantRadiusProperty.value === 'boolean', `invalid constantRadiusProperty: ${constantRadiusProperty}` );
    assert && assert( gridVisibleProperty instanceof Property && typeof gridVisibleProperty.value === 'boolean', `invalid gridVisibleProperty: ${gridVisibleProperty}` );
    assert && assert( pathVisibleProperty instanceof Property && typeof pathVisibleProperty.value === 'boolean', `invalid pathVisibleProperty: ${pathVisibleProperty}` );
    assert && assert( centerOfMassVisibleProperty instanceof Property && typeof centerOfMassVisibleProperty.value === 'boolean', `invalid centerOfMassVisibleProperty: ${centerOfMassVisibleProperty}` );
    assert && assert( !options || Object.getPrototypeOf( options === Object.prototype ), `invalid options: ${options}` );

    options = merge( {

      // {number} the dimensions of the Screen that contains the PlayArea.
      dimensions: 2,

      // {Bounds2} - the model bounds of the PlayArea, in meters.
      bounds: PlayArea.DEFAULT_BOUNDS

    }, options );

    //----------------------------------------------------------------------------------------

    // @public (read-only) {Bounds2} - the model bounds of the PlayArea, in meters.
    this.bounds = options.bounds;

    // @public (read-only) {Balls[]} - an array of all possible balls. Balls are created at the start of the Simulation and are
    //                                never disposed. However, these Balls are NOT necessarily the Balls currently within the
    //                                PlayArea system. That is determined by the `this.balls` declaration below. This is just used
    //                                so that the same Ball instances are added with the same number of balls.
    this.prepopulatedBalls = initialBallStates.map( ( ballState, index ) => new Ball(
      ballState,
      constantRadiusProperty,
      gridVisibleProperty,
      pathVisibleProperty,
      index + 1, {
        dimensions: options.dimensions,
        playAreaBounds: options.bounds
      } ) );

    // @public (read-only) {ObservableArray.<Ball>} - an array of the system of Balls within the PlayArea. Balls
    //                                                **must** be from `this.prepopulatedBalls`.
    this.balls = new ObservableArray();

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

    //----------------------------------------------------------------------------------------

    // Gather the kineticEnergyProperty and the userControlledProperty of ALL possible balls into their respective
    // arrays.
    const ballUserControlledProperties = this.prepopulatedBalls.map( ball => ball.userControlledProperty );
    const ballKineticEnergyProperties = this.prepopulatedBalls.map( ball => ball.kineticEnergyProperty );

    // @public {DerivedProperty.<boolean>} - indicates if there are any Balls that are being controlled by the user. Use
    //                                       all possible userControlledProperties as dependencies to update the
    //                                       derivation but only the balls in the play-area are used in the calculation.
    this.playAreaUserControlledProperty = new DerivedProperty( ballUserControlledProperties, () => {
        return this.balls.some( ball => ball.userControlledProperty.value );
      }, { valueType: 'boolean' } );

    // @public {DerivedProperty.<number>} - the total kinetic energy of the system of balls.
    //
    // For the dependencies, we use:
    //  - The KE Properties of the prepopulatedBalls. Only the balls in the play-area are used in the calculation.
    //  - numberOfBallsProperty, since removing or adding a Ball changes the total kinetic energy of the system.
    //
    // This DerivedProperty is never disposed and lasts for the lifetime of the sim.
    this.totalKineticEnergyProperty = new DerivedProperty( [ ...ballKineticEnergyProperties, numberOfBallsProperty ],
      () => _.sum( this.balls.map( ball => ball.kineticEnergy ) ), {
        valueType: 'number',
        isValidValue: value => value >= 0
    } );

    //----------------------------------------------------------------------------------------

    // @public (read-only) {CenterOfMass} - the center of mass of the system of Balls
    this.centerOfMass = new CenterOfMass(
      this.prepopulatedBalls,
      this.balls,
      this.bounds,
      centerOfMassVisibleProperty,
      pathVisibleProperty
    );

    // Observe when the user is finished controlling any of the Balls to clear the trailing Path of the CenterOfMass.
    // See https://github.com/phetsims/collision-lab/issues/61#issuecomment-634404105. Link lasts for the life-time of
    // the sim as PlayAreas are never disposed.
    this.playAreaUserControlledProperty.lazyLink( playAreaUserControlled => {
      if ( !playAreaUserControlled ) { this.centerOfMass.path.clear(); }
    } );
  }

  /**
   * Resets the PlayArea.
   * @public
   */
  reset() {
    this.prepopulatedBalls.forEach( ball => ball.reset() ); // Reset All Possible Balls.
    this.centerOfMass.reset();
  }

  /**
   * Restarts the PlayArea.
   * @public
   *
   * See https://github.com/phetsims/collision-lab/issues/76 for context on the differences between reset and restart.
   */
  restart() {
    this.balls.forEach( ball => ball.restart() );
    this.centerOfMass.path.clear();
  }

  /**
   * Saves the states of all the Balls in the PlayArea system for the next restart() call. This is called when the user
   * presses the play button. See https://github.com/phetsims/collision-lab/issues/76.
   * @public
   */
  saveBallStates() {
    this.balls.forEach( ball => ball.saveState() );
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
   * Updates the trailing 'Paths' of all Balls in the system and the CenterOfMass.
   * @public
   *
   * @param {number} elapsedTime - the total elapsed time of the simulation, in seconds.
   */
  updatePaths( elapsedTime ) {
    this.balls.forEach( ball => ball.updatePath( elapsedTime ) );
    this.centerOfMass.updatePath( elapsedTime );
  }
}

// @public (read-only) {Bounds2} - the default bounds of the PlayArea
PlayArea.DEFAULT_BOUNDS = new Bounds2( -2, -1, 2, 1 );

collisionLab.register( 'PlayArea', PlayArea );
export default PlayArea;