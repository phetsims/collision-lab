// Copyright 2019-2020, University of Colorado Boulder

/**
 * The 'Intro' screen. Conforms to the contract specified in joist/Screen.
 *
 * @author Brandon Li
 */

import Property from '../../../axon/js/Property.js';
import Screen from '../../../joist/js/Screen.js';
import Tandem from '../../../tandem/js/Tandem.js';
import collisionLab from '../collisionLab.js';
import collisionLabStrings from '../collisionLabStrings.js';
import CollisionLabColors from '../common/CollisionLabColors.js';
import InelasticModel from './model/InelasticModel.js';
import InelasticScreenView from './view/InelasticScreenView.js';

class InelasticScreen extends Screen {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    assert && assert( tandem instanceof Tandem, `invalid tandem: ${tandem}` );

    const options = {
      name: collisionLabStrings.screen.inelastic,
      backgroundColorProperty: new Property( CollisionLabColors.SCREEN_BACKGROUND ),
      tandem: tandem
    };

    super(
      () => new InelasticModel( tandem.createTandem( 'inelasticModel' ) ),
      model => new InelasticScreenView( model, tandem.createTandem( 'inslasticScreenView' ) ),
      options
    );
  }
}

collisionLab.register( 'InelasticScreen', InelasticScreen );
export default InelasticScreen;