// calculated dynamically based on lifespan
let maturityAge;
let birthCooldown;

// controlled with sliders
let maxActiveWalkers; 
let birthChance;
let maxLifespan; 
let maxChildren;       

// adjust arrow tracking (lower number = smoother)
let markerLerpSpeed = 0.3; 

// no touchy
let walkers = [];
let currentWalker;
let totalPopulation = 1;

let arrowX = window.innerWidth / 2;
let arrowY = window.innerHeight / 2;


// slider variables
let popSlider, chanceSlider, lifespanSlider, childrenSlider;

let trailBuffer;

function setup() {
  let calculatedHeight = windowHeight - 50;

  createCanvas(windowWidth, calculatedHeight);
  background(255); 
  
  // MATCH: Ensure the invisible trail layer uses the exact same height
  trailBuffer = createGraphics(windowWidth, calculatedHeight);
  trailBuffer.clear(); 
 
  // slider format: createSlider(min, max, default, step)
  // 1. POPULATION SLIDER
  popSlider = createSlider(10, 200, 100, 10);
  popSlider.position(20, 125);
  popSlider.style('width', '150px');
  popSlider.style('display', 'block');
  popSlider.style('margin-bottom', '22px');

  // 2. CHANCE SLIDER
  chanceSlider = createSlider(0.001, 0.01, 0.005, 0.001);
  chanceSlider.position(20, 165);
  chanceSlider.style('width', '150px');
  chanceSlider.style('display', 'block');
  chanceSlider.style('margin-bottom', '22px');

  // 3. LIFESPAN SLIDER
  lifespanSlider = createSlider(1000, 5000, 1500, 100);
  lifespanSlider.position(20, 205);
  lifespanSlider.style('width', '150px');
  lifespanSlider.style('display', 'block');
  lifespanSlider.style('margin-bottom', '22px');

  // 4. CHILDREN SLIDER
  childrenSlider = createSlider(1, 10, 2, 1);
  childrenSlider.position(20, 245);
  childrenSlider.style('width', '150px');
  childrenSlider.style('display', 'block');

  // spawns original walker
  let firstWalker = new Walker(width / 2, height / 2, null);
  walkers.push(firstWalker);
  currentWalker = firstWalker;
}

function draw() {
  // Pull live slider values, calculate maturityAge, etc.
  maxActiveWalkers = popSlider.value();
  birthChance = chanceSlider.value();
  maxLifespan = lifespanSlider.value();
  maxChildren = childrenSlider.value();   
  maturityAge = int(maxLifespan * 0.25); 
  birthCooldown = int(maxLifespan * 0.25);

  background(255); // Wipe main screen clean
  
  // Clear the invisible trail buffer so we can redraw fresh trails this frame
  trailBuffer.clear(); 
  
  // Loops backward to cleanly delete dead walkers
  for (let i = walkers.length - 1; i >= 0; i--) {
    let w = walkers[i];
    
    if (!w.isDead) {
      w.step();
    } else {
      if (w.history.length > 0) {
        w.history.shift(); 
      }
    }

    // Pass the buffer into the trail drawing function
    w.showTrail(trailBuffer);
    
    if (w.age > maxLifespan && w !== currentWalker && !w.isDead) {
      w.isDead = true; 
    }
    if (w.isDead && w.history.length === 0) {
      walkers.splice(i, 1); 
    }
  }
  
  // Draw the entire pre-compiled trail buffer onto the screen at once
  image(trailBuffer, 0, 0);
  
  // Makes walker head show above trails
  for (let i = 0; i < walkers.length; i++) {
    walkers[i].showHead();
  }
  
  // calculates living population
  let aliveCount = walkers.filter(w => !w.isDead).length;
  
  for (let i = 0; i < walkers.length; i++) {
    let w = walkers[i];
    
    // checks age, previous offspring, birth cooldown, and total population
    if (!w.isDead && w.age >= maturityAge && w.childrenSpawned < maxChildren && w.reproductionCooldown === 0 && aliveCount < maxActiveWalkers) {
      // rolls against birth chance
      if (random(1) < birthChance) {
        // spawns new walker
        let newWalker = new Walker(w.x, w.y, w.color);
        walkers.push(newWalker);
        
        // reassigns arrow to track new walker
        currentWalker = newWalker; 
        
        // increases total population counter
        totalPopulation++;
        
        // increases active walker counter
        aliveCount++;
        
        // increases offspring amount for parent
        w.childrenSpawned++;
        
        // starts birth cooldown for parent
        w.reproductionCooldown = birthCooldown; 
      }
    }
  }

  // updates who the arrow follows
  if (currentWalker && !currentWalker.isDead) {
    // moves to new walker x-position
    arrowX = lerp(arrowX, currentWalker.x, markerLerpSpeed);
    
    // moves to new walker y-position
    arrowY = lerp(arrowY, currentWalker.y, markerLerpSpeed);
    
    // vertical bobbing on arrow
    let bobbing = sin(frameCount * 0.1) * 5;
    
    // sets arrow above head
    let renderY = arrowY - 15 + bobbing; 
    
    // arrow shape
    fill(50, 50, 50);
    noStroke();
    triangle(arrowX - 4, renderY - 6, arrowX + 4, renderY - 6, arrowX, renderY);
    rect(arrowX - 1.5, renderY - 12, 3, 6);
  }
  drawUI();
}

