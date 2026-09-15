function setup() {
  createCanvas(windowWidth, windowHeight / 2);
}

function draw() {
  background(220);
  strokeWeight(1);

  let totalPoints = 7;
  let margin = 50;
  let availableWidth = width - (margin * 2);
  let spacingRatio = 0.5; 
  let circleDiameter = availableWidth / (totalPoints + (totalPoints - 1) * spacingRatio);
  let spacing = circleDiameter * spacingRatio;
  let startX = margin + (circleDiameter / 2);
  let centerY = height / 2;

  for (let i = 0; i < totalPoints; i++) {
    let x = startX + i * (circleDiameter + spacing);
    
    circle(x, centerY, circleDiameter);
  }

  noLoop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight / 2);
  redraw();
}

//push 