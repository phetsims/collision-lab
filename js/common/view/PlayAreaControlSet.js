// Copyright 2020, University of Colorado Boulder

/**
 * A view specialized to display Controls for the user to change the number of Balls in the PlayArea system and the
 * visibility of the PlayArea's Grid. It is positioned just outside the PlayArea on the top-right side and appears on
 * all of the Screens except for the 'Intro' screen.
 *
 * The PlayAreaControlSet consists of:
 *   - a NumberSpinner to allow the user to change the number of balls in the PlayArea
 *   - a GridCheckbox to toggle the visibility of the grid.
 *
 * PlayAreaControlSets are created at the start of the sim and are never disposed, so no dispose method is necessary.
 *
 * @author Brandon Li
 */

import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import assertMutuallyExclusiveOptions from '../../../../phet-core/js/assertMutuallyExclusiveOptions.js';
import merge from '../../../../phet-core/js/merge.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import GridCheckbox from '../../../../scenery-phet/js/GridCheckbox.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import VBox from '../../../../scenery/js/nodes/VBox.js';
import NumberSpinner from '../../../../sun/js/NumberSpinner.js';
import collisionLab from '../../collisionLab.js';
import collisionLabStrings from '../../collisionLabStrings.js';
import CollisionLabConstants from '../CollisionLabConstants.js';

class PlayAreaControlSet extends VBox {

  /**
   * @param {Property.<number>} numberOfBallsProperty - the number of Balls in the PlayArea system.
   * @param {Range} numberOfBallsRange - the range of the number of Balls
   * @param {Property.<boolean>} gridVisibleProperty
   * @param {Object} [options]
   */
  constructor( numberOfBallsProperty, numberOfBallsRange, gridVisibleProperty, options ) {
    assert && AssertUtils.assertPropertyOf( numberOfBallsProperty, 'number' );
    assert && assert( numberOfBallsRange instanceof Range, `invalid numberOfBallsRange: ${numberOfBallsRange}` );
    assert && AssertUtils.assertPropertyOf( gridVisibleProperty, 'boolean' );
    assert && assertMutuallyExclusiveOptions( options, [ 'includeGridCheckbox' ], [ 'includeNumberOfBallsSpinner' ] );

    options = merge( {

      // {boolean} - indicates if components of the PlayAreaControlSet are included (mutually exclusive).
      includeGridCheckbox: true,
      includeNumberOfBallsSpinner: true,

      // {number} - y-margins between the title, number spinner, and grid checkbox, respectively.
      titleToNumberSpinnerMargin: 6,
      numberSpinnerToGridCheckboxMargin: 12,

      // {Object} - options passed to the GridCheckbox instance.
      gridCheckboxOptions: merge( { gridSize: 26 }, CollisionLabConstants.CHECKBOX_OPTIONS ),

      // {Object} - passed to the title Text instance.
      titleTextOptions: {
        font: CollisionLabConstants.CONTROL_FONT,
        maxWidth: 40 // constrain width for i18n, determined empirically
      },

      // {Object} - options passed to the NumberSpinner instance.
      numberSpinnerOptions: {
        font: new PhetFont( 26 ),
        backgroundMinWidth: 37,
        backgroundLineWidth: 0.5,
        arrowButtonLineWidth: 0.5,
        yMargin: 4
      },

      // super-class options
      align: 'left'
    }, options );

    // Set options that cannot be overridden.
    assert && assert( !options.spacing, 'PlayAreaControlSet sets spacing' );
    assert && assert( !options.children, 'PlayAreaControlSet sets children' );
    options.spacing = options.numberSpinnerToGridCheckboxMargin;
    options.children = [];

    //----------------------------------------------------------------------------------------

    if ( options.includeNumberOfBallsSpinner ) {

      // Create the title Text of the PlayAreaControlSet.
      const ballsText = new Text( collisionLabStrings.balls, options.titleTextOptions );

      // Create the NumberSpinner of the PlayAreaControlSet to allow the user to change the number of balls.
      const numberOfBallsSpinner = new NumberSpinner( numberOfBallsProperty,
        new Property( numberOfBallsRange ),
        options.numberSpinnerOptions );

      // Wrap the controls of the number of Balls in a separate VBox to give separate spacing.
      const ballControlBox = new VBox( {
        children: [ ballsText, numberOfBallsSpinner ],
        spacing: options.titleToNumberSpinnerMargin
      } );

      options.children.push( ballControlBox );
    }

    //----------------------------------------------------------------------------------------

    // Create and add a GridCheckbox instance if includeGridCheckbox is true.
    if ( options.includeGridCheckbox ) {

      // Create the Grid Checkbox.
      const gridCheckbox = new GridCheckbox( gridVisibleProperty, options.gridCheckboxOptions );

      options.children.push( gridCheckbox );
    }

    super( options );
  }
}

collisionLab.register( 'PlayAreaControlSet', PlayAreaControlSet );
export default PlayAreaControlSet;