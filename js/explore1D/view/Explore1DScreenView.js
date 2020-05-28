// Copyright 2019-2020, University of Colorado Boulder

/**
 * Top level view for the 'Intro' screen.
 *
 * @author BrandonLi
 */

import Tandem from '../../../../tandem/js/Tandem.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabScreenView from '../../common/view/CollisionLabScreenView.js';

class Explore1DScreenView extends CollisionLabScreenView {

  /**
   * @param {IntroModel} model
   * @param {Tandem} tandem
   */
  constructor( model, tandem ) {

    assert && assert( tandem instanceof Tandem, `invalid tandem: ${tandem}` );

    super( model, tandem );
  }
}

collisionLab.register( 'Explore1DScreenView', Explore1DScreenView );
export default Explore1DScreenView;