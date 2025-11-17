let canvasSize;
let UNIT;
const GRID_COLS = 36;
const GRID_ROWS = 36;

const BG     = "#ffffffff";
const YELLOW = "#f4d31f";
const RED    = "#d1372a";
const BLUE   = "#2956a4";
const GREY   = "#d5cfc5";

// audio
let soundFile;
let amp;
let fft;
let audioLevel = 0; // 0–1 whole audio volume Level
let bass = 0;       // 0–1 bass volume Level
let treble = 0;     // 0–1 treble volume Level

function preload() {
  soundFile = loadSound("assets/audioTrack.mp3");
}

// _______lines and blocks_______

// YELLOW_VERTICAL_LINES [x, y, w, h]
const YELLOW_VERTICAL_LINES = [
  [1,0,1,14], [3,0,1,36], [6,0,1,36], [10,0,1,36],
  [12,16,3,5], [17,13,3,8], [21,0,1,36], [23,0,1,13], [23,16,1,20], 
  [28,0,1,36], [32,0,1,36], [34,0,1,36]
];

// YELLOW_HORIZONTAL_LINES [x, y, w, h]
const YELLOW_HORIZONTAL_LINES = [
  [0,1,36,1], [0,6,36,1], [0,13,36,1],
  [0,16,36,1], [0,20,36,1], [0,22,36,1],
  [3,25,20,1], [0,27,3,1], [0,30,36,1], [0,32,3,1], [0,34,36,1]
];

// segement [ baseX, baseY, [ dx, dy, color ] ]
const SEGMENTS = [
  // Top_horizontal
  [0, 1, [
    [2,0,RED],[4,0,BLUE],[6,0,RED],[9,0,BLUE],
    [12,0,RED],[15,0,BLUE],[18,0,RED]
  ]],
  // Middle_horizontal
  [0, 13, [
    [1,0,RED],[3,0,BLUE],[5,0,RED],[9,0,BLUE],
    [12,0,YELLOW],[15,0,RED],[18,0,BLUE]
  ]],
  // Bottom_horizontal
  [0, 20, [
    [1,0,BLUE],[3,0,RED],[5,0,BLUE],[7,0,RED],
    [9,0,BLUE],[11,0,RED],[13,0,BLUE]
  ]],
  // Left vertical line
  [1, 0, [
    [0,2,RED],[0,4,BLUE],[0,6,RED],[0,20,BLUE],[0,16,RED], [0,27,BLUE], [0,32,RED]
  ]],
  // Middle vertical line
  [23, 0, [
    [0,2,RED],[0,4,BLUE],[0,6,RED],[0,9,BLUE],
    [0,13,YELLOW],[0,16,RED]
  ]],
  // right vertical line
  [32, 0, [
    [0,3,BLUE],[0,5,RED],[0,8,BLUE],[0,11,RED],[0,15,BLUE]
  ]],
  // Middle
  [0, 22, [
    [3,0,BLUE],[5,0,RED],[8,0,BLUE],[11,0,RED],[15,0,BLUE], 
    [17,0,BLUE],[19,0,RED],[21,0,BLUE],[24,0,RED],[26,0,BLUE], 
    [28,0,RED],[30,0,BLUE],[32,0,RED],[34,0,BLUE]
  ]],
  // Short middle line
  [0, 25, [
    [3,0,BLUE],[5,0,RED],[8,0,BLUE],[11,0,RED],[15,0,BLUE], 
    [17,0,BLUE],[19,0,RED],[21,0,BLUE],[23,0,RED]
  ]],
  // The bottom line above
  [0, 30, [
    [3,0,BLUE],[5,0,RED],[8,0,BLUE],[11,0,RED],[15,0,BLUE], 
    [17,0,BLUE],[19,0,RED],[21,0,BLUE],[24,0,RED],[26,0,BLUE], 
    [28,0,RED],[30,0,BLUE],[32,0,RED],[34,0,BLUE]
  ]],
  // Bottom
  [0, 34, [
    [3,0,BLUE],[5,0,RED],[8,0,BLUE],[11,0,RED],[15,0,BLUE], 
    [17,0,BLUE],[19,0,RED],[21,0,BLUE],[24,0,RED],[26,0,BLUE], 
    [28,0,RED],[30,0,BLUE],[32,0,RED],[34,0,BLUE]
  ]]
];