function drawUI() {
  // UI background
  fill(0, 0, 0, 150);
  noStroke();
  rect(15, 15, 200, 250, 5); 
  
  // UI text
  fill(255);
  textSize(14);
  textAlign(LEFT, TOP);
  
  // calculates live population
  let aliveCount = walkers.filter(w => !w.isDead).length;

  // counter text
  text("Active Walkers: " + aliveCount, 25, 25);
  text("Total Population: " + totalPopulation, 25, 45);
  text("Youngest Age: " + currentWalker.age + " frames", 25, 65);
  
  // slider text
  text("Max Population: " + maxActiveWalkers, 25, 92);
  text("Birth Chance: " + (birthChance * 100).toFixed(1) + "%", 25, 132);
  text("Max Lifespan: " + maxLifespan + " frames", 25, 172);
  text("Max Children: " + maxChildren, 25, 212);           
}

class Walker {
      constructor(startX, startY, parentColor) {
    // OPTIMIZATION: 250 logged points now covers 1000 frames of visual history!
    this.maxTrailLength = 250; 
    
    let minMutation = 10;
    let maxMutation = 20;
    let constantBias = 0.3;
    
    this.x = startX;
    this.y = startY;
    this.age = 0; 
    this.isDead = false; 
    this.childrenSpawned = 0;
    this.reproductionCooldown = 0; 
    this.history = [];
    
    if (parentColor) {
      this.rChannel = red(parentColor);
      this.gChannel = green(parentColor);
      this.bChannel = blue(parentColor);
      
      let r = constrain(this.rChannel + this.getForcedRandom(minMutation, maxMutation), 100, 200);
      let g = constrain(this.gChannel + this.getForcedRandom(minMutation, maxMutation), 100, 200);
      let b = constrain(this.bChannel + this.getForcedRandom(minMutation, maxMutation), 100, 200);
      
      this.color = color(r, g, b);
    } else {
      this.color = color(random(100, 200), random(100, 200), random(100, 200));
    }
    
    this.rChannel = red(this.color);
    this.gChannel = green(this.color);
    this.bChannel = blue(this.color);
    
    let angle = random(TWO_PI);
    this.biasX = cos(angle) * constantBias; 
    this.biasY = sin(angle) * constantBias;
  }

    // determines if mutation amount is negative or positive
  getForcedRandom(minVal, maxVal) {
    let change = random(minVal, maxVal);
    if (random(1) < 0.5) {
      change *= -1;
    }
    return change;
  }
  
    showTrail(layer) {
    if (this.history.length < 2) return;

    let activeZoneLength = 50;
    
    // Configure the hidden layer's line settings
    layer.noFill();
    layer.strokeWeight(5); 
    layer.strokeCap(ROUND);
    layer.strokeJoin(ROUND);
    
    // Access the native drawing context of the hidden layer to handle smooth alpha fading
    let ctx = layer.canvas.getContext('2d');
    
    for (let i = 0; i < this.history.length - 1; i++) {
      let pos = this.history[i];
      let nextPos = this.history[i + 1];
      
      let pointAge = this.history.length - 1 - i; 
      let alphaPercent = 1.0; // Native canvas alpha ranges from 0.0 to 1.0
      
      if (pointAge > activeZoneLength) {
        let totalFadeFrames = this.history.length - activeZoneLength;
        let framesPastActive = pointAge - activeZoneLength;
        
        if (totalFadeFrames > 0) {
          alphaPercent = 1.0 - (framesPastActive / totalFadeFrames);
        } else {
          alphaPercent = 0;
        }
        alphaPercent = constrain(alphaPercent, 0, 1.0); 
      }
      
      if (alphaPercent > 0) {
        // Set the global canvas transparency before making a stroke
        ctx.globalAlpha = alphaPercent;
        
        // Draw with a SOLID, 255-alpha color so overlapping corners cannot stack opacity
        layer.stroke(this.rChannel, this.gChannel, this.bChannel, 255); 
        layer.line(pos.x, pos.y, nextPos.x, nextPos.y); 
      }
    }
    
    // Always reset the global transparency back to 100% solid for subsequent walkers
    ctx.globalAlpha = 1.0;
  }


  // adds outline only to head
  showHead() {
    if (!this.isDead) {
      let r = red(this.color);
      let g = green(this.color);
      let b = blue(this.color);
      
      stroke(0);       
      strokeWeight(1);   
      fill(r, g, b, 255);
      ellipse(this.x, this.y, 5);
    }
  }

    step() {
    this.age++; 

    if (this.reproductionCooldown > 0) {
      this.reproductionCooldown--;
    }

    // OPTIMIZATION: Only log a coordinate position once every 4 frames 
    if (frameCount % 4 === 0) {
      this.history.push({ x: this.x, y: this.y });
    }
    
    if (this.history.length > this.maxTrailLength) {
      this.history.shift();
    }

    let xstep = random(-3, 3);
    let ystep = random(-3, 3);
    
    this.x += xstep + this.biasX;
    this.y += ystep + this.biasY;
    
    if (this.x <= 0) {
      this.biasX = abs(this.biasX);
      this.x = 1;
    } else if (this.x >= width) {
      this.biasX = -abs(this.biasX);
      this.x = width - 1;
    }
    
    if (this.y <= 0) {
      this.biasY = abs(this.biasY);
      this.y = 1;
    } else if (this.y >= height) {
      this.biasY = -abs(this.biasY);
      this.y = height - 1;
    }
  }
}

function windowResized() {
  // ADJUST: Apply the same header height subtraction here
  let calculatedHeight = windowHeight - 50;

  resizeCanvas(windowWidth, calculatedHeight);
  
  let newBuffer = createGraphics(windowWidth, calculatedHeight);
  newBuffer.clear();
  
  newBuffer.image(trailBuffer, 0, 0);
  trailBuffer = newBuffer;
}