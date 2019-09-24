// Copyright 2019, University of Colorado Boulder

/**
 * Top level view for the 'Intro' screen.
 *
 * @author BrandonLi
 */

define( require => {
  'use strict';

  // modules
  const collisionLab = require( 'COLLISION_LAB/collisionLab' );
  const CollisionLabScreenView = require( 'COLLISION_LAB/common/view/CollisionLabScreenView' );
  const Tandem = require( 'TANDEM/Tandem' );

  class IntroScreenView extends CollisionLabScreenView {

    /**
     * @param {IntroModel} model
     * @param {Tandem} tandem
     */
    constructor( model, tandem ) {

      assert && assert( tandem instanceof Tandem, `invalid tandem: ${tandem}` );

      super( model, tandem );
    }
  }

  return collisionLab.register( 'IntroScreenView', IntroScreenView );
} );