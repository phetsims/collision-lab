// Copyright 2019, University of Colorado Boulder

/**
 * Common Model for collision lab
 * @author Martin Veillette
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
  const NumberProperty = require( 'AXON/NumberProperty' );
  const ObservableArray = require( 'AXON/ObservableArray' );
  const Range = require( 'DOT/Range' );
  const Vector2 = require( 'DOT/Vector2' );

  // constants
  const TABLE_BOUNDS = CollisionLabConstants.TABLE_BOUNDS;

  class CollisionLabModel {

    /**
     * @param {Tandem} tandem
     */
    constructor( tandem ) {

      // @public
      this.numberOfBallsProperty = new NumberProperty( 2 );

      // @public
      this.elasticityProperty = new NumberProperty( 1, { range: new Range( 0, 1 ) } );

      // @public
      this.isBorderReflecting = new BooleanProperty( true );

      // @public
      this.balls = new ObservableArray();

      // @public
      this.collisionDetector = new CollisionDetector( TABLE_BOUNDS, this.balls, this.elasticityProperty );

      this.createInitialBallData();

      this.initializeBalls();

      // @public (read-only)
      this.centerOfMass = new CenterOfMass( this.balls );


      // @public (read-only)
      this.time = 0;

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
      this.isBorderReflecting.reset();
      this.elasticityProperty.reset();
      this.createInitialBallData();
      this.initializeBalls();
    }

    /**
     * Steps the model forward in time
     * @public
     * @param {number} dt
     */
    step( dt ) {

      this.lastTime = this.time;

      // updates the position and velocity of each ball
      this.balls.forEach( ball => {
        ball.step( dt );
      } );
      this.collisionDetector.detectCollision( this.lastTime, this.time );
      this.collisionDetector.doBallBorderCollisions();

      this.time += dt;

      // updates the position and velocity of center of mass
      this.centerOfMass.update();
    }

    /**
     * @private
     */
    createInitialBallData() {
      this.prepopulatedBalls = new Array( CollisionLabConstants.MAX_BALLS );
      this.prepopulatedBalls[ 0 ] = new Ball( 0.5, new Vector2( 1, 0.5 ), new Vector2( -1, -0.3 ) );
      this.prepopulatedBalls[ 1 ] = new Ball( 1.5, new Vector2( -1, -0.5 ), new Vector2( 0.5, 0.5 ) );
      this.prepopulatedBalls[ 2 ] = new Ball( 1, new Vector2( 1, -0.5 ), new Vector2( -0.5, -0.25 ) );
      this.prepopulatedBalls[ 3 ] = new Ball( 4, new Vector2( 2.2, -1.2 ), new Vector2( 1.1, 0.2 ) );
      this.prepopulatedBalls[ 4 ] = new Ball( 5, new Vector2( 1.2, 0.8 ), new Vector2( -1.1, 0 ) );
      this.prepopulatedBalls[ 5 ] = new Ball( 0.5, new Vector2( 1.2, 0.8 ), new Vector2( -1.1, 0 ) );

      // increase the number of balls for debugging/ performance purposes
      for ( let i = 6; i < CollisionLabConstants.MAX_BALLS; i++ ) {
        this.prepopulatedBalls[ i ] = new Ball( 0.25, new Vector2( 1.2, 0.8 ), new Vector2( -1.1, 0 ) );
      }
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

  return collisionLab.register( 'CollisionLabModel', CollisionLabModel );
} );