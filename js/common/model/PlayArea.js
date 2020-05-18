// Copyright 2019-2020, University of Colorado Boulder

/**
 * PlayArea is the model for the PlayArea system of different Ball objects, intended to be sub-classed.
 *
 * PlayArea is mainly responsible for:
 *   - Keeping track of the number of Balls within the PlayArea system.
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
   * @param {ObservableArray.<Ball>} balls
   */
  constructor( balls, elasticityPercentProperty, numberOfBallsProperty ) {
    assert && assert( balls instanceof ObservableArray && balls.count( ball => ball instanceof Ball ) === balls.length, `invalid balls: ${balls}` );

    // @public {Property.<boolean>}
    this.stepBackwardButtonEnabledProperty = new DerivedProperty( [ elasticityPercentProperty ],
      elasticity => elasticity > 0 );

    // @public determines if the balls will reflect at the border
    this.reflectingBorderProperty = new BooleanProperty( true );

    // @public determines if the balls are sticky
    this.isStickyProperty = new BooleanProperty( true );

    // @public {Property.<boolean>}
    this.isComplettelyInelasticAndStickyProperty = new DerivedProperty( [ elasticityPercentProperty, this.isStickyProperty ],
      ( elasticity, isSticky ) => elasticity === 0 && isSticky );

    // @public determines if the ball size is constant (i.e. independent of mass)
    this.constantRadiusProperty = new BooleanProperty( false );

    // @public
    this.kineticEnergySumProperty = new KineticEnergySumProperty( balls );

    // @public (read-only)
    this.centerOfMass = new CenterOfMass( balls );

    // @public
    this.collisionDetector = new CollisionDetector( PLAY_AREA_BOUNDS,
      balls,
      new DerivedProperty( [ elasticityPercentProperty ], elasticity => elasticity / 100 ),
      this.isComplettelyInelasticAndStickyProperty,
      this.reflectingBorderProperty );

    // @public (read-only) shape for the grid
    this.grid = new Grid();

    this.balls = balls;

    // create an array for all possible balls.
    this.prepopulatedBalls = [];
    this.createInitialBallData();

    this.initializeBalls( numberOfBallsProperty.value );

    // update the number of balls
    numberOfBallsProperty.lazyLink( ( newValue, oldValue ) => {
      const difference = newValue - oldValue;

      if ( difference < 0 ) {

        // remove ball(s) from observableArray
        this.balls.splice( oldValue + difference, Math.abs( difference ) );
      }
      else {
        // add balls to observableArray
        for ( let i = oldValue; i < newValue; i++ ) {
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
    this.reflectingBorderProperty.reset();
    this.constantRadiusProperty.reset();
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

  /**
   * Create an an array containing all possible balls with initial conditions
   * @private
   */
  createInitialBallData() {

    // empty the prepopulated ball array
    this.prepopulatedBalls = [];

    // create initial data for balls
    DEFAULT_BALL_SETTINGS.forEach( ( ballSettings, index ) => {
      this.prepopulatedBalls.push( new Ball(
        ballSettings.position,
        ballSettings.velocity,
        ballSettings.mass,
        this.constantRadiusProperty,
        index + 1
      ) );
    } );
  }

  /**
   * @private
   */
  initializeBalls( numberOfBalls ) {
    this.balls.clear();
    for ( let i = 0; i < numberOfBalls; i++ ) {
      this.balls.push( this.prepopulatedBalls[ i ] );
    }
  }
}

collisionLab.register( 'PlayArea', PlayArea );
export default PlayArea;