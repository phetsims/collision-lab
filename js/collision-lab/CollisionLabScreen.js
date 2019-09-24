// Copyright 2019, University of Colorado Boulder

/**
 * @author Martin Veillette
 */
define( require => {
  'use strict';

  // modules
  const collisionLab = require( 'COLLISION_LAB/collisionLab' );
  const CollisionLabModel = require( 'COLLISION_LAB/collision-lab/model/CollisionLabModel' );
  const CollisionLabScreenView = require( 'COLLISION_LAB/collision-lab/view/CollisionLabScreenView' );
  const Property = require( 'AXON/Property' );
  const Screen = require( 'JOIST/Screen' );

  class CollisionLabScreen extends Screen {

    /**
     * @param {Tandem} tandem
     */
    constructor( tandem ) {

      const options = {
        backgroundColorProperty: new Property( 'white' ),
        tandem: tandem
      };

      super(
        () => new CollisionLabModel( tandem.createTandem( 'model' ) ),
        model => new CollisionLabScreenView( model, tandem.createTandem( 'view' ) ),
        options
      );
    }
  }

  return collisionLab.register( 'CollisionLabScreen', CollisionLabScreen );
} );