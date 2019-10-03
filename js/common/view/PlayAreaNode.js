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
     * @param {BooleanProperty} gridVisibilityProperty
     * @param {BooleanProperty} kineticEnergyVisibilityProperty
     * @param {BooleanProperty} centerOfMassVisibilityProperty
     */
    constructor( playArea, gridVisibilityProperty, kineticEnergyVisibilityProperty, centerOfMassVisibilityProperty ) {

      assert && assert( playArea instanceof PlayArea, `invalid playArea: ${playArea}` );
      assert && assert( _.every( [gridVisibilityProperty,
        kineticEnergyVisibilityProperty,
        centerOfMassVisibilityProperty], property => property instanceof BooleanProperty ) );

      //----------------------------------------------------------------------------------------

      super();
    }
  }

  return collisionLab.register( 'PlayAreaNode', PlayAreaNode );
} );