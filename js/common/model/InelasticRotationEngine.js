// Copyright 2019-2020, University of Colorado Boulder

/**
 * InelasticRotationEngine.
 *
 * @author Brandon Li
 */


import collisionLab from '../../collisionLab.js';

class InelasticRotationEngine {


  constructor() {

    this.stickyBallCluster = null;
  }

  registerStickyCollision( ball1, ball2 ) {

  }

  step() {

  }

  handleClusterToBorderCollisions() {

  }

  handleClusterToClusterCollisions() {
    assert( false )
  }
}

collisionLab.register( 'InelasticRotationEngine', InelasticRotationEngine );
export default InelasticRotationEngine;