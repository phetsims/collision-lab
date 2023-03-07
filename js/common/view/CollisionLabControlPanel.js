// Copyright 2019-2023, University of Colorado Boulder

/**
 * Control Panel at the upper-right corner of each screen that allows the user to manipulate certain Properties of
 * the simulation.
 *
 * All screens have a control-panel in the same location with similar components. However, some components vary for
 * specific screens. This includes (which appear in some screens, not in other screens):
 *    - Elasticity Number Control
 *    - stick vs slip ABSwitch
 *    - change in momentum Checkbox
 *    - path Checkbox
 *    - reflecting border Checkbox
 *
 * Since many screens have similar control-panels, this was implemented to work generally for all screens, but can be
 * subclassed to add extra components that are specific to a screen. It also contains an options API to un-include
 * components that are normally common to all screens.
 *
 * @author Brandon Li
 * @author Alex Schor
 */

import merge from '../../../../phet-core/js/merge.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import { Color, HSeparator, VBox } from '../../../../scenery/js/imports.js';
  import Panel from '../../../../sun/js/Panel.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabStrings from '../../CollisionLabStrings.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import CollisionLabCheckbox from './CollisionLabCheckbox.js';
import CollisionLabIconFactory from './CollisionLabIconFactory.js';
import CollisionLabViewProperties from './CollisionLabViewProperties.js';
import ElasticityNumberControl from './ElasticityNumberControl.js';

class CollisionLabControlPanel extends Panel {

  /**
   * @param {CollisionLabViewProperties} viewProperties
   * @param {Property.<boolean>} centerOfMassVisibleProperty
   * @param {Property.<boolean>} pathsVisibleProperty
   * @param {Property.<boolean>} reflectingBorderProperty
   * @param {Property.<number>} elasticityPercentProperty
   * @param {Property.<boolean>} ballsConstantSizeProperty
   * @param {Object} [options]
   */
  constructor( viewProperties,
               centerOfMassVisibleProperty,
               pathsVisibleProperty,
               reflectingBorderProperty,
               elasticityPercentProperty,
               ballsConstantSizeProperty,
               options ) {
    assert && assert( viewProperties instanceof CollisionLabViewProperties, `invalid viewProperties: ${viewProperties}` );
    assert && AssertUtils.assertPropertyOf( centerOfMassVisibleProperty, 'boolean' );
    assert && AssertUtils.assertPropertyOf( pathsVisibleProperty, 'boolean' );
    assert && AssertUtils.assertPropertyOf( reflectingBorderProperty, 'boolean' );
    assert && AssertUtils.assertPropertyOf( elasticityPercentProperty, 'number' );
    assert && AssertUtils.assertPropertyOf( ballsConstantSizeProperty, 'boolean' );

    options = merge( {}, CollisionLabConstants.PANEL_OPTIONS, {

      // {number} - the spacing between the content Nodes of the Panel
      contentSpacing: 7,

      // {boolean} - indicates if the reflecting border checkbox is included.
      includeReflectingBorderCheckbox: true,

      // {boolean} - indicates if the 'Path' checkbox is included.
      includePathCheckbox: true,

      // {boolean} - indicates if the 'Elasticity' NumberControl is included.
      includeElasticityNumberControl: true,

      // {Object} - passed to the ElasticityNumberControl, if it is included.
      elasticityNumberControlOptions: null

    }, options );

    // Make the panel a fixed width.
    assert && assert( options.minWidth === undefined, 'CollisionLabControlPanel sets minWidth' );
    assert && assert( options.maxWidth === undefined, 'CollisionLabControlPanel sets maxWidth' );
    const panelWidth = CollisionLabConstants.CONTROL_PANEL_CONTENT_WIDTH + 2 * options.xMargin;
    options.minWidth = panelWidth;
    options.maxWidth = panelWidth;

    //----------------------------------------------------------------------------------------

    // Create the content Node of the Control Panel.
    const contentNode = new VBox( { spacing: options.contentSpacing, align: 'left' } );
    super( contentNode, options );

    // @protected {Node} - the content Node. This is referenced for layouting purposes in sub-classes.
    this.contentNode = contentNode;

    //----------------------------------------------------------------------------------------

    // 'Velocity' visibility Checkbox
    const velocityCheckbox = new CollisionLabCheckbox( viewProperties.velocityVectorVisibleProperty, CollisionLabStrings.velocity, {
      icon: CollisionLabIconFactory.createVelocityVectorIcon()
    } );

    // 'Momentum' visibility Checkbox
    const momentumCheckbox = new CollisionLabCheckbox( viewProperties.momentumVectorVisibleProperty, CollisionLabStrings.momentum, {
      icon: CollisionLabIconFactory.createMomentumVectorIcon()
    } );

    // @protected {Checkbox} - 'Center of Mass' visibility Checkbox. This is referenced for ordering in sub-classes.
    this.centerOfMassCheckbox = new CollisionLabCheckbox( centerOfMassVisibleProperty, CollisionLabStrings.centerOfMass, {
      icon: CollisionLabIconFactory.createCenterOfMassIcon()
    } );

    // 'Kinetic Energy' visibility Checkbox
    const kineticEnergyCheckbox = new CollisionLabCheckbox( viewProperties.kineticEnergyVisibleProperty, CollisionLabStrings.kineticEnergy );

    // 'Values' visibility Checkbox. This is referenced for ordering in sub-classes.
    const valuesCheckbox = new CollisionLabCheckbox( viewProperties.valuesVisibleProperty, CollisionLabStrings.values );

    // @protected {Checkbox} - 'Constant Size' Checkbox. Exposed to sub-classes for layouting.
    this.constantSizeCheckbox = new CollisionLabCheckbox( ballsConstantSizeProperty, CollisionLabStrings.constantSize );

    const hSeparator = new HSeparator( { stroke: Color.BLACK } );

    //----------------------------------------------------------------------------------------

    // Set the children of the content in the correct order.
    contentNode.children = [
      velocityCheckbox,
      momentumCheckbox,
      this.centerOfMassCheckbox,
      kineticEnergyCheckbox,
      valuesCheckbox
    ];

    // Add the reflecting border Checkbox if it is included.
    if ( options.includeReflectingBorderCheckbox ) {

      // 'Reflecting Border' Checkbox
      const reflectingBorderCheckbox = new CollisionLabCheckbox( reflectingBorderProperty,
        CollisionLabStrings.reflectingBorder );

      // Add the Reflecting Border Checkbox after the values Checkbox.
      contentNode.addChild( reflectingBorderCheckbox );
    }

    // Add the path Checkbox if it is included.
    if ( options.includePathCheckbox ) {

      // Create the 'Path' visibility Checkbox.
      const pathCheckbox = new CollisionLabCheckbox( pathsVisibleProperty, CollisionLabStrings.path );

      // Add the 'Path' Checkbox after the 'Values' Checkbox.
      contentNode.addChild( pathCheckbox );
    }

    contentNode.addChild( hSeparator );

    // Add the 'Elasticity' NumberControl if it is included.
    if ( options.includeElasticityNumberControl ) {

      // 'Elasticity' Number Control
      const elasticityNumberControl = new ElasticityNumberControl( elasticityPercentProperty, options.elasticityNumberControlOptions );

      // Add the 'Elasticity' NumberControl after the horizontal line separator.
      contentNode.addChild( elasticityNumberControl );
    }

    contentNode.addChild( this.constantSizeCheckbox );

    // Apply additional Bounds mutators.
    this.mutate( options );
  }
}

collisionLab.register( 'CollisionLabControlPanel', CollisionLabControlPanel );
export default CollisionLabControlPanel;