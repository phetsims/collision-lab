// Copyright 2020, University of Colorado Boulder

/**
 * IntroPlayArea is a PlayArea sub-type for the 'Intro' screen.
 *
 * Although it adds no additional functionality to the super-class, it is added for symmetry within the screen-specific
 * sub-types of  PlayArea. It is responsible for providing a correct configuration of the super-class for the 'Intro'
 * screen, which includes specifying the dimensions, initial Property values, and disabling Properties.
 *
 * @author Brandon Li
 */

import merge from '../../../../phet-core/js/merge.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabConstants from '../../common/CollisionLabConstants.js';
import PlayArea from '../../common/model/PlayArea.js';

class IntroPlayArea extends PlayArea {

  /**
   * @param {Object} [options]
   */
  constructor( options ) {

    options = merge( {

      dimensions: 1,
      isGridVisibleInitially: true,
      reflectsBorderInitially: false,
      bounds: PlayArea.DEFAULT_BOUNDS.erodedY( CollisionLabConstants.PLAY_AREA_1D_ERODED_Y )

    }, options );

    super( options );

    //----------------------------------------------------------------------------------------

    // Ensure that Grids are always visible for the 'Intro' screen.
    assert && this.gridVisibleProperty.link( gridVisible => {
      assert( gridVisible === true, 'Grids must be visible in the Intro screen.' );
    } );
  }
}

collisionLab.register( 'IntroPlayArea', IntroPlayArea );
export default IntroPlayArea;