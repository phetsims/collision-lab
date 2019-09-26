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
  const Shape = require( 'KITE/Shape' );
  const Path = require( 'SCENERY/nodes/Path' );
  const Node = require( 'SCENERY/nodes/Node' );
  const CollisionLabConstants = require( 'COLLISION_LAB/common/CollisionLabConstants' );
  // const CollisionLabColors = require( 'COLLISION_LAB/common/CollisionLabColors' );

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

      const viewBounds = modelViewTransform.modelToViewBounds( TABLE_BOUNDS );
      const borderShape = Shape.bounds( viewBounds );
      const borderPath = new Path( borderShape, {
        stroke: 'black'
      } );
      this.addChild( borderPath );

      const gridMinX = TABLE_BOUNDS.minX;
      const gridMaxX = TABLE_BOUNDS.maxX;
      const gridMinY = TABLE_BOUNDS.minY;
      const gridMaxY = TABLE_BOUNDS.maxY;
      const gridWidth = TABLE_BOUNDS.width;
      const gridHeight = TABLE_BOUNDS.height;

      const majorGridLinesShape = new Shape();
      const minorGridLinesShape = new Shape();


      // Vertical gridlines
      for ( let i = 0; i * MINOR_GRIDLINE_SPACING < gridWidth; i++ ) {
        const x = i * MINOR_GRIDLINE_SPACING + gridMinX;
        if ( i % MINOR_GRIDLINES_PER_MAJOR_GRIDLINE === 0 ) {
          majorGridLinesShape.moveTo( x, gridMinY ).verticalLineTo( gridMaxY );
        }
        else {
          minorGridLinesShape.moveTo( x, gridMinY ).verticalLineTo( gridMaxY );
        }
      }

      // Horizontal gridlines
      for ( let j = 0; j * MINOR_GRIDLINE_SPACING < gridHeight; j++ ) {
        const y = j * MINOR_GRIDLINE_SPACING + gridMinY;
        if ( j % MINOR_GRIDLINES_PER_MAJOR_GRIDLINE === 0 ) {
          majorGridLinesShape.moveTo( gridMinX, y ).horizontalLineTo( gridMaxX );
        }
        else {
          minorGridLinesShape.moveTo( gridMinX, y ).horizontalLineTo( gridMaxX );
        }
      }


      const majorGridLinesPath = new Path( modelViewTransform.modelToViewShape( majorGridLinesShape ), {
        stroke: 'black'
      } );

      const minorGridLinesPath = new Path( modelViewTransform.modelToViewShape( minorGridLinesShape ), {
        stroke: 'pink'
      } );

      this.addChild( majorGridLinesPath );
      this.addChild( minorGridLinesPath );

    }
  }

  return collisionLab.register( 'GridNode', GridNode );
} );