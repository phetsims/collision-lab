// Copyright 2019-2020, University of Colorado Boulder

/**
 * View for the PlayArea, which includes:
 *  - background, border, and grid lines
 *  - Kinetic Energy Display
 *  - Center of mass
 *
 * PlayAreaNode is created at the start of the sim and is never disposed, so no dispose method is necessary.
 *
 * @author Brandon Li
 */

import Property from '../../../../axon/js/Property.js';
import GridNode from '../../../../griddle/js/GridNode.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabColors from '../CollisionLabColors.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import PlayArea from '../model/PlayArea.js';

// constants
const MINOR_GRIDLINE_SPACING = CollisionLabConstants.MINOR_GRIDLINE_SPACING; // model
const MAJOR_GRIDLINE_SPACING = CollisionLabConstants.MAJOR_GRIDLINE_SPACING; // model
const MAJOR_GRID_LINE_WIDTH = 2; // view units
const MINOR_GRID_LINE_WIDTH = 1; // view units

class PlayAreaNode extends Node {

  /**
   * @param {PlayArea} playArea
   * @param {Property.<boolean>} gridVisibleProperty
   * @param {Property.<boolean>} kineticEnergyVisibleProperty
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options]
   */
  constructor( playArea,
               gridVisibleProperty,
               kineticEnergyVisibleProperty,
               modelViewTransform,
               options ) {
    assert && assert( playArea instanceof PlayArea, `invalid playArea: ${playArea}` );
    assert && assert( gridVisibleProperty instanceof Property && typeof gridVisibleProperty.value === 'boolean', `invalid gridVisibleProperty: ${gridVisibleProperty}` );
    assert && assert( kineticEnergyVisibleProperty instanceof Property && typeof kineticEnergyVisibleProperty.value === 'boolean', `invalid kineticEnergyVisibleProperty: ${gridVisibleProperty}` );
    assert && assert( modelViewTransform instanceof ModelViewTransform2, `invalid modelViewTransform: ${modelViewTransform}` );
    assert && assert( !options || Object.getPrototypeOf( options ) === Object.prototype, `Extra prototype on options: ${options}` );

    super( options );

    //----------------------------------------------------------------------------------------

    const playAreaViewBounds = modelViewTransform.modelToViewBounds( playArea.bounds );

    const background = new Rectangle( playAreaViewBounds, { fill: CollisionLabColors.GRID_BACKGROUND_COLOR } );

    const gridNode = new GridNode( playAreaViewBounds.width, playAreaViewBounds.height, {
      majorHorizontalLineSpacing: -modelViewTransform.modelToViewDeltaY( MAJOR_GRIDLINE_SPACING ),
      majorVerticalLineSpacing: modelViewTransform.modelToViewDeltaX( MAJOR_GRIDLINE_SPACING ),
      minorHorizontalLineSpacing: -modelViewTransform.modelToViewDeltaY( MINOR_GRIDLINE_SPACING ),
      minorVerticalLineSpacing: modelViewTransform.modelToViewDeltaX( MINOR_GRIDLINE_SPACING ),
      majorLineOptions: {
        lineWidth: MAJOR_GRID_LINE_WIDTH,
        stroke: CollisionLabColors.MAJOR_GRID_LINE_COLOR
      },
      minorLineOptions: {
        lineWidth: MINOR_GRID_LINE_WIDTH,
        stroke: CollisionLabColors.MAJOR_GRID_LINE_COLOR
      },
      center: playAreaViewBounds.center
    } );

    const border = new Rectangle( playAreaViewBounds, {
      stroke: CollisionLabColors.GRID_BORDER_COLOR,
      lineWidth: 3
    } );

    // Set the children of the PlayAreaNode in the correct rendering order.
    this.children = [
      background,
      gridNode,
      border
    ];
  }
}

collisionLab.register( 'PlayAreaNode', PlayAreaNode );
export default PlayAreaNode;