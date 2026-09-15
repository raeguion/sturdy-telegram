let startHue;
let endHue;
let randomButton;

function setup() {
  createCanvas(windowWidth, windowHeight / 2);
  
  colorMode(HSB, 360, 100, 100);
  
  pickNewColors();

  randomButton = createButton('Randomize Colors');
  randomButton.position(20, height + 20);
  randomButton.mousePressed(handleButtonClick);
}

function draw() {
  background(220); 
  strokeWeight(0);
  rectMode(CORNER); 

  let totalRects = 10;
  let margin = 20;
  let availableWidth = width - (margin * 2);
  let spacingRatio = 0.1; 
  let rectWidth = availableWidth / (totalRects + (totalRects - 1) * spacingRatio);
  
  let rectHeight = height - (margin * 2); 
  let spacing = rectWidth * spacingRatio;
  let startX = margin; 
  let y = margin;

  for (let i = 0; i < totalRects; i++) {
    let x = startX + i * (rectWidth + spacing);

    let currentHue = map(i, 0, totalRects - 1, startHue, endHue);
    
    fill(currentHue, 100, 100);
    rect(x, y, rectWidth, rectHeight);
  }

  noLoop();
}

function pickNewColors() {
  startHue = random(0, 360);
  endHue = random(0, 360);
}

function handleButtonClick() {
  pickNewColors();
  loop(); 
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight / 2);
  randomButton.position(20, height + 20);
  redraw();
}