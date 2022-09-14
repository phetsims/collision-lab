// Copyright 2019-2022, University of Colorado Boulder

/**
 * The 'Intro' screen. Conforms to the contract specified in joist/Screen.
 *
 * @author Brandon Li
 */

import Property from '../../../axon/js/Property.js';
import Screen from '../../../joist/js/Screen.js';
import Tandem from '../../../tandem/js/Tandem.js';
import collisionLab from '../collisionLab.js';
import CollisionLabStrings from '../CollisionLabStrings.js';
import CollisionLabColors from '../common/CollisionLabColors.js';
import CollisionLabIconFactory from '../common/view/CollisionLabIconFactory.js';
import InelasticModel from './model/InelasticModel.js';
import InelasticScreenView from './view/InelasticScreenView.js';

class InelasticScreen extends Screen {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {
    assert && assert( tandem instanceof Tandem, `invalid tandem: ${tandem}` );

    const createModel = () => new InelasticModel( tandem.createTandem( 'model' ) );
    const createView = model => new InelasticScreenView( model, tandem.createTandem( 'view' ) );

    super( createModel, createView, {
      name: CollisionLabStrings.screen.inelasticStringProperty,
      backgroundColorProperty: new Property( CollisionLabColors.SCREEN_BACKGROUND ),
      homeScreenIcon: CollisionLabIconFactory.createInelasticScreenIcon(),
      tandem: tandem
    } );
  }
}

collisionLab.register( 'InelasticScreen', InelasticScreen );
export default InelasticScreen;