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
        this.position = new Vector(x, y);
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
        ctx.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
        ctx.strokeStyle = "black";
        ctx.stroke();
        ctx.fillStyle = this.fillColor;
        ctx.fill();
    }

    displayVector() {
        this.velocity.drawVector(this.position.x, this.position.y, 10, "#6e9aeb");
        this.acceleration.drawVector(this.position.x, this.position.y, 50, "#ed4c7f");
    }

    reposition(){
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
    let factor = 10**precision;
    return Math.round(number * factor) / factor;
}


function collisionDetectionBetweenBalls(ball1, ball2) {
    let distance = ball2.position.subtract(ball1.position);
    if (ball1.radius + ball2.radius >= distance.magnitude()) {
        return true;
    }
    else {
        return false;
    }
}


function penetrationResolutionBetweenBalls(ball1, ball2) {
    let distance = ball1.position.subtract(ball2.position);
    let penetrationDepth = ball1.radius + ball2.radius - distance.magnitude();
    let penetrationResolution = distance.unit().multiply(penetrationDepth/2);
    ball1.position = ball1.position.add(penetrationResolution);
    ball2.position = ball2.position.add(penetrationResolution.multiply(-1));
}


function collisionResolutionBetweenBalls(ball1, ball2){
    let normal = ball1.position.subtract(ball2.position).unit();
    let relativeVelocity = ball1.velocity.subtract(ball2.velocity);
    let seperationVelocity = Vector.dot(relativeVelocity, normal);
    let seperationVelocityVector = normal.multiply(-seperationVelocity);

    ball1.velocity = ball1.velocity.add(seperationVelocityVector);
    ball2.velocity = ball2.velocity.add(seperationVelocityVector.multiply(-1));
    
}


function mainLoop() {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    
    ballList.forEach((ballElement, index) => {
        ballElement.drawBall();

        if (ballElement.isPlayer) {
            playerController(mainBall);
        }
        
        for (let i = index + 1; i < ballList.length; i++)
            if (collisionDetectionBetweenBalls(ballList[index] , ballList[i])) {
                penetrationResolutionBetweenBalls(ballList[index] , ballList[i]);
                collisionResolutionBetweenBalls(ballList[index] , ballList[i]);
            }
        
        ballElement.displayVector();
        ballElement.reposition();
    });

    requestAnimationFrame(mainLoop);
}


let mainBall = new Ball(200, 200, 30, "mediumseagreen");
let ball2 = new Ball(100, 100, 20, "mediumseagreen");
let ball3 = new Ball(400, 400, 35, "mediumseagreen");
let ball4 = new Ball(300, 300, 40, "mediumseagreen");
let ball5 = new Ball(550, 300, 35, "mediumseagreen");
mainBall.isPlayer = true;
requestAnimationFrame(mainLoop);
