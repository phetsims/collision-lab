// Copyright 2019-2022, University of Colorado Boulder

/**
 * PlayAreaNode is the view representation of a single PlayArea, which appears in all screens of the 'Collision Lab'
 * simulation. PlayAreaNode was implemented to work for both 1D and 2D screens, so no sub-types are needed.
 *
 * PlayAreaNode draws all of the components that are related to the 'play area', including its background, grid, and
 * border. For the 1D screens, the grid is a series of tick-lines at the top of the PlayArea. When the PlayArea's
 * border reflects, it has a 'thicker' border (and vise versa when its border doesn't reflect).
 *
 * For the 'Collision Lab' sim, there is 1 PlayAreaNode for each screen and they are created at the start if the sim,
 * so they are never disposed.
 *
 * NOTE: Do not translate this node. It's origin must be at the origin of the view coordinate frame.
 *
 * @author Brandon Li
 */

import GridNode from '../../../../griddle/js/GridNode.js';
import { Shape } from '../../../../kite/js/imports.js';
import merge from '../../../../phet-core/js/merge.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import { Node, Path, Rectangle } from '../../../../scenery/js/imports.js';
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
    const background = new Rectangle( playAreaViewBounds, { fill: CollisionLabColors.GRID_BACKGROUND } );

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
                      CollisionLabColors.REFLECTING_PLAY_AREA_BORDER :
                      CollisionLabColors.NON_REFLECTING_PLAY_AREA_BORDER;
    } );

    //----------------------------------------------------------------------------------------

    if ( playArea.dimension === PlayArea.Dimension.TWO ) {

      // Create the GridNode for 2D screens.
      const gridNode = new GridNode( playAreaViewBounds.width, playAreaViewBounds.height, {
        majorHorizontalLineSpacing: -modelViewTransform.modelToViewDeltaY( MAJOR_GRIDLINE_SPACING ),
        majorVerticalLineSpacing: modelViewTransform.modelToViewDeltaX( MAJOR_GRIDLINE_SPACING ),
        minorHorizontalLineSpacing: -modelViewTransform.modelToViewDeltaY( MINOR_GRIDLINE_SPACING ),
        minorVerticalLineSpacing: modelViewTransform.modelToViewDeltaX( MINOR_GRIDLINE_SPACING ),
        majorLineOptions: {
          lineWidth: options.majorGridLineWidth,
          stroke: CollisionLabColors.MAJOR_GRIDLINE_COLOR
        },
        minorLineOptions: {
          lineWidth: options.minorGridLineWidth,
          stroke: CollisionLabColors.MINOR_GRIDLINE_COLOR
        },
        center: playAreaViewBounds.center
      } );

      // Observe when the gridVisibleProperty changes and update the visibility of the GridNode. Link is never unlinked
      // since PlayAreaNodes are never disposed.
      gridVisibleProperty.linkAttribute( gridNode, 'visible' );

      // Set the children in the correct rendering order.
      options.children = [
        background,
        gridNode,
        border
      ];
    }
    else {

      // For 1D screens, drag tick-lines at the top of the PlayArea.
      const minorTickLinesShape = new Shape();
      const majorTickLinesShape = new Shape();

      // Minor Tick lines
      for ( let xValue = playArea.left; xValue <= playArea.right; xValue += MINOR_GRIDLINE_SPACING ) {
        minorTickLinesShape.moveTo( xValue, playArea.top ).verticalLineToRelative( -options.minorTickLength );
      }

      // Major Tick lines
      for ( let xValue = playArea.left; xValue <= playArea.right; xValue += MAJOR_GRIDLINE_SPACING ) {
        majorTickLinesShape.moveTo( xValue, playArea.top ).verticalLineToRelative( -options.majorTickLength );
      }

      // Create the Paths for the minor and major Ticks.
      const minorTickLinesPath = new Path( modelViewTransform.modelToViewShape( minorTickLinesShape ), {
        lineWidth: options.tickLineWidth,
        stroke: CollisionLabColors.TICK_LINE_COLOR
      } );
      const majorTickLinesPath = new Path( modelViewTransform.modelToViewShape( majorTickLinesShape ), {
        lineWidth: options.tickLineWidth,
        stroke: CollisionLabColors.TICK_LINE_COLOR
      } );

      // Verify that the grid (ticks) are always visible in 1D screens.
      assert && playArea.gridVisibleProperty.link( gridVisible => assert( gridVisible, 'grids must be visible' ) );

      // Set the children in the correct rendering order.
      options.children = [
        background,
        minorTickLinesPath,
        majorTickLinesPath,
        border
      ];
    }

    super( options );
  }
}

collisionLab.register( 'PlayAreaNode', PlayAreaNode );
export default PlayAreaNode;