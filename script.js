const canvas = document.getElementById("canvas");
const ctx = canvas.getContext('2d');

function drawBall(x, y, radius, fillColor) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = "black";
    ctx.stroke();
    ctx.fillStyle = fillColor;
    ctx.fill();
}

drawBall(100, 100, 20, "mediumseagreen");