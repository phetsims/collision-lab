// Copyright 2020, University of Colorado Boulder

/**
 * BallValuesNumberDisplay is a subclass of NumberDisplay for displaying a value that is associated with a Ball.
 * Instances appear in the BallValuesPanel.
 *
 * Displays a single component of a Ball Vector (i.e. x-position | x-velocity ... ) of a single  Ball that is currently
 * in the specified PlayArea.
 *
 * 'Is a' relationship with NumberDisplay but adds the following functionality:
 *    - If BallValueQuantities.X_MOMENTUM or BallValueQuantities.Y_MOMENTUM, it solely displays the momentum.
 *
 *      Otherwise, for all other BallValueQuantities, if the NumberDisplay is pressed, the KeypadLayer is fired,
 *      allowing the user to edit the value of the Ball quantity.
 *
 * This BallValuesNumberDisplay should be disposed if the Ball is removed from the PlayArea.
 *
 * @author Brandon Li
 */

