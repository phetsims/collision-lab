// Copyright 2019, University of Colorado Boulder

/**
 * View for the PlayArea, which includes:
 *  - The borders of the PlayArea as well as the grid lines
 *  - The dashed lines that indicate the origin // TODO is this what the dashed lines in the mock up indicate?
 *  - The label of the total kinetic energy in the PlayArea
 *  - The CenterOfMass node
 *
 * @author Brandon Li
 */

define( require => {
  'use strict';

  // modules
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const collisionLab = require( 'COLLISION_LAB/collisionLab' );
  const Node = require( 'SCENERY/nodes/Node' );
  const PlayArea = require( 'COLLISION_LAB/common/model/PlayArea' );

  class PlayAreaNode extends Node {

    /**
     * @param {PlayArea} playArea
     * @param {Property.<boolean>} gridVisibleProperty
     * @param {Property.<boolean>} kineticEnergyVisibleProperty
     * @param {Property.<boolean>} centerOfMassVisibleProperty
     */
    constructor( playArea, gridVisibleProperty, kineticEnergyVisibleProperty, centerOfMassVisibleProperty ) {

      assert && assert( playArea instanceof PlayArea, `invalid playArea: ${playArea}` );
      assert && assert( _.every( [gridVisibleProperty,
        kineticEnergyVisibleProperty,
        centerOfMassVisibleProperty], property => property instanceof BooleanProperty ) );

      //----------------------------------------------------------------------------------------

      super();
    }
  }

  return collisionLab.register( 'PlayAreaNode', PlayAreaNode );
} );