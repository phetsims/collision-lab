# Collision Lab - model description

This is a high-level description of the model used in the Collision Lab simulation. It's intended for audiences that are not necessarily technical. 

The model consists of a ball system and play-area, engaged in rigid-body collisions. 

## Play-Area

Play-areas are present in all screens. It is the main viewing box of the Balls, described as a friction-less two-dimensional box. It has rigid borders that can be toggled (on or off) with the 'Reflecting Border' checkbox.

Play-areas also have a grid background when the grid checkbox is checked.  When the grid is visible, Ball positions are snapped to the nearest grid-line when they are dragged.

For both the _Intro_ and _Explore 1D_ screens, the play-areas are one-dimensional and there is no grid checkbox. Instead, it has tick-marks (same spacing as the grid-lines) along the top of the play-area that are always visible. Ball positions are still snapped to the nearest tick-mark.

In the _Intro_ screen, there is no "Reflecting Border" checkbox and its play-area does not have rigid borders.

## Balls and Ball Systems

Balls are rigid bodies that have mass, radius, position, and velocity. Momentum (<img src="https://render.githubusercontent.com/render/math?math=\vec{p}">) is derived from the mass and the velocity of the Ball, where <img src="https://render.githubusercontent.com/render/math?math=\large \vec{p} = m \cdot \vec{v}">. The position and velocity of balls are manipulated directly by dragging or through the Keypad (by pressing one of the Number displays in the bottom panel with the "More Data" checkbox checked). The mass of balls are directly manipulated through mass-sliders or through the Keypad (in the bottom panel).

When the "Constant Radius" checkbox is not checked, the radii of balls are derived from the volume of a sphere using a uniform (and constant) density model. When the "Constant Radius" checkbox is checked, all Balls have the same radii; the "tint" of the Balls also changes based on the density of the Ball.

The collection of all Balls is referred to as the ball system, both inside and outside the play-area. The number of balls in the system is manipulated through a NumberPicker at the top-right of the Play Area (labeled 'Balls'). Note that this NumberPicker is not included in the _Intro_ and _Inelastic_ screens.

The kinetic energy and center-of-mass position/velocity are derived from the state of the balls within the system. 

All balls within the system (with the exception of the _Inelastic_ screen) are undergoing uniform motion and have no rotational kinematics.

In the _Inelastic_ screen, perfectly inelastic collisions that 'stick' results in stuck balls rotating around the center of mass of the cluster of balls (if the collision isn't head-on), where the [angular velocity (&omega;)](https://en.wikipedia.org/wiki/Angular_velocity) (relative to the center-of-mass) is derived from the [conservation of Angular Momentum (L)](https://en.wikipedia.org/wiki/Angular_momentum#Collection_of_particles).

For the _Explore 2D_ and _Inelastic_ screens, when the "Paths" checkbox is checked, a trailing path is drawn behind every ball (and the center-of-mass if it is visible). The paths fade over time to only show the recent position of the balls. Note that the trailing paths only show the recent path of the balls **after** the "Path" checkbox is checked.

## Collisions

The position and velocity of balls within the ball system are indirectly manipulated when they collide with other rigid bodies. 

The elasticity slider directly controls the [coefficient of restitution](https://en.wikipedia.org/wiki/Coefficient_of_restitution) of all balls in collisions (where 0% is perfectly inelastic and 100% is perfectly elastic), including when balls collide with the play-area's reflecting border. 

Perfectly inelastic collisions are disabled for the _Explore 2D_ screen by design. However, perfectly inelastic collisions are enabled in the _Inelastic_ screen. 

In the _Inelastic_ screen, there are two types of perfectly inelastic collisions: stick vs slip. Perfectly inelastic collisions that "slip" follow the standard collision-response algorithm, where the component of
velocity along the line of contact (see [Impact Particles](http://web.mst.edu/~reflori/be150/Dyn%20Lecture%20Videos/Impact%20Particles%201/Impact%20Particles%201.pdf)) is exactly equal before and after the collision. Perfectly inelastic collisions that "stick", as described above, results in a rotation of balls.


## Conservation of momentum

All ball-ball collisions follow the [law of conservation of momentum](https://en.wikipedia.org/wiki/Conservation_of_momentum). Note that when a ball collides with the reflecting border, momentum is not conserved (since an external force acts on the system).

The momentum vectors can be visualized in the Momenta Diagram in the bottom-right corner of every screen, which displays the momentum vectors of each Ball oriented tip-to-tail along with the total momentum vector of the entire ball system. For the _Intro_ and _Explore 1D_ screens, momentum vectors are stacked vertically on top of each other for better visibility of the momentum vectors (which all have a y-component of 0 kg⋅m/s).

In the _Intro_ screen, there is also a "Change in momentum" checkbox. When it is checked, the [impulse](https://en.wikipedia.org/wiki/Impulse_(physics)) vectors are displayed temporarily above the balls when a ball-ball collision occurs. The impulse vectors are equal and opposite with respect to each ball.

## Simulation State Control
- restart vs rest 
- step backwards

## Inelastic screen presets
