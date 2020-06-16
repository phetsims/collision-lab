// Copyright 2020, University of Colorado Boulder

/**
 * Enumeration of the possible 'types' of columns in the BallValuesPanel at the bottom of all screens. This Enumeration
 * is solely used within the view hierarchy. The column will determine what label is displayed and what Property of a
 * Ball is displayed and/or manipulated. See BallValuesPanel.js, BallValuesPanelColumnNode.js, and
 * BallValuesPanelNumberDisplay.js for full context.
 *
 * @author Brandon Li
 */

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import collisionLab from '../../collisionLab.js';

const BallValuesPanelColumnTypes = Enumeration.byKeys( [

  'BALL_ICONS',   // Column of Ball Icons. For displaying purposes only.
  'MASS',         // Column of mass NumberDisplays. Editable by the user.
  'MASS_SLIDERS', // Column of sliders to change the Mass of a Ball. Only shown when 'More Data' is unchecked.
  'X_POSITION',   // Column of x-position NumberDisplays. Editable by the user.
  'Y_POSITION',   // Column of y-position NumberDisplays. Editable by the user and shown for 'Explore 2D' only.
  'X_VELOCITY',   // Column of x-velocity NumberDisplays. Editable by the user.
  'Y_VELOCITY',   // Column of y-velocity NumberDisplays. Editable by the user and shown for 'Explore 2D' only.
  'X_MOMENTUM',   // Column of x-momentum NumberDisplays. NOT editable by the user.
  'Y_MOMENTUM'    // Column of y-momentum NumberDisplays. NOT editable by the user and shown for 'Explore 2D' only.

] );

collisionLab.register( 'BallValuesPanelColumnTypes', BallValuesPanelColumnTypes );
export default BallValuesPanelColumnTypes;