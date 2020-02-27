// Copyright 2019, University of Colorado Boulder

/**
 * Creates the scenery view for the grid lines and border of the playArea
 *
 * @author Alex Schor
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabColors from '../CollisionLabColors.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import Grid from '../model/Grid.js';

class GridNode extends Node {

  /**
   * @param {Grid} grid
   * @param {Property.<boolean>} gridVisibleProperty
   * @param {ModelViewTransform2} modelViewTransform
   */
  constructor( grid, gridVisibleProperty, modelViewTransform ) {

    assert && assert( grid instanceof Grid,
      `invalid grid: ${grid}` );
    assert && assert( gridVisibleProperty instanceof BooleanProperty,
      `invalid gridVisibleProperty: ${gridVisibleProperty}` );
    assert && assert( modelViewTransform instanceof ModelViewTransform2,
      `invalid modelViewTransform: ${modelViewTransform}` );

    //----------------------------------------------------------------------------------------

    super();

    // create major grid lines
    const majorGridLinesPath = new Path( modelViewTransform.modelToViewShape( grid.majorGridLinesShape ), {
      lineWidth: CollisionLabConstants.MAJOR_GRID_LINE_WIDTH,
      stroke: CollisionLabColors.MAJOR_GRID_LINE_COLOR
    } );

    // create minor grid lines
    const minorGridLinesPath = new Path( modelViewTransform.modelToViewShape( grid.minorGridLinesShape ), {
      lineWidth: CollisionLabConstants.MINOR_GRID_LINE_WIDTH,
      stroke: CollisionLabColors.MINOR_GRID_LINE_COLOR
    } );

    // create border of the play area
    const borderPath = new Path( modelViewTransform.modelToViewShape( grid.borderShape ), {
      lineWidth: 5,
      stroke: 'green'
    } );

    this.addChild( majorGridLinesPath );
    this.addChild( minorGridLinesPath );
    this.addChild( borderPath );

    // link visibility of grid lines to the gridVisibleProperty
    // present for the lifetime of the simulation
    gridVisibleProperty.link( visible => {
      minorGridLinesPath.visible = visible;
      majorGridLinesPath.visible = visible;
    } );

  }
}

collisionLab.register( 'GridNode', GridNode );
export default GridNode;