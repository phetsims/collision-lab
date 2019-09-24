// Copyright 2019, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Martin Veillette
 */
define( require => {
  'use strict';

  // modules
  const CollisionLabScreen = require( 'COLLISION_LAB/collision-lab/CollisionLabScreen' );
  const IntroScreen = require( 'COLLISION_LAB/intro/IntroScreen' );
  const Sim = require( 'JOIST/Sim' );
  const SimLauncher = require( 'JOIST/SimLauncher' );
  const Tandem = require( 'TANDEM/Tandem' );

  // strings
  const collisionLabTitleString = require( 'string!COLLISION_LAB/collision-lab.title' );

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

  // launch the sim - beware that scenery Image nodes created outside of SimLauncher.launch() will have zero bounds
  // until the images are fully loaded, see https://github.com/phetsims/coulombs-law/issues/70
  SimLauncher.launch( () => {
    const sim = new Sim( collisionLabTitleString, [
      new IntroScreen( Tandem.rootTandem.createTandem( 'introScreen' ) ),
      new CollisionLabScreen( Tandem.rootTandem.createTandem( 'collisionLabScreen' ) )
    ], simOptions );
    sim.start();
  } );
} );