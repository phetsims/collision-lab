# Collision Lab - implementation notes

This document contains notes related to the implementation of Collision Lab. 
This is not an exhaustive description of the implementation. The intention is 
to provide a high-level overview and to supplement the internal documentation 
(source code comments) and external documentation (design documents).  

Before reading this document, you are encouraged to read:
* [model.md](https://github.com/phetsims/collision-lab/blob/master/doc/model.md), a high-level description of the simulation model
* [PhET Development Overview](https://github.com/phetsims/phet-info/blob/master/doc/phet-development-overview.md)  
* [PhET Software Design Patterns](https://github.com/phetsims/phet-info/blob/master/doc/phet-software-design-patterns.md)
* [Collision Lab HTML5](https://docs.google.com/document/d/1FwMnpv8LyMZfMYPcASYhI2jtgCXyWrgAjTOx3Po_MsE/), the design document

## Terminology

This section defines terminology that you'll see used throughout the internal and external documentation. Skim this section once, and refer back to it as you explore the implementation.

Much of the terminology for this sim is identified by labels that are visible in the user interface (Center of Mass, Path, Momenta Diagram, Change in Momentum, ...) and those terms are not included here.

* _play area_ - the main viewing box of the Balls
* _ball system_ - the complete collection of balls, inside and outside the play area
* _collision engine_ refers to the main physics engine of the simulation
* _ball values panel_ refers to the panel at the bottom of each screen, which displays and allows to user to manipulate the Properties of the Balls that are in the system.
* _inelastic collision type_ refers to which type of perfectly inelastic collision, see [InelasticCollisionType](js/inelastic/model/InelasticCollisionType.js)
* _inelastic preset_ refers to a preset for the 'Inelastic screen', see [InelasticPreset](js/inelastic/model/InelasticPreset.js)

## General

This section describes how this simulation addresses implementation considerations that are typically encountered in PhET simulations.

**Coordinate Transforms**: The model coordinate frame is in meters (m), with +x right, +y up. The standard (scenery) view coordinate frame has +x right, +y down. Thus, Collision Lab uses a [ModelViewTransform2](https://github.com/phetsims/phetcommon/blob/master/js/view/ModelViewTransform2.js) scaling transformation that inverts the y-axis.

**Query Parameters**: Query parameters are used to enable sim-specific features, mainly for debugging and
testing. Sim-specific query parameters are documented in
[CollisionLabQueryParameters](js/common/CollisionLabQueryParameters.js).

**Assertions**: The implementation makes heavy use of `assert` to verify pre/post assumptions and perform type checking. This sim performs type-checking for almost all function arguments via `assert`. If you are making modifications to this sim, do so with assertions enabled via the `?ea` query parameter.

**Memory Management**: There are no dynamically allocated objects for the collision lab simulation. The same Ball objects (both model and view) are used with the same number of Balls, meaning Balls are created at the start of the sim and persist for the lifetime of the sim. See [BallSystem](js/common/model/BallSystem.js) for details.

For the view, the simulation takes advantage of this and creates scenery Nodes that represent each Ball (for the Ball Values Panel, Paths, BallNodes, etc.), regardless of whether or not the Ball is currently visible and adjusts visibility based on whether or not it is in the system. There is no performance loss since Balls not in the system are not stepped or updated. 

Thus, all observer/observable relationships exist for the lifetime of the sim, so there is no need to call the various memory-management functions associated with these objects (unlink, dispose, removeListener, etc.).

## Class Overview

### Common to all screens

This section describes the **main** classes that are common to multiple screens. You'll find these classes in `js/common/`.

#### Model

[CollisionLabModel](js/common/model/CollisionLabModel.js) is the model base class for all screens. It is responsible for instantiating sub-models common to all screens.

[PlayArea](js/common/model/PlayArea.js) is the main viewing box of the Balls.

[Ball](js/common/model/Ball.js) is the model for the Balls that appear in the sim.

[CollisionEngine](js/common/model/CollisionEngine.js) implements collision detection and responses of Balls for all screens. Reference the [Collision Implementation](https://github.com/phetsims/collision-lab/blob/master/doc/implementation-notes.md#collision-implementation) 

[BallSystem](js/common/model/BallSystem.js) is the class that instantiates pre-populated Balls and tracks the number of Balls and which Balls that are in the "system."

#### View

[CollisionLabViewProperties](js/common/view/CollisionLabViewProperties.js) a collection of boolean AXON Properties, mostly for visibility, that applies to all screens.

[CollisionBallScreenView](js/common/view/CollisionBallScreenView.js) is the base `ScreenView` for all screens. 

[PlayAreaNode](js/common/view/PlayAreaNode.js) is the PlayArea view for all screens.

[BallNode](js/common/view/BallNode.js) is the view associated with each Ball.

[BallSystemNode](js/common/view/BallSystemNode.js) is the view associated with each BallSystem. In particular, it is responsible for creating each BallNode and layering them.

### Screen-specific classes

All screens have screen-specific to account for the described [screen differences](https://github.com/phetsims/collision-lab/blob/master/model.md#screen-differences).

The top-level classes ([CollisionLabModel](js/common/model/CollisionLabModel.js) and [CollisionBallScreenView](js/common/view/CollisionBallScreenView.js)) use the [Factory Method Pattern](https://en.wikipedia.org/wiki/Factory_method_pattern) to allow screens to specify and provide screen-specific sub-classes while still allowing the base-classes to handle the instance.

### Inelastic Screen

The _Inelastic_ screen introduces many components and behaviors that are unique to it, as described in the [screen differences](https://github.com/phetsims/collision-lab/blob/master/model.md#screen-differences) section.

[InelasticCollisionType](js/inelastic/model/InelasticCollisionType.js) is an Enumeration of the different types of collisions ("Stick" vs "Slip").

[InelasticCollisionEngine](js/inelastic/model/InelasticCollisionEngine.js) implements collision detection and responses for perfectly inelastic collisions that "stick." Most notably, it handles rotations of Ball clusters. Reference the [Collision Implementation](https://github.com/phetsims/collision-lab/blob/master/doc/implementation-notes.md#collision-implementation).

[InelasticPreset](js/inelastic/model/InelasticPreset.js) is a rich Enumeration which maps to a `PresetValue` that sets the states of the Balls. The different _presets_ are visible in the [PresetComboBox](js/inelastic/model/PresetComboBox.js).

## Collision Implementation

The motion of Balls is based on the fact that they are under-going uniform-motion. At every time step, the balls are first propagated forward uniformly assuming no collision of any kind.

Next, the Balls are inspected to determine if a ball-to-ball or a ball-to-border collision has occurred. Collisions are detected after the collision occurs by checking if any two Balls physically overlap or if any Ball overlaps with the border of the PlayArea. The collision-lab implementation of collision detection does not use a [QuadTree](https://en.wikipedia.org/wiki/Quadtree) data structure since there aren't too many Balls in the model at a time.

If and when a collision is detected, the collision is processed by first analytically determining how long the Balls have been overlapping. Using this time, the collision is reconstructed to the exact moment of contact to more accurately simulate colliding balls, and the position of Balls after the collision are updated to a more realistic position.

The algorithms for finding the overlapping time of collisions can be found below:

* [ball-to-ball-time-of-impact-derivation](https://github.com/phetsims/collision-lab/blob/master/doc/images/ball-to-ball-time-of-impact-derivation.pdf)
* [ball-to-border-time-of-impact-derivation](https://github.com/phetsims/collision-lab/blob/master/doc/images/ball-to-border-time-of-impact-derivation.pdf)

The velocity of the Balls are also updated, taking into account the elasticity and input momentums. The algorithm for determining output velocities follows the standard rigid-body collision model as described in [Impact Particles](http://web.mst.edu/~reflori/be150/Dyn%20Lecture%20Videos/Impact%20Particles%201/Impact%20Particles%201.pdf).

The _Inelastic_ screen introduces rotations of Ball clusters around the center of mass. This is implemented by taking advantage of the fact that there are only 2 Balls in the _Inelastic_ screen. The [InelasticCollisionEngine](js/inelastic/model/InelasticCollisionEngine.js) will keep a flag that indicates if the Balls are rotating. Once the Balls are rotating, the [InelasticCollisionEngine](js/inelastic/model/InelasticCollisionEngine.js) hijacks the uniform-motion model and rotates the Balls, with constant angular velocity, around the moving center of mass. All 'slipping' collisions are forwarded to the `CollisionEngine`.

If in the future the simulation needs to support rotations of Ball clusters of 3 or more Balls, there should be a separate sub-model (perhaps called `RotatingBallCluster`) for tracking the necessary fields needed for each rotating ball cluster. The [InelasticCollisionEngine](js/inelastic/model/InelasticCollisionEngine.js) should create and step these when a collision that results in rotating Balls occurs. [InelasticCollisionEngine](js/inelastic/model/InelasticCollisionEngine.js) will also have to consider collisions between a ball and a rotating ball-cluster as well as collisions between two ball-clusters.

