
//board
let board;
let boardWidth = 430;
let boardHeight = 725;
let context;

//bird
let birdWidth = 34; 
let birdHeight = 24;
let birdX = boardWidth/8;
let birdY = boardHeight/2;
let birdImg;

let bird = {
    x : birdX,
    y : birdY,
    width : birdWidth,
    height : birdHeight
}

//pipes
let pipeArray = [];
let pipeWidth = 64; 
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

//physics
let velocityX = -2; //pipes moving left speed
let velocityY = 0; //bird jump speed
let gravity = 0.4; //bird falling speed

let gameOver = false;
let score = 0;

let highScore = localStorage.getItem("flappyHighScore") 

//sound
let wingsound= new Audio("sfx_wing.wav");
let hitsound = new Audio("sfx_hit.wav");
let bgm = new Audio("bgm_mario.mp3");
bgm.loop = true; //loop background music
let die= new Audio("sfx_die.wav");

window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); //used for drawing on the board

    //load images
    birdImg = new Image();
    birdImg.src = "flappybird.png";
    birdImg.onload = function() {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    }

    topPipeImg = new Image();
    topPipeImg.src = "toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "bottompipe.png";

    requestAnimationFrame(update);
    setInterval(placePipes, 1500); //every 1.5 seconds
    document.addEventListener("keydown", moveBird); 
    
}

function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        return;
    }
    //check if high score is beaten
    if (score > highScore) {
    highScore = score;
    localStorage.setItem("flappyHighScore", highScore);
    }

    context.clearRect(0, 0, board.width, board.height);

    //bird
    velocityY += gravity; //apply gravity to current velocityY
    bird.y = Math.max(bird.y + velocityY, 0); //apply gravity to current bird.y, limit the bird.y to top of the canvas
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    if (bird.y > board.height) {
        die.play(); //play sound when bird falls off the board
        gameOver = true;
    }

    //pipes
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5; //0.5 because there are 2 pipes! so 0.5*2 = 1, 1 for each set of pipes
            pipe.passed = true;
        }

        if (detectCollision(bird, pipe)) {
            hitsound.play(); //play sound when bird hits a pipe
            gameOver = true;
        }
    }

    //clear pipes
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift(); //removes first element from the array
    }

    //score
    context.fillStyle = "white";
    context.font="45px sans-serif";
    context.fillText(score, 5, 45);

    if (gameOver) {
        bgm.pause(); //pause background music
        context.fillText("GAME OVER", 5, 90);
        context.fillText("HIGH: " + Math.floor(highScore), 5, 140)
        bgm.currentTime = 0; //reset background music to the beginning
        // context.fillText("Press Space to Restart", 5, 135);
    }
}

function placePipes() {
    if (gameOver) {
        return;
    }
    //(0-1) * pipeHeight/2.
    // 0 -> -128 (pipeHeight/4)
    // 1 -> -128 - 256 (pipeHeight/4 - pipeHeight/2) = -3/4 pipeHeight
    let randomPipeY = pipeY - pipeHeight/4 - Math.random()*(pipeHeight/2);
    let openingSpace = board.height/4;

    let topPipe = {
        img : topPipeImg,
        x : pipeX,
        y : randomPipeY,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }
    pipeArray.push(topPipe);

    let bottomPipe = {
        img : bottomPipeImg,
        x : pipeX,
        y : randomPipeY + pipeHeight + openingSpace,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }
    pipeArray.push(bottomPipe);
}

function moveBird(e) {
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
        if(bgm.paused){
            bgm.play(); //play background music
        }
        wingsound.play(); //play sound when bird jumps
        //jump
        velocityY = -6;

        //reset game
        if (gameOver) {
            bird.y = birdY; //reset bird position
            pipeArray = [];
            score = 0;
            gameOver = false;
        }
    }
}
//Axis-Aligned Bounding Box (AABB) collision detection
function detectCollision(a, b) {
    return a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
           a.x + a.width > b.x &&   //a's top right corner passes b's top left corner
           a.y < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner
           a.y + a.height > b.y;    //a's bottom left corner passes b's top left corner
}