// big red and blue blocks [x, y, w, h]
const RED_BLOCKS = [
  [7,2,2,4],
  [11,2,3,4],
  [7,17,3,2],
  [30,28,3,3],
  [17,34,3,2],
  [25,17,3,5]
];

const BLUE_BLOCKS = [
  [4,8,3,3],
  [4,26,3,3],
  [12,17,3,3],
  [24,7,3,6]
];

// red block with white block and yellow segments inside it
const NESTED_A = {
  base: [26,4],
  outer: [0,0,4,6,RED],
  inner: [1,1,2,2,BG],
  yellowOffsets: [ [-1,-1],[2,-1],[-1,1],[2,1],[0,0] ],
  yellowBaseOffset: [1,3]
};

const NESTED_B = {
  base: [18,16],
  outer: [0,0,4,7,RED],
  inner: [1,1,2,3,BG],
  yellowOffsets: [ [-1,0],[2,0],[-1,2],[2,2],[0,1] ],
  yellowBaseOffset: [1,4]
};

// grey dots [x, y]
const GREY_DOTS = [
  [3,2],[10,2],[10,6],[24,6],[17,13],[15,13],[6,17]
];

// _______Mondrian class_______
class Mondrian {
  constructor() {
    this.rects = [];          // lines blocks nested dots
    this.segmentGroups = [];  // red/blue segments animation
    this.build();
  }

  addRect(gx, gy, gw, gh, colorVal) {
    this.rects.push({ gx, gy, gw, gh, color: colorVal });
  }

  addBatch(list, colorVal) {
    list.forEach(([x,y,w,h]) => this.addRect(x, y, w, h, colorVal));
  }

  addOffsetPoints(baseX, baseY, points) {
    points.forEach(([dx,dy,colorVal]) => {
      this.addRect(baseX + dx, baseY + dy, 1, 1, colorVal);
    });
  }

  build() {
    this.buildYellow();
    this.buildSegments();
    this.buildBlocks();
    this.buildNested();
    this.buildGreys();
  }

  // yellow lines keep still
  drawStaticYellow() {
    for (const r of this.rects) {
      if (r.color !== YELLOW) continue;
      fill(r.color);
      rect(r.gx * UNIT, r.gy * UNIT, r.gw * UNIT, r.gh * UNIT);
    }
  }

  // other blocks
    // red block / nested：scaling + glow + transparency changes based on bass 
    // blue block：scaling + glow  based on treble
    // segments：stay still
  drawAnimatedNonSegmentRects() {
    for (const r of this.rects) {
      if (r.color === YELLOW) continue;

      const baseC = color(r.color);

      const isRedBlockOrNested  = (r.color === RED  && (r.gw > 1 || r.gh > 1));
      const isBlueBlockOrNested = (r.color === BLUE && (r.gw > 1 || r.gh > 1));

      if (isRedBlockOrNested || isBlueBlockOrNested) {

        const bandValue = isRedBlockOrNested ? bass : treble;

        // Transparency: The red blocks change with the music, while the blue blocks remain fixed and opaque.
        const blockAlpha = isBlueBlockOrNested
          ? 255
          : 255 * bandValue;

        // scaling
        const maxScaleAmp = 0.4;
        const scaleFactor = 1 + maxScaleAmp * bandValue;

        const gx = r.gx * UNIT;
        const gy = r.gy * UNIT;
        const gw = r.gw * UNIT;
        const gh = r.gh * UNIT;
        const cx = gx + gw / 2;
        const cy = gy + gh / 2;

        const cr = red(baseC);
        const cg = green(baseC);
        const cb = blue(baseC);

        push();
        translate(cx, cy);
        scale(scaleFactor);
        rectMode(CENTER);

        // glowing effect
        const glowStrength = 80 * bandValue;
        drawingContext.shadowBlur = glowStrength;
        drawingContext.shadowColor = `rgba(${cr}, ${cg}, ${cb}, ${blockAlpha / 255})`;

        fill(cr, cg, cb, blockAlpha);
        rect(0, 0, gw, gh);

        drawingContext.shadowBlur = 0;
        pop();

      } else {
        fill(baseC);
        rect(r.gx * UNIT, r.gy * UNIT, r.gw * UNIT, r.gh * UNIT);
      }
    }
  }


