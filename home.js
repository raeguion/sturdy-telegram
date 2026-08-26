//this is how you format comments in .js

console.log("hello world!")

function setup () {
    createCanvas (windowWidth,windowHeight)
}

function draw () {
    //background (200)
    rectMode(CENTER)
    rect(mouseX,mouseY,50,50)
    
}

function windowResized(){
    resizeCanvas(windowWidth, windowHeight)

}