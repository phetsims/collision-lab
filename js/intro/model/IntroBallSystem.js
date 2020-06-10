// Copyright 2020, University of Colorado Boulder

/**
 * IntroBallSystem is a BallSystem sub-type for the 'Intro' screen.
 *
 *
 * @author Brandon Li
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import RangeWithValue from '../../../../dot/js/RangeWithValue.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import merge from '../../../../phet-core/js/merge.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabQueryParameters from '../../common/CollisionLabQueryParameters.js';
import BallState from '../../common/model/BallState.js';
import BallSystem from '../../common/model/BallSystem.js';
import PlayArea from '../../common/model/PlayArea.js';

// constants
const INTRO_INITIAL_BALL_STATES = [
  new BallState( new Vector2( -1, 0 ), new Vector2( 1, 0 ), 0.5 ),
  new BallState( new Vector2( 0, 0 ), new Vector2( -0.5, 0 ), 1.5 )
];
const CHANGE_IN_MOMENTUM_VISIBLE_PERIOD = CollisionLabQueryParameters.changeInMomentumVisiblePeriod;
const CHANGE_IN_MOMENTUM_FADE_PERIOD = CollisionLabQueryParameters.changeInMomentumFadePeriod;


class IntroBallSystem extends BallSystem {

  /**
   * @param {PlayArea} playArea
   * @param {Object} [options]
   */
  constructor( playArea, elapsedTimeProperty, options ) {
    assert && assert( playArea instanceof PlayArea, `invalid playArea: ${playArea}` );

    options = merge( {

      numberOfBallsRange: new RangeWithValue( 2, 2, 2 )

    }, options );

    super( INTRO_INITIAL_BALL_STATES, playArea, options );

    //----------------------------------------------------------------------------------------

    // @public {BooleanProperty}
    this.changeInMomentumVisibleProperty = new BooleanProperty( false );

    // @public (read-only)
    this.changeInMomentumOpacityProperty = new NumberProperty( 0 );

    // @public (read-only)
    this.collisionPointProperty = new Vector2Property( Vector2.ZERO );

    // @public (read-only)
    this.collisionTime = 0;

    // @private
    this.changeInMomentumDefined = false;

    elapsedTimeProperty.link( elapsedTime => {
      if ( this.changeInMomentumDefined ) {
        const dt = elapsedTime - this.collisionTime;

        if ( dt <= 0 ) {
          this.clear();
        }
        if ( dt >= CHANGE_IN_MOMENTUM_VISIBLE_PERIOD &&
            dt <= ( CHANGE_IN_MOMENTUM_VISIBLE_PERIOD + CHANGE_IN_MOMENTUM_FADE_PERIOD ) ) {

          this.changeInMomentumOpacityProperty.value = Utils.linear( CHANGE_IN_MOMENTUM_VISIBLE_PERIOD,
            CHANGE_IN_MOMENTUM_VISIBLE_PERIOD + CHANGE_IN_MOMENTUM_FADE_PERIOD,
            1,
            0,
            dt );

          if ( this.changeInMomentumOpacityProperty.value === 0 ) {
            this.clear();
          }
        }
      }
    } );



    // @public (read-only)
    this.ballToChangeInMomentumProperty = new Map();

    // Populate the Map with Paths.
    this.prepopulatedBalls.forEach( ball => {

      const changeInMomentumProperty = new Vector2Property( Vector2.ZERO );

      ball.momentumProperty.link( ( ballMomentum, previousBallMomentum ) => {
        if ( previousBallMomentum && this.changeInMomentumVisibleProperty.value && !ball.userControlledProperty.value ) {
          changeInMomentumProperty.value = ballMomentum.minus( previousBallMomentum );
        }
      } );

      this.ballToChangeInMomentumProperty.set( ball, changeInMomentumProperty );
    } );

    //----------------------------------------------------------------------------------------

    this.changeInMomentumVisibleProperty.link( changeInMomentVisible => {
      if ( !changeInMomentVisible ) {
        this.clear();
      }
    } );

    this.ballSystemUserControlledProperty.link( userControlled => {
      if ( userControlled ) {
        this.clear();
      }
    } );

    // @private
    this.elapsedTimeProperty = elapsedTimeProperty;
  }

  // @public
  clear() {
    this.ballToChangeInMomentumProperty.forEach( changeInMomentumProperty => {
      changeInMomentumProperty.reset();
    } );
    this.changeInMomentumDefined = false;
    this.changeInMomentumOpacityProperty.value = 0;
  }


  // @public
  registerBallCollision( collisionPoint, overlappedTime ) {
    if ( this.changeInMomentumVisibleProperty.value ) {
      this.collisionPointProperty.value = collisionPoint;
      this.collisionTime = this.elapsedTimeProperty.value - overlappedTime;
      this.changeInMomentumDefined = true;
      this.changeInMomentumOpacityProperty.value = 1;
    }
  }
}

collisionLab.register( 'IntroBallSystem', IntroBallSystem );
export default IntroBallSystem;