const state = {
  metrics: {
    flatnessRate: 0,
    flatnessPeak: 0,
    slopeRate: 0,
    slopeAvg: 0,
    reworkRate: 0,
    reworkCount: 0,
    efficiency: 0,
    efficiencyGain: 0,
  },
  production: [],
  scanTasks: [],
  alerts: [],
  auditLogs: [],
  commandLogs: [],
  heatmap: {
    mode: 'flatness',
    threshold: 4,
    grid: [],
  },
};

const navButtons = Array.from(document.querySelectorAll('.nav-item'));
const panels = Array.from(document.querySelectorAll('.panel'));

navButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.target;
    if (!target) return;
    navButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    panels.forEach(panel => panel.classList.toggle('active', `#${panel.id}` === target));
  });
});

const toast = document.getElementById('toast');
const showToast = (message = '操作已完成（模拟）') => {
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2400);
};

const randomBetween = (min, max, fraction = 1) => {
  const value = Math.random() * (max - min) + min;
  return parseFloat(value.toFixed(fraction));
};

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const createId = () => (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
  ? crypto.randomUUID()
  : `${Date.now()}-${Math.random().toString(16).slice(2)}`);

const metricCards = document.querySelectorAll('.kpi-card');

const refreshMetrics = () => {
  state.metrics.flatnessRate = randomBetween(97.8, 99.6, 1);
  state.metrics.flatnessPeak = randomBetween(2.1, 3.9, 1);
  state.metrics.slopeRate = randomBetween(98.6, 99.8, 1);
  state.metrics.slopeAvg = randomBetween(1.8, 2.2, 2);
  state.metrics.reworkRate = randomBetween(0.8, 1.9, 1);
  state.metrics.reworkCount = randomInt(0, 2);
  state.metrics.efficiency = randomBetween(55, 68, 0);
  state.metrics.efficiencyGain = randomBetween(42, 63, 0);

  metricCards.forEach(card => {
    const metric = card.dataset.metric;
    if (!metric) return;
    const valueElement = card.querySelector('.kpi-value');
    switch (metric) {
      case 'flatness':
        valueElement.textContent = `${state.metrics.flatnessRate}%`;
        card.querySelector('.metric-peak').textContent = `${state.metrics.flatnessPeak} mm`;
        break;
      case 'slope':
        valueElement.textContent = `${state.metrics.slopeRate}%`;
        card.querySelector('.metric-angle').textContent = `${state.metrics.slopeAvg}%`;
        break;
      case 'rework':
        valueElement.textContent = `${state.metrics.reworkRate}%`;
        card.querySelector('.metric-count').textContent = `${state.metrics.reworkCount}`;
        break;
      case 'efficiency':
        valueElement.textContent = `${state.metrics.efficiency} min`;
        card.querySelector('.metric-gain').textContent = `${state.metrics.efficiencyGain}%`;
        break;
      default:
        break;
    }
  });
};

metricCards.forEach(card => {
  card.querySelectorAll('[data-refresh="metrics"]').forEach(btn => btn.addEventListener('click', refreshMetrics));
});

