// Copyright 2020, University of Colorado Boulder

/**
 * PlayAreaScaleBarNode is a specialized view to display a arrow scale-bar, which samples some portion of a
 * PlayArea's bounds and indicates its width/height. In the 'Collision Lab' simulation, its purpose is to allow the user
 * gauge the size of the PlayArea.
 *
 * It is drawn vertically for two dimensional PlayAreas and it is drawn horizontally for one dimensional PlayAreas.
 * It looks like this (but with solid arrow heads):
 *                        _
 *    0.5 m               ∧
 * |<—————>|   OR   0.5 m │
 *                        ∨
 *                        ̅
 * @author Brandon Li
 */

import merge from '../../../../phet-core/js/merge.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import HBox from '../../../../scenery/js/nodes/HBox.js';
import LayoutBox from '../../../../scenery/js/nodes/LayoutBox.js';
import Line from '../../../../scenery/js/nodes/Line.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Color from '../../../../scenery/js/util/Color.js';
import collisionLab from '../../collisionLab.js';
import collisionLabStrings from '../../collisionLabStrings.js';
import CollisionLabConstants from '../CollisionLabConstants.js';

class PlayAreaScaleBarNode extends LayoutBox {

  /**
   * @param {number} length - the width or height of the scale-bar, in model units (meters).
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options]
   */
  constructor( length, modelViewTransform, options ) {
    assert && assert( typeof length === 'number' && length > 0, `invalid length: ${length}` );
    assert && assert( modelViewTransform instanceof ModelViewTransform2, `invalid modelViewTransform: ${modelViewTransform}` );

    options = merge( {

      // {PaintDeft} - the color of the strokes and fills of all Paintables
      color: Color.BLACK,

      // {Orientation} - the orientation of the scale-bar. Either HORIZONTAL or VERTICAL.
      scaleBarOrientation: Orientation.HORIZONTAL,

      // {Object} - passed to the ArrowNode instance.
      arrowOptions: {
        headWidth: 7.5,
        headHeight: 7,
        tailWidth: 2.9,
        lineWidth: 0
      },

      // Side-bar
      sideBarLength: 8,    // {number} - the length of the bars on the side of the ArrowNode
      sideBarLineWidth: 1, // {number} - the line-width of the bars on the side of the ArrowNode

      // Label
      labelMargin: 0, // {number} - margin between the label and the arrow.
      labelFont: CollisionLabConstants.DISPLAY_FONT
    }, options );

    //----------------------------------------------------------------------------------------

    // Ensure only some options were provided.
    assert && assert( !options.orientation, 'PlayAreaScaleBarNode sets orientation' );
    assert && assert( !options.spacing, 'PlayAreaScaleBarNode sets spacing' );
    assert && assert( !options.children, 'PlayAreaScaleBarNode sets children' );
    assert && assert( !options.arrowOptions.fill, 'PlayAreaScaleBarNode sets arrowOptions.fill' );
    assert && assert( !options.arrowOptions.stroke, 'PlayAreaScaleBarNode sets arrowOptions.stroke' );
    assert && assert( !options.arrowOptions.doubleHead, 'PlayAreaScaleBarNode sets arrowOptions.doubleHead' );

    //----------------------------------------------------------------------------------------

    // Create the Label of the scale-bar.
    const labelNode = new Text( StringUtils.fillIn( collisionLabStrings.pattern.m, { value: length } ), {
      font: options.labelFont,
      maxWidth: modelViewTransform.modelToViewDeltaX( length ) * 0.75 // Constrain width for i18n (eye-balled).
    } );

    /*----------------------------------------------------------------------------*
     * First draw the arrow and the side-bars. Draw it horizontally and rotate if the orientation is VERTICAL.
     *----------------------------------------------------------------------------*/

    // Create the left side-bar.
    const leftSideBar = new Line( 0, 0, 0, options.sideBarLength, {
      lineWidth: options.sideBarLineWidth,
      stroke: options.color
    } );

    // Create the ArrowNode.
    const arrowNode = new ArrowNode( 0, 0,
      modelViewTransform.modelToViewDeltaX( length ) - 2 * options.sideBarLineWidth, 0, merge( {
        stroke: options.color,
        fill: options.color,
        doubleHead: true
      }, options.arrowOptions ) );

    // Create the right side-bar.
    const rightSideBar = new Line( 0, 0, 0, options.sideBarLength, {
      lineWidth: options.sideBarLineWidth,
      stroke: options.color
    } );

    // Wrap the arrow and side-bars in a HBox.
    const sideBarsAndArrowsContainer = new HBox( { children: [ leftSideBar, arrowNode, rightSideBar ] } );

    // Rotate the sideBarsAndArrowsContainer if the orientation is VERTICAL.
    if ( options.scaleBarOrientation === Orientation.VERTICAL ) { sideBarsAndArrowsContainer.rotate( Math.PI / 2 ); }

    //----------------------------------------------------------------------------------------

    // Set the children of the LayoutBox.
    options.children = [
      labelNode,
      sideBarsAndArrowsContainer
    ];

    // Set the spacing and orientation of the LayoutBox.
    options.spacing = options.labelMargin;
    options.orientation = options.scaleBarOrientation === Orientation.HORIZONTAL ? 'vertical' : 'horizontal';

    super( options );
  }
}

collisionLab.register( 'PlayAreaScaleBarNode', PlayAreaScaleBarNode );
export default PlayAreaScaleBarNode;