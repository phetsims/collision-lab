// Copyright 2019-2020, University of Colorado Boulder

/**
 * BallValuesPanel is the Panel at the bottom of all screens which displays and allows the user to modify the values
 * of all Balls that are currently in the system.
 *
 * For each Ball in the BallSystem, it displays it's values, which are:
 *    - Masses (kg).
 *    - The x and y component of the Ball's position (m).
 *    - The x and y component of the Ball's velocity (m/s).
 *    - The x and y component of the Ball's linear momentum (kg m/s).
 *
 * If the "More Data" checkbox is not checked, the Panel only displays:
 *   - Masses of the Balls (kg).
 *   - Sliders to change the masses.
 *
 * The Panel is built into columns using BallValuesPanelColumnNode. If the dimensions of the PlayArea is 1D, the
 * y-component of the vectored BallValues described above are not included. Otherwise, each column of components are
 * grouped together and a title-label is placed above the group (like "Position (m)").
 *
 * This panel exists for the entire sim and is never disposed.
 *
 * @author Brandon Li
 */

import merge from '../../../../phet-core/js/merge.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import AlignGroup from '../../../../scenery/js/nodes/AlignGroup.js';
import HBox from '../../../../scenery/js/nodes/HBox.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import VBox from '../../../../scenery/js/nodes/VBox.js';
import Panel from '../../../../sun/js/Panel.js';
import collisionLab from '../../collisionLab.js';
import collisionLabStrings from '../../collisionLabStrings.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import BallSystem from '../model/BallSystem.js';
import BallValuesPanelColumnNode from './BallValuesPanelColumnNode.js';
import BallValuesPanelColumnTypes from './BallValuesPanelColumnTypes.js';
import KeypadDialog from './KeypadDialog.js';

// AlignGroup for each group of x (and y) component columns that display the components of vector values of Balls. This
// is to match the width of column groups across screens, regardless of whether or not the y-component column is
// included. See https://github.com/phetsims/collision-lab/issues/83#issuecomment-639105292.
const COMPONENT_COLUMN_GROUP_ALIGN_GROUP = new AlignGroup( { matchHorizontal: true, matchVertical: false } );

// AlignGroup for the title-labels that are placed above each group (like "Position (m)"). This is made to match the
// vertical height of each title-label across screens, regardless of their scaling.
const TITLE_ALIGN_GROUP = new AlignGroup( { matchHorizontal: false, matchVertical: true } );


class BallValuesPanel extends Panel {

