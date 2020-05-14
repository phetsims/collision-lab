// Copyright 2020, University of Colorado Boulder

/**
 * TimeControlNode specific to collision lab
 *
 * @author Martin Veillette
 */

import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import TimeControlNode from '../../../../scenery-phet/js/TimeControlNode.js';
import collisionLab from '../../collisionLab.js';

class CollisionLabTimeControlNode extends TimeControlNode {

  /**
   * @param {Property.<boolean>} playProperty
   * @param {EnumerationProperty.<TimeSpeed>} timeSpeedProperty
   * @param {Property.<boolean>} playAreaFreeProperty
   * @param {Function} stepBackward
   * @param {Function} stepForward
   * @param {Object} [options]
   */
  constructor( playProperty, timeSpeedProperty, playAreaFreeProperty,
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
          font: new PhetFont( 16 ),
          maxWidth: 200
        },

        // Options for the radio button group
        radioButtonGroupOptions: { spacing: 1 }
      },

      enabledProperty: playAreaFreeProperty,

      // Spacing options
      buttonGroupXSpacing: 20 // horizontal space between push buttons and radio buttons
    }, options ) );
  }
}

collisionLab.register( 'CollisionLabTimeControlNode', CollisionLabTimeControlNode );
export default CollisionLabTimeControlNode;