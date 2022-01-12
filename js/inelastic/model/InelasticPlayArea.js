// Copyright 2020-2022, University of Colorado Boulder

/**
 * InelasticPlayArea is a PlayArea sub-type for the 'Inelastic' screen.
 *
 * @author Brandon Li
 */

import EnumerationDeprecatedProperty from '../../../../axon/js/EnumerationDeprecatedProperty.js';
import merge from '../../../../phet-core/js/merge.js';
import collisionLab from '../../collisionLab.js';
import PlayArea from '../../common/model/PlayArea.js';
import InelasticCollisionType from './InelasticCollisionType.js';

class InelasticPlayArea extends PlayArea {

  /**
   * @param {Object} [options]
   */
  constructor( options ) {

    options = merge( {

      initialElasticityPercent: 0

    }, options );

    super( PlayArea.Dimension.TWO, options );

    //----------------------------------------------------------------------------------------

    // @public {Property.<InelasticCollisionType>} - the type of perfectly inelastic collision. Ignored
    //                                                           if the elasticity isn't 0.
    this.inelasticCollisionTypeProperty = new EnumerationDeprecatedProperty( InelasticCollisionType,
      InelasticCollisionType.STICK );


    // Verify that Paths are never visible for the 'Explore 1D' screen.
    assert && this.elasticityPercentProperty.link( elasticityPercent => assert( elasticityPercent === 0 ) );
  }

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