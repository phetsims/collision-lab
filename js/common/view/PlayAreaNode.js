// Copyright 2019-2020, University of Colorado Boulder

/**
 * PlayAreaNode is the view representation of a single PlayArea, which appears in all screens of the 'Collision Lab'
 * simulation. PlayAreaNode was implemented to work for both 1D and 2D screens, so no sub-types are needed.
 *
 * PlayAreaNode draws all of the components that are related to the 'play area', including its background, grid, and
 * border. For the 1D screens, the grid is a series of tick-lines at the bottom of the PlayArea. When the PlayArea's
 * border reflects, it has a 'thicker' border (and vise versa when its border doesn't reflect).
 *
 * For the 'Collision Lab' sim, there is 1 PlayAreaNode for each screen and they are created at the start if the sim,
 * so they are never disposed.
 *
 * NOTE: Do not translate this node. It's origin must be at the origin of the view coordinate frame.
 *
 * @author Brandon Li
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import GridNode from '../../../../griddle/js/GridNode.js';
import Shape from '../../../../kite/js/Shape.js';
import merge from '../../../../phet-core/js/merge.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabColors from '../CollisionLabColors.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import PlayArea from '../model/PlayArea.js';

// constants
const MINOR_GRIDLINE_SPACING = CollisionLabConstants.MINOR_GRIDLINE_SPACING; // In model units.
const MAJOR_GRIDLINE_SPACING = CollisionLabConstants.MAJOR_GRIDLINE_SPACING; // In model units.

class PlayAreaNode extends Node {

  /**
   * @param {PlayArea} playArea
   * @param {Property.<boolean>} gridVisibleProperty
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options]
   */
  constructor( playArea, gridVisibleProperty, modelViewTransform, options ) {
    assert && assert( playArea instanceof PlayArea, `invalid playArea: ${playArea}` );
    assert && AssertUtils.assertPropertyOf( gridVisibleProperty, 'boolean' );
    assert && assert( modelViewTransform instanceof ModelViewTransform2, `invalid modelViewTransform: ${modelViewTransform}` );

    options = merge( {

      // grid
      majorGridLineWidth: 2, // {number} - the line-width of the major grid-lines, in view units.
      minorGridLineWidth: 1, // {number} - the line-width of the major grid-lines, in view units.

      // ticks
      majorTickLength: 0.09, // {number} - the vertical length of major tick-lines, in model units.
      minorTickLength: 0.06, // {number} - the vertical length of major tick-lines, in model units.
      tickLineWidth: 1,      // {number} - the line-width of tick-lines, in view units.

      // border
      reflectingBorderLineWidth: 3,   // {number} - the line-width of the border when the border doesn't reflect.
      nonReflectingBorderLineWidth: 1 // {number} - the line-width of the border when the border doesn't reflect.

    }, options );

    assert && assert( !options.children, 'PlayAreaNode sets children' );

    //----------------------------------------------------------------------------------------

    // Convenience reference to the view-bounds of the PlayArea.
    const playAreaViewBounds = modelViewTransform.modelToViewBounds( playArea.bounds );

    // Create the background Rectangle, which appears behind the grid/ticks.
    const background = new Rectangle( playAreaViewBounds, { fill: CollisionLabColors.GRID_BACKGROUND_COLOR } );

    // Create the border Rectangle, which appears in front of the grid/ticks.
    const border = new Rectangle( playAreaViewBounds );

    // Observe when PlayArea's reflectingBorderProperty changes and update the appearance of the border. Link
    // is never unlinked since PlayAreaNodes are never disposed.
    playArea.reflectingBorderProperty.link( reflectingBorder => {

      // Update the line-width of the Border. The border's bounds is dilated so that it fully encapsulates the PlayArea.
      border.lineWidth = reflectingBorder ? options.reflectingBorderLineWidth : options.nonReflectingBorderLineWidth;
      border.rectBounds = playAreaViewBounds.dilated( border.lineWidth / 2 );

      // Update the stroke color of the Border.
      border.stroke = reflectingBorder ?
        CollisionLabColors.REFLECTING_GRID_BORDER_COLOR :
        CollisionLabColors.NON_REFLECTING_GRID_BORDER_COLOR;
    } );

    //----------------------------------------------------------------------------------------


    const children = [
      background
    ];

    if ( playArea.dimensions === 2 ) {

      const gridNode = new GridNode( playAreaViewBounds.width, playAreaViewBounds.height, {
        majorHorizontalLineSpacing: -modelViewTransform.modelToViewDeltaY( MAJOR_GRIDLINE_SPACING ),
        majorVerticalLineSpacing: modelViewTransform.modelToViewDeltaX( MAJOR_GRIDLINE_SPACING ),
        minorHorizontalLineSpacing: -modelViewTransform.modelToViewDeltaY( MINOR_GRIDLINE_SPACING ),
        minorVerticalLineSpacing: modelViewTransform.modelToViewDeltaX( MINOR_GRIDLINE_SPACING ),
        majorLineOptions: {
          lineWidth: MAJOR_GRIDLINE_WIDTH,
          stroke: CollisionLabColors.MAJOR_GRIDLINE_COLOR
        },
        minorLineOptions: {
          lineWidth: MINOR_GRIDLINE_WIDTH,
          stroke: CollisionLabColors.MINOR_GRIDLINE_COLOR
        },
        center: playAreaViewBounds.center
      } );

      gridVisibleProperty.linkAttribute( gridNode, 'visible' );

      children.push( gridNode );
    }
    else {
      const ticksNode = new TicksNode( playArea.bounds, modelViewTransform );

      assert && playArea.gridVisibleProperty.link( gridVisible => assert( gridVisible, 'grids must be visible' ) );
      children.push( ticksNode );

    }


    this.children = children;

        super( options );

  }
}


