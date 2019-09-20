// Copyright 2019, University of Colorado Boulder

/**
 * @author Martin Veillette
 */
define( function( require ) {
  'use strict';

  // modules
  const ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  const CollisionLabConstants = require( 'COLLISION_LAB/CollisionLabConstants' );
  const ScreenView = require( 'JOIST/ScreenView' );
  const collisionLab = require( 'COLLISION_LAB/collisionLab' );
  const ModelViewTransform2 = require( 'PHETCOMMON/ModelViewTransform2' );
  const Vector2 = require( 'DOT/Vector2' );

  class CommonScreenView extends ScreenView {

    /**
     * @param {CollisionLabModel} model
     * @param {Tandem} tandem
     */
    constructor( model, tandem ) {

      super();

      // const modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping(
      //   Vector2.ZERO,
      //   this.layoutBounds.leftCenter,
      //   CollisionLabConstants.VIEW_TO_MODEL_SCALING );

      const resetAllButton = new ResetAllButton( {
        listener: () => {
          model.reset();
        },
        right: this.layoutBounds.maxX - 10,
        bottom: this.layoutBounds.maxY - 10,
        tandem: tandem.createTandem( 'resetAllButton' )
      } );
      this.addChild( resetAllButton );
    }

    // @public
    step( dt ) {
      //TODO Handle view animation here.
    }
  }

  return collisionLab.register( 'CommonScreenView', CommonScreenView );
} );