  // red/blue segments：Move along the yellow line
  drawAnimatedSegments() {
    for (const g of this.segmentGroups) {
      for (const [dx, dy, c] of g.points) {
        const gx = g.baseX + dx;
        const gy = g.baseY + dy;
        fill(c);
        rect(gx * UNIT, gy * UNIT, UNIT, UNIT);
      }
    }
  }

  // build yellow lines
  buildYellow() {
    this.addBatch(YELLOW_VERTICAL_LINES,   YELLOW);
    this.addBatch(YELLOW_HORIZONTAL_LINES, YELLOW);
  }

  // build segments：Save only to segmentGroups, do not draw into rects
  buildSegments() {
    const dirs = ["h","h","h","v","v","v","h","h","h","h"];
    SEGMENTS.forEach(([baseX, baseY, points], idx) => {
      this.segmentGroups.push({
        baseX,
        baseY,
        points,
        dir: dirs[idx],
        phase: 0
      });
    });
  }

  // big red blue blocks
  buildBlocks() {
    this.addBatch(RED_BLOCKS,  RED);
    this.addBatch(BLUE_BLOCKS, BLUE);
  }

  // red block with white block and yellow segments inside it
  buildNestedBlock(config) {
    const [bx, by] = config.base;
    const [ox, oy, ow, oh, outerColor] = config.outer;
    const [ix, iy, iw, ih, innerColor] = config.inner;
    const [ybx, yby] = config.yellowBaseOffset;

    this.addRect(bx + ox, by + oy, ow, oh, outerColor); 
    this.addRect(bx + ix, by + iy, iw, ih, innerColor); 
    
    config.yellowOffsets.forEach(([dx,dy]) => {
      this.addRect(bx + ybx + dx, by + yby + dy, 1, 1, YELLOW);
    });
  }

  buildNested() {
    this.buildNestedBlock(NESTED_A);
    this.buildNestedBlock(NESTED_B);
  }

  // grey dots
  buildGreys() {
    GREY_DOTS.forEach(([x,y]) => this.addRect(x, y, 1, 1, GREY));
  }
}

// ___________main___________
let mondrian;

function setup() {
  createCanvas(800, 800);
  resizeCanvasCalc();
  rectMode(CORNER);
  noStroke();

  mondrian = new Mondrian();

  amp = new p5.Amplitude();
  amp.setInput(soundFile);

  fft = new p5.FFT(0.8, 1024);
  fft.setInput(soundFile);

  frameRate(30);
}

function draw() {
  background(BG);

  if (!soundFile || !soundFile.isLoaded()) {
    fill(0);
    textAlign(CENTER, CENTER);
    textSize(18);
    text("Loading audio file...", width / 2, height / 2);
    return;
  }

  updateAudioLevel();
  updateFrequencyBands();


  mondrian.drawStaticYellow();
  mondrian.drawAnimatedSegments();
  mondrian.drawAnimatedNonSegmentRects();

  drawLevelBar();

  push();
  fill(0, 120);
  textAlign(CENTER, BOTTOM);
  textSize(14);
  text("Click canvas to play / pause audio", width / 2, height - 60);
  pop();
}

function updateAudioLevel() {
  if (soundFile && soundFile.isPlaying()) {
    let level = amp.getLevel();
    audioLevel = constrain(level * 4, 0, 1);
  } else {
    audioLevel *= 0.9;
  }
}

function updateFrequencyBands() {
  if (soundFile && soundFile.isPlaying()) {
    fft.analyze();
    bass   = constrain(map(fft.getEnergy("bass"),   0, 255, 0, 1), 0, 1);
    treble = constrain(map(fft.getEnergy("treble"), 0, 255, 0, 1), 0, 1);
  } else {
    bass   *= 0.9;
    treble *= 0.9;
  }
}

function drawLevelBar() {
  push();
  noStroke();
  fill(0, 40);
  rect(10, 10, 120, 10);
  fill(0);
  rect(10, 10, 120 * audioLevel, 10);
  pop();
}

function windowResized() {
  resizeCanvasCalc();
}

function resizeCanvasCalc() {
  canvasSize = min(windowWidth, windowHeight);
  UNIT = canvasSize / GRID_COLS;
  resizeCanvas(canvasSize, canvasSize);
}

function mousePressed() {
  if (getAudioContext().state !== "running") {
    getAudioContext().resume();
  }
  if (!soundFile || !soundFile.isLoaded()) return;

  if (soundFile.isPlaying()) {
    soundFile.pause();
  } else {
    soundFile.loop();
  }
}
