// Copyright 2019, University of Colorado Boulder

/**
 * @author Martin Veillette
 */
define( require => {
  'use strict';

  // modules
  // const ModelViewTransform2 = require( 'PHETCOMMON/ModelViewTransform2' );
  // const Vector2 = require( 'DOT/Vector2' );
  const collisionLab = require( 'COLLISION_LAB/collisionLab' );
  const CollisionLabConstants = require( 'COLLISION_LAB/common/CollisionLabConstants' );
  const NumberSpinner = require( 'SUN/NumberSpinner' );
  const Property = require( 'AXON/Property' );
  const Range = require( 'DOT/Range' );
  const ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  const ScreenView = require( 'JOIST/ScreenView' );

  class CollisionLabScreenView extends ScreenView {

    /**
     * @param {CollisionLabModel} model
     * @param {Tandem} tandem
     */
    constructor( model, tandem ) {

      super();

      // const modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping(
      //   Vector2.ZERO,
      //   this.layoutBounds.leftCenter,
      //   CollisionLabConstants.VIEW_TO_MODEL_SCALING );


      const numberOfBallsRange = new Range( 0, CollisionLabConstants.MAX_BALLS );
      const numberOfBallsSpinner = new NumberSpinner( model.numberOfBallsProperty, new Property( numberOfBallsRange ) );
      this.addChild( numberOfBallsSpinner );

      const resetAllButton = new ResetAllButton( {
        listener: () => {
          model.reset();
        },
        right: this.layoutBounds.maxX - 10,
        bottom: this.layoutBounds.maxY - 10,
        tandem: tandem.createTandem( 'resetAllButton' )
      } );
      this.addChild( resetAllButton );

    }

    // @public
    step( dt ) {
      //TODO Handle view animation here.
    }
  }

  return collisionLab.register( 'CollisionLabScreenView', CollisionLabScreenView );
} );