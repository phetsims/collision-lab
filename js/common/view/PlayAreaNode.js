// Copyright 2019, University of Colorado Boulder

/**
 * View for the PlayArea, which includes:
 *  - The borders of the PlayArea as well as the grid lines
 *  - The label of the total kinetic energy in the PlayArea
 *  - The CenterOfMass node
 *
 * @author Brandon Li
 */

define( require => {
  'use strict';

  // modules
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const CenterOfMassNode = require( 'COLLISION_LAB/common/view/CenterOfMassNode' );
  const collisionLab = require( 'COLLISION_LAB/collisionLab' );
  const GridNode = require( 'COLLISION_LAB/common/view/GridNode' );
  const KineticEnergyDisplay = require( 'COLLISION_LAB/common/view/KineticEnergyDisplay' );
  const Node = require( 'SCENERY/nodes/Node' );
  const PlayArea = require( 'COLLISION_LAB/common/model/PlayArea' );

  class PlayAreaNode extends Node {

    /**
     * @param {PlayArea} playArea
     * @param {Property.<boolean>} gridVisibleProperty
     * @param {Property.<boolean>} kineticEnergyVisibleProperty
     * @param {Property.<boolean>} centerOfMassVisibleProperty
     * @param {ModelViewTransform2} modelViewTransform
     * @param {Object} [options]
     */
    constructor( playArea,
                 gridVisibleProperty,
                 kineticEnergyVisibleProperty,
                 centerOfMassVisibleProperty,
                 modelViewTransform,
                 options ) {

      assert && assert( playArea instanceof PlayArea, `invalid playArea: ${playArea}` );
      assert && assert( _.every( [gridVisibleProperty,
        kineticEnergyVisibleProperty,
        centerOfMassVisibleProperty], property => property instanceof BooleanProperty ) );

      //----------------------------------------------------------------------------------------

      super( options );

      // create the grid and border of the playArea
      const gridNode = new GridNode( playArea.grid, gridVisibleProperty, modelViewTransform );

      // create the grid and border of the playArea
      const kineticEnergyDisplay = new KineticEnergyDisplay( playArea.kineticEnergySumProperty,
        kineticEnergyVisibleProperty );

      // create the center of mass
      const centerOfMassNode = new CenterOfMassNode( playArea.centerOfMass,
        centerOfMassVisibleProperty,
        playArea.numberOfBallsProperty,
        modelViewTransform );

      this.addChild( gridNode );
      this.addChild( kineticEnergyDisplay );
      this.addChild( centerOfMassNode );

      kineticEnergyDisplay.left = gridNode.left + 5;
      kineticEnergyDisplay.bottom = gridNode.bottom - 5;

    }
  }

  return collisionLab.register( 'PlayAreaNode', PlayAreaNode );
} );