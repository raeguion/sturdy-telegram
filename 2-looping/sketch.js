// GLOBAL VARIABLES
let x = 0
let y;
let size = 50
let speed = 20


function setup() {
  createCanvas(windowWidth, windowHeight)
  background(255)

  y = windowHeight/2
}

function draw() {
  stroke(random(148,255), random(148,255), random(148,255))
  fill(random(148,255), random(148,255), random(148,255))
  circle(x, y, size)

  // "=" is for assigning value
  // "==" is for equivalency
  x = x + speed

  if(x > width + size/2){
    x = -size/2
    y = random(size, windowHeight - size)
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  redraw();
}