// Copyright 2019, University of Colorado Boulder

/**
 * TimeControlNode specific to collision lab
 *
 * @author Martin Veillette
 */
define( require => {
  'use strict';

  // modules
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const TimeControlNode = require( 'SCENERY_PHET/TimeControlNode' );
  const collisionLab = require( 'COLLISION_LAB/collisionLab' );
  const merge = require( 'PHET_CORE/merge' );

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

  return collisionLab.register( 'CollisionLabTimeControlNode', CollisionLabTimeControlNode );
} );
