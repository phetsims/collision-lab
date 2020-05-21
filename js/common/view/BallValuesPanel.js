// Copyright 2019-2020, University of Colorado Boulder

/**
 * BallValuesPanel is the Panel at the bottom of all screen which displays and allows the user to modify Ball values.
 *
 *
 *
 * The Panel first
 * For each Ball in the PlayArea, this Panel displays it's values, which is a BallValuesEntryNode.
 *
 * This panel exists for the entire sim and is never disposed.
 *
 * @author Brandon Li
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import ObservableArray from '../../../../axon/js/ObservableArray.js';
import merge from '../../../../phet-core/js/merge.js';
import AlignGroup from '../../../../scenery/js/nodes/AlignGroup.js';
import HBox from '../../../../scenery/js/nodes/HBox.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Panel from '../../../../sun/js/Panel.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabColors from '../CollisionLabColors.js';
import Ball from '../model/Ball.js';
import BallValuesPanelColumnNode from './BallValuesPanelColumnNode.js';
import KeypadPlane from './KeypadPlane.js';

// const Text = require( '/scenery/js/nodes/Text' );

// strings
// const momentumUnitString = require( 'string!COLLISION_LAB/momentumUnit' );
// const positionUnitString = require( 'string!COLLISION_LAB/positionUnit' );
// const velocityUnitString = require( 'string!COLLISION_LAB/velocityUnit' );
// const massUnitString = require( 'string!COLLISION_LAB/massUnit' );

class BallValuesPanel extends Panel {

  /**
   * @param {ObservableArray.<Ball>} balls - collections of particles inside the container
   * @param {Property.<boolean>} moreDataVisibleProperty - Property that indicates if the "More Data" checkbox is checked.
   * @param {KeypadPlane} keypadPlane
   * @param {Object} [options]
   */
  constructor( balls, moreDataVisibleProperty, keypadPlane, options ) {
    assert && assert( balls instanceof ObservableArray && balls.count( ball => ball instanceof Ball ) === balls.length, `invalid balls: ${balls}` );
    assert && assert( moreDataVisibleProperty instanceof BooleanProperty, `invalid moreDataVisibleProperty: ${moreDataVisibleProperty}` );
    assert && assert( keypadPlane instanceof KeypadPlane, `invalid keypadPlane: ${keypadPlane}` );
    assert && assert( !options || Object.getPrototypeOf( options ) === Object.prototype, `invalid options: ${options}` );

    options = merge( {}, CollisionLabColors.PANEL_COLORS, {

      ballIconColumnSpacing: 10,    // {number} - x-spacing between the ball-icons and the first NumberDisplays
      componentColumnsSpacing: 12,  // {number} - x-spacing between the x and y component NumberDisplay columns
      columnGroupSpacing: 22,       // {number} - x-spacing between the major groups of NumberDisplay columns

      // super-class
      xMargin: 16,
      yMargin: 12,
      cornerRadius: 7

    }, options );

    //----------------------------------------------------------------------------------------

    // Create AlignGroups for the content and labels of every column to match the vertical height of each component of
    // the BallValuesPanel. See BallValuesPanelColumnNode for more documentation.
    const labelAlignGroup = new AlignGroup( {  matchHorizontal: false, matchVertical: true } );
    const contentAlignGroup = new AlignGroup( {  matchHorizontal: false, matchVertical: true } );

    // Create each BallValuesPanelColumnNode for each type of BallValuesPanelColumnNode.ColumnTypes
    const ballIconsColumnNode = new BallValuesPanelColumnNode( balls, BallValuesPanelColumnNode.ColumnTypes.BALL_ICONS, contentAlignGroup, labelAlignGroup, keypadPlane );
    const massColumnNode = new BallValuesPanelColumnNode( balls, BallValuesPanelColumnNode.ColumnTypes.MASS, contentAlignGroup, labelAlignGroup, keypadPlane );
    const xPositionColumnNode = new BallValuesPanelColumnNode( balls, BallValuesPanelColumnNode.ColumnTypes.X_POSITION, contentAlignGroup, labelAlignGroup, keypadPlane );
    const yPositionColumnNode = new BallValuesPanelColumnNode( balls, BallValuesPanelColumnNode.ColumnTypes.Y_POSITION, contentAlignGroup, labelAlignGroup, keypadPlane );
    const xVelocityColumnNode = new BallValuesPanelColumnNode( balls, BallValuesPanelColumnNode.ColumnTypes.X_VELOCITY, contentAlignGroup, labelAlignGroup, keypadPlane );
    const yVelocityColumnNode = new BallValuesPanelColumnNode( balls, BallValuesPanelColumnNode.ColumnTypes.Y_VELOCITY, contentAlignGroup, labelAlignGroup, keypadPlane );
    const xMomentumColumnNode = new BallValuesPanelColumnNode( balls, BallValuesPanelColumnNode.ColumnTypes.X_MOMENTUM, contentAlignGroup, labelAlignGroup, keypadPlane );
    const yMomentumColumnNode = new BallValuesPanelColumnNode( balls, BallValuesPanelColumnNode.ColumnTypes.Y_MOMENTUM, contentAlignGroup, labelAlignGroup, keypadPlane );
    const massSlidersColumnNode = new BallValuesPanelColumnNode( balls, BallValuesPanelColumnNode.ColumnTypes.MASS_SLIDERS, contentAlignGroup, labelAlignGroup, keypadPlane );

    // Group the columns by components
    const positionColumnGroup = new HBox( {
      children: [ xPositionColumnNode, yPositionColumnNode ],
      spacing: options.componentColumnsSpacing
    } );
    const velocityColumnGroup = new HBox( {
      children: [ xVelocityColumnNode, yVelocityColumnNode ],
      spacing: options.componentColumnsSpacing
    } );
    const momentumColumnGroup = new HBox( {
      children: [ xMomentumColumnNode, yMomentumColumnNode ],
      spacing: options.componentColumnsSpacing
    } );

    // The content when "More Data" is checked.
    const moreDataBox = new HBox( {
      children: [
        massColumnNode,
        positionColumnGroup,
        velocityColumnGroup,
        momentumColumnGroup
      ],
      spacing: options.columnGroupSpacing,
      left: ballIconsColumnNode.right + options.ballIconColumnSpacing,
      centerY: ballIconsColumnNode.centerY
    } );

    // The content when "More Data" is not checked.
    const lessDataBox = new HBox( {
      children: [
        massColumnNode,
        massSlidersColumnNode
      ],
      spacing: options.columnGroupSpacing,
      left: ballIconsColumnNode.right + options.ballIconColumnSpacing,
      centerY: ballIconsColumnNode.centerY
    } );

    //----------------------------------------------------------------------------------------

    // Reference the content Node of the Panel, passed to the super-class.
    const panelContentNode = new Node();

    // Observe when the moreDataVisibleProperty changes and update the children of our Node. We change our children
    // rather than the visibility of our children to change our Bounds, which allows out super-class to resize.
    // Link is not removed since BallValuesPanels are never disposed.
    moreDataVisibleProperty.link( moreDataVisible => {
      panelContentNode.children = [ ballIconsColumnNode, moreDataVisible ? moreDataBox : lessDataBox ];
    } );

    super( panelContentNode, options );
  }
}

collisionLab.register( 'BallValuesPanel', BallValuesPanel );
export default BallValuesPanel;