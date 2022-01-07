// Copyright 2020-2022, University of Colorado Boulder

/**
 * Enumeration of the different 'presets' for the 'Inelastic' screen. Each preset maps to a class that stores
 * pre-defined states of Balls that sets up a collision scenario that relates to the learning goals of perfectly
 * inelastic collisions.
 *
 * The user selects different presets via ComboBox, which then triggers the BallSystem to call the setBalls() method
 * of each value of the enumeration. If the user manipulates any of the two Balls, the preset should be set to CUSTOM,
 * which indicates that the user can set up a 'custom' collision scenario.
 *
 * @author Brandon Li
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import EnumerationDeprecated from '../../../../phet-core/js/EnumerationDeprecated.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import collisionLab from '../../collisionLab.js';
import Ball from '../../common/model/Ball.js';
import BallState from '../../common/model/BallState.js';

// @private
class InelasticPresetValue {

  /**
   * @param {BallState[]|null} ballStates - the pre-defined BallStates that correspond to the preset, in corresponding
   *                                        order of each Ball. Null indicates that there are no pre-defined BallStates
   *                                        that are associated with the preset.
   */
  constructor( ballStates ) {
    assert && ballStates && AssertUtils.assertArrayOf( ballStates, BallState );

    // @public {BallState[]|null} - reference to the passed-in BallState.
    this.ballStates = ballStates;
  }

  /**
   * Sets every Ball's position, mass, and velocity to the pre-defined BallStates that were passed into the constructor.
   * If the preset doesn't have any associated BallStates, then nothing happens.
   * @public
   *
   * @param {ObservableArrayDef.<Ball>} balls
   */
  setBalls( balls ) {
    assert && assert( Array.isArray( balls ) ) && AssertUtils.assertArrayOf( balls, Ball );
    assert && assert( !this.ballStates || this.ballStates.length === balls.length );

    this.ballStates && balls.forEach( ( ball, index ) => {

      // Set the state of the Ball with the corresponding BallState index.
      ball.setState( this.ballStates[ index ] );

      // Changing the preset resets the trailing 'Path' and the rotation of the Ball.
      ball.path.clear();
      ball.rotationProperty.reset();

      // Verify that the Ball is in-Bounds.
      assert && assert( ball.insidePlayAreaProperty.value );

      // Save the states of the Balls for the next restart call().
      ball.saveState();
    } );
  }
}

const InelasticPreset = EnumerationDeprecated.byMap( {

  // The custom preset, which indicates that the user can set up a 'custom' collision scenario. When the preset
  // is set to CUSTOM, none of the balls are changed, so there are no BallStates that are associated with this Preset.
  CUSTOM: new InelasticPresetValue( null ),

  /*----------------------------------------------------------------------------*
   * The rest of the Presets are specific collision scenarios that relate to the
   * learning goals of perfectly inelastic collisions.
   *----------------------------------------------------------------------------*/

  CRISS_CROSS: new InelasticPresetValue( [
    new BallState( new Vector2( -0.5, 0.00 ), new Vector2( 1.00, 0.5 ), 0.50 ),
    new BallState( new Vector2( 0.50, 0.00 ), new Vector2( -1.0, 0.5 ), 0.50 )
  ] ),

  HEAD_ON: new InelasticPresetValue( [
    new BallState( new Vector2( -0.5, 0.00 ), new Vector2( 0.50, 0 ), 0.5 ),
    new BallState( new Vector2( 0.50, 0.00 ), new Vector2( -0.5, 0 ), 0.5 )
  ] ),

  GLANCING: new InelasticPresetValue( [
    new BallState( new Vector2( -0.65, 0.00 ), new Vector2( 0, 0 ), 1.8 ),
    new BallState( new Vector2( 0.6, 0.12 ), new Vector2( -1, 0 ), 0.3 )
  ] )
} );

collisionLab.register( 'InelasticPreset', InelasticPreset );
export default InelasticPreset;