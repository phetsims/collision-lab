// Copyright 2019-2022, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Martin Veillette
 */

import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import CollisionLabStrings from './CollisionLabStrings.js';
import Explore1DScreen from './explore1D/Explore1DScreen.js';
import Explore2DScreen from './explore2D/Explore2DScreen.js';
import InelasticScreen from './inelastic/InelasticScreen.js';
import IntroScreen from './intro/IntroScreen.js';

const simOptions = {
  credits: {
    leadDesign: 'Michael Dubson, Amy Rouinfar',
    softwareDevelopment: 'Brandon Li, Martin Veillette, Jonathan Olson',
    team: 'Trish Loeblein, Ariel Paul, Kathy Perkins',
    qualityAssurance: 'Kathryn Woessner, Liam Mulhall, Devon Quispe, Brooklyn Lash, Logan Bray, Steele Dalton, Matthew Moore',
    graphicArts: '',
    soundDesign: '',
    thanks: ''
  }
};

// Launch the 'Collision Lab' simulation.
simLauncher.launch( () => {
  const sim = new Sim( CollisionLabStrings[ 'collision-lab' ].titleStringProperty, [
    new IntroScreen( Tandem.ROOT.createTandem( 'introScreen' ) ),
    new Explore1DScreen( Tandem.ROOT.createTandem( 'explore1DScreen' ) ),
    new Explore2DScreen( Tandem.ROOT.createTandem( 'explore2DScreen' ) ),
    new InelasticScreen( Tandem.ROOT.createTandem( 'inelasticScreen' ) )
  ], simOptions );

  sim.start();
} );
