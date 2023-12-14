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

let friction = 0.1;

class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(vect) {
        return new Vector(this.x + vect.x, this.y + vect.y)
    }

    subtract(vect) {
        return new Vector(this.x - vect.x, this.y - vect.y)
    }

    multiply(n) {
        return new Vector(this.x * n, this.y * n);
    }

    magnitude() {
        return Math.sqrt(this.x**2 + this.y**2);
    }

    unit() {
        if (this.magnitude() === 0) {
            return new Vector(0, 0);
        }

        return new Vector(this.x / this.magnitude(), this.y / this.magnitude());
    }

    normal() {
        return new Vector(-this.y, this.x).unit();
    }

    static dot(vect1, vect2) {
        return ((vect1.x * vect2.x) + (vect1.y * vect2.y));
    }

    drawVector(startX, startY, n, color) {
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX + this.x * n, startY + this.y * n);
        ctx.strokeStyle = color;
        ctx.stroke();
    }
}


class Ball {
    constructor(x, y, radius, fillColor) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.fillColor = fillColor;
        this.isPlayer = false;
        this.velocity = new Vector(0, 0);
        this.acceleration = new Vector(0, 0);
        this.accelerationParameter = 0.5;
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

    displayVector() {
        ctx.beginPath();
        ctx.arc(100, 100, 50, 0, 2 * Math.PI);
        ctx.strokeStyle = "black";
        ctx.stroke();
        this.velocity.drawVector(100, 100, 10, "#6e9aeb");
        this.acceleration.drawVector(100, 100, 50, "#ed4c7f");
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
        ball.acceleration.y = -ball.accelerationParameter;
    }
    if (moveDown) {
        ball.acceleration.y = ball.accelerationParameter;
    }
    if (moveLeft) {
        ball.acceleration.x = -ball.accelerationParameter;
    }
    if (moveRight) {
        ball.acceleration.x = ball.accelerationParameter;
    }
    if (!moveUp && !moveDown) {
        ball.acceleration.y = 0;
    }
    if (!moveLeft && !moveRight) {
        ball.acceleration.x = 0;
    }

    ball.acceleration = ball.acceleration.unit().multiply(ball.accelerationParameter);

    ball.velocity = ball.velocity.add(ball.acceleration);
    ball.velocity = ball.velocity.multiply(1 - friction);

    ball.x += ball.velocity.x;
    ball.y += ball.velocity.y;
} 


function mainLoop() {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    
    ballList.forEach(ballElement => {
        ballElement.drawBall();

        if (ballElement.isPlayer) {
            playerController(mainBall);
        }

        ballElement.displayVector();
    });

    requestAnimationFrame(mainLoop);
}


let mainBall = new Ball(200, 200, 20, "mediumseagreen");
mainBall.isPlayer = true;
requestAnimationFrame(mainLoop);
