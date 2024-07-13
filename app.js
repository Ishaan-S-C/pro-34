const { Engine, Render, Runner, World, Bodies, Mouse, MouseConstraint, Constraint, Events } = Matter;

const width = window.innerWidth;
const height = window.innerHeight;

const engine = Engine.create();
const world = engine.world;

const render = Render.create({
    element: document.body,
    engine: engine,
    canvas: document.getElementById('gameCanvas'),
    options: {
        width: width,
        height: height,
        wireframes: false,
        background: '#87CEEB'
    }
});

Render.run(render);
Runner.run(Runner.create(), engine);

// Score and UI elements
let score = 0;
const scoreBoard = document.getElementById('scoreBoard');
const resetButton = document.getElementById('resetButton');

// Function to update the score
const updateScore = () => {
    scoreBoard.innerText = `Score: ${score}`;
};

// Function to reset the level
const resetLevel = () => {
    World.clear(world);
    Engine.clear(engine);
    setupWorld();
    score = 0;
    updateScore();
};

// Event listener for reset button
resetButton.addEventListener('click', resetLevel);

const setupWorld = () => {
    // Add ground
    const ground = Bodies.rectangle(width / 2, height - 20, width, 40, { isStatic: true });
    World.add(world, ground);

    // Add slingshot
    const slingshotBase = Bodies.rectangle(150, height - 100, 20, 100, { isStatic: true });
    World.add(world, slingshotBase);

    bird = Bodies.circle(200, height - 150, 20, { density: 0.004 });
    World.add(world, bird);

    slingshot = Constraint.create({
        pointA: { x: 200, y: height - 150 },
        bodyB: bird,
        stiffness: 0.05,
        length: 20
    });
    World.add(world, slingshot);

    // Add obstacles and pigs
    pig = Bodies.circle(800, height - 40, 20, { isStatic: false });
    World.add(world, pig);

    box = Bodies.rectangle(800, height - 60, 40, 40, { isStatic: false });
    World.add(world, box);

    // Add mouse control
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2,
            render: {
                visible: false
            }
        }
    });
    World.add(world, mouseConstraint);

    render.mouse = mouse;

    let isFiring = false;

    Events.on(mouseConstraint, 'enddrag', (event) => {
        if (event.body === bird) {
            isFiring = true;
        }
    });

    Events.on(engine, 'afterUpdate', () => {
        if (isFiring && bird.position.x > 200) {
            slingshot.bodyB = null;
            isFiring = false;
        }
    });

    // Collision event to detect pig hit
    Events.on(engine, 'collisionStart', (event) => {
        const pairs = event.pairs;
        pairs.forEach(pair => {
            if (pair.bodyA === pig || pair.bodyB === pig) {
                score += 100;
                updateScore();
                World.remove(world, pig);
            }
        });
    });
};

// Initial setup
setupWorld();

// Resize the canvas to fill the window
window.addEventListener('resize', () => {
    render.canvas.width = window.innerWidth;
    render.canvas.height = window.innerHeight;
    Render.lookAt(render, {
        min: { x: 0, y: 0 },
        max: { x: window.innerWidth, y: window.innerHeight }
    });
});
