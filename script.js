const canvas = document.getElementById("canvas");
const ctx = canvas.getContext('2d');

let x = 100;
let y = 100;

let moveUp, moveDown, moveLeft, moveRight;

const UP = 38;
const DOWN = 40;
const LEFT = 37;
const RIGHT = 39;
const W = 87;
const S = 83;
const A = 65;
const D = 68;



function drawBall(x, y, radius, fillColor) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = "black";
    ctx.stroke();
    ctx.fillStyle = fillColor;
    ctx.fill();
}

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

function move() {
    if (moveUp) {
        y--;
    }
    if (moveDown) {
        y++;
    }
    if (moveLeft) {
        x--;
    }
    if (moveRight) {
        x++;
    }
}


function mainLoop() {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    move();
    drawBall(x, y, 20, "mediumseagreen");
    requestAnimationFrame(mainLoop);
}
requestAnimationFrame(mainLoop);
