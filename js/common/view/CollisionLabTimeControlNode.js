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
   * @param {Property.<boolean>} isSlowMotionProperty
   * @param {Property.<boolean>} playAreaFreeProperty
   * @param {Function} stepBackward
   * @param {Function} stepForward
   * @param {Object} [options]
   */
  constructor( playProperty, isSlowMotionProperty, playAreaFreeProperty,
               stepBackward, stepForward, options ) {


    super( playProperty, merge( {
      includeStepBackwardButton: true,

      // property associated with the slow/normal radio buttons
      isSlowMotionProperty: isSlowMotionProperty,

      enabledProperty: playAreaFreeProperty,

      // Spacing options
      playPauseStepXSpacing: 9, // horizontal space between Play/Pause and Step buttons
      buttonsXSpacing: 20, // horizontal space between push buttons and radio buttons

      // Options for the Normal/Slow text labels
      labelOptions: {
        font: new PhetFont( 16 ),
        maxWidth: 200
      },

      // Options for radio buttons
      radioButtonOptions: { radius: 7 },

      // Options for the radio button group
      radioButtonGroupOptions: { spacing: 1 },

      // Options for the play pause buttons
      playPauseOptions: {
        radius: 30
      },

      stepBackwardOptions: {
        listener: () => stepBackward(),
        radius: 20
      },
      stepForwardOptions: {
        listener: () => stepForward(),
        radius: 20
      }
    }, options ) );
  }
}

collisionLab.register( 'CollisionLabTimeControlNode', CollisionLabTimeControlNode );
export default CollisionLabTimeControlNode;