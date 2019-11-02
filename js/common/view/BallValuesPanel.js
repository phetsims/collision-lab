// Copyright 2019, University of Colorado Boulder

/**
 * BallValuesPanel is the Panel at the bottom of the screen.
 *
 * For each Ball in the PlayArea, this Panel displays it's values, which are:
 *    - Mass (kg)
 *    - The position of the Ball
 *    - The velocity of the Ball
 *    - The linear momentum of the Ball
 * Depending on if the "More Data" checkbox is checked or not, some of these values may be hidden.
 *
 * This panel exists for the entire sim and is never disposed.
 *
 * @author Brandon Li
 */

define( require => {
  'use strict';

  // modules
  const Ball = require( 'COLLISION_LAB/common/model/Ball' );
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const collisionLab = require( 'COLLISION_LAB/collisionLab' );
  const Node = require( 'SCENERY/nodes/Node' );
  const ObservableArray = require( 'AXON/ObservableArray' );
  const Panel = require( 'SUN/Panel' );

  class BallValuesPanel extends Panel {

    /**
     * @param {ObservableArray.<Ball>} balls - collections of particles inside the container
     * @param {Property.<boolean>} modeDataProperty - Property that indicates if the "More Data" checkbox is checked.
     */
    constructor( balls, moreDataProperty ) {

      assert && assert( balls instanceof ObservableArray
      && balls.count( ball => ball instanceof Ball ) === balls.length, `invalid balls: ${balls}` );
      assert && assert( moreDataProperty instanceof BooleanProperty, `invalid moreDataProperty: ${moreDataProperty}` );

      super( new Node() );

    }
  }

  return collisionLab.register( 'BallValuesPanel', BallValuesPanel );
} );