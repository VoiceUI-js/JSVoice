const micBtn = document.getElementById('micBtn');
const wave = document.getElementById('wave');
const status = document.getElementById('status');

const barCount = 12;
let isListening = false;
let animFrame = null;

// Create bars
wave.innerHTML = '';
const bars = [];
for (let i = 0; i < barCount; i++) {
  const bar = document.createElement('div');
  bar.className = 'bar';
  wave.appendChild(bar);
  bars.push(bar);
}

// Animation loop
function animateWave() {
  if (!isListening) {
    bars.forEach(bar => bar.style.height = '10px');
    return;
  }
  const t = Date.now() / 300;
  bars.forEach((bar, i) => {
    const scale = 10 + 28 * Math.abs(Math.sin(t + i * 0.4));
    bar.style.height = `${scale}px`;
  });
  animFrame = requestAnimationFrame(animateWave);
}

// Start/stop animation and update opacity for visual feedback
function setListening(listen) {
  isListening = listen;
  if (listen) {
    wave.style.opacity = '1';
    status.textContent = 'Listening...';
    animFrame = requestAnimationFrame(animateWave);
  } else {
    wave.style.opacity = '0.4';
    status.textContent = 'Mic is idle. Click to listen.';
    cancelAnimationFrame(animFrame);
    animateWave(); // reset bars
  }
}

// Toggle listening state on button click
micBtn.addEventListener('click', () => {
  setListening(!isListening);
});