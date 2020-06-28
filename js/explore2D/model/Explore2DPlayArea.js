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

class Explore2DPlayArea extends PlayArea {

  /**
   * @param {Object} [options]
   */
  constructor( options ) {

    super( options );

    //----------------------------------------------------------------------------------------

    // @public (read-only) {Range} - the constrained range of the elasticity.
    this.elasticityPercentRange = new Range( 5, CollisionLabConstants.ELASTICITY_PERCENT_RANGE.max );

    this.elasticityPercentProperty.range = this.elasticityPercentRange;
  }
}

collisionLab.register( 'Explore2DPlayArea', Explore2DPlayArea );
export default Explore2DPlayArea;