const productionTable = document.getElementById('productionTable');
const renderProduction = () => {
  productionTable.innerHTML = '';
  state.production.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.code}</td>
      <td>${item.scan}</td>
      <td>${item.analysis}</td>
      <td>${item.control}</td>
      <td>${item.finish}</td>
    `;
    productionTable.appendChild(tr);
  });
};

const refreshProduction = () => {
  state.production = Array.from({ length: 6 }).map((_, index) => {
    const code = `TJ-${String(index + 18).padStart(2, '0')}`;
    const statuses = ['排队', '扫描中', '完成'];
    const scanStatus = statuses[randomInt(1, 2)];
    const analysisStatus = scanStatus === '完成' ? statuses[randomInt(1, 2)] : '排队';
    const controlStatus = analysisStatus === '完成' ? ['已下发', '待确认'][randomInt(0, 1)] : '等待分析';
    const finish = `${randomInt(15, 23)}:${randomInt(0, 5)}${randomInt(0, 9)}`;
    return {
      code,
      scan: scanStatus,
      analysis: analysisStatus,
      control: controlStatus,
      finish,
    };
  });
  renderProduction();
};

document.querySelectorAll('[data-refresh="production"]').forEach(btn => btn.addEventListener('click', () => {
  refreshProduction();
  showToast('生产节拍已刷新（模拟）');
}));

const trendCanvas = document.getElementById('trendChart');
const trendCtx = trendCanvas.getContext('2d');

const drawTrendChart = () => {
  const width = trendCanvas.width;
  const height = trendCanvas.height;
  trendCtx.clearRect(0, 0, width, height);

  trendCtx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  trendCtx.lineWidth = 1;
  for (let i = 1; i < 6; i += 1) {
    const x = (width / 6) * i;
    trendCtx.beginPath();
    trendCtx.moveTo(x, 0);
    trendCtx.lineTo(x, height);
    trendCtx.stroke();
  }

  const flatnessData = Array.from({ length: 6 }, () => randomBetween(1.8, 3.9, 1));
  const slopeData = Array.from({ length: 6 }, () => randomBetween(1.8, 2.3, 2));

  const mapPoint = (index, value, max) => {
    const x = (width / 5) * index;
    const y = height - (value / max) * (height * 0.8) - height * 0.1;
    return [x, y];
  };

  const drawLine = (data, color, max) => {
    trendCtx.strokeStyle = color;
    trendCtx.lineWidth = 2;
    trendCtx.beginPath();
    data.forEach((value, i) => {
      const [x, y] = mapPoint(i, value, max);
      if (i === 0) trendCtx.moveTo(x, y);
      else trendCtx.lineTo(x, y);
    });
    trendCtx.stroke();
    data.forEach((value, i) => {
      const [x, y] = mapPoint(i, value, max);
      trendCtx.fillStyle = color;
      trendCtx.beginPath();
      trendCtx.arc(x, y, 4, 0, Math.PI * 2);
      trendCtx.fill();
    });
  };

  drawLine(flatnessData, '#ff5d73', 4.5);
  drawLine(slopeData, '#40d3a3', 2.6);
};

const scannerSelector = document.getElementById('scannerSelector');
const scannerInfo = document.getElementById('scannerInfo');
const scanners = [
  {
    id: 'p50',
    name: '徕卡 ScanStation P50',
    range: '> 1000 m',
    speed: '1,000,000 点/秒',
    precision: '±1.2 mm (10m)',
    noise: '±0.4 mm',
    note: '远程高精度，适用于固定测站快速扫描。',
  },
  {
    id: 'x7',
    name: '天宝 Trimble X7',
    range: '80 m',
    speed: '500,000 点/秒',
    precision: '±2.0 mm (10m)',
    noise: '±0.5 mm',
    note: '自动校准、自动拼接，易用性高。',
  },
  {
    id: 's350',
    name: '法如 FARO Focus S350',
    range: '350 m',
    speed: '976,000 点/秒',
    precision: '±1.0 mm (10m)',
    noise: '±0.3 mm',
    note: '轻便高速，性价比高。',
  },
];

const renderScannerInfo = id => {
  const scanner = scanners.find(item => item.id === id);
  if (!scanner) return;
  scannerInfo.innerHTML = `
    <dt>型号</dt><dd>${scanner.name}</dd>
    <dt>最大测程</dt><dd>${scanner.range}</dd>
    <dt>扫描速度</dt><dd>${scanner.speed}</dd>
    <dt>三维点精度</dt><dd>${scanner.precision}</dd>
    <dt>测距噪声</dt><dd>${scanner.noise}</dd>
    <dt>特点</dt><dd>${scanner.note}</dd>
  `;
};

scanners.forEach(scanner => {
  const option = document.createElement('option');
  option.value = scanner.id;
  option.textContent = scanner.name;
  scannerSelector.appendChild(option);
});

scannerSelector.addEventListener('change', event => {
  renderScannerInfo(event.target.value);
});

const scanTaskTable = document.getElementById('scanTaskTable');
const createScanTasks = () => {
  state.scanTasks = Array.from({ length: 4 }).map((_, i) => ({
    station: `S${i + 1}`,
    beam: `TJ-${String(i + 25).padStart(2, '0')}`,
    progress: 0,
    noise: randomBetween(0.6, 1.6, 1),
    status: '待启动',
  }));
};

const renderScanTasks = () => {
  scanTaskTable.innerHTML = '';
  state.scanTasks.forEach((task, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${task.station}</td>
      <td>${task.beam}</td>
      <td>
        <div class="progress">
          <div class="progress-bar" style="width:${task.progress}%"></div>
          <span>${task.progress}%</span>
        </div>
      </td>
      <td>${task.noise}%</td>
      <td>
        <button class="btn tiny" data-action="start" data-index="${index}" ${task.status === '完成' ? 'disabled' : ''}>
          ${task.status === '进行中' ? '扫描中' : task.status === '完成' ? '已完成' : '启动'}
        </button>
      </td>
    `;
    scanTaskTable.appendChild(tr);
  });
};

