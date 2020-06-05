// Copyright 2020, University of Colorado Boulder

/**
 * Enumeration of the possible 'types' of perfectly inelastic collisions.
 *
 * @author Brandon Li
 */

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import collisionLab from '../../collisionLab.js';

const InelasticCollisionTypes = Enumeration.byKeys( [

  // This is the behavior of the flash simulation, where the component of velocity along the 'Plane of Contact'
  // is equal before and after the collision. This is described in
  // http://web.mst.edu/~reflori/be150/Dyn%20Lecture%20Videos/Impact%20Particles%201/Impact%20Particles%201.pdf.
  'SLIP',

  // This is a new feature of the HTML5 version of the simulation, where Balls stick together and rotate around
  // the center of mass in a perfectly inelastic collision that isn't head-on. See
  // https://github.com/phetsims/collision-lab/issues/3.
  'STICK'

] );

collisionLab.register( 'InelasticCollisionTypes', InelasticCollisionTypes );
export default InelasticCollisionTypes;