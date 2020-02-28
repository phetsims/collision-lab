// Copyright 2019-2020, University of Colorado Boulder

/**
 * Node for a square "X" symbol.
 *
 * @author Alex Schor
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import merge from '../../../../phet-core/js/merge.js';
import PlusNode from '../../../../scenery-phet/js/PlusNode.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabColors from '../CollisionLabColors.js';

class XNode extends PlusNode {

  /**
   * @param {Object} [options]
   */
  constructor( options ) {

    options = merge( {
      lineWidth: 2, // lineWidth of stroke
      sideLength: 30, // the side length of the bounding square of the X
      legThickness: 9 // thickness of the legs of the X
    }, CollisionLabColors.X_MARKER_COLORS, options );

    // width of the plus sign
    const plusSideLength = ( options.sideLength - options.legThickness ) * Math.sqrt( 2 );

    // options for plusNode
    const plusNodeOptions = merge( options, {

      // width of the plus sign, height of the horizontal line in plus sign
      size: new Dimension2( plusSideLength, options.legThickness ),

      // rotate plusNode by 45 degrees
      rotation: Math.PI / 4
    } );

    super( plusNodeOptions );

  }
}

collisionLab.register( 'XNode', XNode );
export default XNode;