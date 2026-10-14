// lifespan and things dependant on lifespan
let currentMaxLifespan;
let currentMaturityAge;
let currentBirthCooldown;
let gestationPeriod;

// controlled with sliders
let maxActiveBugs;
let birthChance;

// no touchy
let bugs = [];
let totalPopulation = 6; // starting population
let isFirstBirth = true; // sets the fertility to 100% for the first mating event
let img;

// unique ID generators for incest prevention
let globalIdCounter = 0;
let globalLitterCounter = 0;

// slider variables
let popSlider, chanceSlider, lifespanSlider;

async function setup() {
  createCanvas(windowWidth, windowHeight - 50);
  background(255);
  img = await loadImage("leaves.jpg");

  // slider format: createSlider(min, max, default, step)
  popSlider = createSlider(10, 200, 100, 10);
  popSlider.position(20, 110);
  popSlider.style("width", "150px");

  chanceSlider = createSlider(0.05, 1, 0.75, 0.05);
  chanceSlider.position(20, 150);
  chanceSlider.style("width", "150px");

  lifespanSlider = createSlider(500, 10000, 5000, 500);
  lifespanSlider.position(20, 190);
  lifespanSlider.style("width", "150px");

  updateGlobalMilestones();

  // evenly distributes bugs around a ring, all facing the center
  spawnInitialParents();
} // end of setup()

function draw() {
  // updates values based on sliders
  maxActiveBugs = popSlider.value();
  birthChance = chanceSlider.value();
  updateGlobalMilestones();

  let ar = img.width / img.height;
  background(255);
  image(img, 0, 0, img.width, img.height / ar);

  // update and render active bugs
  for (let i = 0; i < bugs.length; i++) {
    let w = bugs[i];
    if (!w.isDead) {
      w.step();
      w.show();
    }
  }

  // remove dead bugs
  for (let i = bugs.length - 1; i >= 0; i--) {
    if (bugs[i].isDead) {
      console.log("dead")
      bugs.splice(i, 1);
    }
  }

  // collision and pregnancy system
  // fun fact: for bugs you would typically use the word "gravid" instead of "pregnant"
  // however I didn't know that when I started, so I'm sticking with "pregnant"
  let aliveCount = bugs.filter((w) => !w.isDead).length;

  for (let i = 0; i < bugs.length; i++) {
    for (let j = i + 1; j < bugs.length; j++) {
      let w1 = bugs[i];
      let w2 = bugs[j];

      // base radius for both bugs
      let r1 = w1.d;
      let r2 = w2.d;

      // if a bug is pregnant, expand its collision radius to account for stroke weight
      if (w1.isPregnant && w1.mateColor) r1 += 1.5;
      if (w2.isPregnant && w2.mateColor) r2 += 1.5;

      let distanceBetween = dist(
        w1.renderX,
        w1.renderY,
        w2.renderX,
        w2.renderY
      );
      let combinedRadii = r1 + r2;

      if (distanceBetween <= combinedRadii) {
        // incest check
        let areSiblings = w1.litterId !== null && w1.litterId === w2.litterId;
        let isParentChild =
          w1.id === w2.parent1Id ||
          w1.id === w2.parent2Id ||
          w2.id === w1.parent1Id ||
          w2.id === w1.parent2Id;
        let isRelated = areSiblings || isParentChild;

        // check if bugs are viable parents on collision
        let w1Ready =
          !w1.isDead &&
          w1.age >= w1.myMaturityAge &&
          w1.age <= w1.myLifespan &&
          w1.reproductionCooldown === 0 &&
          !w1.isPregnant;
        let w2Ready =
          !w2.isDead &&
          w2.age >= w2.myMaturityAge &&
          w2.age <= w2.myLifespan &&
          w2.reproductionCooldown === 0 &&
          !w2.isPregnant;

        // do the pregnancy stuff
        if (w1Ready && w2Ready && aliveCount < maxActiveBugs && !isRelated) {
          if (isFirstBirth || random(1) < birthChance) {
            isFirstBirth = false;

            // randomize which parent gets pregnant
            let pregnantParent = random(1) < 0.5 ? w1 : w2;
            let otherParent = pregnantParent === w1 ? w2 : w1;

            // set a bunch of stuff for both the pregnant bug and its pending offspring
            pregnantParent.isPregnant = true;
            pregnantParent.gestationTimer = gestationPeriod;
            pregnantParent.pendingLitterSize = int(random(1, 6));
            pregnantParent.mateColor = otherParent.color;
            pregnantParent.pendingChildColor = lerpColor(
              pregnantParent.color,
              otherParent.color,
              0.5
            );

            pregnantParent.pendingParent1Id = pregnantParent.id;
            pregnantParent.pendingParent2Id = otherParent.id;

            pregnantParent.reproductionCooldown =
              pregnantParent.myBirthCooldown;
          }
        }

        // right-of-way logic
        let w1IsAdult = w1.d === 10;
        let w2IsAdult = w2.d === 10;

        if (w1IsAdult && !w2IsAdult) {
          // Bug 1 is an adult, Bug 2 is a juvenile. Bug 2 inverts directional bias.
          w2.biasX = -w2.biasX;
          w2.biasY = -w2.biasY;
        } else if (!w1IsAdult && w2IsAdult) {
          // Bug 1 is a juvenile, Bug 2 is an adult. Bug 1 inverts directional bias.
          w1.biasX = -w1.biasX;
          w1.biasY = -w1.biasY;
        } else {
          // Adult vs Adult OR Juvenile vs Juvenile. Swap directional bias.
          let tempBiasX = w1.biasX;
          let tempBiasY = w1.biasY;
          w1.biasX = w2.biasX;
          w1.biasY = w2.biasY;
          w2.biasX = tempBiasX;
          w2.biasY = tempBiasY;
        }

        // dont overlap or i will get mad
        let overlap = combinedRadii - distanceBetween;
        let dx = (w2.renderX - w1.renderX) / (distanceBetween || 1);
        let dy = (w2.renderY - w1.renderY) / (distanceBetween || 1);

        // nudge target vectors
        w1.x -= dx * (overlap / 2);
        w1.y -= dy * (overlap / 2);
        w2.x += dx * (overlap / 2);
        w2.y += dy * (overlap / 2);

        // nudge render vectors
        w1.renderX -= dx * (overlap / 2);
        w1.renderY -= dy * (overlap / 2);
        w2.renderX += dx * (overlap / 2);
        w2.renderY += dy * (overlap / 2);
      }
    }
  }

  // automatically reset simulation if there are no bugs remaining
  if (bugs.length === 0) {
    globalIdCounter = 0;
    globalLitterCounter = 0;
    spawnInitialParents();
    totalPopulation = 6;
    isFirstBirth = true;
  }

  // draw the user interface
  drawUI();
} // end of draw()

