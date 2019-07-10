
var Hangman = Hangman || {};

$(document).ready(() => {
    let gameWorld = Hangman.gameWorld()
    $('#letters').hide()
})

Hangman.gameWorld = function() {
    var Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Composites = Matter.Composites,
        MouseConstraint = Matter.MouseConstraint,
        Mouse = Matter.Mouse,
        World = Matter.World,
        Bodies = Matter.Bodies;

    // create engine
    var engine = Engine.create(),
        world = engine.world;

    // create renderer
    var render = Render.create({
        element: document.getElementById("cvas"),
        engine: engine,
        options: {
            width: window.innerWidth,
            height: 500,
            background: 'transparent',
            wireframes: false,
            showAngleIndicator: true,
            showCollisions: false,
            showBounds: false,
            showPositions: false,
            showShadows: true,
            showInternalEdges: false
        }
    });

    Render.run(render);

    // create runner
    var runner = Runner.create();
    Runner.run(runner, engine);

    // add bodies
    World.add(world, [
        // walls
        Bodies.rectangle(window.innerWidth/2, 10, window.innerWidth, 20, { isStatic: true }),
        Bodies.rectangle(10, 230, 20, 420, { isStatic: true }),
        Bodies.rectangle(window.innerWidth-10, 230, 20, 420, { isStatic: true }),
        Bodies.rectangle(window.innerWidth/2, 450, window.innerWidth, 20, { isStatic: true }),
    ]);

    World.add(world, [
        Bodies.rectangle(400, 100, 60, 60, { frictionAir: 0.001 }),
        Bodies.rectangle(500, 100, 60, 60, { frictionAir: 0.05 }),
        Bodies.rectangle(600, 100, 60, 60, { frictionAir: 0.1 })
    ])
    

    //World.add(world, Composites.stack);
    
    // add mouse control
    var mouse = Mouse.create(render.canvas),
        mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
                render: {
                    visible: false
                }
            }
        });

    World.add(world, mouseConstraint);

    // keep the mouse in sync with rendering
    render.mouse = mouse;

    return {
        engine: engine,
        runner: runner,
        render: render,
        canvas: render.canvas,
        stop: function() {
            Matter.Render.stop(render);
            Matter.Runner.stop(runner);
        }
    };
};


function generateButtons() {
    var letters = "abcdefghijklmnopqrstuvwxyz"
    for (const [i, letter] of letters.split("").entries()) {
        $("#letters").append(`<div class="btnWrapperL" style="width:${Math.floor(window.innerWidth/27)}px;"><div class="letter${i}">${letter}</div></div>`)
        $(`.letter${i}`).click((e) => disintegrateLetter(e.target))
    }
}

async function btnHandler(el) {
    new Particles(`.${el.className}`, {
        direction: 'left',
        style: 'fill'
    }).disintegrate()
    $('#letters').show();
    Hangman.word = await extractRandomWord()
    for (let i = 0; i < Hangman.word.length; i++) {
        $('.wordDash').append($("<div>", {class: `dash${i}`, text: "_"}))
    }    
}

function disintegrateLetter(el) {
    let particle = new Particles(`.${el.className}`, {
        duration: 300,
        type: 'circle',
        direction: 'top',
        oscilationCoefficient: 10,
        color: 'white',
        begin: () => {
            el.innerHTML = ""
        }
    })
    particle.disintegrate()
}

function selectRandomWord(randArt) {
    let words = randArt.match(/[a-zA-Z]{6,}/g)
    return words[Math.floor(Math.random() * words.length)]
}

async function extractRandomWord() {
    try {
        return await $.get("https://en.wikipedia.org/w/api.php?action=query&generator=random&format=json&origin=*&grnnamespace=0&grnlimit=1&prop=extracts&explaintext&exlimit=1")
        .then(data => {
            generateButtons()
            return Object.values(data.query.pages)[0].extract
        }).then(selectRandomWord)
    } catch (error) {
        return 'Failed to retrieve word'
    }
}

//#region Wikimedia API 
// REST https://en.wikipedia.org/api/rest_v1/page/random/summary
// $.ajax({
//     url: "https://en.wikipedia.org/w/api.php?action=query&generator=random&format=json&origin=*&grnnamespace=0&grnlimit=1&prop=extracts&explaintext&exlimit=1",
//     data: data,
//     type: "GET",
//     beforeSend: function(xhr) {
//         xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
//     },
//     success: function(data) {
//         //console.log(Object.values(data.query.pages)[0].revisions[0].slots.main["*"]) // this gives a random article
//         console.log(Object.values(data.query.pages)[0].extract)
//     }
//  });
//#endregion