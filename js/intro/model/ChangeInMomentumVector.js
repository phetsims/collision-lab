// Copyright 2020, University of Colorado Boulder

/**
 * A model for a single Change in Momentum Vector, which appears 'briefly' when the momentum of a Ball collides and
 * changes momentum in the 'Intro' screen.
 *
 * Its main responsibility is to track the momentum Property of a Ball and compute the components of the change in
 * momentum vector. The vector is rendered out-of-bounds of the PlayArea to reduce clutter. After a collision, the
 * vector is fully opaque for a set time-period. Then, after this time-period, its opacity linearly reduces for
 * another set period of time. The opacity of the vector is modeled in this class.
 *
 * In the design, the 'Change in Momentum' vectors only appear AFTER the visibility checkbox is checked, meaning the
 * components of the change in momentum vector are always 0 if the checkbox isn't checked and is only updated if and
 * only if the checkbox ix checked.
 *
 * ChangeInMomentumVectors are created for each Ball, which are never disposed, meaning ChangeInMomentumVectors are
 * also never disposed.
 *
 * @author Brandon Li
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabQueryParameters from '../../common/CollisionLabQueryParameters.js';

// constants
const CHANGE_IN_MOMENTUM_VISIBLE_PERIOD = CollisionLabQueryParameters.changeInMomentumVisiblePeriod;
const CHANGE_IN_MOMENTUM_FADE_PERIOD = CollisionLabQueryParameters.changeInMomentumFadePeriod;

class ChangeInMomentumVector {

  /**
   * @param {Property.<Vector2>} ballMomentumProperty - momentum of the Ball.
   * @param {Property.<boolean>} changeInMomentVectorVisibleProperty - the components are always 0 if false.
   * @param {Property.<number>} elapsedTimeProperty
   */
  constructor( ballMomentumProperty, changeInMomentVectorVisibleProperty, elapsedTimeProperty ) {
    assert && AssertUtils.assertPropertyOf( ballMomentumProperty, Vector2 );
    assert && AssertUtils.assertPropertyOf( changeInMomentVectorVisibleProperty, 'boolean' );
    assert && AssertUtils.assertPropertyOf( elapsedTimeProperty, 'number' );


    // @public (read-only)
    this.componentsProperty = new Vector2Property( Vector2.ZERO );

    // @public (read-only)
    this.opacityProperty = new NumberProperty( 0 );

    // @public (read-only)
    this.setTime = 0;

    this.isDefined = false;

    ballMomentumProperty.link( ( ballMomentum, previousBallMomentum ) => {
      if ( previousBallMomentum && changeInMomentVectorVisibleProperty.value ) {
        this.componentsProperty.value = ballMomentum.minus( previousBallMomentum );
        this.setTime = elapsedTimeProperty.value;
        this.opacityProperty.value = 1;
        this.isDefined = true;
      }
    } );

    changeInMomentVectorVisibleProperty.link( changeInMomentVectorVisible => {
      if ( !changeInMomentVectorVisible ) {
        this.clear();
      }
    } );


    elapsedTimeProperty.link( elapsedTime => {
      if ( this.isDefined ) {
        const dt = elapsedTime - this.setTime;

        if ( dt <= 0 ) {
          this.clear();
        }
        if ( dt >= CHANGE_IN_MOMENTUM_VISIBLE_PERIOD &&
            dt <= ( CHANGE_IN_MOMENTUM_VISIBLE_PERIOD + CHANGE_IN_MOMENTUM_FADE_PERIOD ) ) {

          this.opacityProperty.value = Utils.linear( CHANGE_IN_MOMENTUM_VISIBLE_PERIOD,
            CHANGE_IN_MOMENTUM_VISIBLE_PERIOD + CHANGE_IN_MOMENTUM_FADE_PERIOD,
            1,
            0,
            dt );

          if ( this.opacityProperty.value === 0 ) {
            this.clear();
          }
        }
      }
    } );

  }

  // @public
  clear() {
    this.componentsProperty.value = Vector2.ZERO;
    this.opacityProperty.value = 0;
    this.isDefined = false;
  }
}

collisionLab.register( 'ChangeInMomentumVector', ChangeInMomentumVector );
export default ChangeInMomentumVector;