// Copyright 2020-2022, University of Colorado Boulder

/**
 * Enumeration of the possible 'types' of columns in the BallValuesPanel at the bottom of all screens. This Enumeration
 * is solely used within the view hierarchy. Each 'type' maps to a class that determines if and how a Ball could be
 * edited by the Keypad. See BallValuesPanel.js, BallValuesPanelColumnNode.js, and BallValuesPanelNumberDisplay.js for
 * full context.
 *
 * @author Brandon Li
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import EnumerationDeprecated from '../../../../phet-core/js/EnumerationDeprecated.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabStrings from '../../CollisionLabStrings.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import BallUtils from '../model/BallUtils.js';

// @private
class BallValuesPanelColumnType {

  /**
   * @param {function(ball: Ball):Property.<number>|null} createDisplayProperty - Function that gets a Property that is
   *   displayed in the NumberDisplays in the column. Null means that there is no Property displayed. This function is
   *   called ONCE at the start of the sim.
   *
   * @param {Object|null} editConfig - contains information on how a Ball is edited if a NumberDisplay in this
   *                                   column 'type' is pressed. Null means the column is not editable in any way.
   *                                   The object contains:
   * {
   *
   *    // Function that edits a value of a Ball via Keypad.
   *    editValue: {function(ball: Ball, value: number)},
   *
   *    // Gets the range in which the value can be edited.
   *    getEditingRange: {function(ball: Ball):Range},
   *
   *    // The unit associated with the column type.
   *    editingUnit: {string},
   *
   *    // Function that gets the getUserControlledProperty of a Ball associated with this column type.
   *    getUserControlledProperty: {function(ball: Ball):Property.<boolean>}
   *
   * }
   */
  constructor( createDisplayProperty, editConfig ) {

    // @public (read-only) {Object|null}
    this.editConfig = editConfig;

    // @public (read-only) {function|null}
    this.createDisplayProperty = createDisplayProperty;
  }
}

const BallValuesPanelColumnTypes = EnumerationDeprecated.byMap( {

  // Column of Ball Icons. For displaying purposes only.
  BALL_ICONS: new BallValuesPanelColumnType( null, null ),

  // Column of mass NumberDisplays. Editable by the user.
  MASS: new BallValuesPanelColumnType( _.property( 'massProperty' ), {
    editValue: ( ball, mass ) => { ball.massProperty.value = mass; },
    getEditingRange: () => CollisionLabConstants.MASS_RANGE,
    editingUnit: CollisionLabStrings.units.kilograms,
    getUserControlledProperty: _.property( 'massUserControlledProperty' )
  } ),

  // Column of sliders to change the Mass of a Ball. Only shown when 'More Data' is unchecked.
  MASS_SLIDERS: new BallValuesPanelColumnType( _.property( 'massProperty' ), {
    editValue: ( ball, mass ) => { ball.massProperty.value = mass; },
    getEditingRange: () => CollisionLabConstants.MASS_RANGE,
    editingUnit: CollisionLabStrings.units.kilograms,
    getUserControlledProperty: _.property( 'massUserControlledProperty' )
  } ),

  // Column of x-position NumberDisplays. Editable by the user.
  X_POSITION: new BallValuesPanelColumnType( ball => new DerivedProperty( [ ball.positionProperty ], _.property( 'x' ) ), {
    editValue: ( ball, xPosition ) => ball.setXPosition( xPosition ),
    getEditingRange: ball => BallUtils.getKeypadXPositionRange( ball ),
    editingUnit: CollisionLabStrings.units.meters,
    getUserControlledProperty: _.property( 'xPositionUserControlledProperty' )
  } ),

  // Column of y-position NumberDisplays. Editable by the user and shown for 2D screens only.
  Y_POSITION: new BallValuesPanelColumnType( ball => new DerivedProperty( [ ball.positionProperty ], _.property( 'y' ) ), {
    editValue: ( ball, yPosition ) => ball.setYPosition( yPosition ),
    getEditingRange: ball => BallUtils.getKeypadYPositionRange( ball ),
    editingUnit: CollisionLabStrings.units.meters,
    getUserControlledProperty: _.property( 'yPositionUserControlledProperty' )
  } ),

  // Column of x-velocity NumberDisplays. Editable by the user.
  X_VELOCITY: new BallValuesPanelColumnType( ball => new DerivedProperty( [ ball.velocityProperty ], _.property( 'x' ) ), {
    editValue: ( ball, xVelocity ) => ball.setXVelocity( xVelocity ),
    getEditingRange: () => CollisionLabConstants.VELOCITY_RANGE,
    editingUnit: CollisionLabStrings.units.metersPerSecond,
    getUserControlledProperty: _.property( 'xVelocityUserControlledProperty' )
  } ),

  // Column of y-velocity NumberDisplays. Editable by the user and shown for 2D screens only.
  Y_VELOCITY: new BallValuesPanelColumnType( ball => new DerivedProperty( [ ball.velocityProperty ], _.property( 'y' ) ), {
    editValue: ( ball, yVelocity ) => ball.setYVelocity( yVelocity ),
    getEditingRange: () => CollisionLabConstants.VELOCITY_RANGE,
    editingUnit: CollisionLabStrings.units.metersPerSecond,
    getUserControlledProperty: _.property( 'yVelocityUserControlledProperty' )
  } ),

  // Column of x-momentum NumberDisplays. NOT editable by the user.
  X_MOMENTUM: new BallValuesPanelColumnType( ball => new DerivedProperty( [ ball.momentumProperty ], _.property( 'x' ) ), null ),

  // Column of y-momentum NumberDisplays. NOT editable by the user and shown for 2D screens only.
  Y_MOMENTUM: new BallValuesPanelColumnType( ball => new DerivedProperty( [ ball.momentumProperty ], _.property( 'y' ) ), null )

} );

collisionLab.register( 'BallValuesPanelColumnTypes', BallValuesPanelColumnTypes );
export default BallValuesPanelColumnTypes;