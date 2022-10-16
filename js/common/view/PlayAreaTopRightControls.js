// Copyright 2020-2022, University of Colorado Boulder

/**
 * A view specialized to display Controls for the user to change the number of Balls in the BallSystem and the
 * visibility of the PlayArea's Grid. It is positioned just outside the PlayArea on the top-right side and appears on
 * all of the Screens except for the 'Intro' screen.
 *
 * The PlayAreaTopRightControls consists of:
 *   - a NumberSpinner to allow the user to change the number of balls in the system.
 *   - a GridCheckbox to toggle the visibility of the grid.
 *
 * PlayAreaTopRightControls are created at the start of the sim and are never disposed, so no dispose method is
 * necessary.
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
import { Text, VBox } from '../../../../scenery/js/imports.js';
import NumberSpinner from '../../../../sun/js/NumberSpinner.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabStrings from '../../CollisionLabStrings.js';
import CollisionLabConstants from '../CollisionLabConstants.js';

class PlayAreaTopRightControls extends VBox {

  /**
   * @param {Property.<number>} numberOfBallsProperty - the number of Balls in the BallSystem.
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

      // {boolean} - indicates if components of the PlayAreaTopRightControls are included (mutually exclusive).
      includeGridCheckbox: true,
      includeNumberOfBallsSpinner: true,

      // {number} - y-margins between the title, number spinner, and grid checkbox, respectively.
      titleToNumberSpinnerMargin: 6,
      numberSpinnerToGridCheckboxMargin: 12,

      // {Object} - options passed to the GridCheckbox instance.
      gridCheckboxOptions: merge( {
        iconOptions: { size: 26 }
      }, CollisionLabConstants.CHECKBOX_OPTIONS ),

      // {Object} - passed to the title Text instance.
      titleTextOptions: {
        font: CollisionLabConstants.CONTROL_FONT,
        maxWidth: 40 // constrain width for i18n, determined empirically
      },

      // {Object} - options passed to the NumberSpinner instance.
      numberSpinnerOptions: {
        numberDisplayOptions: {
          align: 'center',
          xMargin: 5,
          yMargin: 4,
          minBackgroundWidth: 37,
          backgroundLineWidth: 0.5,
          textOptions: {
            font: new PhetFont( 26 )
          }
        },
        touchAreaXDilation: 8,
        touchAreaYDilation: 4,
        arrowButtonLineWidth: 0.5
      },

      // super-class options
      align: 'left'
    }, options );

    // Set options that cannot be overridden.
    assert && assert( !options.spacing, 'PlayAreaTopRightControls sets spacing' );
    assert && assert( !options.children, 'PlayAreaTopRightControls sets children' );
    options.spacing = options.numberSpinnerToGridCheckboxMargin;
    options.children = [];

    //----------------------------------------------------------------------------------------

    if ( options.includeNumberOfBallsSpinner ) {

      // Create the title Text of the PlayAreaTopRightControls.
      const ballsText = new Text( CollisionLabStrings.balls, options.titleTextOptions );

      // Create the NumberSpinner of the PlayAreaTopRightControls to allow the user to change the number of balls.
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

collisionLab.register( 'PlayAreaTopRightControls', PlayAreaTopRightControls );
export default PlayAreaTopRightControls;