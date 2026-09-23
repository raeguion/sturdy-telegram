function setup() {
  let size = Math.min(windowWidth, windowHeight);
  createCanvas(size, size);
}

function draw() {
  background(220);
  strokeWeight(1);

  let margin = 50;
  let startX = margin;
  let startY = margin;
  let endX = width - margin;
  let endY = height - margin;

  let totalPoints = 9;

  for (let i = 0; i < totalPoints; i++) {
    let pct = i / (totalPoints - 1);

    let y1 = lerp(startY, endY, pct);
    let x2 = lerp(startX, endX, pct);

    line(startX, y1, x2, endY);
  }

  noLoop();
}

function windowResized() {
  let size = Math.min(windowWidth, windowHeight);
  resizeCanvas(size, size);
  redraw();
}