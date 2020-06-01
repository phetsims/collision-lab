// Copyright 2019-2020, University of Colorado Boulder

/**
 * Top level view for the 'Intro' screen.
 *
 * @author BrandonLi
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabConstants from '../../common/CollisionLabConstants.js';
import CollisionLabScreenView from '../../common/view/CollisionLabScreenView.js';

class Explore1DScreenView extends CollisionLabScreenView {

  /**
   * @param {IntroModel} model
   * @param {Tandem} tandem
   */
  constructor( model, tandem ) {

    assert && assert( tandem instanceof Tandem, `invalid tandem: ${tandem}` );

    super( model, tandem, {
      playAreaLeftTop: new Vector2( CollisionLabConstants.SCREEN_VIEW_X_MARGIN, CollisionLabConstants.PLAY_AREA_VIEW_TOP_1D )

    } );
  }
}

collisionLab.register( 'Explore1DScreenView', Explore1DScreenView );
export default Explore1DScreenView;