// Copyright 2019, University of Colorado Boulder

/**
 * Common Model for collision lab
 * @author Martin Veillette
 */
define( require => {
  'use strict';

  // modules
  const collisionLab = require( 'COLLISION_LAB/collisionLab' );
  const CollisionLabConstants = require( 'COLLISION_LAB/common/CollisionLabConstants' );
  const NumberProperty = require( 'AXON/NumberProperty' );
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const Vector2 = require( 'DOT/Vector2' );
  const Ball = require( 'COLLISION_LAB/Common/Model/Ball' );
  const Range = require( 'DOT/Range' );
  const ObservableArray = require( 'AXON/ObservableArray' );

  /**
   * @constructor
   */
  class CommonModel {

    /**
     * @param {Tandem} tandem
     */
    constructor( tandem ) {

      // @public
      this.numberOfBallsProperty = new NumberProperty( 2 );

      // @public read-only
      this.centerOfMassPosition = new Vector2( 0, 0 );

      // @public
      this.elasticityProperty = new NumberProperty( 1, { range: new Range( 0, 1 ) } );

      // @public
      this.isBorderReflecting = new BooleanProperty( true );

      // @public
      this.balls = new ObservableArray();

      this.createInitialBallData();

      this.initializeBalls();

      const self = this;

      // update the number of balls
      this.numberOfBallsProperty.lazyLink( function( newValue, oldValue ) {
        const difference = newValue - oldValue;

        if ( difference < 0 ) {

          // remove ball(s) from observableArray
          self.balls.splice( oldValue - 1, Math.abs( difference ) );
        }
        else {
          // add balls to observableArray
          for ( let i = oldValue; i < newValue; i++ ) {
            self.balls.push( self.prepopulatedBalls[ i ] );
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
      this.balls.forEach( function( ball ) {
        ball.step( dt );
        // console.log( ball.position );
      } );
    }

    /**
     * @private
     */
    createInitialBallData() {

      this.prepopulatedBalls = new Array( CollisionLabConstants.MAX_BALLS );
      this.prepopulatedBalls[ 0 ] = new Ball( 0.5, new Vector2( 1, 1 ), new Vector2( 1, 0.3 ) );
      this.prepopulatedBalls[ 1 ] = new Ball( 1.5, new Vector2( 2, 0.5 ), new Vector2( -0.5, -0.5 ) );
      this.prepopulatedBalls[ 2 ] = new Ball( 1, new Vector2( 1, -0.5 ), new Vector2( -0.5, -0.25 ) );
      this.prepopulatedBalls[ 3 ] = new Ball( 4, new Vector2( 2.2, -1.2 ), new Vector2( 1.1, 0.2 ) );
      this.prepopulatedBalls[ 4 ] = new Ball( 5, new Vector2( 1.2, 0.8 ), new Vector2( -1.1, 0 ) );
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


    /**
     * @public
     */
    setCenterOfMass() {
      let totalMass = 0;
      let totalFirstMoment = new Vector2( 0, 0 );

      this.balls.forEach( function( ball ) {
        totalMass += ball.getMass();
        totalFirstMoment = totalFirstMoment.plus( ball.getFirstMoment() );
      } );

      this.centerOfMassPosition = totalFirstMoment.divideScalar( totalMass );
    }
  }

  return collisionLab.register( 'CommonModel', CommonModel );
} );