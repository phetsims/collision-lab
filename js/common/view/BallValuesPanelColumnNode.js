// Copyright 2020, University of Colorado Boulder

/**
 * An column in the BallValuesPanel: either displays a column of a single type of Ball Values for all Balls
 * or other visuals, like Ball icons or Mass sliders.
 *
 * Possible 'types' of Ball columns are:
 *   - Mass (kg)
 *   - x or y position of the Ball (m)
 *   - x or y velocity of the Ball (m/s)
 *   - x or y linear momentum of the Ball (kg m/s)
 *   - Ball Icons
 *   - Mass Sliders
 *
 * Each column has:
 *   - Content Nodes; these are the main content Nodes of the column (eg. the Mass Sliders)
 *   - Label Nodes; these are the Labels above some of the columns (eg. the 'x' above the x position NumberDisplays)
 *     These the column doesn't have a label, this will be an empty Node. These are all aligned vertically in a
 *     AlignGroup (provided externally).
 *
 * BallValuesColumnNodes are created at the start of the sim and are never disposed, so no dispose method is necessary.
 *
 * @author Brandon Li
 */

import ObservableArray from '../../../../axon/js/ObservableArray.js';
import Enumeration from '../../../../phet-core/js/Enumeration.js';
import merge from '../../../../phet-core/js/merge.js';
import AlignGroup from '../../../../scenery/js/nodes/AlignGroup.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import RichText from '../../../../scenery/js/nodes/RichText.js';
import VBox from '../../../../scenery/js/nodes/VBox.js';
import collisionLab from '../../collisionLab.js';
import collisionLabStrings from '../../collisionLabStrings.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import Ball from '../model/Ball.js';
import BallMassSlider from './BallMassSlider.js';
import BallValuesNumberDisplay from './BallValuesNumberDisplay.js';
import CollisionLabIconFactory from './CollisionLabIconFactory.js';
import KeypadPlane from './KeypadPlane.js';

// Possible BallValuesPanelColumnNode types. See the comment at the top of this file more context.
const ColumnTypes = Enumeration.byKeys( [
  'BALL_ICONS',
  'MASS',
  'MASS_SLIDERS',
  'X_POSITION',
  'Y_POSITION',
  'X_VELOCITY',
  'Y_VELOCITY',
  'X_MOMENTUM',
  'Y_MOMENTUM'
] );

class BallValuesPanelColumnNode extends Node {

  /**
   * @param {ObservableArray.<Ball>} balls - collections of particles inside the container
   * @param {ColumnTypes} columnType - the Ball Quantity to display
   * @param {AlignGroup} contentAlignGroup - align group for the content of the column
   * @param {AlignGroup} labelAlignGroup - align group for the label of the column, even if there is no apparent label.
   * @param {KeypadPlane} keypadPlane
   * @param {Object} [options]
   */
  constructor( balls, columnType, contentAlignGroup, labelAlignGroup, keypadPlane, options ) {
    assert && assert( balls instanceof ObservableArray && balls.count( ball => ball instanceof Ball ) === balls.length, `invalid balls: ${balls}` );
    assert && assert( ColumnTypes.includes( columnType ), `invalid columnType: ${columnType}` );
    assert && assert( contentAlignGroup instanceof AlignGroup, `invalid contentAlignGroup: ${contentAlignGroup}` );
    assert && assert( labelAlignGroup instanceof AlignGroup, `invalid labelAlignGroup: ${labelAlignGroup}` );
    assert && assert( keypadPlane instanceof KeypadPlane, `invalid keypadPlane: ${keypadPlane}` );
    assert && assert( !options || Object.getPrototypeOf( options ) === Object.prototype, `invalid options: ${options}` );

    options = merge( {

      contentSpacing: 10, // {number} - y-spacing between the content
      labelSpacing: 8     // {number} - y-spacing between the label and the first content Node

    }, options );

    super( options );

    //----------------------------------------------------------------------------------------

    // @private {ColumnTypes} (final)
    this.columnType = columnType;

    // First create the Label Node. Wrapped in a AlignBox to align with the AlignGroup.
    const labelNode = labelAlignGroup.createBox( new RichText( this.getLabelString(), {
      font: CollisionLabConstants.DISPLAY_FONT
    } ) );

    // @private {VBox} - create the VBox wrapper for the content of column.
    this.contentContainerNode = new VBox( {
      top: labelNode.bottom + options.labelSpacing,
      centerX: labelNode.centerX
    } );

    // @private {AlignGroup}
    this.contentAlignGroup = contentAlignGroup;

    // @private {KeypadPlane}
    this.keypadPlane = keypadPlane;

    // @private {ObservableArray.<Ball>}
    this.balls = balls;

    // Add both the label and the contentContainerNode as children of this Node.
    this.children = [ labelNode, this.contentContainerNode ];

    //----------------------------------------------------------------------------------------

    // Register the Balls that are already in the system.
    balls.forEach( this.registerBall.bind( this ) );

    // Observe when Balls are added to the system and register the added Ball. Link is never disposed as
    // BallValuesColumnNodes are never disposed.
    balls.addItemAddedListener( this.registerBall.bind( this ) );
  }