scanTaskTable.addEventListener('click', event => {
  const button = event.target.closest('button[data-action="start"]');
  if (!button) return;
  const index = Number(button.dataset.index);
  const task = state.scanTasks[index];
  if (!task || task.status === '完成') return;

  task.status = '进行中';
  button.textContent = '扫描中';
  button.disabled = true;
  let progress = task.progress;

  const interval = setInterval(() => {
    progress += randomInt(5, 12);
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      task.status = '完成';
      showToast(`${task.beam} 点云已生成（模拟）`);
      addAuditLog(`测站 ${task.station} 完成扫描，点云噪声率 ${task.noise}%`);
    }
    task.progress = progress;
    renderScanTasks();
  }, 600);
});

const generateHeatmapGrid = () => {
  const rows = 12;
  const cols = 28;
  state.heatmap.grid = Array.from({ length: rows }, () => Array.from({ length: cols }, () => randomBetween(-3.5, 3.5, 2)));
};

const heatmapCanvas = document.getElementById('heatmap');
const heatmapCtx = heatmapCanvas.getContext('2d');

const drawHeatmap = () => {
  const { grid, mode, threshold } = state.heatmap;
  const rows = grid.length;
  const cols = grid[0].length;
  const cellWidth = heatmapCanvas.width / cols;
  const cellHeight = heatmapCanvas.height / rows;
  heatmapCtx.clearRect(0, 0, heatmapCanvas.width, heatmapCanvas.height);

  grid.forEach((row, y) => {
    row.forEach((value, x) => {
      let color;
      let magnitude = value;
      if (mode === 'flatness') {
        magnitude = value;
        color = magnitude > threshold / 2 ? '#ff5d73' : magnitude < -threshold / 2 ? '#4c8dff' : '#40d3a3';
      } else if (mode === 'slope') {
        const slopeValue = randomBetween(1.6, 2.4, 2);
        magnitude = slopeValue;
        color = Math.abs(slopeValue - 2) > threshold * 0.05 ? '#ffb648' : '#40d3a3';
      } else {
        const absolute = randomBetween(-6, 6, 1);
        magnitude = absolute;
        color = Math.abs(absolute) > threshold ? '#ff5d73' : '#6a9bff';
      }
      heatmapCtx.fillStyle = color;
      heatmapCtx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
    });
  });

  heatmapCtx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  heatmapCtx.lineWidth = 1;
  for (let x = 0; x <= cols; x += 1) {
    heatmapCtx.beginPath();
    heatmapCtx.moveTo(x * cellWidth, 0);
    heatmapCtx.lineTo(x * cellWidth, heatmapCanvas.height);
    heatmapCtx.stroke();
  }
  for (let y = 0; y <= rows; y += 1) {
    heatmapCtx.beginPath();
    heatmapCtx.moveTo(0, y * cellHeight);
    heatmapCtx.lineTo(heatmapCanvas.width, y * cellHeight);
    heatmapCtx.stroke();
  }
};

const heatmapMode = document.getElementById('heatmapMode');
const heatmapThreshold = document.getElementById('heatmapThreshold');
const thresholdValue = document.getElementById('thresholdValue');

heatmapMode.addEventListener('change', event => {
  state.heatmap.mode = event.target.value;
  drawHeatmap();
});

