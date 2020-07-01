// Copyright 2020, University of Colorado Boulder

/**
 * InelasticPlayArea is a PlayArea sub-type for the 'Inelastic' screen.
 *
 * @author Brandon Li
 */

import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import merge from '../../../../phet-core/js/merge.js';
import collisionLab from '../../collisionLab.js';
import PlayArea from '../../common/model/PlayArea.js';
import InelasticCollisionTypes from './InelasticCollisionTypes.js';

class InelasticPlayArea extends PlayArea {

  /**
   * @param {Object} [options]
   */
  constructor( options ) {

    options = merge( {

      initialElasticityPercent: 0

    }, options );

    super( options );

    //----------------------------------------------------------------------------------------

    // @public {EnumerationProperty.<InelasticCollisionTypes>} - the type of perfectly inelastic collision. Ignored
    //                                                           if the elasticity isn't 0.
    this.inelasticCollisionTypeProperty = new EnumerationProperty( InelasticCollisionTypes,
      InelasticCollisionTypes.SLIP );


    // Verify that Paths are never visible for the 'Explore 1D' screen.
    assert && this.elasticityPercentProperty.link( elasticityPercent => assert( elasticityPercent === 0 ) );
  }

  /**
   * Convenience method to get the inelastic collision type.
   * @public
   *
   * @returns {InelasticCollisionTypes}
   */
  get inelasticCollisionType() { return this.inelasticCollisionTypeProperty.value; }

  /**
   * Resets the InelasticPlayArea.
   * @public
   *
   * Called when the reset-all button is pressed.
   */
  reset() {
    super.reset();
    this.inelasticCollisionTypeProperty.reset();
  }
}

collisionLab.register( 'InelasticPlayArea', InelasticPlayArea );
export default InelasticPlayArea;