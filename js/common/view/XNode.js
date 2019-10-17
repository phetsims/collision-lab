// Copyright 2019, University of Colorado Boulder

/**
 * Node for a square "X" symbol.
 *
 * @author Alex Schor
 */

define( require => {
  'use strict';

  // modules
  const collisionLab = require( 'COLLISION_LAB/collisionLab' );
  const merge = require( 'PHET_CORE/merge' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Path = require( 'SCENERY/nodes/Path' );
  const Shape = require( 'KITE/Shape' );


  class XNode extends Node {

    /**
     * @param {Object} [options]
     */
    constructor( options ) {

      super();

      options = merge( {
        stroke: 'black',
        lineWidth: 2,
        size: 30, // the side length of the bounding square of the X
        thickness: 9 // thickness of the legs of the X
      }, options );

      /**
       * The calculations for the positions of the various points on the X are based on the following two dimensions:
       * (All angles are 45deg, X is rotationally symmetrical for 90deg increments. Drawing not to scale.)
       *
       *    / \  / \ __
       *    \  \/  /   |---internalVerticesOffset
       *     \    /____|
       *     /    \
       *    /  /\  \
       *    \ /  \ /
       *  |--|
       *    \_ externalVerticesOffset
       *
       * All of the external vertices (on the legs of the X) are externalVerticesOffset away from the corner of
       * the bounding box in both the X and Y directions.
       *
       * All of the internal vertices (where the legs of the X meet) are internalVerticesOffset away from the external
       * vertices in both the X and Y directions
       */


      const size = options.size;
      const externalVerticesOffset = options.thickness / Math.sqrt( 2 );
      const internalVerticesOffset = ( size - ( 2 * externalVerticesOffset ) ) / 2;


      /**
       *  ORDER IN WHICH VERTICES ARE DRAWN:
       *  (Going around counterclockwise)
       *
       *     1    11
       *  2 / \  / \ 10
       *    \  \/  /
       *   3 \ 12 / 9
       *     / 6  \
       *  4 /  /\  \ 8
       *    \ /  \ /
       *     5    7
       */

      // Drawing the 12 vertices of the X shape, starting in top left and moving counter-clockwise
      const xShape = new Shape()
        .moveTo( externalVerticesOffset, 0 )                                                       // 1
        .lineTo( 0, externalVerticesOffset )                                                       // 2
        .lineTo( internalVerticesOffset, externalVerticesOffset + internalVerticesOffset )         // 3
        .lineTo( 0, size - externalVerticesOffset )                                                // 4
        .lineTo( externalVerticesOffset, size )                                                    // 5
        .lineTo( internalVerticesOffset + externalVerticesOffset, size - internalVerticesOffset )  // 6
        .lineTo( size - externalVerticesOffset, size )                                             // 7
        .lineTo( size, size - externalVerticesOffset )                                             // 8
        .lineTo( size - internalVerticesOffset, externalVerticesOffset + internalVerticesOffset )  // 9
        .lineTo( size, externalVerticesOffset )                                                    // 10
        .lineTo( size - externalVerticesOffset, 0 )                                                // 11
        .lineTo( internalVerticesOffset + externalVerticesOffset, internalVerticesOffset )         // 12
        .close();

      const xPath = new Path( xShape, {
        lineWidth: options.lineWidth,
        stroke: options.stroke,
        fill: options.fill
      } );

      this.addChild( xPath );
    }
  }

  return collisionLab.register( 'XNode', XNode );
} );
