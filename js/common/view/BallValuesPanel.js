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
 * The Panel is built into columns using BallValuesPanelColumnNode. If the dimensions of the screen that contains the
 * Balls is 2D, the columns are grouped together (like the x-position and the y-position column) and a title-label is
 * placed above it (in this case "Position").
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
import KeypadDialog from './KeypadDialog.js';

class BallValuesPanel extends Panel {

  /**
   * @param {ObservableArray.<Ball>} balls - collections of particles inside the container
   * @param {Property.<boolean>} moreDataVisibleProperty - indicates if the "More Data" checkbox is checked.
   * @param {KeypadDialog} keypadDialog
   * @param {Object} [options]
   */
  constructor( balls, moreDataVisibleProperty, keypadDialog, options ) {
    assert && assert( balls instanceof ObservableArray && balls.count( ball => ball instanceof Ball ) === balls.length, `invalid balls: ${balls}` );
    assert && assert( moreDataVisibleProperty instanceof BooleanProperty, `invalid moreDataVisibleProperty: ${moreDataVisibleProperty}` );
    assert && assert( keypadDialog instanceof KeypadDialog, `invalid keypadDialog: ${keypadDialog}` );
    assert && assert( !options || Object.getPrototypeOf( options ) === Object.prototype, `invalid options: ${options}` );

    options = merge( {}, CollisionLabConstants.PANEL_OPTIONS, {

      ballIconColumnSpacing: 12,    // {number} - x-spacing between the ball-icons and the first NumberDisplays
      componentColumnsSpacing: 12,  // {number} - x-spacing between the x and y component NumberDisplay columns
      columnGroupSpacing: 21,       // {number} - x-spacing between the major groups of NumberDisplay columns
      columnGroupsTopMargin: 0.5,   // {number} - y-margin between the columns and the title-labels above them
      dimensions: 2,                // {number} - the dimensions of the screen that the Balls appears in.

      massTitleMaxWidth: 67,            // {number} - maxWidth for the 'Mass (kg)' title label for i18n
      componentGroupTitleMaxWidth: 140, // {number} maxWidth for the other title labels (for component groups) for 18n

      // {Font} - applied to all of the title label Text instances
      titleFont: CollisionLabConstants.PANEL_TITLE_FONT

    }, options );

    //----------------------------------------------------------------------------------------

    // Create AlignGroups for the content and labels of every BallValuesPanelColumnNode to match the vertical height of
    // each component in the BallValuesPanel. See BallValuesPanelColumnNode for more documentation.
    const labelAlignGroup = new AlignGroup( { matchHorizontal: false, matchVertical: true } );
    const contentAlignGroup = new AlignGroup( { matchHorizontal: false, matchVertical: true } );

    // Convenience function to create a BallValuesPanelColumnNode
    const createColumnNode = columnType => new BallValuesPanelColumnNode( balls, columnType, contentAlignGroup, labelAlignGroup, keypadDialog );

    // Create each BallValuesPanelColumnNode for each 1D BallValuesPanelColumnNode.ColumnTypes first.
    const ballIconsColumnNode = createColumnNode( BallValuesPanelColumnNode.ColumnTypes.BALL_ICONS );
    const massColumnNode = createColumnNode( BallValuesPanelColumnNode.ColumnTypes.MASS );
    const xPositionColumnNode = createColumnNode( BallValuesPanelColumnNode.ColumnTypes.X_POSITION );
    const xVelocityColumnNode = createColumnNode( BallValuesPanelColumnNode.ColumnTypes.X_VELOCITY );
    const xMomentumColumnNode = createColumnNode( BallValuesPanelColumnNode.ColumnTypes.X_MOMENTUM );
    const massSlidersColumnNode = createColumnNode( BallValuesPanelColumnNode.ColumnTypes.MASS_SLIDERS );

    //----------------------------------------------------------------------------------------

    // Wrap the component-specific column groups into a HBox. Children will be added if the dimensions is 2D.
    const positionColumnGroup = new HBox( { children: [ xPositionColumnNode ], spacing: options.componentColumnsSpacing } );
    const velocityColumnGroup = new HBox( { children: [ xVelocityColumnNode ], spacing: options.componentColumnsSpacing } );
    const momentumColumnGroup = new HBox( { children: [ xMomentumColumnNode ], spacing: options.componentColumnsSpacing } );

    // For 2D screens, add the y-component Columns to their correlating group.
    if ( options.dimensions === 2 ) {
      const yPositionColumnNode = createColumnNode( BallValuesPanelColumnNode.ColumnTypes.Y_POSITION );
      const yVelocityColumnNode = createColumnNode( BallValuesPanelColumnNode.ColumnTypes.Y_VELOCITY );
      const yMomentumColumnNode = createColumnNode( BallValuesPanelColumnNode.ColumnTypes.Y_MOMENTUM );

      positionColumnGroup.addChild( yPositionColumnNode );
      velocityColumnGroup.addChild( yVelocityColumnNode );
      momentumColumnGroup.addChild( yMomentumColumnNode );
    }

    //----------------------------------------------------------------------------------------

    // Create a AlignGroup for the Title Labels to match the vertical height of each Text instance.
    const titleAlignGroup = new AlignGroup( { matchHorizontal: false, matchVertical: true } );

    // Create the Title Labels for the groups of columns. Wrapped in AlignBoxes to ensure they have the same height.
    const massTitleNode = titleAlignGroup.createBox( new Text( collisionLabStrings.massUnit, { font: options.titleFont, maxWidth: options.massTitleMaxWidth } ) );
    const momentumTitleNode = titleAlignGroup.createBox( new Text( collisionLabStrings.momentumUnit, { font: options.titleFont, maxWidth: options.componentGroupTitleMaxWidth } ) );
    const positionTitleNode = titleAlignGroup.createBox( new Text( collisionLabStrings.positionUnit, { font: options.titleFont, maxWidth: options.componentGroupTitleMaxWidth } ) );
    const velocityTitleNode = titleAlignGroup.createBox( new Text( collisionLabStrings.velocityUnit, { font: options.titleFont, maxWidth: options.componentGroupTitleMaxWidth } ) );

    // Horizontally group the column groups with their respective title Labels in a VBox.
    const massColumnGroupAndTitleBox = new VBox( { children: [ massTitleNode, massColumnNode ], spacing: options.columnGroupsTopMargin } );
    const positionColumnGroupAndTitleBox = new VBox( { children: [ positionTitleNode, positionColumnGroup ], spacing: options.columnGroupsTopMargin } );
    const velocityColumnGroupAndTitleBox = new VBox( { children: [ velocityTitleNode, velocityColumnGroup ], spacing: options.columnGroupsTopMargin } );
    const momentumColumnGroupAndTitleBox = new VBox( { children: [ momentumTitleNode, momentumColumnGroup ], spacing: options.columnGroupsTopMargin } );

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