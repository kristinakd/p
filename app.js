const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const spinBtn = document.getElementById("spinBtn");
const resultEl = document.getElementById("result");

// Значения по кругу (можно менять порядок/кол-во)
const values = [
  400, 350, 500, 600, 750, 550, 350, 500, 1000, 0, 450, 550, 400, 500,
  500, "x2", 600, 700, 400, "+", 600, 350, 500, 450, 400, 600, 350, 500,
  "ш", 400, 600, 500, 200, 300, 350, 600, "п", 500, 600, "x2"
];

const segments = values.map((label, i) => ({
  label: String(label),
  color: i % 2 === 0 ? "#2f3a8f" : "#f7f2ea"
}));

let currentAngle = 0;
let isSpinning = false;
const POINTER_ANGLE = -Math.PI / 2; // вверх (под стрелкой)

function drawWheel() {
  const size = canvas.width;
  const radius = size / 2;
  const slice = (Math.PI * 2) / segments.length;
  const ringWidth = radius * 0.2;
  const innerRadius = radius - ringWidth;
  const baseOffset = POINTER_ANGLE - slice / 2;

  ctx.clearRect(0, 0, size, size);
  ctx.save();
  ctx.translate(radius, radius);
  ctx.rotate(currentAngle + baseOffset);

  // Фон круга, чтобы не было "прозрачных" участков
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fillStyle = "#f7f2ea";
  ctx.fill();

  // Основные сектора
  segments.forEach((seg, i) => {
    const start = i * slice;
    const end = start + slice;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, innerRadius, start, end);
    ctx.closePath();
    ctx.fillStyle = seg.color;
    ctx.fill();

    ctx.strokeStyle = "rgba(0,0,0,0.12)";
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  // Внешний пояс с чередованием белого и синего
  segments.forEach((seg, i) => {
    const start = i * slice;
    const end = start + slice;

    ctx.beginPath();
    ctx.arc(0, 0, radius, start, end);
    ctx.arc(0, 0, innerRadius, end, start, true);
    ctx.closePath();

    ctx.fillStyle = i % 2 === 0 ? "#2f3a8f" : "#ffffff";
    ctx.fill();

    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  // Подписи на поясе без табличек
  segments.forEach((seg, i) => {
    const center = i * slice + slice / 2;

    ctx.save();
    ctx.rotate(center);
    const boxRadius = radius - ringWidth * 0.55;
    ctx.translate(0, -boxRadius);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const maxWidth = (radius * slice) * 0.8;
    let fontSize = Math.max(9, Math.floor(ringWidth * 0.4));
    ctx.font = `${fontSize}px 'Trebuchet MS', sans-serif`;
    while (ctx.measureText(seg.label).width > maxWidth && fontSize > 8) {
      fontSize -= 1;
      ctx.font = `${fontSize}px 'Trebuchet MS', sans-serif`;
    }
    ctx.fillStyle = i % 2 === 0 ? "#ffffff" : "#2f3a8f";
    ctx.fillText(seg.label, 0, 0);
    ctx.restore();
  });

  // Центр
  ctx.beginPath();
  ctx.arc(0, 0, 10, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.2)";
  ctx.stroke();

  ctx.restore();
}

function spin() {
  if (isSpinning) return;
  isSpinning = true;
  spinBtn.disabled = true;
  resultEl.textContent = "Результат: крутится...";

  const fullRotations = 6 + Math.random() * 4;
  const extraAngle = Math.random() * Math.PI * 2;
  const targetAngle = currentAngle + fullRotations * Math.PI * 2 + extraAngle;

  const duration = 4800 + Math.random() * 700;
  const start = performance.now();
  const initialAngle = currentAngle;

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function animate(now) {
    const elapsed = now - start;
    const t = Math.min(elapsed / duration, 1);
    const eased = easeOutCubic(t);

    currentAngle = initialAngle + (targetAngle - initialAngle) * eased;
    drawWheel();

    if (t < 1) {
      requestAnimationFrame(animate);
    } else {
      isSpinning = false;
      spinBtn.disabled = false;
      showResult();
    }
  }

  requestAnimationFrame(animate);
}

function showResult() {
  const slice = (Math.PI * 2) / segments.length;
  const normalized =
    (Math.PI * 2 - ((currentAngle + POINTER_ANGLE - slice / 2) % (Math.PI * 2))) %
    (Math.PI * 2);
  const index = Math.floor(normalized / slice) % segments.length;
  const winner = segments[index];

  resultEl.textContent = `Результат: ${winner.label}`;
}

spinBtn.addEventListener("click", spin);

function resize() {
  const size = Math.min(600, Math.floor(window.innerWidth * 0.8));
  canvas.width = size;
  canvas.height = size;
  drawWheel();
}

window.addEventListener("resize", resize);
resize();
