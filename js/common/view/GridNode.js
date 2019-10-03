// Copyright 2019, University of Colorado Boulder

/**
 * Creates the scenery view for the grid lines and border of the playArea
 *
 * @author Alex Schor
 */

define( require => {
  'use strict';

  // modules
  const collisionLab = require( 'COLLISION_LAB/collisionLab' );
  const CollisionLabColors = require( 'COLLISION_LAB/common/CollisionLabColors' );
  const CollisionLabConstants = require( 'COLLISION_LAB/common/CollisionLabConstants' );
  const Grid = require( 'COLLISION_LAB/common/model/Grid' );
  const ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Path = require( 'SCENERY/nodes/Path' );

  class GridNode extends Node {

    /**
     * @param {Grid} grid
     * @param {ModelViewTransform2} modelViewTransform
     */
    constructor( grid, modelViewTransform ) {

      assert && assert( grid instanceof Grid,
        `invalid grid: ${grid}` );
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

    }
  }

  return collisionLab.register( 'GridNode', GridNode );
} );