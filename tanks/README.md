# Tanks!

## Concept:

_"What goes up must come down..."_
**Blood, Sweat & Tears**

Players take turns lobbing projectiles; anyone sustaining a hit is destroyed. Last one standing wins!

## Wireframes:

![Initial Hand Drawn Wireframe](./wireframe.jpg)

## Tech:

    - HTML
    - CSS / BOOTSTRAP
    - JavaScript / jQuery
    - HTML Canvas

## Approach:

As a kid Tank Wars was an early favorite, and the simple yet compelling game play seemed perfect for my first JS project. Some initial googling of simple games introduced me to HTML Canvas as a well supported, well documented way to draw shapes and lines in the browser. It was important for me to get started quickly with a simple version, while also having the ability to make the game more complex and detailed if time allowed.

## Challenges:

One of the first challenges was simply learning HTML Canvas itself; some ideas that may be standard in animation seemed quirky (e.g. rotating the canvas, drawing a straight line, and rotating back to accomplish an angled line). I got a lot of initial ideas from studying simple JS clock animations.

A second challenge came in implementing the actual physics and math to calculate a projectile's path. While fairly straightforward and well documented in high-school course websites, it took some work translating the physics (gravitational vertical acceleration) and trigonometry (SIN, COSIN) speak into my computer code.

Animation was also problematic; converting my static drawing loops into smooth animations was important for gameplay but eluded me. jCanvas proved to be a helpful library for using jQuery methods to create, manipulate, and importantly animate things drawn with HTML Canvas.

## Known Bugs and Wonkiness Being Fixed:

- Terrain generation and drawing needs to be scoped out of game.newGame() to make **Change Terrain** button operational, and to allow **New Game** button to start play on existing terrain.
- **Display explosion AFTER shot lands**
- Modal flashes the Resume button on initial closure

## Future Ideas:

### Graphics

- Flatten terrain directly below tanks.
- More animations (tank destruction, tank dropping into place)
- Add chem trails to see last shot. Slow fade out?
- Make craters more jagged, more visually interesting (color?).
- Utilize actual images
- Use some Bézier/Quadratic curves for terrain instead of all straight lines.
- Place titles, scores etc on top of canvas
- Add snow capped mountains
- Add Trees

### Responsiveness / UI

- Make mobile responsive and playable with on-screen controls to fire keyboard inputs
- Use slider(s) under Change Players button
- Add mouse functionality for game-play.

### Logic / Game Play

- **Add computer logic for Robot players.**
- Give tanks more than 1 starting hitpoint; require multiple shots to kill, damage based on shot proximity. Falling could harm tank as well.
- Randomize starting player. Weight towards those in the middle since they are most in danger?
- Spread tanks further apart, rather than evenly spaced.
- Allow shots off screen horizontally to wrap back from other side?
- Allow shots that hit bottom of screen (where ground has been destroyed to bounce)
- Integrate terrain steepness? Increase as gameplay continues in multiple rounds?
- Keep running tally of player wins; allow names for players. Allow custom tank objects.
- Build your own level: click on screen to add terrain nodes. Place your own tanks like in Settlers of Catan.
- Add Day/Night displays, with limited visibility.
- Add wind to buffet shots around horizontally. Trees could indicate wind-direction and velocity.

## Resources

- [Coolor.co - Color Palette Generator](http://www.coolors.co) - Make pretty colors that works together
- [Canvas Clock Demo](http://www.dhtmlgoodies.com/tutorials/canvas-clock/) - Tells time.
- [Keycode.info by Wes Bos](https://keycode.info/) - App to get key codes

## External Libraries

- [KeyDrown.JS](https://jeremyckahn.github.io/keydrown/) - Library to speed up user held keys
- [jCanvas](https://projects.calebevans.me/jcanvas/) - Library to use jQuery on HTML Canvas (easier animations)

## App Demo

<!-- - [Play Game](http://www.benhammondmusic.com/tanks/) -->

- [Play Game on GitHub Pages](https://benhammondmusic.github.io/tanks)
- [Source Code on GitHub](https://github.com/benhammondmusic/benhammondmusic.github.io/tree/main/tanks)
