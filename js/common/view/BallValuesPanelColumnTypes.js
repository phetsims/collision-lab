// Copyright 2020, University of Colorado Boulder

/**
 * Enumeration of the possible 'types' of columns in the BallValuesPanel at the bottom of all screens. This Enumeration
 * is solely used within the view hierarchy. Each 'type' maps to a class that determines if and how a Ball could be
 * edited by the Keypad. See BallValuesPanel.js, BallValuesPanelColumnNode.js, and BallValuesPanelNumberDisplay.js for
 * full context.
 *
 * @author Brandon Li
 */

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import collisionLab from '../../collisionLab.js';
import collisionLabStrings from '../../collisionLabStrings.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import BallUtils from '../model/BallUtils.js';

// @private
class BallValuesPanelColumnType {

  /**
   * @param {Object|null} editConfig - contains information on how a Ball is edited if a NumberDisplay in this
   *                                   column 'type' is pressed. Null means the column is not editable in any way.
   *                                   The object contains:
   * {
   *    // Function that edits a value of a Ball via Keypad.
   *    editValue: {function(ball: Ball, value: number)},
   *
   *    // Gets the range in which the value can be edited.
   *    editingRange: {function(ball: Ball):Range},
   *
   *    // The unit associated with the column type.
   *    editingUnit: {string},
   *
   *    // Function that gets the getUserControlledProperty of a Ball associated with this column type.
   *    getUserControlledProperty: {function(ball: Ball):Property.<boolean>}
   *
   * }
   */
  constructor( editConfig ) {

    // @public (read-only) {Object}
    this.editConfig = editConfig;
  }
}

const BallValuesPanelColumnTypes = Enumeration.byMap( {

  // Column of Ball Icons. For displaying purposes only.
  'BALL_ICONS': new BallValuesPanelColumnType( null ),

  // Column of mass NumberDisplays. Editable by the user.
  'MASS': new BallValuesPanelColumnType( {
    editValue: ( ball, mass ) => { ball.mass = mass; },
    editingRange: () => CollisionLabConstants.MASS_RANGE,
    editingUnit: collisionLabStrings.units.kilograms,
    getUserControlledProperty: _.property( 'massUserControlledProperty' )
  } ),

  // Column of sliders to change the Mass of a Ball. Only shown when 'More Data' is unchecked.
  'MASS_SLIDERS': new BallValuesPanelColumnType( {
    editValue: ( ball, mass ) => { ball.mass = mass; },
    editingRange: () => CollisionLabConstants.MASS_RANGE,
    editingUnit: collisionLabStrings.units.kilograms,
    getUserControlledProperty: _.property( 'massUserControlledProperty' )
  } ),

  // Column of x-position NumberDisplays. Editable by the user.
  'X_POSITION': new BallValuesPanelColumnType( {
    editValue: ( ball, xPosition ) => { ball.xPosition = xPosition; },
    editingRange: ball => BallUtils.getKeypadXPositionRange( ball ),
    editingUnit: collisionLabStrings.units.meters,
    getUserControlledProperty: _.property( 'xPositionUserControlledProperty' )
  } ),

  // Column of y-position NumberDisplays. Editable by the user and shown for 2D screens only.
  'Y_POSITION': new BallValuesPanelColumnType( {
    editValue: ( ball, yPosition ) => { ball.yPosition = yPosition; },
    editingRange: ball => BallUtils.getKeypadYPositionRange( ball ),
    editingUnit: collisionLabStrings.units.meters,
    getUserControlledProperty: _.property( 'yPositionUserControlledProperty' )
  } ),

  // Column of x-velocity NumberDisplays. Editable by the user.
  'X_VELOCITY': new BallValuesPanelColumnType( {
    editValue: ( ball, xVelocity ) => { ball.xVelocity = xVelocity; },
    editingRange: () => CollisionLabConstants.VELOCITY_RANGE,
    editingUnit: collisionLabStrings.units.metersPerSecond,
    getUserControlledProperty: _.property( 'xVelocityUserControlledProperty' )
  } ),

  // Column of y-velocity NumberDisplays. Editable by the user and shown for 2D screens only.
  'Y_VELOCITY': new BallValuesPanelColumnType( {
    editValue: ( ball, yVelocity ) => { ball.yVelocity = yVelocity; },
    editingRange: () => CollisionLabConstants.VELOCITY_RANGE,
    editingUnit: collisionLabStrings.units.metersPerSecond,
    getUserControlledProperty: _.property( 'yVelocityUserControlledProperty' )
  } ),

  // Column of x-momentum NumberDisplays. NOT editable by the user.
  'X_MOMENTUM': new BallValuesPanelColumnType( null ),

  // Column of y-momentum NumberDisplays. NOT editable by the user and shown for 2D screens only.
  'Y_MOMENTUM': new BallValuesPanelColumnType( null )

} );

collisionLab.register( 'BallValuesPanelColumnTypes', BallValuesPanelColumnTypes );
export default BallValuesPanelColumnTypes;