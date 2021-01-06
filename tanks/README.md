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

As a kid Tank Wars was an early favorite, and the simple yet compelling game play seemed perfect for my first JS project. Some initial googling of simple games introduced me to HTML Canvas as a well supported, well documented way to animate shapes in the browser. It was important for me to get started quickly with a simple version, while also having the ability to make the game more complex and detailed if time allowed.

## Challenges:

One of the first challenges was simply learning HTML Canvas itself; some ideas that may be standard in animation seemed quirky (e.g. rotating the canvas, drawing a straight line, and rotating back to accomplish an angled line). I got a lot of initial ideas from studying simple JS clock animations.

A second challenge came in implementing the actual physics and math to calculate a projectile's path. While fairly straightforward and well documented in high-school course websites, it took some work translating the physics (gravitational vertical acceleration) and trigonometry (SIN, COSIN) speak into my computer code.

## Known Bugs and Wonkiness Being Fixed:

- Terrain generation and drawing needs to be scoped out of game.newGame() to make **Change Terrain** button operational, and to allow **New Game** button to start play on existing terrain.
- Need to make sure shot can go across entire screen

## Cool Features In Progress:

- Animations (shots, explosions, tank destruction)

## Future Ideas:

- Add computer logic for **Robot** players.
- Use slider(s) under **Change Players** button
- Place titles, graphics, etc on top of canvas
- Randomize starting player. Weight towards those in the middle since they are most in danger?
- Spread tanks further apart, rather than evenly spaced.
- Improve shot detection to account for tank size, explosion size **as circles**
- Allow shots off screen horizontally to wrap back from other side?
- Integrate terrain steepness? Increase as games go on?
- Keep running tally of player wins; allow names for players. Allow custom tank objects.
- Add snow capped mountains
- Add Trees

- -Explosions
  -- Ground destroyed
  -- Utilize actual images / improve graphics: use Bézier curves for terrain
  -- Testing / edge cases / stretch goals
  -- Read me:, screenshots
  -- Demonstration
  -- Build your own level / defenses: clock add terrain node
  -- Day/night/wind
  -- Add my trees

  -- Fine tuned aiming

## Resources

## App Demo

- [Play Game](http://www.benhammondmusic.com/tanks/)
- [Source Code on GitHub](https://github.com/benhammondmusic/benhammondmusic.github.io/tree/main/tanks)
