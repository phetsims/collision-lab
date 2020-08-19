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
import InelasticScreen from './inelastic/InelasticScreen.js';
import IntroScreen from './intro/IntroScreen.js';

const simOptions = {
  credits: {
    leadDesign: '',
    softwareDevelopment: 'Brandon Li, Martin Veillette',
    team: '',
    qualityAssurance: '',
    graphicArts: '',
    soundDesign: '',
    thanks: ''
  }
};

// Launch the 'Collision Lab' simulation.
simLauncher.launch( () => {
  const sim = new Sim( collisionLabStrings[ 'collision-lab' ].title, [
    new IntroScreen( Tandem.ROOT.createTandem( 'introScreen' ) ),
    new Explore1DScreen( Tandem.ROOT.createTandem( 'explore1DScreen' ) ),
    new Explore2DScreen( Tandem.ROOT.createTandem( 'explore2DScreen' ) ),
    new InelasticScreen( Tandem.ROOT.createTandem( 'inelasticScreen' ) )
  ], simOptions );

  sim.start();
} );