// evenly distributes bugs around a ring, all facing the center
function spawnInitialParents() {
  let centerX = width / 2;
  let centerY = height / 2;
  let ringRadius = 150; // The radius of the starting circle layout

  // loop through the starting population amount
  for (let i = 0; i < totalPopulation; i++) {
    // calculate angles based on size of starting population
    let positionAngle = (TWO_PI / totalPopulation) * i;

    // calculate coordinates on the ring circumference
    let startX = centerX + cos(positionAngle) * ringRadius;
    let startY = centerY + sin(positionAngle) * ringRadius;

    // make them face the center by facing the opposite side of the circle
    let facingAngle = positionAngle + PI;

    // spawn a new bug facing that direction
    let w = new Bug(startX, startY, null, facingAngle, null, null, null);

    // ensure starting population are all adults
    w.age = currentMaturityAge;
    w.d = 10;
    w.myLifespan = currentMaxLifespan;
    w.myMaturityAge = currentMaturityAge;
    w.myBirthCooldown = currentBirthCooldown;

    bugs.push(w);
  }
} // end of spawnInitialParents()

// update sliders and cooldown lengths
function updateGlobalMilestones() {
  currentMaxLifespan = lifespanSlider.value();
  currentMaturityAge = int(currentMaxLifespan * 0.25);
  currentBirthCooldown = int(currentMaxLifespan * 0.25);
  gestationPeriod = int(currentMaxLifespan * 0.1);
}

