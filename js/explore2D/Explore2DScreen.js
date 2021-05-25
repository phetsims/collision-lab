// Copyright 2019-2021, University of Colorado Boulder

/**
 * The 'Explore 2D' screen. Conforms to the contract specified in joist/Screen.
 *
 * @author Brandon Li
 */

import Property from '../../../axon/js/Property.js';
import Screen from '../../../joist/js/Screen.js';
import Tandem from '../../../tandem/js/Tandem.js';
import collisionLab from '../collisionLab.js';
import collisionLabStrings from '../collisionLabStrings.js';
import CollisionLabColors from '../common/CollisionLabColors.js';
import CollisionLabIconFactory from '../common/view/CollisionLabIconFactory.js';
import Explore2DModel from './model/Explore2DModel.js';
import Explore2DScreenView from './view/Explore2DScreenView.js';

class Explore2DScreen extends Screen {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {
    assert && assert( tandem instanceof Tandem, `invalid tandem: ${tandem}` );

    const createModel = () => new Explore2DModel( tandem.createTandem( 'model' ) );
    const createView = model => new Explore2DScreenView( model, tandem.createTandem( 'view' ) );

    super( createModel, createView, {
      name: collisionLabStrings.screen.explore2D,
      backgroundColorProperty: new Property( CollisionLabColors.SCREEN_BACKGROUND ),
      homeScreenIcon: CollisionLabIconFactory.createExplore2DScreenIcon(),
      tandem: tandem
    } );
  }
}

collisionLab.register( 'Explore2DScreen', Explore2DScreen );
export default Explore2DScreen;