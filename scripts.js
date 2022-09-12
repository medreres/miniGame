var canvas, ctx, w, h;
var balls = [];
var initialNumberOfBalls = 1;
var globalSpeedMutiplier = 1;
var colorToEat = 'red';
var wrongBallsEaten = goodBallsEaten = 0;
var numberOfGoodBalls;
var mousePos;
var level = 1;
const PAUSE = 5000;
const gameRunning = 'gameRunning',
    displayGameOverMenu = 'displayGameOverMenu';
var gameState = displayGameOverMenu;


var player = {
    x: 10,
    y: 10,
    width: 30,
    height: 30,
};

document.addEventListener("DOMContentLoaded", () => {
    canvas = document.querySelector("#canvas");

    w = canvas.width;
    h = canvas.height;

    ctx = canvas.getContext("2d");

    startGame(initialNumberOfBalls);

    canvas.addEventListener("mousemove", mouseMoved);

    gameMenu();

    detectSpacePressed();

    ballEatenSound = new Howl({
        urls: ['https://mainline.i3s.unice.fr/mooc/SkywardBound/assets/sounds/plop.mp3'],
        onload: function () {
            // start the animation
            mainLoop();
        }
    });
});

function playBackgroundMusic() {
    let audioPlayer = document.querySelector("#audioPlayer");
    audioPlayer.play();
}

function pausebackgroundMusic() {
    let audioPlayer = document.querySelector("#audioPlayer");
    audioPlayer.pause();
}

function detectSpacePressed() {
    document.addEventListener('keyup', (evt) => {
        if (isGamePaused() && evt.key == ' ') {
            // restartGame();
            toggleGame();
        }
    })

    document.addEventListener('click', (evt) => {
        if (isGamePaused() && evt.target == '[object HTMLCanvasElement]') {
            toggleGame();
        }
    })
}

function isGamePaused() {
    return gameState === displayGameOverMenu;
}

function gameMenu() {
    ctx.save();

    ctx.font = '20px Arial';
    ctx.fillText('Press \'Space\' or click here to start game', h / 2 - 180, w / 2);
    ctx.restore();
}

function startGameMenu() {
    ctx.save();

    ctx.restore();
}

function mouseMoved(evt) {
    mousePos = getMousePos(canvas, evt);
}