// UI box
function drawUI() {
  fill(0, 0, 0, 100);
  noStroke();
  rect(15, 15, 190, 190, 5);

  fill(255);
  textSize(14);
  textAlign(LEFT, TOP);

  let aliveCount = bugs.filter((w) => !w.isDead).length;

  // counters
  text("Living Population: " + aliveCount, 25, 25);
  text("Historical Population: " + totalPopulation, 25, 45);

  // slider text
  text("Max Population: " + maxActiveBugs, 25, 75);
  text("Fertility: " + (birthChance * 100).toFixed(0) + "%", 25, 115);
  text("Lifespan: " + currentMaxLifespan + " frames", 25, 155);
} // end of drawUI()

class Bug {
  constructor(startX, startY, parentColor, forcedAngle, p1Id, p2Id, litId) {
    let minMutation = 10;
    let maxMutation = 20;
    let constantBias = 0.3;

    // unique ID
    this.id = globalIdCounter;
    globalIdCounter++;

    // lineage trackers
    this.parent1Id = p1Id;
    this.parent2Id = p2Id;
    this.litterId = litId;

    // starting positions
    this.x = startX;
    this.y = startY;
    this.renderX = startX;
    this.renderY = startY;

    // other starter stats
    this.d = 5;
    this.age = 0;
    this.isDying = false;
    this.isDead = false;
    this.reproductionCooldown = 0;

    this.myLifespan = currentMaxLifespan;
    this.myMaturityAge = currentMaturityAge;
    this.myBirthCooldown = currentBirthCooldown;

    this.isPregnant = false;
    this.gestationTimer = 0;
    this.pendingLitterSize = 0;
    this.pendingChildColor = null;
    this.mateColor = null;

    this.pendingParent1Id = null;
    this.pendingParent2Id = null;
    this.displayHeadColor = color(0)
    this.alpha = 255;

    // color mutation stuff
    if (parentColor) {
      let pr = red(parentColor);
      let pg = green(parentColor);
      let pb = blue(parentColor);
      let headColor = color(0);

      let r = constrain(
        pr + this.getForcedRandom(minMutation, maxMutation),
        100,
        200
      );
      let g = constrain(
        pg + this.getForcedRandom(minMutation, maxMutation),
        100,
        200
      );
      let b = constrain(
        pb + this.getForcedRandom(minMutation, maxMutation),
        100,
        200
      );

      this.color = color(r, g, b);
    } else {
      this.color = color(random(100, 200), random(100, 200), random(100, 200));
    }

    // directional bias
    let angle = forcedAngle !== undefined ? forcedAngle : random(TWO_PI);
    this.biasX = cos(angle) * constantBias;
    this.biasY = sin(angle) * constantBias;

    // render angle to smooothly change the head's position based on facing direction
    this.renderAngle = angle;
    // render diameter for changing size upon reaching maturity
    this.renderD = 5; // starts at juvenile size
  } // end of constructor

  getForcedRandom(minVal, maxVal) {
    let change = random(minVal, maxVal);
    if (random(1) < 0.5) {
      change *= -1;
    }
    return change;
  }

