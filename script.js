const canvas = document.getElementById("canvas");
const ctx = canvas.getContext('2d');

let moveUp, moveDown, moveLeft, moveRight;

const UP = 38;
const DOWN = 40;
const LEFT = 37;
const RIGHT = 39;
const W = 87;
const S = 83;
const A = 65;
const D = 68;

const ballList = [];


class Ball {
    constructor(x, y, radius, fillColor) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.fillColor = fillColor;
        this.isPlayer = false;
        ballList.push(this);
    }

    drawBall() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.strokeStyle = "black";
        ctx.stroke();
        ctx.fillStyle = this.fillColor;
        ctx.fill();
    }
}


function playerController(ball) {
    canvas.addEventListener('keydown', function (e) {
        if (e.keyCode == UP || e.keyCode == W) {
            moveUp = true;
        }
        if (e.keyCode == DOWN || e.keyCode == S) {
            moveDown = true;
        }
        if (e.keyCode == LEFT || e.keyCode == A) {
            moveLeft = true;
        }
        if (e.keyCode == RIGHT || e.keyCode == D) {
            moveRight = true;
        }
    
    });
    
    canvas.addEventListener('keyup', function (e) {
        if (e.keyCode == UP || e.keyCode == W) {
            moveUp = false;
        }
        if (e.keyCode == DOWN || e.keyCode == S) {
            moveDown = false;
        }
        if (e.keyCode == LEFT || e.keyCode == A) {
            moveLeft = false;
        }
        if (e.keyCode == RIGHT || e.keyCode == D) {
            moveRight = false;
        }
    
    });
    
    if (moveUp) {
        ball.y--;
    }
    if (moveDown) {
        ball.y++;
    }
    if (moveLeft) {
        ball.x--;
    }
    if (moveRight) {
        ball.x++;
    }
} 


function mainLoop() {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    
    ballList.forEach(ballElement => {
        ballElement.drawBall();

        if (ballElement.isPlayer) {
            playerController(mainBall);
        }
    });

    requestAnimationFrame(mainLoop);
}


let mainBall = new Ball(200, 200, 20, "mediumseagreen");
mainBall.isPlayer = true;
requestAnimationFrame(mainLoop);
