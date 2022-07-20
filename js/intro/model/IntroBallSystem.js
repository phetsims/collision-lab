// Copyright 2020-2022, University of Colorado Boulder

/**
 * IntroBallSystem is a BallSystem sub-type for the 'Intro' screen. IntroBallSystems only have 2 fixed Balls and the
 * numberOfBallsProperty cannot be mutated.
 *
 * In the 'Intro' screen, there are 'Change in Momentum' vectors that appear 'briefly' when the momentum of a Ball
 * collides and changes momentum with another Ball. IntroBallSystem will keep track of the momentum of the two Balls
 * and compute the change in momentum vector. The vector is rendered out-of-bounds of the PlayArea to reduce clutter.
 * After a collision, the change in momentum vectors are fully opaque for a set time-period. Then, after this
 * time-period, the opacity linearly reduces for another set period of time. The opacity of the vectors are also
 * modeled in this class.
 *
 * In the design, the 'Change in Momentum' vectors are only shown for collisions that occur AFTER the visibility
 * checkbox is checked, meaning the components of the change in momentum vectors are always 0 if the checkbox isn't
 * checked and are only updated if and only if the checkbox is checked. Thus, the changeInMomentumVisibleProperty is in
 * the model.
 *
 * Additionally, the view renders a 'Change in Momentum' string over where the two Balls collided, (there are no
 * ball-to-border collisions in 'Intro'). This collision point can only be computed inside of IntroCollisionEngine.js,
 * which will signal to the IntroBallSystem that a collision between the two balls has occurred, passing the collision
 * point and time. This will then trigger changes in the changeInMomentumOpacityProperty over time.
 *
 * @author Brandon Li
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import RangeWithValue from '../../../../dot/js/RangeWithValue.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import merge from '../../../../phet-core/js/merge.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabQueryParameters from '../../common/CollisionLabQueryParameters.js';
import BallState from '../../common/model/BallState.js';
import BallSystem from '../../common/model/BallSystem.js';
import IntroPlayArea from './IntroPlayArea.js';

// constants
const CHANGE_IN_MOMENTUM_VISIBLE_PERIOD = CollisionLabQueryParameters.changeInMomentumVisiblePeriod;
const CHANGE_IN_MOMENTUM_FADE_PERIOD = CollisionLabQueryParameters.changeInMomentumFadePeriod;
const NUMBER_OF_BALLS = 2;
const OPACITY_RANGE = new Range( 0, 1 );

class IntroBallSystem extends BallSystem {

  /**
   * @param {IntroPlayArea} playArea
   * @param {Property.<number>} elapsedTimeProperty
   * @param {Object} [options]
   */
  constructor( playArea, elapsedTimeProperty, options ) {
    assert && assert( playArea instanceof IntroPlayArea, `invalid playArea: ${playArea}` );
    assert && AssertUtils.assertPropertyOf( elapsedTimeProperty, 'number' );

    options = merge( {

      numberOfBallsRange: new RangeWithValue( NUMBER_OF_BALLS, NUMBER_OF_BALLS, NUMBER_OF_BALLS ),
      pathsVisibleInitially: false

    }, options );

    super( IntroBallSystem.INITIAL_BALL_STATES, playArea, options );

    // Verify that there is a fixed number of Balls in the 'Intro' screen.
    assert && this.numberOfBallsProperty.link( numberOfBalls => assert( numberOfBalls === NUMBER_OF_BALLS ) );

    // Verify that Paths are never visible for the 'Explore 1D' screen.
    assert && this.pathsVisibleProperty.link( pathVisible => assert( !pathVisible ) );

    //----------------------------------------------------------------------------------------

    // @public {Property.<boolean>} - indicates if the 'Change in Momentum' vectors are visible. This is in the model since
    //                             the change in momentum vectors are only updated after the visibility checkbox is
    //                             checked and are zero when false. Set externally in the view.
    this.changeInMomentumVisibleProperty = new BooleanProperty( false );

    // @public (read-only) {Property.<number>} - the opacity of the 'Change in Momentum' vectors. Set internally in this
    //                                           class but can be read by the view.
    this.changeInMomentumOpacityProperty = new NumberProperty( 0 );

    // @public (read-only) {Property.<Vector2|null>} - the collision point of the Balls in the 'Intro' BallSystem. If
    //                                                 this changes to a non-null position, a collision has happened and
    //                                                 will trigger changes in the changeInMomentumOpacityProperty over
    //                                                 time. Null means a collision-point is not yet defined.
    this.collisionPointProperty = new Property( null, {
      isValidValue: value => value instanceof Vector2 || value === null,
      reentrant: true
    } );

    // @public (read-only) {number|null} - indicates when the collision between the two Balls occurred. Null indicates
    //                                     the collision-time is not yet defined.
    this.collisionContactTime = null;

    // @public (read-only) {Map.<Ball, Vector2Property>} - Map of a Ball to its associated 'Change in Momentum' vector.
    this.ballToChangeInMomentumProperty = new Map();

    //----------------------------------------------------------------------------------------

    // Populate the Map. There are a fixed number of Balls in the IntroBallSystem and Balls are never disposed.
    this.balls.forEach( ball => {

      // Map the ball to a change in momentum Property.
      this.ballToChangeInMomentumProperty.set( ball, new Vector2Property( Vector2.ZERO ) );

      // Observe when the momentum of the Ball changes and compute the change in momentum. Currently, DerivedProperties
      // have no support for passing the previous values, so we have to use a normal Property link to compute the change
      // in momentum. Link lasts for the life-time of the sim as Balls are never disposed.
      ball.momentumProperty.lazyLink( ( ballMomentum, previousBallMomentum ) => {
        assert && assert( ballMomentum.y === 0 && previousBallMomentum.y === 0 );

        if ( this.changeInMomentumVisibleProperty.value && !ball.userControlledProperty.value ) {

          // Only update the change in momentum if they are visible, as documented above. Also don't update the change
          // in momentum from user-manipulation (like dragging the velocity of the Ball).
          this.ballToChangeInMomentumProperty.get( ball ).value = ballMomentum.minus( previousBallMomentum );
        }
      } );
    } );

    //----------------------------------------------------------------------------------------

    // Observe when the collision-point is set or when the elapsedTimeProperty changes. If the collision-time is
    // defined, meaning that a collision between the two balls has occurred, the changeInMomentumOpacityProperty
    // is degraded based on how far the total elapsed time has passed the time of collision. Multilink never disposed.
    Multilink.multilink( [ this.collisionPointProperty, elapsedTimeProperty ], ( collisionPoint, elapsedTime ) => {
      if ( Number.isFinite( this.collisionContactTime ) ) {

        // Compute the time since the collision.
        const timeSinceCollision = elapsedTime - this.collisionContactTime;

        if ( timeSinceCollision < 0 ) {

          // If the time since the collision is negative, the sim has reversed back to when the collision occurred. This
          // clears the change in momentum vectors. See https://github.com/phetsims/collision-lab/issues/85
          this.clearChangeInMomentum();
        }
        else if ( timeSinceCollision <= CHANGE_IN_MOMENTUM_VISIBLE_PERIOD ) {

          // If the time is less than the CHANGE_IN_MOMENTUM_VISIBLE_PERIOD, it is still fully opaque.
          this.changeInMomentumOpacityProperty.value = 1;
        }
        else {

          // Convenience reference to the total time the Change in Momentum vectors are visible.
          const totalChangeInMomentumLifetime = CHANGE_IN_MOMENTUM_VISIBLE_PERIOD + CHANGE_IN_MOMENTUM_FADE_PERIOD;

          // Use a linear mapping to linearly decrease the opacity in this time period.
          this.changeInMomentumOpacityProperty.value = Utils.linear( CHANGE_IN_MOMENTUM_VISIBLE_PERIOD,
            totalChangeInMomentumLifetime,
            OPACITY_RANGE.max,
            OPACITY_RANGE.min,
            Math.min( timeSinceCollision, totalChangeInMomentumLifetime ) );
        }
      }
    } );

    //----------------------------------------------------------------------------------------

    // Observe when the 'Change in Momentum' visibility is toggled to false. When this happens, the change in momentum
    // vectors should be cleared. This is because the 'Change in Momentum' vectors only are calculated AFTER the
    // visibility checkbox is checked. Link persists for the life-time of the sim.
    this.changeInMomentumVisibleProperty.lazyLink( changeInMomentVisible => {
      !changeInMomentVisible && this.clearChangeInMomentum();
    } );

    // Observe when the user is controlling any of the Balls and clear the change in momentum vectors. See
    // https://github.com/phetsims/collision-lab/issues/85. Link lasts for the life-time of the sim.
    this.ballSystemUserControlledProperty.lazyLink( userControlled => {
      userControlled && this.clearChangeInMomentum();
    } );
  }

  /**
   * 'Clears' the 'change in momentum' related fields of this class.
   * @public
   *
   * This is invoked in the following scenarios:
   *   - the reset all button is pressed.
   *   - the restart button is pressed.
   *   - when the 'Change in Momentum' checkbox is un-checked.
   *   - when the Ball is user-manipulated, either by dragging or from the Keypad.
   */
  clearChangeInMomentum() {
    this.collisionPointProperty.reset();
    this.changeInMomentumOpacityProperty.reset();
    this.collisionContactTime = null;
    this.ballToChangeInMomentumProperty.forEach( changeInMomentumProperty => { changeInMomentumProperty.reset(); } );
  }

  /**
   * Resets the IntroBallSystem.
   * @public
   * @override
   */
  reset() {
    super.reset();
    this.changeInMomentumVisibleProperty.reset();
    this.clearChangeInMomentum();
  }

  /**
   * Restarts the IntroBallSystem.
   * @public
   * @override
   *
   * See https://github.com/phetsims/collision-lab/issues/76 for context on the differences between reset and restart.
   */
  restart() {
    super.restart();
    this.clearChangeInMomentum();
  }

  /**
   * Registers a collision between the two balls of the 'Intro' screen, if the change in momentum vectors are visible.
   * This is called from inside of IntroCollisionEngine.
   * @public
   *
   * @param {Vector2} collisionPoint - the exact position of where the 2 Balls collided.
   * @param {number} collisionContactTime - when the 2 Balls collided.
   */
  registerChangeInMomentumCollision( collisionPoint, collisionContactTime ) {
    assert && assert( this.changeInMomentumVisibleProperty.value );
    assert && assert( collisionPoint instanceof Vector2 && collisionPoint.y === 0, `invalid collisionPoint: ${collisionPoint}` );
    assert && assert( typeof collisionContactTime === 'number' && collisionContactTime >= 0, `invalid collisionContactTime: ${collisionContactTime}` );

    this.collisionContactTime = collisionContactTime;
    this.collisionPointProperty.value = collisionPoint;
  }
}

// @public (read-only) {BallState[]} - the initial BallStates of all Balls in the 'Intro' screen.
IntroBallSystem.INITIAL_BALL_STATES = [
  new BallState( new Vector2( -1, 0 ), new Vector2( 1, 0 ), 0.5 ),
  new BallState( new Vector2( 1, 0 ), new Vector2( -0.5, 0 ), 1.5 )
];

collisionLab.register( 'IntroBallSystem', IntroBallSystem );
export default IntroBallSystem;