// Copyright 2020-2022, University of Colorado Boulder

/**
 * A single column in the BallValuesPanel: usually displays a column of NumberDisplays of a single type of Ball Values
 * for all the Balls in the system, but also displays some other components, like Ball icons or Mass sliders. See
 * BallValuesPanelColumnTypes for and exhaustive list of all types of columns.
 *
 * Each column has:
 *   - Content Nodes - these are the main content Nodes of the column (the NumberDisplays, ball icons, etc.).
 *   - Label Nodes - these are the Labels above some of the columns (eg. the 'x' above the x-position NumberDisplays).
 *     If the column doesn't have a label, the label will be an empty Node. These are all aligned to have the same
 *     heights vertically in a AlignGroup.
 *
 * BallValuesColumnNode takes advantage of the prepopulatedBalls in the BallSystem, which all Balls in the system must
 * be apart of. Instead of creating a Content Node each time a Ball is added to the system, it creates all the Content
 * Nodes for every Ball at the start of the sim and adjusts their visibilities based on which Balls are in the
 * system. There is no performance loss since Balls not in the BallSystem are not stepped or updated (meaning their
 * values cannot be changed). BallValuesColumnNodes are created at the start of the sim and are never disposed.
 *
 * @author Brandon Li
 */

import merge from '../../../../phet-core/js/merge.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import { AlignGroup, RichText, VBox } from '../../../../scenery/js/imports.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabStrings from '../../CollisionLabStrings.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import Ball from '../model/Ball.js';
import BallSystem from '../model/BallSystem.js';
import BallMassSlider from './BallMassSlider.js';
import BallValuesPanelColumnTypes from './BallValuesPanelColumnTypes.js';
import BallValuesPanelNumberDisplay from './BallValuesPanelNumberDisplay.js';
import CollisionLabIconFactory from './CollisionLabIconFactory.js';
import KeypadDialog from '../../../../scenery-phet/js/keypad/KeypadDialog.js';

// AlignGroups for the content and label Nodes of every BallValuesPanelColumnNode. Created to match the vertical height
// of each component in the BallValuesPanel across screens every screen.
const LABEL_ALIGN_GROUP = new AlignGroup( { matchHorizontal: false, matchVertical: true } );
const CONTENT_ALIGN_GROUP = new AlignGroup( { matchHorizontal: false, matchVertical: true } );

class BallValuesPanelColumnNode extends VBox {

  /**
   * @param {BallSystem} ballSystem - the system of Balls.
   * @param {BallValuesPanelColumnTypes} columnType
   * @param {KeypadDialog} keypadDialog - KeypadDialog instance for the screen.
   * @param {Object} [options]
   */
  constructor( ballSystem, columnType, keypadDialog, options ) {
    assert && assert( ballSystem instanceof BallSystem, `invalid ballSystem: ${ballSystem}` );
    assert && assert( BallValuesPanelColumnTypes.includes( columnType ), `invalid columnType: ${columnType}` );
    assert && assert( keypadDialog instanceof KeypadDialog, `invalid keypadDialog: ${keypadDialog}` );

    options = merge( {

      // {number} - y-spacing between each of the content Nodes.
      contentContainerSpacing: 3.5,

      // {number} - y-spacing between the label and first content Node.
      labelSpacing: 3

    }, options );

    // Set the spacing super-class option.
    assert && assert( !options.spacing, 'BallValuesPanelColumnNode sets spacing' );
    assert && assert( !options.children, 'BallValuesPanelColumnNode sets children' );
    options.spacing = options.labelSpacing;

    //----------------------------------------------------------------------------------------

    // Create the Label Node. See the comment at the top of this file for context.
    const labelNode = new RichText( BallValuesPanelColumnNode.getLabelString( columnType ), {
      font: CollisionLabConstants.DISPLAY_FONT,
      maxWidth: 25 // constrain width for i18n, determined empirically
    } );

    // Create the VBox container for the contentNodes of the column.
    const contentContainer = new VBox( { spacing: options.contentContainerSpacing } );

    // Loop through each possible Ball and create the corresponding contentNode. These Balls are NOT necessarily the
    // Balls currently within the BallSystem so we are responsible for updating visibility based on whether or not it is
    // the system.
    ballSystem.prepopulatedBalls.forEach( ball => {

      // Create the corresponding contentNode for each prepopulatedBall.
      const contentNode = BallValuesPanelColumnNode.createContentNode( ball, columnType, ballSystem, keypadDialog );

      // Add the content to the container.
      contentContainer.addChild( contentNode );

      // Observe when Balls are added or removed from the BallSystem, meaning the contentNode's visibility could change
      // if the ball is added or removed from the system. It should only be visible if the ball is in the BallSystem.
      ballSystem.balls.lengthProperty.link( () => {
        contentNode.visible = ballSystem.balls.includes( ball );
      } );
    } );

    // Set the children of this Node to the correct rendering order.
    options.children = [ LABEL_ALIGN_GROUP.createBox( labelNode ), contentContainer ];

    super( options );
  }