  step() {
    // increase age
    this.age++;

    // chance of death upon reaching old age (added 120 so they dont die before the color fades)
    if (this.age > this.myLifespan + 120) {
      if (random(1) < 0.002) {
        this.isDying = true;
      }
    }
    if (this.isDying === true) {
      this.color.setAlpha(this.alpha);
      this.displayHeadColor.setAlpha(this.alpha);
      this.alpha-=2;
    }

    if (alpha(this.color) < 0) {
      this.isDead = true;
    }

    // grow upon reaching maturity
    if (this.age >= this.myMaturityAge) {
      this.d = 10;
    } else {
      this.d = 5;
    }

    // smooothly transition between juvenile and adult size
    this.renderD = lerp(this.renderD, this.d, 0.05);

    // decrease reproduction cooldown
    if (this.reproductionCooldown > 0) {
      this.reproductionCooldown--;
    }

    // decrease gestation timer
    if (this.isPregnant) {
      this.gestationTimer--;

      if (this.gestationTimer <= 0) {
        // update living population counter
        let currentAliveCount = bugs.filter((w) => !w.isDead).length;

        // update litter ID counter
        let currentLitterId = "L_" + globalLitterCounter;
        globalLitterCounter++;

        // optional: keep track of current litter ID
        console.log(currentLitterId);

        // new juvenile bug
        for (let k = 0; k < this.pendingLitterSize; k++) {
          if (currentAliveCount < maxActiveBugs) {
            let childBug = new Bug(
              this.x,
              this.y,
              this.pendingChildColor,
              undefined,
              this.pendingParent1Id,
              this.pendingParent2Id,
              currentLitterId
            );
            bugs.push(childBug);

            // increase population counters
            totalPopulation++;
            currentAliveCount++;
          }
        }

        // reset previously pregnant bug
        this.isPregnant = false;
        this.pendingLitterSize = 0;
        this.pendingChildColor = null;
        this.mateColor = null;
        this.pendingParent1Id = null;
        this.pendingParent2Id = null;
      }
    }

    // max crawl speed
    let speed = 3;
    if (this.age > this.myLifespan) {
      speed = 1; // slow down elderly bugs
    }

    // movement
    let xstep = random(-speed, speed);
    let ystep = random(-speed, speed);

    this.x += xstep + this.biasX;
    this.y += ystep + this.biasY;

    // smooothing out how the movement is rendered
    let smoooth = 0.08;
    this.renderX = lerp(this.renderX, this.x, smoooth);
    this.renderY = lerp(this.renderY, this.y, smoooth);

    // bounces off LEFT wall
    if (this.x <= this.d) {
      this.biasX = abs(this.biasX);
      this.x = this.d + 1;
    } else if (this.x >= width - this.d) {
      // bounces off RIGHT wall
      this.biasX = -abs(this.biasX);
      this.x = width - this.d - 1;
    }

    // bounces off CEILING
    if (this.y <= this.d) {
      this.biasY = abs(this.biasY);
      this.y = this.d + 1;
    } else if (this.y >= height - this.d) {
      // bounces off FLOOR
      this.biasY = -abs(this.biasY);
      this.y = height - this.d - 1;
    }
  } // end of step()

  show() {
    // calculate movement for the head
    let dx = this.x - this.renderX;
    let dy = this.y - this.renderY;
    let targetAngle =
      dx === 0 && dy === 0 ? atan2(this.biasY, this.biasX) : atan2(dy, dx);

    let angleDiff = targetAngle - this.renderAngle;
    while (angleDiff < -PI) angleDiff += TWO_PI;
    while (angleDiff > PI) angleDiff -= TWO_PI;
    this.renderAngle += angleDiff * 0.08;

    // juvenile/adult colors
    let displayBodyColor = this.color;
    //let displayHeadColor = this.displayHeadColor;

    if (this.age > this.myLifespan) {
      // calculate how many frames they have been elderly
      let framesElderly = this.age - this.myLifespan;

      // map the transition to happen smooothly over 120 frames (2 seconds)
      let agingFactor = constrain(framesElderly / 120, 0, 1);

      // fade body color to be 75% elderly grey and 25% original color
      let targetGreyBody = color(240);
      displayBodyColor = lerpColor(
        this.color,
        targetGreyBody,
        agingFactor * 0.75
      );

      // fade head color from black to grey
      let targetGreyHead = color(120);
      this.displayHeadColor = lerpColor(color(0), targetGreyHead, agingFactor);
    }

    // layer the head underneath the body
    let headX = this.renderX + cos(this.renderAngle) * this.renderD;
    let headY = this.renderY + sin(this.renderAngle) * this.renderD;
    let headDiameter = this.renderD * 1.0;

    // head visual
    noStroke();
    fill(this.displayHeadColor);
    circle(headX, headY, headDiameter);

    // layer the main body over the head
    if (this.isPregnant && this.mateColor) {
      // match mate's body color on outline if pregant
      stroke(this.mateColor);
      strokeWeight(3);
    } else {
      noStroke();
    }

    // body visual
    fill(displayBodyColor);
    circle(this.renderX, this.renderY, this.renderD * 2);
  } // end of show()
} // end of class Bug

// automatically resizes canvas
function windowResized() {
  resizeCanvas(windowWidth, windowHeight - 50);
}
