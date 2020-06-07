// Copyright 2019-2020, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Martin Veillette
 */

import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import collisionLabStrings from './collisionLabStrings.js';
import Explore1DScreen from './explore1D/Explore1DScreen.js';
import Explore2DScreen from './explore2D/Explore2DScreen.js';
import IntroScreen from './intro/IntroScreen.js';

const collisionLabTitleString = collisionLabStrings[ 'collision-lab' ].title;

const simOptions = {
  credits: {
    //TODO fill in credits, all of these fields are optional, see joist.CreditsNode
    leadDesign: '',
    softwareDevelopment: '',
    team: '',
    qualityAssurance: '',
    graphicArts: '',
    soundDesign: '',
    thanks: ''
  }
};

// launch the sim - beware that scenery Image nodes created outside of simLauncher.launch() will have zero bounds
// until the images are fully loaded, see https://github.com/phetsims/coulombs-law/issues/70
simLauncher.launch( () => {
  const sim = new Sim( collisionLabTitleString, [
    new IntroScreen( Tandem.ROOT.createTandem( 'introScreen' ) ),
    new Explore1DScreen( Tandem.ROOT.createTandem( 'explore1DScreen' ) ),
    new Explore2DScreen( Tandem.ROOT.createTandem( 'explore2DScreen' ) )
  ], simOptions );
  sim.start();
} );