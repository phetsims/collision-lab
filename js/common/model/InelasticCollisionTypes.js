// Copyright 2019-2020, University of Colorado Boulder

/**
 * Enumeration of the possible 'types' of Inelastic Collisions.
 *
 * @author Brandon Li
 */

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import collisionLab from '../../collisionLab.js';

const InelasticCollisionTypes = Enumeration.byKeys( [


  'STICK',


  'SLIDE'


] );

collisionLab.register( 'InelasticCollisionTypes', InelasticCollisionTypes );
export default InelasticCollisionTypes;