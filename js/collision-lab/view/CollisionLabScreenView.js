// Copyright 2019, University of Colorado Boulder

/**
 * @author Martin Veillette
 */
define( require => {
  'use strict';

  // modules
  const ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  const ScreenView = require( 'JOIST/ScreenView' );
  const collisionLab = require( 'COLLISION_LAB/collisionLab' );

  class CollisionLabScreenView extends ScreenView {

    /**
     * @param {CollisionLabModel} model
     * @param {Tandem} tandem
     */
    constructor( model, tandem ) {

      super();

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

  return collisionLab.register( 'CollisionLabScreenView', CollisionLabScreenView );
} );