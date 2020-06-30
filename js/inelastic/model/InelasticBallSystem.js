// Copyright 2020, University of Colorado Boulder

/**
 * InelasticBallSystem is a BallSystem sub-type for the 'Inelastic' screen.
 *
 * ENSURE 2Balls,
 * Presets
 *
 * @author Brandon Li
 */

import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import RangeWithValue from '../../../../dot/js/RangeWithValue.js';
import merge from '../../../../phet-core/js/merge.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import collisionLab from '../../collisionLab.js';
import BallSystem from '../../common/model/BallSystem.js';
import InelasticBallSystemPresets from './InelasticBallSystemPresets.js';
import InelasticPlayArea from './InelasticPlayArea.js';

// constants
const NUMBER_OF_BALLS = 2;
const DEFAULT_PRESET = InelasticBallSystemPresets.CUSTOM;

class InelasticBallSystem extends BallSystem {

  /**
   * @param {InelasticPlayArea} playArea
   * @param {Object} [options]
   */
  constructor( playArea, elapsedTimeProperty, options ) {
    assert && assert( playArea instanceof InelasticPlayArea, `invalid playArea: ${playArea}` );
    assert && AssertUtils.assertPropertyOf( elapsedTimeProperty, 'number' );

    options = merge( {

      numberOfBallsRange: new RangeWithValue( NUMBER_OF_BALLS, NUMBER_OF_BALLS, NUMBER_OF_BALLS ),
      pathVisibleInitially: false

    }, options );

    super( [ DEFAULT_PRESET.ballState1, DEFAULT_PRESET.ballState2 ], playArea, elapsedTimeProperty, options );

    // Verify that there is a fixed number of Balls in the 'Intro' screen.
    assert && this.numberOfBallsProperty.link( numberOfBalls => assert( numberOfBalls === NUMBER_OF_BALLS ) );

    //----------------------------------------------------------------------------------------

    // @public {EnumerationProperty.<InelasticBallSystemPresets>} - the type of perfectly inelastic collision. Ignored
    //                                                           if the elasticity isn't 0.
    this.inelasticBallSystemPresetProperty = new EnumerationProperty( InelasticBallSystemPresets, DEFAULT_PRESET );


    this.ballSystemUserControlledProperty.link( ballSystemUserControlled => {
      ballSystemUserControlled && ( this.inelasticBallSystemPresetProperty.value = InelasticBallSystemPresets.CUSTOM );
    } );


    this.inelasticBallSystemPresetProperty.link( inelasticBallSystemPreset => {
      this.balls.forEach( ( ball, index ) => {
        inelasticBallSystemPreset.setBallSystem( this );
      } );
    } );
  }
}

collisionLab.register( 'InelasticBallSystem', InelasticBallSystem );
export default InelasticBallSystem;