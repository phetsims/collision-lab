// Copyright 2019-2020, University of Colorado Boulder

/**
 * Top level model for the 'Intro' screen.
 *
 * @author Brandon Li
 */

import Tandem from '../../../../tandem/js/Tandem.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabModel from '../../common/model/CollisionLabModel.js'; // TODO: #13

class Explore2DModel extends CollisionLabModel {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    assert && assert( tandem instanceof Tandem, `invalid tandem: ${tandem}` );

    super( tandem );
  }
}

collisionLab.register( 'Explore2DModel', Explore2DModel );
export default Explore2DModel;