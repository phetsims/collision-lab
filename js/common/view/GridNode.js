// Copyright 2019, University of Colorado Boulder

/**
 *
 *
 * @author Alex Schor
 */

define( require => {
  'use strict';

  // modules
  const collisionLab = require( 'COLLISION_LAB/collisionLab' );
  const CollisionLabColors = require( 'COLLISION_LAB/common/CollisionLabColors' );
  const CollisionLabConstants = require( 'COLLISION_LAB/common/CollisionLabConstants' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Path = require( 'SCENERY/nodes/Path' );
  const Shape = require( 'KITE/Shape' );

  //constants
  const MINOR_GRIDLINES_PER_MAJOR_GRIDLINE = CollisionLabConstants.MINOR_GRIDLINES_PER_MAJOR_GRIDLINE;
  const MINOR_GRIDLINE_SPACING = CollisionLabConstants.MINOR_GRIDLINE_SPACING;
  const TABLE_BOUNDS = CollisionLabConstants.TABLE_BOUNDS;

  class GridNode extends Node {

    /**
     *
     * @param {ModelViewTransform2} modelViewTransform
     */
    constructor( modelViewTransform ) {
      super();


      const gridMinX = TABLE_BOUNDS.minX;
      const gridMaxX = TABLE_BOUNDS.maxX;
      const gridMinY = TABLE_BOUNDS.minY;
      const gridMaxY = TABLE_BOUNDS.maxY;
      const gridWidth = TABLE_BOUNDS.width;
      const gridHeight = TABLE_BOUNDS.height;

      const majorGridLinesShape = new Shape();
      const minorGridLinesShape = new Shape();

      // Vertical grid lines
      for ( let i = 0; i * MINOR_GRIDLINE_SPACING < gridWidth; i++ ) {
        const x = i * MINOR_GRIDLINE_SPACING + gridMinX;

        const isMajor = i % MINOR_GRIDLINES_PER_MAJOR_GRIDLINE === 0;
        if ( isMajor ) {
          majorGridLinesShape.moveTo( x, gridMinY ).verticalLineTo( gridMaxY );
        }
        else {
          minorGridLinesShape.moveTo( x, gridMinY ).verticalLineTo( gridMaxY );
        }
      }

      // Horizontal grid lines
      for ( let j = 0; j * MINOR_GRIDLINE_SPACING < gridHeight; j++ ) {
        const y = j * MINOR_GRIDLINE_SPACING + gridMinY;

        const isMajor = j % MINOR_GRIDLINES_PER_MAJOR_GRIDLINE === 0;
        if ( isMajor ) {
          majorGridLinesShape.moveTo( gridMinX, y ).horizontalLineTo( gridMaxX );
        }
        else {
          minorGridLinesShape.moveTo( gridMinX, y ).horizontalLineTo( gridMaxX );
        }
      }

      const majorGridLinesPath = new Path( modelViewTransform.modelToViewShape( majorGridLinesShape ), {
        lineWidth: CollisionLabConstants.MAJOR_GRID_LINE_WIDTH,
        stroke: CollisionLabColors.MAJOR_GRID_LINE_COLOR
      } );

      const minorGridLinesPath = new Path( modelViewTransform.modelToViewShape( minorGridLinesShape ), {
        lineWidth: CollisionLabConstants.MINOR_GRID_LINE_WIDTH,
        stroke: CollisionLabColors.MINOR_GRID_LINE_COLOR
      } );

      this.addChild( majorGridLinesPath );
      this.addChild( minorGridLinesPath );

      // border of the play area
      const borderShape = Shape.bounds( modelViewTransform.modelToViewBounds( TABLE_BOUNDS ) );
      const borderPath = new Path( borderShape, {
        lineWidth: 5,
        stroke: 'green'

      } );
      this.addChild( borderPath );

    }
  }

  return collisionLab.register( 'GridNode', GridNode );
} );