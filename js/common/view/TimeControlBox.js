// Copyright 2012-2019, University of Colorado Boulder

/**
 * Scenery Box of step forward/backward/play/pause control buttons.
 *
 * @author Martin Veillette
 */

define( require => {
  'use strict';

  // modules
  const collisionLab = require( 'COLLISION_LAB/collisionLab' );
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const HBox = require( 'SCENERY/nodes/HBox' );
  const PlayPauseButton = require( 'SCENERY_PHET/buttons/PlayPauseButton' );
  const StepBackwardButton = require( 'SCENERY_PHET/buttons/StepBackwardButton' );
  const StepForwardButton = require( 'SCENERY_PHET/buttons/StepForwardButton' );
  const CollisionLabModel = require( 'COLLISION_LAB/common/model/CollisionLabModel' );

  class TimeControlBox extends HBox {

    /**
     * @param {CollisionLabModel} model
     * @param {Property.<boolean>} playProperty
     * @param {Object} [options]
     */
    constructor( model, playProperty, options ) {

      assert && assert( model instanceof CollisionLabModel, `invalid model: ${model}` );
      assert && assert( playProperty instanceof BooleanProperty, `invalid property: ${playProperty}` );

      const playPauseButton = new PlayPauseButton( playProperty );

      const stepForwardButton = new StepForwardButton( {
        enabled: false,
        listener: () => model.stepForward()
      } );

      const stepBackwardButton = new StepBackwardButton( {
        enabled: false,
        listener: () => model.stepBackward()
      } );

      super( _.extend( {
        resize: false,
        spacing: 10,
        children: [stepBackwardButton, playPauseButton, stepForwardButton]
      }, options ) );

    }

  }

  return collisionLab.register( 'TimeControlBox', TimeControlBox );
} );