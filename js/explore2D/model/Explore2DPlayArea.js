// Copyright 2020, University of Colorado Boulder

/**
 * Explore2DPlayArea is a PlayArea sub-type for the 'Explore 2D' screen.
 *
 * @author Brandon Li
 */

import Range from '../../../../dot/js/Range.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabConstants from '../../common/CollisionLabConstants.js';
import PlayArea from '../../common/model/PlayArea.js';

// constants
const ELASTICITY_PERCENT_RANGE = CollisionLabConstants.ELASTICITY_PERCENT_RANGE;
const ELASTICITY_PERCENT_INTERVAL = CollisionLabConstants.ELASTICITY_PERCENT_INTERVAL;

class Explore2DPlayArea extends PlayArea {

  /**
   * @param {Object} [options]
   */
  constructor( options ) {

    super( PlayArea.Dimension.TWO, options );

    //----------------------------------------------------------------------------------------

    assert && this.elasticityPercentProperty.link( elasticityPercent => {
      assert( elasticityPercent !== 0, 'No perfectly inelastic collisions for Explore 2D' );
    } );

    // @public
    this.enabledElasticityRange = new Range( ELASTICITY_PERCENT_INTERVAL, ELASTICITY_PERCENT_RANGE.max );

    this.elasticityPercentProperty.range = this.enabledElasticityRange;
  }
}

collisionLab.register( 'Explore2DPlayArea', Explore2DPlayArea );
export default Explore2DPlayArea;