  /**
   * Registers a new Ball by adding the appropriate ball value NumberDisplay. This is generally invoked when Balls are
   * added to the system, meaning the column needs to update. Will also ensure that the NumberDisplay is disposed if
   * the Ball is removed from the play-area system.
   * @private
   *
   * @param {Ball} ball
   */
  registerAddedBall( ball ) {
    assert && assert( ball instanceof Ball, `invalid ball: ${ball}` );

    // The content Node to add to the column.
    let contentNode;

    if ( this.columnType === ColumnTypes.BALL_ICONS ) { contentNode = CollisionLabIconFactory.createBallIcon( ball ); }
    else if ( this.columnType === ColumnTypes.BALL_ICONS ) { contentNode = new BallMassSlider( ball ); }
    else { contentNode = new BallValuesNumberDisplay( ball, this.columnType, this.keypadPlane ); }

    const alignBox = this.contentAlignGroup.createBox( contentNode );
    this.contentContainerNode.addChild( alignBox );

    // Observe when the ball is removed to update the Display and dispose the contentNode.
    const removeBallListener = removedBall => {
      if ( ball === removedBall ) {
        contentNode.dispose();
        this.contentContainerNode.removeChild( alignBox );
        this.balls.removeItemRemovedListener( removeBallListener );
      }
    };
    this.balls.addItemRemovedListener( removeBallListener );
  }

  /**
   * Gets the label string representation of the column. The label is above the content of the column. For instance,
   * there is a 'x' label above the x-position NumberDisplays of the Ball.
   * @private
   *
   * @returns {string} - label to display. May use inlined HTML.
   */
  getLabelString() {
    const xString = collisionLabStrings.x;
    const yString = collisionLabStrings.x;

    if ( this.columnType === ColumnTypes.X_POSITION ) { return xString; }
    if ( this.columnType === ColumnTypes.Y_POSITION ) { return yString; }
    if ( this.columnType === ColumnTypes.X_VELOCITY ) { return `${collisionLabStrings.v}<sub>${xString}</sub>`; }
    if ( this.columnType === ColumnTypes.Y_VELOCITY ) { return `${collisionLabStrings.v}<sub>${yString}</sub>`; }
    if ( this.columnType === ColumnTypes.X_MOMENTUM ) { return `${collisionLabStrings.p}<sub>${xString}</sub>`; }
    if ( this.columnType === ColumnTypes.Y_MOMENTUM ) { return `${collisionLabStrings.p}<sub>${yString}</sub>`; }

    // At this point, the column doesn't have a specific label, so return the empty string.
    return '';
  }
}

// @public {ColumnTypes} - possible types of BallValuesPanelColumnNodes, which determines what is displayed.
BallValuesPanelColumnNode.ColumnTypes = ColumnTypes;

collisionLab.register( 'BallValuesPanelColumnNode', BallValuesPanelColumnNode );
export default BallValuesPanelColumnNode;