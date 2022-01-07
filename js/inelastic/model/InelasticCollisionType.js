// Copyright 2020-2022, University of Colorado Boulder

/**
 * Enumeration of the possible 'types' of perfectly inelastic collisions. A perfectly inelastic happens when the
 * elasticity (and the coefficient of restitution) is 0. The documentation in this file is not exhaustive. Please also
 * see CollisionEngine.js and InelasticCollisionEngine.js for complete background.
 *
 * @author Brandon Li
 */

import EnumerationDeprecated from '../../../../phet-core/js/EnumerationDeprecated.js';
import collisionLab from '../../collisionLab.js';

const InelasticCollisionType = EnumerationDeprecated.byKeys( [

  // Perfectly inelastic collisions that 'slip' follow the standard collision-response algorithm, where the component of
  // velocity along the 'Plane of Contact' is exactly equal before and after the collision. This is described more in
  // http://web.mst.edu/~reflori/be150/Dyn%20Lecture%20Videos/Impact%20Particles%201/Impact%20Particles%201.pdf.
  //
  // This is the only type of perfectly inelastic collisions in the flash simulation. The collision-response algorithms
  // for these collisions are handled in CollisionEngine.js.
  'SLIP',

  // Perfectly inelastic collisions that 'stick' are a new feature of the HTML5 version of the simulation, where
  // Balls completely stick together and rotate around the center of mass of the cluster of Balls, if and only if the
  // collision isn't head-on.
  //
  // The issue of rotations were first discussed in https://github.com/phetsims/collision-lab/issues/3 and
  // later in https://github.com/phetsims/collision-lab/issues/87. The collision-response algorithms for this type of
  // collision is handled in InelasticCollisionEngine.js.
  'STICK'

] );

collisionLab.register( 'InelasticCollisionType', InelasticCollisionType );
export default InelasticCollisionType;