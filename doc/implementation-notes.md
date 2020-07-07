# Collision Lab - implementation notes

This document contains notes related to the implementation of Collision Lab. 
This is not an exhaustive description of the implementation. The intention is 
to provide a high-level overview, and to supplement the internal documentation 
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
* _collision engine_ refers to main physics engine of the simulation
* _inelastic collision type_ refers to which type of perfectly inelastic collision, see [InelasticCollisionType](https://github.com/phetsims/collision-lab/blob/master/js/inelastic/model/InelasticCollisionType.js)
* _inelastic preset_ refers to a preset for the 'Inelastic screen', see [InelasticPreset](https://github.com/phetsims/collision-lab/blob/master/js/inelastic/model/InelasticPreset.js)

## General

This section describes how this simulation addresses implementation considerations that are typically encountered in PhET simulations.

**Coordinate Transforms**: The model coordinate frame is in meters (m), with +x right, +y up. The standard (scenery) view coordinate frame has +x right, +y down. Thus, Collision Lab uses a [ModelViewTransform2](https://github.com/phetsims/phetcommon/blob/master/js/view/ModelViewTransform2.js) scaling transformation that inverts the y axis.

**Memory Management**: There are no dynamically allocated objects for the collision lab simulation. The same Ball objects (both model and view) are used with the same number of Balls, meaning Balls are created at the start of the sim and persist for the lifetime of the sim. See [BallSystem](https://github.com/phetsims/collision-lab/blob/master/js/common/model/BallSystem.js) for details.

For the view, the simulation takes advantage of this and creates scenery Nodes that represents each Ball (for the Ball Values Panel, Paths, BallNodes, etc.), regardless of whether or not the Ball is currently visible and adjusts visibility based on whether or not it is in the system. There is no performance loss since Balls not in the system are not stepped or updated. 

Thus, all observer/observable relationships exist for the lifetime of the sim, so there is no need to call the various memory-management functions associated with these objects (unlink, dispose, removeListener, etc.).

**Query Parameters**: Query parameters are used to enable sim-specific features, mainly for debugging and
testing. Sim-specific query parameters are documented in
[CollisionLabQueryParameters](https://github.com/phetsims/collision-lab/blob/master/js/common/CollisionLabQueryParameters.js).

**Assertions**: The implementation makes heavy use of `assert` to verify pre/post assumptions and perform type checking. This sim performs type-checking for almost all function arguments via `assert`. If you are making modifications to this sim, do so with assertions enabled via the `ea` query parameter.

## Class Overview

### Common to all screens

This section describes the **main** classes that are common to multiple screens. You'll find these classes in `js/common/`.

[CollisionLabModel](https://github.com/phetsims/collision-lab/blob/master/js/common/model/CollisionLabModel.js) is the model base class for all screens. It is responsible for instantiating objects common to all screens, including a PlayArea, BallSystem, CollisionEngine, and MomentaDiagram.

[PlayArea](https://github.com/phetsims/collision-lab/blob/master/js/common/model/PlayArea.js) is main viewing box of the Balls.

[Ball](https://github.com/phetsims/collision-lab/blob/master/js/common/model/Ball.js) is the model for the Balls that appear in the sim.

[CollisionEngine](https://github.com/phetsims/collision-lab/blob/master/js/common/model/CollisionEngine.js) implements collision detection and responses of Balls for all screens. Reference the [Collision Detection and Response](https://github.com/phetsims/collision-lab/blob/master/doc/implementation-notes.md#collision) 

[BallSystem](https://github.com/phetsims/collision-lab/blob/master/js/common/model/BallSystem.js) is the class that instantiates pre-populated Balls and tracks the number of Balls and which Balls that are in the "system."

### View

[CollisionLabViewProperties](https://github.com/phetsims/collision-lab/blob/master/js/common/view/CollisionLabViewProperties.js) a collection of boolean AXON Properties, mostly for visibility, that applies to all screens.

[CollisionBallScreenView](https://github.com/phetsims/collision-lab/blob/master/js/common/view/CollisionBallScreenView.js) is the base `ScreenView` for all screens. 

[PlayAreaNode](https://github.com/phetsims/collision-lab/blob/master/js/common/view/PlayAreaNode.js) is the PlayArea view for all screens.

[BallNode](https://github.com/phetsims/collision-lab/blob/master/js/common/view/BallNode.js) is the view associated with each Ball.

[BallSystemNode](https://github.com/phetsims/collision-lab/blob/master/js/common/view/BallSystemNode.js) is the view associated with each BallSystem. In particular, it is responsible for creating each BallNode and layering them.


## Engine

The motion of the balls is based on a ballistic motion. At every time step,
the balls are first propagated forward ballistically assuming no collision of any kind.
Each pair of balls is then inspected to see if they physically overlap.
In the case that they do, a ball collision is processed by first determining 
analytically the exact time of collision. The resulting position of the pair of balls
is then corrected taking into account the elasticity and current time.
Additionally, each ball is check to see if it overlaps with the border of the playArea.
In a similar process, the time of the contact between the border is determined
and then the velocity and positions are corrected.
