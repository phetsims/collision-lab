// Copyright 2019, University of Colorado Boulder

/**
 * Scenery Node for the representation of two radio buttons controlling the speed of the simulation.
 * Two different modes: slow/normal motion.
 *
 * @author Martin Veillette
 */
define( require => {
  'use strict';

  // modules
  const collisionLab = require( 'COLLISION_LAB/collisionLab' );
  const CollisionLabConstants = require( 'COLLISION_LAB/common/CollisionLabConstants' );
  const merge = require( 'PHET_CORE/merge' );
  const NumberProperty = require( 'AXON/NumberProperty' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Text = require( 'SCENERY/nodes/Text' );
  const VerticalAquaRadioButtonGroup = require( 'SUN/VerticalAquaRadioButtonGroup' );

  // strings
  const normalString = require( 'string!COLLISION_LAB/normal' );
  const slowString = require( 'string!COLLISION_LAB/slow' );

  class SpeedRadioButtons extends VerticalAquaRadioButtonGroup {

    /**
     * @param {Property.<number>} speedProperty - The rate of flow of time.
     * @param {Object} [options]
     * @constructor
     */
    constructor( speedProperty, options ) {

      assert && assert( speedProperty instanceof NumberProperty, `invalid property: ${speedProperty}` );

      options = merge( {
        spacing: 1,
        touchAreaXDilation: 5,
        radioButtonOptions: { radius: 8 }
      }, options );

      // TODO: find out best practice to propagate options
      const textOptions = {
        font: new PhetFont( 18 ),
        maxWidth: 200
      };

      const normalText = new Text( normalString, textOptions );
      const slowText = new Text( slowString, textOptions );

      super( speedProperty, [
        { value: CollisionLabConstants.NORMAL_SPEED_SCALE, node: normalText },
        { value: CollisionLabConstants.SLOW_SPEED_SCALE, node: slowText }
      ], options );
    }
  }

  return collisionLab.register( 'SpeedRadioButtons', SpeedRadioButtons );
} );