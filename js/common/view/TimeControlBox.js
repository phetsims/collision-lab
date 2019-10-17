// Copyright 2019, University of Colorado Boulder

/**
 * Scenery Box of step forward/backward/play/pause control buttons.
 *
 * @author Martin Veillette
 */

define( require => {
  'use strict';

  // modules
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const collisionLab = require( 'COLLISION_LAB/collisionLab' );
  const CollisionLabModel = require( 'COLLISION_LAB/common/model/CollisionLabModel' );
  const HBox = require( 'SCENERY/nodes/HBox' );
  const merge = require( 'PHET_CORE/merge' );
  const PlayPauseButton = require( 'SCENERY_PHET/buttons/PlayPauseButton' );
  const StepBackwardButton = require( 'SCENERY_PHET/buttons/StepBackwardButton' );
  const StepForwardButton = require( 'SCENERY_PHET/buttons/StepForwardButton' );


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
        listener: () => model.stepForward()
      } );

      const stepBackwardButton = new StepBackwardButton( {
        listener: () => model.stepBackward()
      } );


      super( merge( {
        resize: false,
        spacing: 10,
        children: [stepBackwardButton, playPauseButton, stepForwardButton]
      }, options ) );

    }

  }

  return collisionLab.register( 'TimeControlBox', TimeControlBox );
} );