// Copyright 2019, University of Colorado Boulder

/**
 * @author Martin Veillette
 */
define( require => {
  'use strict';

  // modules
  const CommonModel = require( 'COLLISION_LAB/common/model/CommonModel' );
  const collisionLab = require( 'COLLISION_LAB/collisionLab' );

  /**
   * @constructor
   */
  class CollisionLabModel extends CommonModel {

    /**
     * @param {Tandem} tandem
     */
    constructor( tandem ) {

      super( tandem );
    }

    // @public resets the model
    reset() {
      super.reset();
    }

    // @public
    step( dt ) {
      super.step( dt );
    }
  }

  return collisionLab.register( 'CollisionLabModel', CollisionLabModel );
} );