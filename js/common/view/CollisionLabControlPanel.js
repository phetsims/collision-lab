// Copyright 2019-2020, University of Colorado Boulder

/**
 * Control Panel at the upper-right corner of each screen that allows the user to manipulate certain Properties of
 * the simulation. It exists for the lifetime of the sim and is not intended to be disposed.
 *
 * @author Brandon Li
 * @author Alex Schor
 */

import Property from '../../../../axon/js/Property.js';
import merge from '../../../../phet-core/js/merge.js';
import VBox from '../../../../scenery/js/nodes/VBox.js';
import Color from '../../../../scenery/js/util/Color.js';
import HSeparator from '../../../../sun/js/HSeparator.js';
import Panel from '../../../../sun/js/Panel.js';
import collisionLab from '../../collisionLab.js';
import collisionLabStrings from '../../collisionLabStrings.js';
import CollisionLabColors from '../CollisionLabColors.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import InelasticCollisionTypes from '../model/InelasticCollisionTypes.js';
import CollisionLabCheckbox from './CollisionLabCheckbox.js';
import CollisionLabIconFactory from './CollisionLabIconFactory.js';
import CollisionLabViewProperties from './CollisionLabViewProperties.js';
import ElasticityControlSet from './ElasticityControlSet.js';

class CollisionLabControlPanel extends Panel {

  /**
   * @param {CollisionLabViewProperties} viewProperties
   * @param {Property.<boolean>} centerOfMassVisibleProperty
   * @param {Property.<boolean>} reflectingBorderProperty
   * @param {Property.<number>} elasticityPercentProperty
   * @param {Property.<InelasticCollisionTypes>} inelasticCollisionTypeProperty
   * @param {Property.<boolean>} ballsConstantSizeProperty
   * @param {Object} [options]
   */
  constructor( viewProperties,
               centerOfMassVisibleProperty,
               reflectingBorderProperty,
               elasticityPercentProperty,
               inelasticCollisionTypeProperty,
               ballsConstantSizeProperty,
               options ) {
    assert && assert( viewProperties instanceof CollisionLabViewProperties, `invalid viewProperties: ${viewProperties}` );
    assert && assert( centerOfMassVisibleProperty instanceof Property && typeof centerOfMassVisibleProperty.value === 'boolean', `invalid centerOfMassVisibleProperty: ${centerOfMassVisibleProperty}` );
    assert && assert( reflectingBorderProperty instanceof Property && typeof reflectingBorderProperty.value === 'boolean', `invalid reflectingBorderProperty: ${reflectingBorderProperty}` );
    assert && assert( elasticityPercentProperty instanceof Property && typeof elasticityPercentProperty.value === 'number', `invalid elasticityPercentProperty: ${elasticityPercentProperty}` );
    assert && assert( inelasticCollisionTypeProperty instanceof Property && InelasticCollisionTypes.includes( inelasticCollisionTypeProperty.value ), `invalid inelasticCollisionTypeProperty: ${inelasticCollisionTypeProperty}` );
    assert && assert( ballsConstantSizeProperty instanceof Property && typeof ballsConstantSizeProperty.value === 'boolean', `invalid ballsConstantSizeProperty: ${ballsConstantSizeProperty}` );
    assert && assert( !options || Object.getPrototypeOf( options === Object.prototype ), `invalid options: ${options}` );

    options = merge( {}, CollisionLabConstants.PANEL_OPTIONS, {

      contentSpacing: 7,         // {number} - the spacing between the content Nodes of the Panel
      elasticityControlSetNodeOptions: null

    }, options );

    // Make the panel a fixed width.
    assert && assert( options.minWidth === undefined, 'CollisionLabControlPanel sets minWidth' );
    assert && assert( options.maxWidth === undefined, 'CollisionLabControlPanel sets maxWidth' );
    const panelWidth = CollisionLabConstants.CONTROL_PANEL_CONTENT_WIDTH + 2 * options.xMargin;
    options.minWidth = panelWidth;
    options.maxWidth = panelWidth;

    //----------------------------------------------------------------------------------------

    // Create the content Node of the Panel
    const contentNode = new VBox( { spacing: options.contentSpacing } );

    super( contentNode, options );

    this.contentNode = contentNode;

    // 'Velocity' visibility Checkbox
    this.velocityCheckbox = new CollisionLabCheckbox( viewProperties.velocityVectorVisibleProperty,
      collisionLabStrings.velocity, {
        icon: CollisionLabIconFactory.createVectorIcon( CollisionLabColors.VELOCITY_VECTOR_COLORS )
      } );

    // 'Momentum' visibility Checkbox
    this.momentumCheckbox = new CollisionLabCheckbox( viewProperties.momentumVectorVisibleProperty,
      collisionLabStrings.momentum, {
        icon: CollisionLabIconFactory.createVectorIcon( CollisionLabColors.MOMENTUM_VECTOR_COLORS )
      } );

    // 'Center of Mass' visibility Checkbox
    this.centerOfMassCheckbox = new CollisionLabCheckbox( centerOfMassVisibleProperty,
      collisionLabStrings.centerOfMass, {
      icon: CollisionLabIconFactory.createCenterOfMassIcon()
    } );

    // 'Kinetic Energy' visibility Checkbox
    this.kineticEnergyCheckbox = new CollisionLabCheckbox( viewProperties.kineticEnergyVisibleProperty,
      collisionLabStrings.kineticEnergy
    );

    // 'Values' visibility Checkbox
    this.valuesCheckbox = new CollisionLabCheckbox( viewProperties.valuesVisibleProperty, collisionLabStrings.values );


    // 'Reflecting Border' Checkbox
    this.reflectingBorderCheckbox = new CollisionLabCheckbox( reflectingBorderProperty,
      collisionLabStrings.reflectingBorder );

    // 'Elasticity' control
    this.elasticityControlSetNode = new ElasticityControlSet(
      elasticityPercentProperty,
      inelasticCollisionTypeProperty,
      options.elasticityControlSetNodeOptions );

    // 'Constant Radius' Checkbox
    this.constantRadiusCheckbox = new CollisionLabCheckbox( ballsConstantSizeProperty, collisionLabStrings.constantSize );

    this.hSeperator = new HSeparator( CollisionLabConstants.CONTROL_PANEL_CONTENT_WIDTH, { stroke: Color.BLACK } );

    this.contentNode.children = [
      this.velocityCheckbox,
      this.momentumCheckbox,
      this.centerOfMassCheckbox,
      this.kineticEnergyCheckbox,
      this.valuesCheckbox,
      this.reflectingBorderCheckbox,
      this.hSeperator,
      this.elasticityControlSetNode,
      this.constantRadiusCheckbox
    ];
  }
}

collisionLab.register( 'CollisionLabControlPanel', CollisionLabControlPanel );
export default CollisionLabControlPanel;