  /**
   * @param {BallSystem} ballSystem - the system of Balls.
   * @param {Property.<boolean>} moreDataVisibleProperty - indicates if the "More Data" checkbox is checked.
   * @param {KeypadDialog} keypadDialog
   * @param {number} dimensions - the dimensions of the PlayArea.
   * @param {Object} [options]
   */
  constructor( ballSystem, moreDataVisibleProperty, keypadDialog, dimensions, options ) {
    assert && assert( ballSystem instanceof BallSystem, `invalid ballSystem: ${ballSystem}` );
    assert && AssertUtils.assertPropertyOf( moreDataVisibleProperty, 'boolean' );
    assert && assert( keypadDialog instanceof KeypadDialog, `invalid keypadDialog: ${keypadDialog}` );
    assert && assert( dimensions === 1 || dimensions === 2, `invalid dimensions: ${ dimensions }` );

    options = merge( {}, CollisionLabConstants.PANEL_OPTIONS, {

      ballIconColumnSpacing: 12,    // {number} - x-spacing between the ball-icons and the first column.
      componentColumnsSpacing: 12,  // {number} - x-spacing between the x and y components of NumberDisplay columns.
      columnGroupSpacing: 21,       // {number} - x-spacing between the major groupings of NumberDisplay columns.
      columnGroupsTopMargin: 0.5,   // {number} - y-margin between the column groups and the title-labels above them

      massTitleMaxWidth: 67,            // {number} - maxWidth for the 'Mass (kg)' title label for i18n.
      componentGroupTitleMaxWidth: 140, // {number} maxWidth for the other title labels (for component groups) for i18n.

      // {Font} - applied to all of the title label Text instances
      titleFont: CollisionLabConstants.PANEL_TITLE_FONT

    }, options );

    //----------------------------------------------------------------------------------------

    // Create each BallValuesPanelColumnNode for each BallValuesPanelColumnTypes that are common to both 1D and 2D.
    const ballIconsColumnNode = new BallValuesPanelColumnNode( ballSystem, BallValuesPanelColumnTypes.BALL_ICONS, keypadDialog );
    const massColumnNode = new BallValuesPanelColumnNode( ballSystem, BallValuesPanelColumnTypes.MASS, keypadDialog );
    const xPositionColumnNode = new BallValuesPanelColumnNode( ballSystem, BallValuesPanelColumnTypes.X_POSITION, keypadDialog );
    const xVelocityColumnNode = new BallValuesPanelColumnNode( ballSystem, BallValuesPanelColumnTypes.X_VELOCITY, keypadDialog );
    const xMomentumColumnNode = new BallValuesPanelColumnNode( ballSystem, BallValuesPanelColumnTypes.X_MOMENTUM, keypadDialog );
    const massSlidersColumnNode = new BallValuesPanelColumnNode( ballSystem, BallValuesPanelColumnTypes.MASS_SLIDERS, keypadDialog );

    //----------------------------------------------------------------------------------------

    // Wrap the component-specific column groups into a HBox. The y-component columns will be added for 2D.
    const positionColumnGroup = new HBox( { children: [ xPositionColumnNode ], spacing: options.componentColumnsSpacing } );
    const velocityColumnGroup = new HBox( { children: [ xVelocityColumnNode ], spacing: options.componentColumnsSpacing } );
    const momentumColumnGroup = new HBox( { children: [ xMomentumColumnNode ], spacing: options.componentColumnsSpacing } );

    // For 2D screens, add the y-component columns to their correlating group.
    if ( dimensions === 2 ) {
      const yPositionColumnNode = new BallValuesPanelColumnNode( ballSystem, BallValuesPanelColumnTypes.Y_POSITION, keypadDialog );
      const yVelocityColumnNode = new BallValuesPanelColumnNode( ballSystem, BallValuesPanelColumnTypes.Y_VELOCITY, keypadDialog );
      const yMomentumColumnNode = new BallValuesPanelColumnNode( ballSystem, BallValuesPanelColumnTypes.Y_MOMENTUM, keypadDialog );

      positionColumnGroup.addChild( yPositionColumnNode );
      velocityColumnGroup.addChild( yVelocityColumnNode );
      momentumColumnGroup.addChild( yMomentumColumnNode );
    }

    //----------------------------------------------------------------------------------------

    // Convenience function to create the title Nodes above each of the groupings of columns.
    const createTitleNode = ( label, units, maxWidth = options.componentGroupTitleMaxWidth ) => {
      const titleString = StringUtils.fillIn( collisionLabStrings.pattern.labelParenthesesUnits, {
        label: label,
        units: units
      } );

      // Wrap the text in a align group to match height.
      return TITLE_ALIGN_GROUP.createBox( new Text( titleString, {
        font: options.titleFont,
        maxWidth: maxWidth
      } ) );
    };

    // Create the Title Labels for the groups of columns. Wrapped in AlignBoxes to ensure they have the same height.
    const massTitleNode = createTitleNode( collisionLabStrings.mass, collisionLabStrings.units.kilogram, options.massTitleMaxWidth );
    const momentumTitleNode = createTitleNode( collisionLabStrings.momentum, collisionLabStrings.units.kilogramMetersPerSecond );
    const positionTitleNode = createTitleNode( collisionLabStrings.position, collisionLabStrings.units.meters );
    const velocityTitleNode = createTitleNode( collisionLabStrings.velocity, collisionLabStrings.units.metersPerSecond );

    //----------------------------------------------------------------------------------------

    // Convenience function to create each section of the Panel, which includes the column group and a title above it.
    const createSectionNode = ( titleNode, columnGroup ) => {
      return new VBox( {

        // Wrap the column group in a align group to match width.
        children: [ titleNode, COMPONENT_COLUMN_GROUP_ALIGN_GROUP.createBox( columnGroup ) ],
        spacing: options.columnGroupsTopMargin
      } );
    };

    // Horizontally group the column groups with their respective title Labels in a VBox.
    const massColumnAndTitleBox = new VBox( { children: [ massTitleNode, massColumnNode ], spacing: options.columnGroupsTopMargin } );
    const positionColumnGroupAndTitleBox = createSectionNode( positionTitleNode, positionColumnGroup );
    const velocityColumnGroupAndTitleBox = createSectionNode( velocityTitleNode, velocityColumnGroup );
    const momentumColumnGroupAndTitleBox = createSectionNode( momentumTitleNode, momentumColumnGroup );

    //----------------------------------------------------------------------------------------

    // The content of the entire Panel when "More Data" is checked.
    const moreDataBox = new HBox( {
      children: [
        massColumnAndTitleBox,
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
        massColumnAndTitleBox,
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