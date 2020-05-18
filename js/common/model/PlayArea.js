// Copyright 2019-2020, University of Colorado Boulder

/**
 * PlayArea is the model for the PlayArea of different Ball objects, intended to be sub-classed.
 *
 * PlayAreas are responsible for:
 *   - Keeping track of the number of Balls in the PlayArea.
 *   - Keeping track of the total kinetic energy of all the Balls in the PlayArea.
 *   - Stepping each Ball at each step call.
 *   - Elasticity of all Balls in the PlayArea.
 *   - Keep track of center of mass position and velocity
 *
 * @author Brandon Li
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import ObservableArray from '../../../../axon/js/ObservableArray.js';
import Range from '../../../../dot/js/Range.js';
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
  constructor( balls ) {

    assert && assert( balls instanceof ObservableArray
    && balls.count( ball => ball instanceof Ball ) === balls.length, `invalid balls: ${balls}` );

    // @public
    this.numberOfBallsProperty = new NumberProperty( 2 );

    // @public
    this.elasticityPercentProperty = new NumberProperty( 100, { range: new Range( 0, 100 ) } );

    // @public {Property.<number>}
    this.elasticityProperty = new DerivedProperty( [ this.elasticityPercentProperty ],
      elasticity => elasticity / 100 );

    // @public {Property.<boolean>}
    this.stepBackwardButtonEnabledProperty = new DerivedProperty( [ this.elasticityPercentProperty ],
      elasticity => elasticity > 0 );

    // @public determines if the balls will reflect at the border
    this.reflectingBorderProperty = new BooleanProperty( true );

    // @public determines if the balls are sticky
    this.isStickyProperty = new BooleanProperty( true );

    // @public {Property.<boolean>}
    this.isComplettelyInelasticAndStickyProperty = new DerivedProperty( [ this.elasticityPercentProperty, this.isStickyProperty ],
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
      this.elasticityProperty,
      this.isComplettelyInelasticAndStickyProperty,
      this.reflectingBorderProperty );

    // @public (read-only) shape for the grid
    this.grid = new Grid();

    this.balls = balls;

    // create an array for all possible balls.
    this.prepopulatedBalls = [];
    this.createInitialBallData();

    this.initializeBalls();

    // update the number of balls
    this.numberOfBallsProperty.lazyLink( ( newValue, oldValue ) => {
      const difference = newValue - oldValue;

      if ( difference < 0 ) {

        // remove ball(s) from observableArray
        this.balls.splice( oldValue - 1, Math.abs( difference ) );
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
    this.numberOfBallsProperty.reset();
    this.elasticityPercentProperty.reset();
    this.reflectingBorderProperty.reset();
    this.constantRadiusProperty.reset();
    this.kineticEnergySumProperty.reset();
    this.createInitialBallData();
    this.initializeBalls();
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
  initializeBalls() {
    this.balls.clear();
    for ( let i = 0; i < this.numberOfBallsProperty.value; i++ ) {
      this.balls.push( this.prepopulatedBalls[ i ] );
    }
  }
}

collisionLab.register( 'PlayArea', PlayArea );
export default PlayArea;