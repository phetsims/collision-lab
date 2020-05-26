// Copyright 2020, University of Colorado Boulder

/**
 * TimeControlNode specific to collision lab
 *
 * @author Martin Veillette
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import TimeControlNode from '../../../../scenery-phet/js/TimeControlNode.js';
import collisionLab from '../../collisionLab.js';

class CollisionLabTimeControlNode extends TimeControlNode {

  /**
   * @param {Property.<boolean>} playProperty
   * @param {EnumerationProperty.<TimeSpeed>} timeSpeedProperty
   * @param {Property.<boolean>} playAreaUserControlledProperty
   * @param {Function} stepBackward
   * @param {Function} stepForward
   * @param {Object} [options]
   */
  constructor( playProperty, elasticityProperty, timeSpeedProperty, playAreaUserControlledProperty,
               stepBackward, stepForward, options ) {


    super( playProperty, merge( {

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
          isPlayingProperty: new DerivedProperty( [ playProperty, elasticityProperty ], ( playing, elasticity ) => {
            return playing || elasticity < 100;
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
    let wasPlaying = playProperty.value;

    playAreaUserControlledProperty.link( playAreaUserControlled => {
      // When the play area is being controlled, the sim is paused and is the play-pause button is disabled.
      // See https://github.com/phetsims/collision-lab/issues/49.
      if ( playAreaUserControlled ) {

        // save playing state, pause the sim, and disable time controls
        wasPlaying = playProperty.value;
        playProperty.value = false;
        this.enabledProperty.value = false;
      }
      else {

        // enable time controls and restore playing state
        this.enabledProperty.value = true;
        playProperty.value = wasPlaying;
      }
    } );
  }
}

collisionLab.register( 'CollisionLabTimeControlNode', CollisionLabTimeControlNode );
export default CollisionLabTimeControlNode;