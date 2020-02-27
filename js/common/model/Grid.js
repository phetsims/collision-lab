// Copyright 2019, University of Colorado Boulder

/**
 *
 *
 * @author Martin Veillette
 */

import Shape from '../../../../kite/js/Shape.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabConstants from '../CollisionLabConstants.js';

//constants
const MINOR_GRIDLINES_PER_MAJOR_GRIDLINE = CollisionLabConstants.MINOR_GRIDLINES_PER_MAJOR_GRIDLINE;
const MINOR_GRIDLINE_SPACING = CollisionLabConstants.MINOR_GRIDLINE_SPACING;
const PLAY_AREA_BOUNDS = CollisionLabConstants.PLAY_AREA_BOUNDS;

class Grid {
  constructor() {

    const gridMinX = PLAY_AREA_BOUNDS.minX;
    const gridMaxX = PLAY_AREA_BOUNDS.maxX;
    const gridMinY = PLAY_AREA_BOUNDS.minY;
    const gridMaxY = PLAY_AREA_BOUNDS.maxY;
    const gridWidth = PLAY_AREA_BOUNDS.width;
    const gridHeight = PLAY_AREA_BOUNDS.height;

    // @public (read-only)
    this.borderShape = Shape.bounds( PLAY_AREA_BOUNDS );

    // @public (read-only)
    this.majorGridLinesShape = new Shape();

    // @public (read-only)
    this.minorGridLinesShape = new Shape();

    // Vertical grid lines
    for ( let i = 0; i * MINOR_GRIDLINE_SPACING < gridWidth; i++ ) {
      const x = i * MINOR_GRIDLINE_SPACING + gridMinX;

      const isMajor = i % MINOR_GRIDLINES_PER_MAJOR_GRIDLINE === 0;
      if ( isMajor ) {
        this.majorGridLinesShape.moveTo( x, gridMinY ).verticalLineTo( gridMaxY );
      }
      else {
        this.minorGridLinesShape.moveTo( x, gridMinY ).verticalLineTo( gridMaxY );
      }
    }

    // Horizontal grid lines
    for ( let j = 0; j * MINOR_GRIDLINE_SPACING < gridHeight; j++ ) {
      const y = j * MINOR_GRIDLINE_SPACING + gridMinY;

      const isMajor = j % MINOR_GRIDLINES_PER_MAJOR_GRIDLINE === 0;
      if ( isMajor ) {
        this.majorGridLinesShape.moveTo( gridMinX, y ).horizontalLineTo( gridMaxX );
      }
      else {
        this.minorGridLinesShape.moveTo( gridMinX, y ).horizontalLineTo( gridMaxX );
      }
    }

  }
}

collisionLab.register( 'Grid', Grid );
export default Grid;