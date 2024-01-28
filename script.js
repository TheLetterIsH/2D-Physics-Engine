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

let friction = 0.05;

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
        return Math.sqrt(this.x ** 2 + this.y ** 2);
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
    constructor(x, y, mass, radius) {
        this.position = new Vector(x, y);

        this.mass = mass;
        if (this.mass === 0) {
            this.inverseMass = 0;
        }
        else {
            this.inverseMass = 1 / this.mass;
        }

        this.radius = radius;
        this.elasticity = 1;
        this.isPlayer = false;
        this.velocity = new Vector(0, 0);
        this.acceleration = new Vector(0, 0);
        this.accelerationParameter = 0.5;
        //this.fillColor = "mediumseagreen";
        ballList.push(this);
    }

    drawBall() {
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
        ctx.strokeStyle = "black";
        ctx.stroke();
        ctx.fillStyle = "mediumseagreen";
        ctx.fill();
    }

    displayGizmos() {
        this.velocity.drawVector(this.position.x, this.position.y, 10, "red");
        ctx.fillStyle = "black";
        ctx.fillText("m: " + this.mass, this.position.x - (this.radius / 2.5), this.position.y - 5);
        ctx.fillText("e: " + this.elasticity, this.position.x - (this.radius / 2.5), this.position.y + 5);
    }

    reposition() {
        this.acceleration = this.acceleration.unit().multiply(this.accelerationParameter);
        this.velocity = this.velocity.add(this.acceleration);
        this.velocity = this.velocity.multiply(1 - friction);
        this.position = this.position.add(this.velocity);
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
}


function round(number, precision) {
    let factor = 10 ** precision;
    return Math.round(number * factor) / factor;
}


function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


function collisionDetectionBetweenBalls(ballA, ballB) {
    let distance = ballB.position.subtract(ballA.position);
    if (ballA.radius + ballB.radius >= distance.magnitude()) {
        return true;
    }
    else {
        return false;
    }
}


function penetrationResolutionBetweenBalls(ballA, ballB) {
    let distance = ballA.position.subtract(ballB.position);
    let penetrationDepth = ballA.radius + ballB.radius - distance.magnitude();
    let penetrationResolution = distance.unit().multiply(penetrationDepth / (ballA.inverseMass + ballB.inverseMass));
    ballA.position = ballA.position.add(penetrationResolution.multiply(ballA.inverseMass));
    ballB.position = ballB.position.add(penetrationResolution.multiply(-ballB.inverseMass));
}


function collisionResolutionBetweenBalls(ballA, ballB) {
    let normal = ballA.position.subtract(ballB.position).unit();
    let relativeVelocity = ballA.velocity.subtract(ballB.velocity);
    let seperationVelocity = Vector.dot(relativeVelocity, normal);
    let newSeperationVelocity = -seperationVelocity * Math.min(ballA.elasticity, ballB.elasticity);

    let seperationVelocityDifference = newSeperationVelocity - seperationVelocity;
    let impulse = seperationVelocityDifference / (ballA.inverseMass + ballB.inverseMass);
    let impulseVector = normal.multiply(impulse);

    ballA.velocity = ballA.velocity.add(impulseVector.multiply(ballA.inverseMass));
    ballB.velocity = ballB.velocity.add(impulseVector.multiply(-ballB.inverseMass));
}


function mainLoop() {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    ballList.forEach((ballElement, index) => {
        ballElement.drawBall();

        if (ballElement.isPlayer) {
            playerController(ballElement);
        }

        for (let i = index + 1; i < ballList.length; i++)
            if (collisionDetectionBetweenBalls(ballList[index], ballList[i])) {
                penetrationResolutionBetweenBalls(ballList[index], ballList[i]);
                collisionResolutionBetweenBalls(ballList[index], ballList[i]);
            }

        ballElement.displayGizmos();
        ballElement.reposition();
    });

    requestAnimationFrame(mainLoop);
}


for (let i = 0; i < 10; i++) {
    let newBall = new Ball(randomInt(100, 500), randomInt(100, 350), randomInt(0, 10), randomInt(20, 50));
    newBall.elasticity = randomInt(0, 15) / 10;
}

ballList[0].isPlayer = true;

requestAnimationFrame(mainLoop);
