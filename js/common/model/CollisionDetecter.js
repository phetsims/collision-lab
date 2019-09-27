// Copyright 2019, University of Colorado Boulder

/**
 * CollisionDetector is the model that collision detection for all screens. Once a collision is detected, the
 * subsequent Ball models are told to change their direction and velocity.
 *
 * @author Brandon Li
 */

define( require => {
  'use strict';

  // modules
  const Ball = require( 'COLLISION_LAB/common/model/Ball' );
  const collisionLab = require( 'COLLISION_LAB/collisionLab' );
  const NumberProperty = require( 'AXON/NumberProperty' );
  const ObservableArray = require( 'AXON/ObservableArray' );
  const PlayArea = require( 'COLLISION_LAB/common/model/PlayArea' );

  class CollisionDetector {

    /**
     * @param {PlayArea} playArea - the PlayArea inside which collision occur
     * @param {ObservableArray.<Ball>} balls - collections of particles inside the container
     * @param {NumberProperty} elasticityProperty
     */
    constructor( playArea, balls, elasticityProperty ) {

      assert && assert( playArea instanceof PlayArea, `invalid playArea: ${playArea}` );
      assert && assert( balls instanceof ObservableArray && _.every( balls.getArray(), ball => ball instanceof Ball ) );
      assert && assert( elasticityProperty instanceof NumberProperty, `invalid elasticityProperty: ${elasticityProperty}` );

    }
  }

  return collisionLab.register( 'CollisionDetector', CollisionDetector );
} );