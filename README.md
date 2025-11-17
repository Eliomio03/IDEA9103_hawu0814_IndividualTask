# IDEA9103_hawu0814_IndividualTask
# Interactive Audiovisual Animation

This project is an **audio-responsive Mondrian-style animation**, built with **p5.js**. It combines geometric composition, music input, and dynamic animation rules to transform static grids into vivid works of art.

---

## How to interact with the work

1. **Load the page**: the Mondrian grid will be displayed immediately.

2. **Click anywhere on the canvas**: play or pause the audio.

3. **When the audio is playing:**

- The red and blue squares will scale and glow.

- The red square will gradually fade out according to **bass**.

- The blue square will be gradually scaled according to **treble**.

- The small colored lines will move along the yellow lines with the audio.

4. **Adjusting the window size** will automatically scale the work.

---

## Animation driving principle

This animation is completely driven by **audio input**, and the specific use is:

- **Overall amplitude** (volume)

- **Bass frequency**

- **High-pitched frequency**

Different visual elements will react to different parts of the sound.

---

## My animation production method

My version focuses on:

- Break down the audio into bass and treble.

- Make red squares respond to bass, including scaling, glow, and transparency.

- Make the blue square respond to the treble, including scaling and glowing.

- Make the moving line move with the yellow grid and stop synchronously when the audio stops.


---

## Inspiration

![inspiration](https://github.com/user-attachments/assets/6fc54f2a-7b6b-4d78-a9d4-d7c1e86ae716)


I really love the glowing effect and the atmosphere that moves with the music in this animated poster; it has inspired and provided me with inspiration for creating a musical visualization of Mondrian's works.

---

## Technical Overview

- **p5. Amplitude()** is used to track the overall loudness.

- **p5. FFT()** is used to extract bass and treble energy.

- Visual elements are scaled by calculating the factor between 0 and 1.

- The luminous effect uses the `shadowBlur` of HTML Canvas to achieve a soft neon effect.

- Line segment animation uses simple phase offset to move the position along the grid line.

---

## My modification of the code group

The texture effects in the group's code are quite complex. Adding animation effects would put too much pressure on the webpage loading. Therefore, I removed the texture effects from the group's code for my animation.

---

## Tools used outside the course

- **shadowBlur** learned from: https://p5js.org/reference/p5/drawingContext/
Mondrian's original style is very flat, so I hope to make these color blocks look more vibrant without destroying the geometric language. Music-responsive neon lights add a modern "digital visualization" beauty without losing the sense of grid. The light intensity changes smoothly with the amplitude of the audio, making the picture vibrant and dynamic.
ShadowBlur works by adding a soft halo around any shape drawn on the HTML5 canvas. Using p5.js, we can access the underlying drawingContext, which provides underlying canvas attributes such as shadowBlur and shadowColor. After setting these values, any shape drawn later will automatically add a fuzzy color halo to its edge.

---
