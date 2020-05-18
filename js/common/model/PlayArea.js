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
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import ObservableArray from '../../../../axon/js/ObservableArray.js';
import Property from '../../../../axon/js/Property.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import Ball from './Ball.js';
import CenterOfMass from './CenterOfMass.js';
import CollisionDetector from './CollisionDetector.js';
import Grid from './Grid.js';
import KineticEnergySumProperty from './KineticEnergySumProperty.js';

// constants
const PLAY_AREA_BOUNDS = CollisionLabConstants.PLAY_AREA_BOUNDS;
const DEFAULT_BALL_SETTINGS = CollisionLabConstants.DEFAULT_BALL_SETTINGS;

class PlayArea {

  /**
   * @param {Property.<number>} numberOfBallsProperty - the number of Balls in the PlayArea system.
   * @param {Property.<number>} elasticityPercentProperty - the elasticity of all collisions, as a percentage.
   * @param {Property.<boolean>} reflectingBorderProperty - indicates if Balls should reflect off the borders.
   * @param {Property.<boolean>} constantRadiusProperty - indicates if Ball radii should be constant.
   * @param {Property.<boolean>} isStickyProperty - indicates if inelastic collisions stick or slide.
   */
  constructor(
    numberOfBallsProperty,
    elasticityPercentProperty,
    reflectingBorderProperty,
    constantRadiusProperty,
    isStickyProperty
  ) {
    assert && assert( numberOfBallsProperty instanceof Property && typeof numberOfBallsProperty.value === 'number', `invalid numberOfBallsProperty: ${numberOfBallsProperty}` );
    assert && assert( elasticityPercentProperty instanceof Property && typeof elasticityPercentProperty.value === 'number', `invalid elasticityPercentProperty: ${elasticityPercentProperty}` );
    assert && assert( reflectingBorderProperty instanceof Property && typeof reflectingBorderProperty.value === 'boolean', `invalid reflectingBorderProperty: ${reflectingBorderProperty}` );
    assert && assert( constantRadiusProperty instanceof Property && typeof constantRadiusProperty.value === 'boolean', `invalid constantRadiusProperty: ${constantRadiusProperty}` );
    assert && assert( isStickyProperty instanceof Property && typeof isStickyProperty.value === 'boolean', `invalid isStickyProperty: ${isStickyProperty}` );

    //----------------------------------------------------------------------------------------
    // @private {Balls[]} - an array of all possible balls. Balls are created at the start of the Simulation and are
    //                      never disposed. However, these Balls are NOT necessarily the Balls currently within the
    //                      PlayArea system. That is determined by the `this.balls` declaration below. This is just used
    //                      so that the same Ball instances are added with the same number of balls.
    this.prepopulatedBalls = [];
    DEFAULT_BALL_SETTINGS.forEach( ( ballSettings, index ) => {
      this.prepopulatedBalls.push( new Ball(
        ballSettings.position,
        ballSettings.velocity,
        ballSettings.mass,
        constantRadiusProperty,
        index + 1
      ) );
    } );


    // @public (read-only) {ObservableArray.<Ball>} - an array of the system of Balls within the PlayArea. Balls
    //                                                **must** be from `this.prepopulatedBalls`.
    this.balls = new ObservableArray();

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
    this.kineticEnergySumProperty = new KineticEnergySumProperty( this.balls );

    // @public (read-only)
    this.centerOfMass = new CenterOfMass( this.balls );

    // @public
    this.collisionDetector = new CollisionDetector( PLAY_AREA_BOUNDS,
      this.balls,
      new DerivedProperty( [ elasticityPercentProperty ], elasticity => elasticity / 100 ),
      isStickyProperty,
      reflectingBorderProperty );

    // @public (read-only) shape for the grid
    this.grid = new Grid();
  }

  /**
   * Resets the model
   * @public
   */
  reset() {
    this.kineticEnergySumProperty.reset();
  }

  /**
   * Steps the position of the balls
   * The position of the balls is
   * (1) updated based on the ballistic motion of individual balls
   * (2) corrected through collisionDetector, to take into account collisions between balls and walls
   * @public
   * @param {number} dt
   * @param {boolean} isReversing - is simulation step in reverse
   */
  step( dt, isReversing ) {

    assert && assert( typeof dt === 'number', `invalid dt: ${dt}` );


    // updates the position and velocity of each ball
    this.balls.forEach( ball => {
      ball.step( dt );
    } );

    this.collisionDetector.isReversing = isReversing;
    this.collisionDetector.detectCollision( dt );
    this.collisionDetector.doBallBorderCollisionsImproved( dt );

  }
}

collisionLab.register( 'PlayArea', PlayArea );
export default PlayArea;