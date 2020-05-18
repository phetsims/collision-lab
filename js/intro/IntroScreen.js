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
import IntroModel from './model/IntroModel.js';
import IntroScreenView from './view/IntroScreenView.js';

const screenIntroString = collisionLabStrings.screen.intro;

class IntroScreen extends Screen {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    assert && assert( tandem instanceof Tandem, `invalid tandem: ${tandem}` );

    const options = {
      name: screenIntroString,
      backgroundColorProperty: new Property( CollisionLabColors.SCREEN_BACKGROUND ),
      tandem: tandem
    };

    super(
      () => new IntroModel( tandem.createTandem( 'model' ) ),
      model => new IntroScreenView( model, tandem.createTandem( 'view' ) ),
      options
    );
  }
}

collisionLab.register( 'IntroScreen', IntroScreen );
export default IntroScreen;