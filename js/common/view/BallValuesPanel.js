// Copyright 2019-2020, University of Colorado Boulder

/**
 * BallValuesPanel is the Panel at the bottom of all screen which displays and allows the user to modify Ball values.
 *
 * For each Ball in the PlayArea, it displays it's values, which are:
 *    - Masses (kg)
 *    - The positions of the Balls (m)
 *    - The velocities of the Balls (m/s)
 *    - The linear momentum of the Balls (kg m/s)
 *
 * If the "More Data" checkbox is not checked, the Node only displays:
 *   - Masses of the Balls (kg)
 *   - A slider to change the mass
 *
 * The Panel is built into columns using BallValuesPanelColumnNode. Then, columns are grouped together (like the
 * x-position and the y-position column) and a title-label is placed above it (in this case "Position").
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
import Text from '../../../../scenery/js/nodes/Text.js';
import VBox from '../../../../scenery/js/nodes/VBox.js';
import Panel from '../../../../sun/js/Panel.js';
import collisionLab from '../../collisionLab.js';
import collisionLabStrings from '../../collisionLabStrings.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import Ball from '../model/Ball.js';
import BallValuesPanelColumnNode from './BallValuesPanelColumnNode.js';
import KeypadPlane from './KeypadPlane.js';

class BallValuesPanel extends Panel {

  /**
   * @param {ObservableArray.<Ball>} balls - collections of particles inside the container
   * @param {Property.<boolean>} moreDataVisibleProperty - indicates if the "More Data" checkbox is checked.
   * @param {KeypadPlane} keypadPlane
   * @param {Object} [options]
   */
  constructor( balls, moreDataVisibleProperty, keypadPlane, options ) {
    assert && assert( balls instanceof ObservableArray && balls.count( ball => ball instanceof Ball ) === balls.length, `invalid balls: ${balls}` );
    assert && assert( moreDataVisibleProperty instanceof BooleanProperty, `invalid moreDataVisibleProperty: ${moreDataVisibleProperty}` );
    assert && assert( keypadPlane instanceof KeypadPlane, `invalid keypadPlane: ${keypadPlane}` );
    assert && assert( !options || Object.getPrototypeOf( options ) === Object.prototype, `invalid options: ${options}` );

    options = merge( {}, CollisionLabConstants.PANEL_OPTIONS, {

      ballIconColumnSpacing: 10,    // {number} - x-spacing between the ball-icons and the first NumberDisplays
      componentColumnsSpacing: 12,  // {number} - x-spacing between the x and y component NumberDisplay columns
      columnGroupSpacing: 22,       // {number} - x-spacing between the major groups of NumberDisplay columns
      columnGroupsTopMargin: 1,     // {number} - y-margin between the columns and the title-labels above them

      titleLabelTextOptions: {
        font: CollisionLabConstants.PANEL_TITLE_FONT,
        maxWidth: 140 // constrain width for i18n, determined empirically
      }

    }, options );

    //----------------------------------------------------------------------------------------

    // Create AlignGroups for the content and labels of every BallValuesPanelColumnNode to match the vertical height of
    // each component in the BallValuesPanel. See BallValuesPanelColumnNode for more documentation.
    const labelAlignGroup = new AlignGroup( { matchHorizontal: false, matchVertical: true } );
    const contentAlignGroup = new AlignGroup( { matchHorizontal: false, matchVertical: true } );

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

    // Horizontally group the components of BallValuesPanelColumnNodes into groups.
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

    //----------------------------------------------------------------------------------------

    // Create the Title Labels for the groups of columns.
    const momentumTitleLabelText = new Text( collisionLabStrings.momentumUnit, options.titleLabelTextOptions );
    const positionTitleLabelText = new Text( collisionLabStrings.positionUnit, options.titleLabelTextOptions );
    const velocityTitleLabelText = new Text( collisionLabStrings.velocityUnit, options.titleLabelTextOptions );
    const massTitleLabelText = new Text( collisionLabStrings.massUnit, options.titleLabelTextOptions );

    // Horizontally group the column groups with their respective title Labels in a VBox.
    const massColumnGroupAndTitleBox = new VBox( {
      children: [ massTitleLabelText, massColumnNode ],
      spacing: options.columnGroupsTopMargin
    } );
    const positionColumnGroupAndTitleBox = new VBox( {
      children: [ positionTitleLabelText, positionColumnGroup ],
      spacing: options.columnGroupsTopMargin
    } );
    const velocityColumnGroupAndTitleBox = new VBox( {
      children: [ velocityTitleLabelText, velocityColumnGroup ],
      spacing: options.columnGroupsTopMargin
    } );
    const momentumColumnGroupAndTitleBox = new VBox( {
      children: [ momentumTitleLabelText, momentumColumnGroup ],
      spacing: options.columnGroupsTopMargin
    } );

    //----------------------------------------------------------------------------------------

    // The content of the entire Panel when "More Data" is checked.
    const moreDataBox = new HBox( {
      children: [
        massColumnGroupAndTitleBox,
        positionColumnGroupAndTitleBox,
        velocityColumnGroupAndTitleBox,
        momentumColumnGroupAndTitleBox
      ],
      spacing: options.columnGroupSpacing,
      align: 'bottom'
    } );

    // The content of the entire Panel when "More Data" is not checked.
    const lessDataBox = new HBox( {
      children: [
        massColumnGroupAndTitleBox,
        massSlidersColumnNode
      ],
      spacing: options.columnGroupSpacing,
      align: 'bottom'
    } );

    //----------------------------------------------------------------------------------------

    // Reference the content Node of the Panel, passed to the super-class.
    const panelContentNode = new HBox( { spacing: options.ballIconColumnSpacing, align: 'bottom' } );

    // Observe when the moreDataVisibleProperty changes and update the children of the content. We change the children
    // rather than the visibility of the children to change the Panel's Bounds, which allows the super-class to resize.
    // Link is not removed since BallValuesPanels are never disposed.
    moreDataVisibleProperty.link( moreDataVisible => {
      panelContentNode.children = [ ballIconsColumnNode, moreDataVisible ? moreDataBox : lessDataBox ];
    } );

    super( panelContentNode, options );
  }
}

collisionLab.register( 'BallValuesPanel', BallValuesPanel );
export default BallValuesPanel;