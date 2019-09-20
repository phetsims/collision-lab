// Copyright 2019, University of Colorado Boulder

/**
 * @author Martin Veillette
 */
define( require => {
  'use strict';

  // modules
  const CommonScreenView = require( 'COLLISION_LAB/common/view/CommonScreenView' );
  const collisionLab = require( 'COLLISION_LAB/collisionLab' );

  class CollisionLabScreenView extends CommonScreenView {

    /**
     * @param {CollisionLabModel} model
     * @param {Tandem} tandem
     */
    constructor( model, tandem ) {

      super( model, tandem );
    }

    // @public
    step( dt ) {
      //TODO Handle view animation here.
    }
  }

  return collisionLab.register( 'CollisionLabScreenView', CollisionLabScreenView );
} );