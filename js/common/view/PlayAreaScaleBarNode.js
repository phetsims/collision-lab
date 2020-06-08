// Copyright 2020, University of Colorado Boulder

/**
 *
 * @author Brandon Li
 */

import merge from '../../../../phet-core/js/merge.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import collisionLab from '../../collisionLab.js';

class PlayAreaScaleBarNode extends Node {

  /**
   * @param {number} length - the width or height of the scale-bar, in model units (meters).
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options]
   */
  constructor( length, modelViewTransform, options ) {
    assert && assert( typeof length === 'number' && length > 0, `invalid length: ${length}` );
    assert && assert( modelViewTransform instanceof ModelViewTransform2, `invalid modelViewTransform: ${modelViewTransform}` );
    assert && assert( !options || Object.getPrototypeOf( options === Object.prototype ), `invalid options: ${options}` );

    options = merge( {
      orientation: Orientation.HORIZONTAL
    } );

    super( options );
  }
}

collisionLab.register( 'PlayAreaScaleBarNode', PlayAreaScaleBarNode );
export default PlayAreaScaleBarNode;