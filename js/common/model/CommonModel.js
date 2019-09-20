// Copyright 2019, University of Colorado Boulder

/**
 * Common Model for collision lab
 * @author Martin Veillette
 */
define( require => {
  'use strict';

  // modules
  const collisionLab = require( 'COLLISION_LAB/collisionLab' );

  /**
   * @constructor
   */
  class CommonModel {

    /**
     * @param {Tandem} tandem
     */
    constructor( tandem ) {
      //TODO
    }

    // @public resets the model
    reset() {
      //TODO Reset things here.
    }

    // @public
    step( dt ) {
      //TODO Handle model animation here.
    }
  }

  return collisionLab.register( 'CommonModel', CommonModel );
} );