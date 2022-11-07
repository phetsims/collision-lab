// Copyright 2020-2022, University of Colorado Boulder

/**
 * ElasticityNumberControl is a NumberControl sub-type to display and allow the user to manipulate the elasticity
 * of all ball collisions in a system. It appears inside of control-panels on all screens.
 *
 * The ElasticityNumberControl is labeled with 'Inelastic' and 'Elastic' instead of the percentages as ticks. Some
 * screens use the enabledRangeProperty to disable perfectly inelastic collisions, while some screens use it to
 * only allow perfectly inelastic collisions.
 *
 * ElasticityNumberControls are created at the start of the sim and are never disposed.
 *
 * @author Brandon Li
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import Utils from '../../../../dot/js/Utils.js';
import merge from '../../../../phet-core/js/merge.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import NumberControl from '../../../../scenery-phet/js/NumberControl.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Color, Text } from '../../../../scenery/js/imports.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabStrings from '../../CollisionLabStrings.js';
import CollisionLabConstants from '../CollisionLabConstants.js';

// constants
const ELASTICITY_PERCENT_RANGE = CollisionLabConstants.ELASTICITY_PERCENT_RANGE;
const ELASTICITY_PERCENT_INTERVAL = CollisionLabConstants.ELASTICITY_PERCENT_INTERVAL;

class ElasticityNumberControl extends NumberControl {

  /**
   * @param {Property.<number>} elasticityPercentProperty
   * @param {Object} [options]
   */
  constructor( elasticityPercentProperty, options ) {
    assert && AssertUtils.assertPropertyOf( elasticityPercentProperty, 'number' );

    options = merge( {

      // {Object} - passed to the tick Text instances.
      tickTextOptions: {
        font: new PhetFont( 12 ),
        maxWidth: 45 // constrain width for i18n, determined empirically
      },

      // {number} - the height of the track of the Slider.
      trackHeight: 0.1,

      // superclass options
      layoutFunction: NumberControl.createLayoutFunction4(),
      includeArrowButtons: false,
      sliderOptions: {
        constrainValue: value => Utils.roundToInterval( value, ELASTICITY_PERCENT_INTERVAL ),
        majorTickLength: 5,
        tickLabelSpacing: 10,
        thumbSize: new Dimension2( 14, 24 )
      },
      numberDisplayOptions: {
        valuePattern: StringUtils.fillIn( CollisionLabStrings.pattern.valueUnits, {
          units: CollisionLabStrings.units.percent
        } ),
        textOptions: { font: CollisionLabConstants.DISPLAY_FONT, maxWidth: 90 },
        backgroundStroke: Color.BLACK,
        backgroundLineWidth: 0.5
      },
      titleNodeOptions: {
        font: CollisionLabConstants.PANEL_TITLE_FONT,
        maxWidth: 90 // constrain width for i18n, determined empirically
      }
    }, options );

    //----------------------------------------------------------------------------------------

    assert && assert( !options.sliderOptions.majorTicks, 'ElasticityNumberControl sets majorTicks' );
    assert && assert( !options.sliderOptions.trackSize, 'ElasticityNumberControl sets trackSize' );

    // Create the 'Inelastic' and 'Elastic' tick labels.
    const inelasticLabel = new Text( CollisionLabStrings.inelastic, options.tickTextOptions );
    const elasticLabel = new Text( CollisionLabStrings.elastic, options.tickTextOptions );

    // Compute the width of the track to ensure the NumberControl fits in control-panels.
    const trackWidth = CollisionLabConstants.CONTROL_PANEL_CONTENT_WIDTH
                       - ( inelasticLabel.width + elasticLabel.width ) / 2;

    // Set options that cannot be overridden.
    options.sliderOptions.trackSize = new Dimension2( trackWidth, options.trackHeight );
    options.sliderOptions.majorTicks = [
      { value: ELASTICITY_PERCENT_RANGE.min, label: inelasticLabel },
      { value: ELASTICITY_PERCENT_RANGE.max, label: elasticLabel }
    ];

    super( CollisionLabStrings.elasticity, elasticityPercentProperty, ELASTICITY_PERCENT_RANGE, options );
  }
}

collisionLab.register( 'ElasticityNumberControl', ElasticityNumberControl );
export default ElasticityNumberControl;
