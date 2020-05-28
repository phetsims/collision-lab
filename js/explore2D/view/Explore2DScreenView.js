// Copyright 2019-2020, University of Colorado Boulder

/**
 * Top level view for the 'Explore2D' screen.
 *
 * @author BrandonLi
 */

import Tandem from '../../../../tandem/js/Tandem.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabScreenView from '../../common/view/CollisionLabScreenView.js';

class Explore2DScreenView extends CollisionLabScreenView {

  /**
   * @param {Explore2DModel} model
   * @param {Tandem} tandem
   */
  constructor( model, tandem ) {

    assert && assert( tandem instanceof Tandem, `invalid tandem: ${tandem}` );

    super( model, tandem );
  }
}

collisionLab.register( 'Explore2DScreenView', Explore2DScreenView );
export default Explore2DScreenView;