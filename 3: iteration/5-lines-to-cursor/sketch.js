function setup() {
  createCanvas(windowWidth, windowHeight); 
}

function draw() {
  background(220);

  let totalLines = 10; 
  let patternWidth = width * 0.8; 

  let leftBound = (width - patternWidth) / 2;
  let rightBound = leftBound + patternWidth;
  
  let startY = height * 0.125; 

  for (let i = 0; i < totalLines; i++) {
  
    let currentX = map(i, 0, totalLines - 1, leftBound, rightBound);
    
    line(currentX, startY, mouseX, mouseY);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}