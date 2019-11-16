// Copyright 2019, University of Colorado Boulder

/**
 *  numerical display for the total kinetic energy
 *
 * @author Martin Veillette
 */

define( require => {
  'use strict';

  // modules
  const collisionLab = require( 'COLLISION_LAB/collisionLab' );
  const CollisionLabColors = require( 'COLLISION_LAB/common/CollisionLabColors' );
  const merge = require( 'PHET_CORE/merge' );
  const CollisionLabConstants = require( 'COLLISION_LAB/common/CollisionLabConstants' );
  const Range = require( 'DOT/Range' );
  const NumberDisplay = require( 'SCENERY_PHET/NumberDisplay' );

  // constant
  const SUM_RANGE = new Range( 0, 10 ); // range for the kinetic energy values

  // strings
  const kineticEnergyJString = require( 'string!COLLISION_LAB/kineticEnergyJ' );

  class KineticEnergyDisplay extends NumberDisplay {

    /**
     * @param {Property.<number>} kineticEnergySumProperty
     * @param {Property.<boolean>} visibleProperty
     */
    constructor( kineticEnergySumProperty, visibleProperty ) {

      super( kineticEnergySumProperty,
        SUM_RANGE,
        merge( CollisionLabColors.KINETIC_ENERGY_DISPLAY_COLORS, {
          align: 'left',
          backgroundLineWidth: 0,
          valuePattern: kineticEnergyJString,
          maxWidth: 300, // determined empirically,
          font: CollisionLabConstants.CHECKBOX_FONT,
          decimalPlaces: 2
        } ) );

      // link visibility of this display to the visibleProperty
      // present for the lifetime of the simulation
      visibleProperty.linkAttribute( this, 'visible' );

    }
  }

  return collisionLab.register( 'KineticEnergyDisplay', KineticEnergyDisplay );
} );