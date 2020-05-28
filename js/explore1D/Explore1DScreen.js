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
import Explore1DModel from './model/Explore1DModel.js';
import Explore1DScreenView from './view/Explore1DScreenView.js';

class Explore1DScreen extends Screen {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    assert && assert( tandem instanceof Tandem, `invalid tandem: ${tandem}` );

    const options = {
      name: collisionLabStrings.screen.explore1D,
      backgroundColorProperty: new Property( CollisionLabColors.SCREEN_BACKGROUND ),
      tandem: tandem
    };

    super(
      () => new Explore1DModel( tandem.createTandem( 'explore1DModel' ) ),
      model => new Explore1DScreenView( model, tandem.createTandem( 'explore2DScreenView' ) ),
      options
    );
  }
}

collisionLab.register( 'Explore1DScreen', Explore1DScreen );
export default Explore1DScreen;