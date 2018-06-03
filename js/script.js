var capture;

var buff;
var lineNum = 8;
var linesColor = [];

var linesXPos = [];
var linesMovSpeed = [];
var linesTrigger = [];
var linesOldSum = [];

var polySynth;

var startPosition;

var noteListWhole = [
"C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5", "G#4", "A4", "A#4",
"B4", "C5", "D5", "C5", "F#5", "E5", "A#5", "G#5", "C6", "D6"
];

var cameraScreenRatio;

var canvasWidth = 1100;
var canvasHeight = 600;

var oldSumInitialized = false;

function preload(){

}


function setup() {

    createCanvas(canvasWidth, canvasHeight);

    let reverb = new Tone.JCReverb(0.4).connect(Tone.Master);
    let delay = new Tone.FeedbackDelay(0.1);

    polySynth = new Tone.PolySynth(6, Tone.Synth);
    let vol = new Tone.Volume(-15);
    // polySynth.chain(delay, reverb);
    polySynth.chain(vol, reverb).chain(vol, delay).chain(vol, Tone.Master);


    let constraints = {
        audio: false,
        video: {
            facingMode: "user"
        }
    };

    capture = createCapture(constraints);
    //capture = createCapture(VIDEO);
    capture.size(1100, 600);
    // capture.hide();
    cameraScreenRatio = 600 / 240;

    buff = createImage(1100, 600);

    //startPosition = 80 * cameraScreenRatio;
    startPosition = 50;

    for (let i = 0; i < lineNum; i++) {
        linesXPos.push(0);
        linesMovSpeed.push(0.0);
        linesTrigger.push(true);
        linesOldSum.push(255);
    }
}


function draw() {

  if (!oldSumInitialized){
    setTimeout(initColorCapture, 2000);
  }
  else{
      trigger();
      lineColorCapture();
      pathLineDraw();
    }



    push();
    translate(0, 0);
    image(buffImageUpdate(capture), 0, startPosition, canvasWidth, canvasHeight-startPosition);
    pop();

}



var buffImageUpdate = function(_capture){

    _capture.loadPixels();
    buff.loadPixels();

    for (let y = 0; y < _capture.height; y++) {
        for (let x = 0; x < _capture.width; x++) {
            if (y > startPosition) {
                let i = y * _capture.width + (_capture.width - 1 - x);
                let _c = [_capture.pixels[i * 4 + 0], _capture.pixels[i * 4 + 1], _capture.pixels[i * 4 + 2], 255];
                buff.set(x, y, _c);
            }
        }
    }

    buff.updatePixels();

    return buff;
};



function lineColorCapture(){
    for (let i = 0; i < lineNum; i++) {
        //let _index = (i) * capture.width / lineNum;
        y = startPosition-22;
        x = - (i/lineNum) * capture.height;
        let offset = (y*capture.width) + x;
        //console.log(_index);
        //let offset = ((_y*width)+_x)*4
        linesColor[i] = [capture.pixels[offset*8 - 4], capture.pixels[offset*8 - 3], capture.pixels[offset*8 - 2], 255];
    }
}

function initColorCapture(){
    for (let i = 0; i < lineNum; i++) {
        //let _index = (i) * capture.width / lineNum;
        y = startPosition-22;
        x = - (i/lineNum) * capture.height;
        let offset = (y*capture.width) + x;
        //console.log(_index);
        //let offset = ((_y*width)+_x)*4
        linesColor[i] = [capture.pixels[offset*8 - 4], capture.pixels[offset*8 - 3], capture.pixels[offset*8 - 2], 255];
        linesOldSum[i] = (linesColor[i][0] + linesColor[i][1] + linesColor[i][2]) / 3.0;
    }

    if (!isNaN(linesOldSum[0]) && linesOldSum[0] != 0){
      oldSumInitialized = true;
    }
}


function pathLineDraw(){

    push();
    for (let i = 0; i < linesColor.length; i++) {
        stroke(linesColor[i]);
        strokeWeight(canvasWidth / lineNum * 0.5);
        line((i+0.5) * canvasWidth / lineNum, 0, (i+0.5) * canvasWidth / lineNum, startPosition+40);
    }
    pop();

}


function trigger(){

    var threshold = 8;
    var speed = 1;

    for (let i = 0; i < linesColor.length; i++) {
        let _colorValueSum = (linesColor[i][0] + linesColor[i][1] + linesColor[i][2]) / 3.0;
        let _diffColorValue = abs(_colorValueSum - linesOldSum[i]);
        if (_diffColorValue > 50 && linesTrigger[i] == true) {
            linesTrigger[i] = false;
            //linesOldSum[i] = _colorValueSum;

            polySynth.triggerAttackRelease(noteListWhole[i], "8t");

        }

        if (linesTrigger[i] == false){
          linesXPos[i] += speed;
        }

        if (linesXPos[i] >= threshold){
          linesTrigger[i] = true;
          linesXPos[i] = 0;
        }



    }

}
