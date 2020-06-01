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
import Shape from '../../../../kite/js/Shape.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabColors from '../CollisionLabColors.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import PlayArea from '../model/PlayArea.js';
import CenterOfMassNode from './CenterOfMassNode.js';
import KineticEnergyNumberDisplay from './KineticEnergyNumberDisplay.js';

// constants
const MINOR_GRIDLINE_SPACING = CollisionLabConstants.MINOR_GRIDLINE_SPACING; // model
const MAJOR_GRIDLINE_SPACING = CollisionLabConstants.MAJOR_GRIDLINE_SPACING; // model
const KINETIC_ENERGY_DISPLAY_MARGIN = 5;
const MAJOR_GRID_LINE_WIDTH = 2; // view units
const MINOR_GRID_LINE_WIDTH = 1; // view units

class PlayAreaNode extends Node {

  /**
   * @param {PlayArea} playArea
   * @param {Property.<boolean>} gridVisibleProperty
   * @param {Property.<boolean>} kineticEnergyVisibleProperty
   * @param {Property.<boolean>} centerOfMassVisibleProperty
   * @param {Property.<boolean>} pathVisibleProperty - indicates if the 'Path' is visible.
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options]
   */
  constructor( playArea,
               gridVisibleProperty,
               kineticEnergyVisibleProperty,
               centerOfMassVisibleProperty,
               pathVisibleProperty,
               modelViewTransform,
               options ) {
    assert && assert( playArea instanceof PlayArea, `invalid playArea: ${playArea}` );
    assert && assert( gridVisibleProperty instanceof Property && typeof gridVisibleProperty.value === 'boolean', `invalid gridVisibleProperty: ${gridVisibleProperty}` );
    assert && assert( kineticEnergyVisibleProperty instanceof Property && typeof kineticEnergyVisibleProperty.value === 'boolean', `invalid kineticEnergyVisibleProperty: ${gridVisibleProperty}` );
    assert && assert( centerOfMassVisibleProperty instanceof Property && typeof centerOfMassVisibleProperty.value === 'boolean', `invalid centerOfMassVisibleProperty: ${gridVisibleProperty}` );
    assert && assert( modelViewTransform instanceof ModelViewTransform2, `invalid modelViewTransform: ${modelViewTransform}` );
    assert && assert( !options || Object.getPrototypeOf( options ) === Object.prototype, `Extra prototype on options: ${options}` );

    super( options );

    //----------------------------------------------------------------------------------------

    const playAreaViewBounds = modelViewTransform.modelToViewBounds( playArea.bounds );

    const background = new Rectangle( playAreaViewBounds, { fill: CollisionLabColors.GRID_BACKGROUND_COLOR } );

    const majorGridLines = new GridLines( playArea, MAJOR_GRIDLINE_SPACING, playArea.dimensions === 2 ? playArea.bounds.height : 0.09, playArea.dimensions === 2, gridVisibleProperty, modelViewTransform, {
      lineWidth: playArea.dimensions === 2 ? MAJOR_GRID_LINE_WIDTH : MINOR_GRID_LINE_WIDTH,
      stroke: CollisionLabColors.MAJOR_GRID_LINE_COLOR
    } );

    const minorGridLines = new GridLines( playArea, MINOR_GRIDLINE_SPACING, playArea.dimensions === 2 ? playArea.bounds.height : 0.06, playArea.dimensions === 2, gridVisibleProperty, modelViewTransform, {
      lineWidth: MINOR_GRID_LINE_WIDTH,
      stroke: playArea.dimensions === 1 ? CollisionLabColors.MAJOR_GRID_LINE_COLOR : CollisionLabColors.MINOR_GRID_LINE_COLOR
    } );

    const kineticEnergyDisplay = new KineticEnergyNumberDisplay( playArea.totalKineticEnergyProperty,
      kineticEnergyVisibleProperty, {
        left: background.left + KINETIC_ENERGY_DISPLAY_MARGIN,
        bottom: background.bottom - KINETIC_ENERGY_DISPLAY_MARGIN
      } );

    const centerOfMassNode = new CenterOfMassNode( playArea.centerOfMass,
      centerOfMassVisibleProperty,
      pathVisibleProperty,
      modelViewTransform );

    const border = new Rectangle( playAreaViewBounds, {
      stroke: CollisionLabColors.GRID_BORDER_COLOR,
      lineWidth: 3
    } );

    // Set the children of the PlayAreaNode in the correct rendering order.
    this.children = [
      background,
      minorGridLines,
      majorGridLines,
      kineticEnergyDisplay,
      centerOfMassNode,
      border
    ];
  }
}

// TODO: use GridNode when it is ready
// Draws vertical and horizontal grid-lines with the given spacing. Used for major and minor axes. Handles visibility.
class GridLines extends Path {

  /**
   * @param {number} spacing - the spacing between grid-lines
   * @param {BooleanProperty} gridVisibleProperty
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options]
   */
  constructor( playArea, spacing, height, includeHorizontal, gridVisibleProperty, modelViewTransform, options ) {
    assert && assert( typeof spacing === 'number', `invalid spacing: ${spacing}` );
    assert && assert( gridVisibleProperty instanceof Property && typeof gridVisibleProperty.value === 'boolean', `invalid gridVisibleProperty: ${gridVisibleProperty}` );
    assert && assert( modelViewTransform instanceof ModelViewTransform2, `invalid modelViewTransform: ${modelViewTransform}` );
    assert && assert( !options || Object.getPrototypeOf( options ) === Object.prototype, `invalid options: ${options}` );

    //----------------------------------------------------------------------------------------

    // Convenience variables
    const gridMinX = playArea.bounds.minX;
    const gridMaxX = playArea.bounds.maxX;
    const gridMinY = playArea.bounds.minY;
    const gridMaxY = playArea.bounds.maxY;

    const gridLineShape = new Shape();

    // Vertical lines
    for ( let xValue = gridMinX; xValue <= gridMaxX; xValue += spacing ) {
      gridLineShape.moveTo( xValue, gridMinY ).verticalLineToRelative( height );
    }

    if ( includeHorizontal ) {
      // Horizontal lines
      for ( let yValue = gridMinY; yValue <= gridMaxY; yValue += spacing ) {
        gridLineShape.moveTo( gridMinX, yValue ).horizontalLineTo( gridMaxX );
      }
    }

    super( modelViewTransform.modelToViewShape( gridLineShape ), options );

    //----------------------------------------------------------------------------------------

    // Observe when the gridVisibleProperty changes and update visibility. No need to unlink since PlayAreaNodes
    // (and GridLines) exist for the lifetime of the sim.
    gridVisibleProperty.linkAttribute( this, 'visible' );
  }
}


collisionLab.register( 'PlayAreaNode', PlayAreaNode );
export default PlayAreaNode;