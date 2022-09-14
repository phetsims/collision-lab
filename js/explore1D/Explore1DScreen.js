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
import Explore1DModel from './model/Explore1DModel.js';
import Explore1DScreenView from './view/Explore1DScreenView.js';

class Explore1DScreen extends Screen {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {
    assert && assert( tandem instanceof Tandem, `invalid tandem: ${tandem}` );

    const createModel = () => new Explore1DModel( tandem.createTandem( 'model' ) );
    const createView = model => new Explore1DScreenView( model, tandem.createTandem( 'view' ) );

    super( createModel, createView, {
      name: CollisionLabStrings.screen.explore1DStringProperty,
      backgroundColorProperty: new Property( CollisionLabColors.SCREEN_BACKGROUND ),
      homeScreenIcon: CollisionLabIconFactory.createExplore1DScreenIcon(),
      tandem: tandem
    } );
  }
}

collisionLab.register( 'Explore1DScreen', Explore1DScreen );
export default Explore1DScreen;