// Copyright 2020, University of Colorado Boulder

/**
 * InelasticPlayArea is a PlayArea sub-type for the 'Inelastic' screen.
 *
 * @author Brandon Li
 */

import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import collisionLab from '../../collisionLab.js';
import PlayArea from '../../common/model/PlayArea.js';
import InelasticCollisionTypes from './InelasticCollisionTypes.js';

class InelasticPlayArea extends PlayArea {

  /**
   * @param {Object} [options]
   */
  constructor( options ) {

    super( options );

    //----------------------------------------------------------------------------------------

    // @public {EnumerationProperty.<InelasticCollisionTypes>} - the type of perfectly inelastic collision. Ignored
    //                                                           if the elasticity isn't 0.
    this.inelasticCollisionTypeProperty = new EnumerationProperty( InelasticCollisionTypes,
      InelasticCollisionTypes.SLIP );
  }

  /**
   * Convenience method to get the inelastic collision type.
   * @public
   *
   * @returns {InelasticCollisionTypes}
   */
  get inelasticCollisionType() { return this.inelasticCollisionTypeProperty.value; }

}

collisionLab.register( 'InelasticPlayArea', InelasticPlayArea );
export default InelasticPlayArea;