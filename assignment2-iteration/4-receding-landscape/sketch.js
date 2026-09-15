function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(220);
  stroke(0);
  strokeWeight(2);
  
  let baseLines = 25; 
  let horizonY = -100; 
  let bottomY = height;        

  let extraLinesPerSide = 30; 
  let startLoop = 0 - extraLinesPerSide;
  let endLoop = baseLines + extraLinesPerSide;

  for (let i = startLoop; i < endLoop; i++) {
    
    let topX = map(i, 0, baseLines - 1, width * 0.48, width * 0.52);
    
    let bottomX = map(i, 0, baseLines - 1, -width * 1.5, width * 2.5);
    
    line(topX, horizonY, bottomX, bottomY);
  }
  
  noLoop(); 
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  redraw();
}