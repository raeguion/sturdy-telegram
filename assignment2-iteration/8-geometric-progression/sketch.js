function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(220);
  fill(255); 
  stroke(0); 

  let centerX = width / 2;
  let centerY = height;

  let maxRadius = dist(centerX, centerY, 0, 0); 
  let maxDiameter = maxRadius * 2;

  let totalCircles = 25; 
  let sizeStep = maxDiameter / totalCircles;

  for (let i = totalCircles; i > 0; i--) {
    let diameter = i * sizeStep;

    let currentStrokeWeight = map(diameter, 0, maxDiameter, 1, 10);
    strokeWeight(currentStrokeWeight);
    
    circle(centerX, centerY, diameter);
  }

  noLoop(); 
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  redraw();
}