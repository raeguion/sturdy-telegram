// this is how you format comments in .html

let points = [];

function setup() {
  createCanvas(windowWidth, windowHeight);

  //HSB = hue, saturation, brightness
  colorMode(HSB, 360, 100, 100);
  noStroke();

  // button
  let clearButton = document.getElementById("clear-btn");
  clearButton.addEventListener("click", function() {
    points = [];
  });
}

function draw() {
  background(350, 20, 98); 

  // Save new points when drawing
  if (mouseIsPressed) {
    points.push({
      x: mouseX,
      y: mouseY,
      index: points.length 
    });
  }

  // Loop through and draw all saved points
  for (let i = 0; i < points.length; i++) {
    let pt = points[i];

    // Wave calculation for color shift
    let wave = sin(pt.index * 0.08 - frameCount * 0.04);
    let dynamicHue = map(wave, -1, 1, 0, 360);

    fill(dynamicHue, 40, 98);
    
    ellipse(pt.x, pt.y, 30, 30);
  }
}

// Automatically resizes canvas
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