heatmapThreshold.addEventListener('input', event => {
  const value = Number(event.target.value);
  state.heatmap.threshold = value;
  thresholdValue.textContent = value;
  drawHeatmap();
});

const metricFlatness = document.getElementById('metricFlatness');
const metricSlope = document.getElementById('metricSlope');
const metricRelative = document.getElementById('metricRelative');
const metricAbsolute = document.getElementById('metricAbsolute');

const runAnalysis = () => {
  metricFlatness.textContent = `${randomBetween(2.2, 3.8, 1)} mm`;
  metricSlope.textContent = `${randomBetween(1.9, 2.1, 2)} %`;
  metricRelative.textContent = `${randomBetween(0.6, 1.8, 1)} mm`;
  metricAbsolute.textContent = `${randomBetween(-6, 6, 1)} mm`;
  showToast('指标解算完成（模拟）');
};

document.getElementById('simulateAnalysis').addEventListener('click', runAnalysis);

document.getElementById('runPipeline').addEventListener('click', () => {
  const steps = Array.from(document.querySelectorAll('#pipelineStepper li'));
  steps.forEach(step => step.classList.remove('active'));
  let index = 0;
  const interval = setInterval(() => {
    if (index > 0) steps[index - 1].classList.remove('active');
    if (index >= steps.length) {
      clearInterval(interval);
      steps[steps.length - 1].classList.add('active');
      runAnalysis();
      return;
    }
    steps[index].classList.add('active');
    index += 1;
  }, 600);
});

const toggleCritical = document.getElementById('toggleCritical');
const alertList = document.getElementById('alertList');
const auditLog = document.getElementById('auditLog');

const addAuditLog = text => {
  const entry = { time: new Date(), text };
  state.auditLogs.unshift(entry);
  renderAuditLogs();
};

const renderAuditLogs = () => {
  auditLog.innerHTML = '';
  state.auditLogs.slice(0, 8).forEach(item => {
    const li = document.createElement('li');
    li.className = 'log-entry';
    li.innerHTML = `<strong>${item.time.toLocaleTimeString()}</strong> · ${item.text}`;
    auditLog.appendChild(li);
  });
};

const createAlerts = () => {
  state.alerts = [
    { id: createId(), level: 'critical', title: 'B 区域平整度超限', message: '最大偏差 4.8 mm，建议立即刮削处理。', time: '08:56' },
    { id: createId(), level: 'warning', title: 'C3 支撑层高差偏大', message: '相邻高差 2.1 mm，待复测确认。', time: '09:12' },
    { id: createId(), level: 'info', title: '点云拼接完成', message: 'S2 测站数据自动拼接成功。', time: '09:24' },
  ];
};

const renderAlerts = () => {
  alertList.innerHTML = '';
  const filtered = toggleCritical.checked ? state.alerts.filter(a => a.level !== 'info') : state.alerts;
  filtered.forEach(alert => {
    const li = document.createElement('li');
    li.className = 'alert-item';
    li.dataset.level = alert.level;
    li.innerHTML = `
      <div class="alert-meta">
        <strong>${alert.title}</strong>
        <span>${alert.message}</span>
      </div>
      <div class="alert-actions">
        <span class="time">${alert.time}</span>
        <button class="btn tiny" data-alert="${alert.id}">确认</button>
      </div>
    `;
    alertList.appendChild(li);
  });
};

alertList.addEventListener('click', event => {
  const button = event.target.closest('button[data-alert]');
  if (!button) return;
  const id = button.dataset.alert;
  const alertIndex = state.alerts.findIndex(item => item.id === id);
  if (alertIndex === -1) return;
  const [alert] = state.alerts.splice(alertIndex, 1);
  addAuditLog(`${alert.title} 已确认，指派自动设备处理。`);
  showToast('报警已确认（模拟）');
  renderAlerts();
});

toggleCritical.addEventListener('change', renderAlerts);

const commandForm = document.getElementById('commandForm');
const commandLog = document.getElementById('commandLog');

