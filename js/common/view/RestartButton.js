// Copyright 2020-2025, University of Colorado Boulder

/**
 * A rectangular Restart button.
 *
 * @author Brandon Li
 * @author Martin Veillette
 */

import merge from '../../../../phet-core/js/merge.js';
import RestartUndoButton from '../../../../scenery-phet/js/buttons/RestartUndoButton.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabColors from '../CollisionLabColors.js';

class RestartButton extends RestartUndoButton {

  /**
   * @param {Object} [options]
   * @constructor
   */
  constructor( options ) {

    options = merge( {

      // super-class
      baseColor: CollisionLabColors.RESTART_BUTTON,
      lineWidth: 0
    }, options );

    super( options );
  }
}

collisionLab.register( 'RestartButton', RestartButton );
export default RestartButton;