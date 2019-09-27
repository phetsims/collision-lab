// Copyright 2019, University of Colorado Boulder

/**
 * BallValuesPanel is the Panel at the bottom of the screen.
 *
 * For each Ball in the PlayArea, this Panel displays it's values, which are:
 *    - Mass (kg)
 *    - The position of the Ball
 *    - The velocity of the Ball
 *    - The linear momentum of the Ball
 *
 * This panel exists for the entire sim and is never disposed.
 *
 * @author Brandon Li
 */

define( require => {
  'use strict';

  // modules
  const collisionLab = require( 'COLLISION_LAB/collisionLab' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Panel = require( 'SUN/Panel' );

  class BallValuesPanel extends Panel {

    /**
     * @param {PlayArea} playArea
     */
    constructor( playArea ) {

      super( new Node() );

    }
  }

  return collisionLab.register( 'BallValuesPanel', BallValuesPanel );
} );