  /**
   * Creates the contentNode that corresponds with the passed-in Ball and BallValuesPanelColumnType.
   * @private
   *
   * @param {Ball} ball
   * @param {BallValuesPanelColumnTypes} columnType
   * @param {BallSystem} ballSystem - the system of Balls.
   * @param {KeypadDialog} keypadDialog - KeypadDialog instance for the screen.
   * @returns {Node}
   */
  static createContentNode( ball, columnType, ballSystem, keypadDialog ) {
    assert && assert( ball instanceof Ball, `invalid ball: ${ball}` );
    assert && assert( BallValuesPanelColumnTypes.includes( columnType ), `invalid columnType: ${columnType}` );
    assert && assert( ballSystem instanceof BallSystem, `invalid ballSystem: ${ballSystem}` );
    assert && assert( keypadDialog instanceof KeypadDialog, `invalid keypadDialog: ${keypadDialog}` );

    // Flag that references the contentNode.
    let contentNode;

    if ( columnType === BallValuesPanelColumnTypes.BALL_ICONS ) {
      contentNode = CollisionLabIconFactory.createBallIcon( ball );
    }
    else if ( columnType === BallValuesPanelColumnTypes.MASS_SLIDERS ) {
      contentNode = new BallMassSlider( ball, ballSystem );
    }
    else {
      contentNode = new BallValuesPanelNumberDisplay( ball, columnType, ballSystem, keypadDialog );
    }

    // Wrap the contentNode in a AlignBox to match the height of all ContentNodes.
    return CONTENT_ALIGN_GROUP.createBox( contentNode );
  }

  /**
   * Gets the string for the label that corresponds with the passed-in BallValuesPanelColumnType. The label is
   * positioned above the content of the column.
   * @private
   *
   * @param {BallValuesPanelColumnTypes} columnType
   * @returns {string} - label to display. May use inlined HTML.
   */
  static getLabelString( columnType ) {
    assert && assert( BallValuesPanelColumnTypes.includes( columnType ), `invalid columnType: ${columnType}` );

    // Convenience function that gets the label for a component BallValuesPanelColumnType.
    const getComponentLabel = ( label, component ) => StringUtils.fillIn( CollisionLabStrings.pattern.symbolSubSymbol, {
      symbol1: label,
      symbol2: component
    } );

    if ( columnType === BallValuesPanelColumnTypes.X_POSITION ) {
      return CollisionLabStrings.symbol.x;
    }
    else if ( columnType === BallValuesPanelColumnTypes.Y_POSITION ) {
      return CollisionLabStrings.symbol.y;
    }
    else if ( columnType === BallValuesPanelColumnTypes.X_VELOCITY ) {
      return getComponentLabel( CollisionLabStrings.symbol.velocity, CollisionLabStrings.symbol.x );
    }
    else if ( columnType === BallValuesPanelColumnTypes.Y_VELOCITY ) {
      return getComponentLabel( CollisionLabStrings.symbol.velocity, CollisionLabStrings.symbol.y );
    }
    else if ( columnType === BallValuesPanelColumnTypes.X_MOMENTUM ) {
      return getComponentLabel( CollisionLabStrings.symbol.momentum, CollisionLabStrings.symbol.x );
    }
    else if ( columnType === BallValuesPanelColumnTypes.Y_MOMENTUM ) {
      return getComponentLabel( CollisionLabStrings.symbol.momentum, CollisionLabStrings.symbol.y );
    }
    else {
      // At this point, the column doesn't have a specific label, so return the empty string.
      return '';
    }
  }
}

collisionLab.register( 'BallValuesPanelColumnNode', BallValuesPanelColumnNode );
export default BallValuesPanelColumnNode;