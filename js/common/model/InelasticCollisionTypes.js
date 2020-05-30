// Copyright 2020, University of Colorado Boulder

/**
 * Enumeration of the possible 'types' of perfectly inelastic collisions.
 *
 * @author Brandon Li
 */

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import collisionLab from '../../collisionLab.js';

const InelasticCollisionTypes = Enumeration.byKeys( [

  // TODO: Document this
  'STICK',


  // TODO: Document this
  'SLIP'
] );

collisionLab.register( 'InelasticCollisionTypes', InelasticCollisionTypes );
export default InelasticCollisionTypes;