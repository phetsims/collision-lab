// Copyright 2020, University of Colorado Boulder

/**
 * CollisionLabTimeControlNode is a subclass of TimeControlNode, specialized for the 'Collision Lab' simulation.
 * Instances are positioned at the bottom-center of the PlayArea and appear in all screens.
 *
 * The CollisionLabTimeControlNode consists of:
 *   - Both step-forward and step-backward buttons.
 *   - Play-Pause Button
 *   - RadioButtons to control the speed of the simulation.
 *
 * Some specific functionality to 'Collision Lab':
 *  - The step-backward button is only enabled when the sim is paused, the elasticity is 100%, and the total
 *    elapsed-time isn't 0.
 *  - The entire TimeControlNode is disabled if the BallSystem is being user-controlled. See
 *    https://github.com/phetsims/collision-lab/issues/49.
 *
 * @author Brandon Li
 * @author Martin Veillette
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import TimeControlNode from '../../../../scenery-phet/js/TimeControlNode.js';
import collisionLab from '../../collisionLab.js';

class CollisionLabTimeControlNode extends TimeControlNode {

  /**
   * @param {Property.<boolean>} isPlayingProperty
   * @param {EnumerationProperty.<TimeSpeed>} timeSpeedProperty
   * @param {Property.<boolean>} ballSystemUserControlledProperty
   * @param {Function} stepBackward
   * @param {Function} stepForward
   * @param {Object} [options]
   */
  constructor( isPlayingProperty, elasticityProperty, elapsedTimeProperty, timeSpeedProperty, ballSystemUserControlledProperty,
               stepBackward, stepForward, options ) {


    super( isPlayingProperty, merge( {

      // property associated with the slow/normal radio buttons
      timeSpeedProperty: timeSpeedProperty,

      playPauseStepButtonOptions: {
        includeStepBackwardButton: true,
        playPauseStepXSpacing: 9, // horizontal space between Play/Pause and Step buttons

        // Options for the play pause buttons
        playPauseButtonOptions: {
          radius: 30
        },

        stepBackwardButtonOptions: {
          listener: () => stepBackward(),

          // Workaround for https://github.com/phetsims/scenery-phet/issues/606.
          // Also see https://github.com/phetsims/scenery-phet/issues/563
          isPlayingProperty: new DerivedProperty( [ isPlayingProperty, elasticityProperty, elapsedTimeProperty ], ( playing, elasticity, elapsedTimeProperty ) => {
            return elapsedTimeProperty === 0 || playing || elasticity < 100;
          } ),
          radius: 20
        },
        stepForwardButtonOptions: {
          listener: () => stepForward(),
          radius: 20
        }
      },

      speedRadioButtonGroupOptions: {
        // Options for the Normal/Slow text labels
        labelOptions: {
          font: new PhetFont( 13 ),
          maxWidth: 150
        },

        // Options for the radio button group
        radioButtonGroupOptions: { spacing: 5 }
      },

      // Spacing options
      buttonGroupXSpacing: 20 // horizontal space between push buttons and radio buttons
    }, options ) );


    //----------------------------------------------------------------------------------------

    // Flag that indicates whether the sim was playing before it was programmatically paused.
    let wasPlaying = isPlayingProperty.value;

    ballSystemUserControlledProperty.link( playAreaUserControlled => {
      // When the play area is being controlled, the sim is paused and is the play-pause button is disabled.
      // See https://github.com/phetsims/collision-lab/issues/49.
      if ( playAreaUserControlled ) {

        // save playing state, pause the sim, and disable time controls
        wasPlaying = isPlayingProperty.value;
        isPlayingProperty.value = false;
        this.enabledProperty.value = false;
      }
      else {

        // enable time controls and restore playing state
        this.enabledProperty.value = true;
        isPlayingProperty.value = wasPlaying;
      }
    } );
  }
}

collisionLab.register( 'CollisionLabTimeControlNode', CollisionLabTimeControlNode );
export default CollisionLabTimeControlNode;