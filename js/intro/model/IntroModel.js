// Copyright 2019, University of Colorado Boulder

/**
 * Top level model for the 'Intro' screen.
 *
 * @author Brandon Li
 */

define( require => {
  'use strict';

  // modules
  const collisionLab = require( 'COLLISION_LAB/collisionLab' );
  const CommonModel = require( 'COLLISION_LAB/common/model/CommonModel' ); // TODO: #13
  const Tandem = require( 'TANDEM/Tandem' );

  class IntroModel extends CommonModel {

    /**
     * @param {Tandem} tandem
     */
    constructor( tandem ) {

      assert && assert( tandem instanceof Tandem, `invalid tandem: ${tandem}` );

      super( tandem );
    }
  }

  return collisionLab.register( 'IntroModel', IntroModel );
} );