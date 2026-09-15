function setup() {
  createCanvas(windowWidth, windowHeight / 2);
}

function draw() {
  background(100,200,250);
  strokeWeight(0);

  rectMode(CORNER); 

  let totalRects = 10;
  let margin = 20;
  let availableWidth = width - (margin * 2);
  let spacingRatio = 0.1; 
  let rectWidth = availableWidth / (totalRects + (totalRects - 1) * spacingRatio);
  
  let maxHeight = height - (margin * 2); 
  let spacing = rectWidth * spacingRatio;
  
  let startX = margin; 

  for (let i = 0; i < totalRects; i++) {
    let x = startX + i * (rectWidth + spacing);

    let brightness = map(i, 0, totalRects - 1, 0, 255);
    fill(brightness);
    
    let currentHeight = map(i, 0, totalRects - 1, rectWidth, maxHeight);
    
    let y = (height - margin) - currentHeight;
    
    rect(x, y, rectWidth, currentHeight);
  }

  noLoop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight / 2);
  redraw();
}

//push