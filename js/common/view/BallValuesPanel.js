// Copyright 2019-2022, University of Colorado Boulder

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
 * The Panel is built into columns using BallValuesPanelColumnNode. If the dimension of the PlayArea is 1D, the
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
import { AlignGroup, HBox, Node, Text, VBox } from '../../../../scenery/js/imports.js';
import Panel from '../../../../sun/js/Panel.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabStrings from '../../CollisionLabStrings.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import BallSystem from '../model/BallSystem.js';
import PlayArea from '../model/PlayArea.js';
import BallValuesPanelColumnNode from './BallValuesPanelColumnNode.js';
import BallValuesPanelColumnTypes from './BallValuesPanelColumnTypes.js';
import KeypadDialog from '../../../../scenery-phet/js/keypad/KeypadDialog.js';

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
   * @param {number} dimension - the dimension of the PlayArea.
   * @param {KeypadDialog} keypadDialog - KeypadDialog instance for the screen.
   * @param {Object} [options]
   */
  constructor( ballSystem, moreDataVisibleProperty, dimension, keypadDialog, options ) {
    assert && assert( ballSystem instanceof BallSystem, `invalid ballSystem: ${ballSystem}` );
    assert && AssertUtils.assertPropertyOf( moreDataVisibleProperty, 'boolean' );
    assert && assert( PlayArea.Dimension.includes( dimension ), `invalid dimension: ${dimension}` );
    assert && assert( keypadDialog instanceof KeypadDialog, `invalid keypadDialog: ${keypadDialog}` );

    options = merge( {}, CollisionLabConstants.PANEL_OPTIONS, {

      ballIconColumnSpacing: 12,   // {number} - x-spacing between the ball-icons and the first column.
      componentColumnsSpacing: 12, // {number} - x-spacing between the x and y components of NumberDisplay columns.
      columnGroupSpacing: 21,      // {number} - x-spacing between each group of columns.
      titleLabelSpacing: 0.5,      // {number} - y-margin between the column groups and the title-labels above them.

      massTitleMaxWidth: 67,            // {number} - maxWidth for the 'Mass (kg)' title label, for i18n.
      componentGroupTitleMaxWidth: 140, // {number} - maxWidth for the title labels of component groups, for i18n.

      // {Font} - applied to all of the title-label Text instances
      titleFont: CollisionLabConstants.PANEL_TITLE_FONT

    }, options );

    //----------------------------------------------------------------------------------------

    // Create each BallValuesPanelColumnNode for each BallValuesPanelColumnTypes that are common to both 1D and 2D.
    const ballIconsColumnNode = new BallValuesPanelColumnNode( ballSystem, BallValuesPanelColumnTypes.BALL_ICONS, keypadDialog );
    const xPositionColumnNode = new BallValuesPanelColumnNode( ballSystem, BallValuesPanelColumnTypes.X_POSITION, keypadDialog );
    const xVelocityColumnNode = new BallValuesPanelColumnNode( ballSystem, BallValuesPanelColumnTypes.X_VELOCITY, keypadDialog );
    const xMomentumColumnNode = new BallValuesPanelColumnNode( ballSystem, BallValuesPanelColumnTypes.X_MOMENTUM, keypadDialog );
    const massColumnNode = new BallValuesPanelColumnNode( ballSystem, BallValuesPanelColumnTypes.MASS, keypadDialog );
    const massSlidersColumnNode = new BallValuesPanelColumnNode( ballSystem, BallValuesPanelColumnTypes.MASS_SLIDERS, keypadDialog );

    // Wrap the component-specific column groups into a HBox. The y-component columns will be added for 2D.
    const positionColumnGroup = new HBox( { children: [ xPositionColumnNode ], spacing: options.componentColumnsSpacing } );
    const velocityColumnGroup = new HBox( { children: [ xVelocityColumnNode ], spacing: options.componentColumnsSpacing } );
    const momentumColumnGroup = new HBox( { children: [ xMomentumColumnNode ], spacing: options.componentColumnsSpacing } );

    // For 2D screens, add the y-component columns to their correlating group.
    if ( dimension === PlayArea.Dimension.TWO ) {
      const yPositionColumnNode = new BallValuesPanelColumnNode( ballSystem, BallValuesPanelColumnTypes.Y_POSITION, keypadDialog );
      const yVelocityColumnNode = new BallValuesPanelColumnNode( ballSystem, BallValuesPanelColumnTypes.Y_VELOCITY, keypadDialog );
      const yMomentumColumnNode = new BallValuesPanelColumnNode( ballSystem, BallValuesPanelColumnTypes.Y_MOMENTUM, keypadDialog );

      positionColumnGroup.addChild( yPositionColumnNode );
      velocityColumnGroup.addChild( yVelocityColumnNode );
      momentumColumnGroup.addChild( yMomentumColumnNode );
    }

    //----------------------------------------------------------------------------------------

    // Convenience function to create the title-label that appears above each column group.
    const createTitleLabel = ( label, units, maxWidth = options.componentGroupTitleMaxWidth ) => {
      const titleString = StringUtils.fillIn( CollisionLabStrings.pattern.labelParenthesesUnits, {
        label: label,
        units: units
      } );

      // Wrap the text in an AlignGroup to match height.
      return TITLE_ALIGN_GROUP.createBox( new Text( titleString, {
        font: options.titleFont,
        maxWidth: maxWidth
      } ) );
    };

    // Create the Title Labels for each section of the BallValuesPanel.
    const massTitleNode = createTitleLabel( CollisionLabStrings.mass, CollisionLabStrings.units.kilograms, options.massTitleMaxWidth );
    const momentumTitleNode = createTitleLabel( CollisionLabStrings.momentum, CollisionLabStrings.units.kilogramMetersPerSecond );
    const positionTitleNode = createTitleLabel( CollisionLabStrings.position, CollisionLabStrings.units.meters );
    const velocityTitleNode = createTitleLabel( CollisionLabStrings.velocity, CollisionLabStrings.units.metersPerSecond );

    //----------------------------------------------------------------------------------------

    // Convenience function to create each section of the Panel, which includes the column group and a title above it.
    const createSectionNode = ( titleNode, columnGroup, isComponentColumnGroup = true ) => {
      return new VBox( {
        children: [
          titleNode,

          // If the group is a grouping of component columns, wrap the column group in a align group to match width.
          isComponentColumnGroup ? COMPONENT_COLUMN_GROUP_ALIGN_GROUP.createBox( columnGroup ) : columnGroup
        ],
        spacing: options.titleLabelSpacing
      } );
    };

    // Horizontally group the column groups with their respective title-labels.
    const massSectionNode = createSectionNode( massTitleNode, massColumnNode, false );
    const positionSectionNode = createSectionNode( positionTitleNode, positionColumnGroup );
    const velocitySectionNode = createSectionNode( velocityTitleNode, velocityColumnGroup );
    const momentumSectionNode = createSectionNode( momentumTitleNode, momentumColumnGroup );

    //----------------------------------------------------------------------------------------

    // The content of the entire Panel when "More Data" is checked.
    const moreDataBox = new HBox( {
      children: [
        new Node( { children: [ massSectionNode ] } ),
        positionSectionNode,
        velocitySectionNode,
        momentumSectionNode
      ],
      spacing: options.columnGroupSpacing,
      align: 'bottom'
    } );

    // The content of the entire Panel when "More Data" is not checked.
    const lessDataBox = new HBox( {
      children: [
        new Node( { children: [ massSectionNode ] } ),
        massSlidersColumnNode
      ],
      spacing: options.columnGroupSpacing,
      align: 'bottom'
    } );

    // Observe when the moreDataVisibleProperty changes and update the visibility of the content of the Panel.
    // Link is not removed since BallValuesPanels are never disposed.
    moreDataVisibleProperty.link( moreDataVisible => {
      moreDataBox.visible = moreDataVisible;
      lessDataBox.visible = !moreDataVisible;
    } );

    super( new HBox( {
      spacing: options.ballIconColumnSpacing,
      children: [ ballIconsColumnNode, moreDataBox, lessDataBox ],
      align: 'bottom'
    } ), options );
  }
}

collisionLab.register( 'BallValuesPanel', BallValuesPanel );
export default BallValuesPanel;