function getMousePos(c, e) {
    let rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

function getRandomColor() {
    var colors = ["red", "blue", "cyan", "purple", "pink", "green", "yellow"];

    var colorIndex = Math.round((colors.length - 1) * Math.random());

    return colors[colorIndex];
}

function createBalls(n) {
    let ballsArray = [];

    for (let i = 0; i < n; i++) {
        let b = {
            x: Math.round(Math.random() * h),
            y: Math.round(Math.random() * w),
            radius: 5 + 30 * Math.random(),
            speedX: -5 + 10 * Math.random(),
            speedY: -5 + 10 * Math.random(),
            color: getRandomColor()
        };
        ballsArray.push(b);
    }
    return ballsArray;
}

function toggleGame() {
    if (gameState === gameRunning) {
        document.querySelector('canvas').style.cursor = 'pointer';
        gameState = displayGameOverMenu;

    } else {
        document.querySelector('canvas').style.cursor = 'none';
        gameState = gameRunning;
    }
}

function mainLoop() {

    if (!isGamePaused()) {
        ctx.clearRect(0, 0, w, h);

        drawPlayer(player);
        drawAllBalls(balls);

        moveAllBalls(balls);

        movePlayerWithMouse();
        drawNumberOfBallsAlive(balls);
    }

    requestAnimationFrame(mainLoop);
}

function movePlayerWithMouse() {
    if (mousePos !== undefined) {
        player.x = mousePos.x;
        player.y = mousePos.y;
    }
}

function drawAllBalls(ballArray) {
    ballArray.forEach((ball) => {
        drawFilledCircle(ball);
    });
}

function circRectsOverlap(x0, y0, w0, h0, cx, cy, r) {
    var testX = cx;
    var testY = cy;
    if (testX < x0) testX = x0;
    if (testX > x0 + w0) testX = x0 + w0;
    if (testY < y0) testY = y0;
    if (testY > y0 + h0) testY = y0 + h0;
    return (cx - testX) * (cx - testX) + (cy - testY) * (cy - testY) < r * r;
}

function drawNumberOfBallsAlive(balls) {
    ctx.save();
    ctx.font = "20px Arial";
    if (balls.length === 0) {
        ctx.fillText("Game over!", 20, 30);

        restartGame();

        toggleGame();

        gameMenu();
    } else if (goodBallsEaten == numberOfGoodBalls) {
        ctx.fillText(`You win! Final score: ${ wrongBallsEaten +  goodBallsEaten}`, 20, 30);
    } else {
        ctx.fillText("Balls still alive: " + balls.length, 210, 30);
        ctx.fillText("Good Balls eaten: " + goodBallsEaten, 210, 50);
        ctx.fillText("Wrong Balls eaten: " + wrongBallsEaten, 210, 70);
        ctx.fillText(`Level: ${level}`, 210, 90);
    }
    ctx.restore();
}

function restartGame() {
    initialNumberOfBalls++;
    level++;

    //restart game
    startGame(initialNumberOfBalls);
}

function testCollisionWithPlayer(b, i) {
    if (
        circRectsOverlap(
            player.x,
            player.y,
            player.width,
            player.height,
            b.x,
            b.y,
            b.radius
        )
    ) {
        ballEatenSound.play();
        if (b.color === colorToEat) {
            // Yes, we remove it and increment the score
            goodBallsEaten += 1;
        } else {
            wrongBallsEaten += 1;
        }

        balls.splice(i, 1);
    }
}

function moveAllBalls(ballArray) {
    ballArray.forEach((ball, index) => {
        moveBall(ball);

        testCollisionWithPlayer(ball, index);
    });
}

function drawPlayer(r) {
    ctx.save();

    const playerImg = new Image();
    playerImg.src = './resources/monster.png';

    ctx.translate(r.x - r.width / 2, r.y - r.height / 2);

    // ctx.fillStyle = r.color;
    // ctx.fillRect(0, 0, r.width, r.height);
    ctx.drawImage(playerImg, 0, 0);
    ctx.restore();


}

function drawFilledCircle(c) {
    ctx.save();

    ctx.translate(c.x, c.y);
    ctx.fillStyle = c.color;
    ctx.beginPath();
    ctx.arc(0, 0, c.radius, 0, 2 * Math.PI);
    ctx.fill();

    ctx.restore();
}

function moveBall(b) {
    b.x += b.speedX * globalSpeedMutiplier;
    b.y += b.speedY * globalSpeedMutiplier;

    testCollisionBallWithWalls(b);
}

function testCollisionBallWithWalls(b) {
    if (b.x + b.radius > w) {
        //change direction of speed
        b.speedX = -b.speedX;

        //put ball on the collision point
        b.x = w - b.radius;
    } else if (b.x - b.radius < 0) {
        //change direction of speed
        b.speedX = -b.speedX;

        //put ball on the collision point
        b.x = b.radius;
    }

    if (b.y + b.radius > h) {
        //change direction of speed
        b.speedY *= -1;

        //put ball on the collision point
        b.y = h - b.radius;
    } else if (b.y - b.radius < 0) {
        b.speedY *= -1;

        b.y = b.radius;
    }
}


function changeNBalls(n) {
    startGame(n);
}

function changeColorToEar(color) {
    colorToEat = color;
    startGame(initialNumberOfBalls);
}

function changeBallSpeed(coef) {
    globalSpeedMutiplier = coef;
}

function startGame(nb) {
    do {
        balls = createBalls(nb);
        initialNumberOfBalls = nb;
        numberOfGoodBalls = countNumberOfGoodBalls(balls, colorToEat);
    } while (numberOfGoodBalls === 0);

    wrongBallsEaten = goodBallsEaten = 0;
}

function countNumberOfGoodBalls(ballArray, color) {
    return ballArray.filter((ball) => ball.color === color).length;
}