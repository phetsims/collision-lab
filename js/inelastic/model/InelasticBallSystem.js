// Copyright 2020, University of Colorado Boulder

/**
 * InelasticBallSystem is a BallSystem sub-type for the 'Inelastic' screen. InelasticBallSystems only have 2 fixed Balls
 * and the numberOfBallsProperty cannot be mutated.
 *
 * In the 'Inelastic' screen, there are different 'presets' of Balls. When the user changes a the preset,
 * InelasticBallSystem will do the following:
 *   - Pause the sim.
 *   - Set the elapsed time to 0.
 *   - Save the states of all Balls for the next restart call.
 *   - Set every Ball's position, mass, and velocity to the preset's BallStates, if the preset is not set to CUSTOM.
 *     Setting the preset to CUSTOM doesn't change any of the Balls.
 *   - If the user manipulates any of the two Balls, the preset is set to CUSTOM.
 *
 * @author Brandon Li
 */

import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import RangeWithValue from '../../../../dot/js/RangeWithValue.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import collisionLab from '../../collisionLab.js';
import BallState from '../../common/model/BallState.js';
import BallSystem from '../../common/model/BallSystem.js';
import InelasticPresets from './InelasticPresets.js';
import InelasticPlayArea from './InelasticPlayArea.js';

// constants
const NUMBER_OF_BALLS = 2;
const INELASTIC_INITIAL_BALL_STATES = [
  new BallState( new Vector2( -1.0, 0.000 ), new Vector2( 1.00, 0.300 ), 0.50 ),
  new BallState( new Vector2( 0.00, 0.500 ), new Vector2( -0.5, -0.50 ), 1.50 )
];

class InelasticBallSystem extends BallSystem {

  /**
   * @param {InelasticPlayArea} playArea
   * @param {Property.<number>} elapsedTimeProperty
   * @param {Property.<boolean>} isPlayingProperty
   * @param {Object} [options]
   */
  constructor( playArea, elapsedTimeProperty, isPlayingProperty, options ) {
    assert && assert( playArea instanceof InelasticPlayArea, `invalid playArea: ${playArea}` );
    assert && AssertUtils.assertPropertyOf( elapsedTimeProperty, 'number' );
    assert && AssertUtils.assertPropertyOf( isPlayingProperty, 'boolean' );

    options = merge( {

      numberOfBallsRange: new RangeWithValue( NUMBER_OF_BALLS, NUMBER_OF_BALLS, NUMBER_OF_BALLS ),
      pathsVisibleInitially: false

    }, options );

    super( INELASTIC_INITIAL_BALL_STATES, playArea, elapsedTimeProperty, options );

    // Verify that the configuration of Balls conforms to the invariants for the Inelastic screens, but bury behind
    // assert so it doesn't impact production performance.
    if ( assert ) {

      // Verify that the correct number of BallStates were provided.
      assert( INELASTIC_INITIAL_BALL_STATES.length === NUMBER_OF_BALLS );

      // Verify that there is a fixed number of Balls in the 'InelasticBallSystem' screen.
      this.numberOfBallsProperty.link( numberOfBalls => assert( numberOfBalls === NUMBER_OF_BALLS ) );

      // Verify that the position of BallStates were inside the PlayArea's bounds.
      assert( INELASTIC_INITIAL_BALL_STATES.every( ballState => playArea.bounds.containsPoint( ballState.position ) ) );
    }

    // @public {EnumerationProperty.<InelasticPresets>} - the type of perfectly inelastic collision.
    this.inelasticPresetProperty = new EnumerationProperty( InelasticPresets, InelasticPresets.CUSTOM );

    //----------------------------------------------------------------------------------------

    // Observe when the user manipulates any of the two Balls and set the InelasticPreset to CUSTOM. Link is never
    // removed since InelasticBallSystems are never disposed.
    this.ballSystemUserControlledProperty.link( ballSystemUserControlled => {
      ballSystemUserControlled && ( this.inelasticPreset = InelasticPresets.CUSTOM );
    } );

    // Observe when the InelasticPreset changes to do the functionality described at the top of the file. Link is never
    // removed since InelasticBallSystems are never disposed.
    this.inelasticBallSystemPresetProperty.link( inelasticPreset => {

      // Pause the sim.
      isPlayingProperty.value = false;

      // Set the elapsed time to 0.
      elapsedTimeProperty.reset();

      // Save the states of the Balls for the next restart call.
      this.saveBallStates();

      // Set every Ball's position, mass, and velocity to the preset's BallStates.
      inelasticPreset.setBalls( this.balls );
    } );
  }

  /**
   * Get the value of the inelasticPresetProperty.
   * @public
   *
   * @returns {InelasticPresets}
   */
  get inelasticPreset() { return this.inelasticPresetProperty.value; }

  /**
   * Sets the value of the inelasticPresetProperty.
   * @public
   *
   * @param {InelasticPresets} inelasticPreset
   */
  set inelasticPreset( inelasticPreset ) { this.inelasticPresetProperty.value = inelasticPreset; }
}

collisionLab.register( 'InelasticBallSystem', InelasticBallSystem );
export default InelasticBallSystem;