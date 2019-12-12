// Copyright 2019, University of Colorado Boulder

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

define( require => {
  'use strict';

  // modules
  const Ball = require( 'COLLISION_LAB/common/model/Ball' );
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const CenterOfMass = require( 'COLLISION_LAB/common/model/CenterOfMass' );
  const CollisionDetector = require( 'COLLISION_LAB/common/model/CollisionDetector' );
  const collisionLab = require( 'COLLISION_LAB/collisionLab' );
  const CollisionLabConstants = require( 'COLLISION_LAB/common/CollisionLabConstants' );
  const Grid = require( 'COLLISION_LAB/common/model/Grid' );
  const KineticEnergySumProperty = require( 'COLLISION_LAB/common/model/KineticEnergySumProperty' );
  const NumberProperty = require( 'AXON/NumberProperty' );
  const ObservableArray = require( 'AXON/ObservableArray' );
  const Range = require( 'DOT/Range' );

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

      // @public (read-only) running time
      this.time = 0;

      // @public (read-only) running time at the previous step - value will be updated later
      this.lastTime = 0;

      // @public
      this.numberOfBallsProperty = new NumberProperty( 2 );

      // @public
      this.elasticityProperty = new NumberProperty( 1, { range: new Range( 0, 1 ) } );

      // @public determines if the balls will reflect at the border
      this.reflectingBorderProperty = new BooleanProperty( true );

      // @public determines if the ball size is constant (i.e. independent of mass)
      this.constantRadiusProperty = new BooleanProperty( false );

      // @public
      this.kineticEnergySumProperty = new KineticEnergySumProperty( balls );

      // @public (read-only)
      this.centerOfMass = new CenterOfMass( balls );

      // @public
      this.collisionDetector = new CollisionDetector( PLAY_AREA_BOUNDS, balls, this.elasticityProperty );

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
      this.elasticityProperty.reset();
      this.reflectingBorderProperty.reset();
      this.constantRadiusProperty.reset();
      this.kineticEnergySumProperty.reset();
      this.createInitialBallData();
      this.initializeBalls();
    }

    /**
     *
     * @param {number} dt
     * @param {boolean} isReversing
     */
    step( dt, isReversing ) {

      assert && assert( typeof dt === 'number', `invalid dt: ${dt}` );

      // Go backwards in time if we're reversing
      if ( isReversing ) {
        dt *= -1;
      }
      else {
        // else increment time
        this.lastTime = this.time;
      }

      // increment the clock time
      this.time += dt;

      // updates the position and velocity of each ball
      this.balls.forEach( ball => {
        ball.step( dt );
      } );

      this.collisionDetector.isReversing = isReversing;
      this.collisionDetector.detectCollision( this.lastTime, this.time );
      this.collisionDetector.doBallBorderCollisions();

      //
      if ( isReversing ) {
        this.lastTime = this.time;
      }


    }

    /**
     * Create
     * @private
     */
    createInitialBallData() {
      DEFAULT_BALL_SETTINGS.forEach( ballSettings => {
        this.prepopulatedBalls.push( new Ball( ballSettings.mass,
          ballSettings.position,
          ballSettings.velocity,
          this.constantRadiusProperty ) );
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

  return collisionLab.register( 'PlayArea', PlayArea );
} );