// Copyright 2019, University of Colorado Boulder

/**
 * The 'Intro' screen. Conforms to the contract specified in joist/Screen.
 *
 * @author Brandon Li
 */

define( require => {
  'use strict';

  // modules
  const collisionLab = require( 'COLLISION_LAB/collisionLab' );
  const CollisionLabColors = require( 'COLLISION_LAB/common/CollisionLabColors' );
  const IntroModel = require( 'COLLISION_LAB/intro/model/IntroModel' );
  const IntroScreenView = require( 'COLLISION_LAB/intro/view/IntroScreenView' );
  const Property = require( 'AXON/Property' );
  const Screen = require( 'JOIST/Screen' );
  const Tandem = require( 'TANDEM/Tandem' );

  // strings
  const screenIntroString = require( 'string!COLLISION_LAB/screen.intro' );

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

  return collisionLab.register( 'IntroScreen', IntroScreen );
} );