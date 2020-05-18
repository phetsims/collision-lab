// Copyright 2019-2020, University of Colorado Boulder

/**
 * View for the PlayArea, which includes:
 *  - The borders of the PlayArea as well as the grid lines
 *  - The label of the total kinetic energy in the PlayArea
 *  - The CenterOfMass node
 *
 * @author Brandon Li
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import collisionLab from '../../collisionLab.js';
import PlayArea from '../model/PlayArea.js';
import CenterOfMassNode from './CenterOfMassNode.js';
import GridNode from './GridNode.js';
import KineticEnergyDisplay from './KineticEnergyDisplay.js';

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
               numberOfBallsProperty,
               modelViewTransform,
               options ) {

    assert && assert( playArea instanceof PlayArea, `invalid playArea: ${playArea}` );
    assert && assert( _.every( [ gridVisibleProperty,
      kineticEnergyVisibleProperty,
      centerOfMassVisibleProperty ], property => property instanceof BooleanProperty ) );

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
      numberOfBallsProperty,
      modelViewTransform );

    this.addChild( gridNode );
    this.addChild( kineticEnergyDisplay );
    this.addChild( centerOfMassNode );

    kineticEnergyDisplay.left = gridNode.left + 5;
    kineticEnergyDisplay.bottom = gridNode.bottom - 5;

  }
}

collisionLab.register( 'PlayAreaNode', PlayAreaNode );
export default PlayAreaNode;