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
const wallList = [];
const capsuleList = [];

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

    static cross(vect1, vect2) {
        return ((vect1.x * vect2.y) - (vect1.y * vect2.x))
    }

    drawVector(startX, startY, n, color) {
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX + this.x * n, startY + this.y * n);
        ctx.strokeStyle = color;
        ctx.stroke();
    }
}


class Matrix {
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.data = [];

        for (let i = 0; i < this.rows; i++) {
            this.data[i] = [];
            for (let j = 0; j < this.cols; j++) {
                this.data[i][j] = 0;
            }
        }
    }

    multiplyVector(vect) {
        let result = new Vector(0, 0);
        result.x = this.data[0][0] * vect.x + this.data[0][1] * vect.y;
        result.y = this.data[1][0] * vect.x + this.data[1][1] * vect.y;
        return result;
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

    keyControl() {
        if (moveUp) {
            this.acceleration.y = -this.accelerationParameter;
        }
        if (moveDown) {
            this.acceleration.y = this.accelerationParameter;
        }
        if (moveLeft) {
            this.acceleration.x = -this.accelerationParameter;
        }
        if (moveRight) {
            this.acceleration.x = this.accelerationParameter;
        }
        if (!moveUp && !moveDown) {
            this.acceleration.y = 0;
        }
        if (!moveLeft && !moveRight) {
            this.acceleration.x = 0;
        }
    }
}


class Capsule {
    constructor(x1, y1, x2, y2, radius) {
        this.start = new Vector(x1, y1);
        this.end = new Vector(x2, y2);
        this.radius = radius;
        this.velocity = new Vector(0, 0);
        this.acceleration = new Vector(0, 0);
        this.accelerationParameter = 0.5;
        this.position = this.start.add(this.end).multiply(0.5);
        this.length = this.end.subtract(this.start).magnitude();
        this.direction = this.end.subtract(this.start).unit();
        this.angularVelocity = 0;
        this.angle = 0;
        this.referenceDirection = this.end.subtract(this.start).unit();
        this.referenceAngle = Math.acos(Vector.dot(this.referenceDirection, new Vector(1, 0)));

        if (Vector.cross(this.referenceDirection, new Vector(1, 0)) > 0) {
            this.referenceAngle *= -1;
        }

        capsuleList.push(this);
    }

    drawCapsule() {
        ctx.beginPath();
        ctx.arc(this.start.x, this.start.y, this.radius, this.referenceAngle + this.angle + Math.PI / 2, this.referenceAngle + this.angle + 3 * Math.PI / 2);
        ctx.arc(this.end.x, this.end.y, this.radius, this.referenceAngle + this.angle - Math.PI / 2, this.referenceAngle + this.angle + Math.PI / 2);
        ctx.closePath();
        ctx.strokeStyle = "black";
        ctx.stroke();
        ctx.fillStyle = "indianred";
        ctx.fill();
    }

    reposition() {
        this.acceleration = this.acceleration.unit().multiply(this.accelerationParameter);
        this.velocity = this.velocity.add(this.acceleration);
        this.velocity = this.velocity.multiply(1 - friction);
        this.position = this.position.add(this.velocity);
        this.angle += this.angularVelocity;
        this.angularVelocity *= 0.99;

        let rotMatrix = rotationMatrix(this.angle);
        this.direction = rotMatrix.multiplyVector(this.referenceDirection);

        this.start = this.position.add(this.direction.multiply(-this.length / 2));
        this.end = this.position.add(this.direction.multiply(this.length / 2));
    }

    keyControl() {
        if (moveUp) {
            this.acceleration = this.direction.multiply(-this.accelerationParameter);
        }
        if (moveDown) {
            this.acceleration = this.direction.multiply(this.accelerationParameter);
        }
        if (moveLeft) {
            this.angularVelocity = -0.01;
        }
        if (moveRight) {
            this.angularVelocity = 0.01;
        }
        if (!moveUp && !moveDown) {
            this.acceleration = new Vector(0, 0);
        }
    }
}


class Wall {
    constructor(x1, y1, x2, y2) {
        this.start = new Vector(x1, y1);
        this.end = new Vector(x2, y2);
        wallList.push(this);
    }

    drawWall() {
        ctx.beginPath();
        ctx.moveTo(this.start.x, this.start.y);
        ctx.lineTo(this.end.x, this.end.y);
        ctx.strokeStyle = "black";
        ctx.stroke();
        ctx.closePath();
    }

    wallUnit() {
        return this.end.subtract(this.start).unit();
    }
}


function userInput() {
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
}


function round(number, precision) {
    let factor = 10 ** precision;
    return Math.round(number * factor) / factor;
}