const renderCommandLog = () => {
  commandLog.innerHTML = '';
  state.commandLogs.slice(0, 6).forEach(entry => {
    const li = document.createElement('li');
    li.className = 'log-entry';
    li.innerHTML = `<strong>${entry.time}</strong> · ${entry.text}`;
    commandLog.appendChild(li);
  });
};

const addCommandLog = text => {
  state.commandLogs.unshift({ time: new Date().toLocaleTimeString(), text });
  renderCommandLog();
};

commandForm.addEventListener('submit', event => {
  event.preventDefault();
  const formData = new FormData(commandForm);
  const position = formData.get('position');
  const type = formData.get('type');
  const value = formData.get('value');
  const device = formData.get('device');
  if (!position || !type || !value || !device) return;
  const typeMap = {
    lower: '补浆',
    higher: '刮削',
    slope: '坡度调整',
  };
  addCommandLog(`向 ${position} 下发${typeMap[type]}指令，调整量 ${value}，设备 ${device}`);
  addAuditLog(`${position} 已执行 ${typeMap[type]}，等待复扫确认。`);
  commandForm.reset();
  showToast('指令已发送至 PLC（模拟）');
});

document.getElementById('autoOptimize').addEventListener('click', () => {
  const presets = [
    'A1-04 自动刮削 2.1mm 已完成，准备复扫。',
    'B3-02 补浆 1.4mm 指令执行中。',
    'C2-06 坡度微调 0.3%，等待确认。',
  ];
  addCommandLog(presets[randomInt(0, presets.length - 1)]);
  showToast('已触发自优化策略（模拟）');
});

const modalTriggers = document.querySelectorAll('[data-modal]');
const modals = document.querySelectorAll('.modal');
const closeButtons = document.querySelectorAll('[data-close]');

modalTriggers.forEach(trigger => {
  trigger.addEventListener('click', () => {
    const id = trigger.dataset.modal;
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    buildReport();
  });
});

closeButtons.forEach(button => {
  button.addEventListener('click', () => {
    const modal = button.closest('.modal');
    if (modal) closeModal(modal);
  });
});

modals.forEach(modal => {
  modal.addEventListener('click', event => {
    if (event.target === modal) closeModal(modal);
  });
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    modals.forEach(closeModal);
  }
});

function closeModal(modal) {
  modal.classList.remove('show');
  document.body.style.overflow = '';
}

const reportBody = document.getElementById('reportBody');
const buildReport = () => {
  const rows = state.production.map(item => `
    <tr>
      <td>${item.code}</td>
      <td>${item.scan}</td>
      <td>${item.analysis}</td>
      <td>${item.control}</td>
      <td>${item.finish}</td>
    </tr>
  `).join('');
  reportBody.innerHTML = `
    <p>本日报基于假数据生成，展示格式与关键字段供演示使用。</p>
    <table class="data-table">
      <thead>
        <tr>
          <th>箱梁编号</th>
          <th>扫描状态</th>
          <th>分析状态</th>
          <th>闭环控制</th>
          <th>预计完工</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
};

const reportModal = document.getElementById('reportModal');
reportModal.addEventListener('transitionend', () => {
  if (!reportModal.classList.contains('show')) {
    reportBody.innerHTML = '';
  }
});

const simulateShift = document.getElementById('simulateShift');
simulateShift.addEventListener('click', () => {
  refreshMetrics();
  refreshProduction();
  drawTrendChart();
  createScanTasks();
  renderScanTasks();
  createAlerts();
  renderAlerts();
  state.auditLogs = [];
  renderAuditLogs();
  state.commandLogs = [];
  renderCommandLog();
  generateHeatmapGrid();
  drawHeatmap();
  runAnalysis();
  renderScannerInfo(scannerSelector.value || scanners[0].id);
  showToast('新班次数据已加载（模拟）');
});

const init = () => {
  refreshMetrics();
  refreshProduction();
  drawTrendChart();
  renderScannerInfo(scanners[0].id);
  scannerSelector.value = scanners[0].id;
  createScanTasks();
  renderScanTasks();
  createAlerts();
  renderAlerts();
  renderAuditLogs();
  renderCommandLog();
  generateHeatmapGrid();
  drawHeatmap();
  runAnalysis();
};

init();