// Draws vertical and horizontal grid-lines with the given spacing. Used for major and minor axes. Handles visibility.
class TicksNode extends Node {

  /**
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options]
   */
  constructor( playAreaBounds, modelViewTransform ) {
    assert && assert( playAreaBounds instanceof Bounds2, `invalid playAreaBounds: ${playAreaBounds}` );
    assert && assert( modelViewTransform instanceof ModelViewTransform2, `invalid modelViewTransform: ${modelViewTransform}` );

    //----------------------------------------------------------------------------------------

    // Convenience variables
    const gridMinX = playAreaBounds.minX;
    const gridMaxX = playAreaBounds.maxX;
    const gridMinY = playAreaBounds.minY;
    const minorGridLinesShape = new Shape();
    const majorGridLinesShape = new Shape();

    // Minor Grid lines
    for ( let xValue = gridMinX; xValue <= gridMaxX; xValue += MINOR_GRIDLINE_SPACING ) {
      minorGridLinesShape.moveTo( xValue, gridMinY ).verticalLineToRelative( MINOR_TICK_LENGTH );
    }

    // Major Grid lines
    for ( let xValue = gridMinX; xValue <= gridMaxX; xValue += MAJOR_GRIDLINE_SPACING ) {
      majorGridLinesShape.moveTo( xValue, gridMinY ).verticalLineToRelative( MAJOR_TICK_LENGTH );
    }

    super( {
      children: [
        new Path( modelViewTransform.modelToViewShape( minorGridLinesShape ), {
          lineWidth: MINOR_GRIDLINE_WIDTH,
          stroke: CollisionLabColors.MINOR_GRIDLINE_COLOR
        } ),
        new Path( modelViewTransform.modelToViewShape( majorGridLinesShape ), {
          lineWidth: MINOR_GRIDLINE_WIDTH,
          stroke: CollisionLabColors.MAJOR_GRIDLINE_COLOR
        } )
      ]
    } );
  }
}


collisionLab.register( 'PlayAreaNode', PlayAreaNode );
export default PlayAreaNode;