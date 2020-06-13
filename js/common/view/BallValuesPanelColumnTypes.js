// Copyright 2018-2020, University of Colorado Boulder

/**
 * Enumeration of the possible 'types' of BallValuesPanelColumnNodes. This Enumeration is solely used in the view
 * hierarchy. See BallValuesPanelColumnNode.js and BallValuesPanelNumberDisplay.js for full context.
 *
 * @author Brandon Li
 */

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import collisionLab from '../../collisionLab.js';

const BallValuesPanelColumnTypes = Enumeration.byKeys( [
  'BALL_ICONS',
  'MASS',
  'MASS_SLIDERS',
  'X_POSITION',
  'Y_POSITION',
  'X_VELOCITY',
  'Y_VELOCITY',
  'X_MOMENTUM',
  'Y_MOMENTUM'
] );

collisionLab.register( 'BallValuesPanelColumnTypes', BallValuesPanelColumnTypes );
export default BallValuesPanelColumnTypes;