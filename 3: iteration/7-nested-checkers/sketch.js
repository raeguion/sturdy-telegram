let numRect = 8;
let sideMargin = 40; 

function setup() {
  let availableWidth = windowWidth - (sideMargin * 2);
  let availableHeight = windowHeight - (sideMargin * 2);
  
  let maxPossibleSize = min(availableWidth, availableHeight);
  let squareSize = int(maxPossibleSize / numRect);
  let cleanCanvasSize = squareSize * numRect;

  let canvas = createCanvas(cleanCanvasSize, cleanCanvasSize);
  
  canvas.style('display', 'block');
  canvas.style('margin', 'auto');
  
  let dynamicTopMargin = (windowHeight - cleanCanvasSize) / 2;
  canvas.style('margin-top', dynamicTopMargin + 'px');

}

function draw() {
  background(220);

  let size = width / numRect;
    
  for (let x = 0; x < width; x = x + size) {
    for (let y = 0; y < height; y = y + size) {
      
      let col = round(x / size);
      let row = round(y / size);

      if ((col + row) % 2 === 1) {
        fill(0);
      } else {
        fill(255);
      }
      
      rect(x, y, size, size);
    }
  }

  noLoop(); 
}

function windowResized() {
  let availableWidth = windowWidth - (sideMargin * 2);
  let availableHeight = windowHeight - (sideMargin * 2);
  
  let maxPossibleSize = min(availableWidth, availableHeight);
  let squareSize = int(maxPossibleSize / numRect);
  let cleanCanvasSize = squareSize * numRect;
  
  resizeCanvas(cleanCanvasSize, cleanCanvasSize);
  
  let dynamicTopMargin = (windowHeight - cleanCanvasSize) / 2;
  
  let canvasElement = select('canvas');
  canvasElement.style('margin-top', dynamicTopMargin + 'px');
  
  redraw();
}