function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


function rotationMatrix(angle) {
    let matrix = new Matrix(2, 2);
    matrix.data[0][0] = Math.cos(angle);
    matrix.data[0][1] = -Math.sin(angle);
    matrix.data[1][0] = Math.sin(angle);
    matrix.data[1][1] = Math.cos(angle);

    return matrix;
}


function closestPointBetweenBallAndWall(ballA, wallA) {
    let ballToWallStart = wallA.start.subtract(ballA.position);
    
    if (Vector.dot(wallA.wallUnit(), ballToWallStart) > 0) {
        return wallA.start;
    }

    let wallEndToBall = ballA.position.subtract(wallA.end);
    
    if (Vector.dot(wallA.wallUnit(), wallEndToBall) > 0) {
        return wallA.end;
    }

    let closestDistance = Vector.dot(wallA.wallUnit(), ballToWallStart);
    let closestVector = wallA.wallUnit().multiply(closestDistance);

    return wallA.start.subtract(closestVector);
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


function collisionDetectionBetweenBallAndWall(ballA, wallA) {
    let closestPointToBall = closestPointBetweenBallAndWall(ballA, wallA).subtract(ballA.position);

    if (closestPointToBall.magnitude() <= ballA.radius) {
        return true;
    }
}


function penetrationResolutionBetweenBalls(ballA, ballB) {
    let distance = ballA.position.subtract(ballB.position);
    let penetrationDepth = ballA.radius + ballB.radius - distance.magnitude();
    let penetrationResolution = distance.unit().multiply(penetrationDepth / (ballA.inverseMass + ballB.inverseMass));
    ballA.position = ballA.position.add(penetrationResolution.multiply(ballA.inverseMass));
    ballB.position = ballB.position.add(penetrationResolution.multiply(-ballB.inverseMass));
}


function penetrationResolutionBetweenBallAndWall(ballA, wallA) {
    let penetrationVector = ballA.position.subtract(closestPointBetweenBallAndWall(ballA, wallA));
    ballA.position = ballA.position.add(penetrationVector.unit().multiply(ballA.radius - penetrationVector.magnitude()));
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


function collisionResolutionBetweenBallAndWall(ballA, wallA) {
    let normal = ballA.position.subtract(closestPointBetweenBallAndWall(ballA, wallA)).unit();
    let seperationVelocity = Vector.dot(ballA.velocity, normal);
    let newSeperationVelocity = -seperationVelocity * ballA.elasticity;
    
    let seperationVelocityDifference = seperationVelocity - newSeperationVelocity;

    ballA.velocity = ballA.velocity.add(normal.multiply(-seperationVelocityDifference));
}


function mainLoop() {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    userInput();

    ballList.forEach((ballElement, index) => {
        ballElement.drawBall();

        if (ballElement.isPlayer) {
            ballElement.keyControl();
        }

        wallList.forEach((wallElement) => {
            if (collisionDetectionBetweenBallAndWall(ballList[index], wallElement)) {
                penetrationResolutionBetweenBallAndWall(ballList[index], wallElement);
                collisionResolutionBetweenBallAndWall(ballList[index], wallElement);
            }
        })

        for (let i = index + 1; i < ballList.length; i++) {
            if (collisionDetectionBetweenBalls(ballList[index], ballList[i])) {
                penetrationResolutionBetweenBalls(ballList[index], ballList[i]);
                collisionResolutionBetweenBalls(ballList[index], ballList[i]);
            }
        }

        ballElement.displayGizmos();
        ballElement.reposition();
    });

    capsuleList.forEach((capsuleElement) => {
        capsuleElement.drawCapsule();
        capsuleElement.keyControl();
        capsuleElement.reposition();
    })

    wallList.forEach((wallElement) => {
        wallElement.drawWall();
    })

    requestAnimationFrame(mainLoop);
}


for (let i = 0; i < 5; i++) {
    let newBall = new Ball(randomInt(100, 500), randomInt(100, 350), randomInt(0, 10), randomInt(20, 50));
    newBall.elasticity = randomInt(0, 15) / 10;
}

ballList[0].isPlayer = true;

let capsule1 = new Capsule(300, 300, 400, 400, 50);

let wall1 = new Wall(0, 0, canvas.clientWidth, 0);
let wall2 = new Wall(canvas.clientWidth, 0, canvas.clientWidth, canvas.clientHeight);
let wall3 = new Wall(canvas.clientWidth, canvas.clientHeight, 0, canvas.clientHeight);
let wall4 = new Wall(0, canvas.clientHeight, 0, 0);

requestAnimationFrame(mainLoop);
