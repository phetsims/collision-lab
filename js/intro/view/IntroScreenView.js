// Copyright 2019, University of Colorado Boulder

/**
 * Top level view for the 'Intro' screen.
 *
 * @author BrandonLi
 */

define( function( require ) {
  'use strict';

  // modules
  const collisionLab = require( 'COLLISION_LAB/collisionLab' );
  const CommonScreenView = require( 'COLLISION_LAB/common/view/CommonScreenView' ); // TODO #13
  const Tandem = require( 'TANDEM/Tandem' );

  class IntroScreenView extends CommonScreenView {

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