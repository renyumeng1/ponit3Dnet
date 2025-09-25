const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
const toast = document.getElementById('toast');

navToggle?.addEventListener('click', () => {
  navLinks?.classList.toggle('open');
});

document.querySelectorAll('[data-scroll]').forEach(btn => {
  btn.addEventListener('click', event => {
    const target = event.currentTarget.getAttribute('data-scroll');
    if (target) {
      document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

const modals = document.querySelectorAll('.modal');
const openButtons = document.querySelectorAll('[data-modal]');
const closeButtons = document.querySelectorAll('[data-close]');

openButtons.forEach(button => {
  button.addEventListener('click', () => {
    const id = button.getAttribute('data-modal');
    const modal = document.getElementById(id);
    modal?.classList.add('show');
    document.body.style.overflow = 'hidden';
  });
});

const closeModal = modal => {
  modal.classList.remove('show');
  document.body.style.overflow = '';
};

closeButtons.forEach(button => {
  button.addEventListener('click', () => {
    const modal = button.closest('.modal');
    if (modal) closeModal(modal);
  });
});

modals.forEach(modal => {
  modal.addEventListener('click', event => {
    if (event.target === modal) {
      closeModal(modal);
    }
  });
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    modals.forEach(modal => modal.classList.remove('show'));
    document.body.style.overflow = '';
  }
});

const cards = document.querySelectorAll('.card[data-detail]');
const detailSections = document.querySelectorAll('.detail');

cards.forEach(card => {
  card.addEventListener('click', () => {
    const id = card.getAttribute('data-detail');
    cards.forEach(c => c.classList.remove('active'));
    detailSections.forEach(section => section.classList.remove('active'));
    card.classList.add('active');
    document.getElementById(id)?.classList.add('active');
  });
});

const tabs = document.querySelectorAll('.tab');
const tabPanels = document.querySelectorAll('.tab-panel');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const id = tab.getAttribute('data-tab');
    tabs.forEach(t => t.classList.remove('active'));
    tabPanels.forEach(panel => panel.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(id)?.classList.add('active');
  });
});

const analysisTimeline = document.querySelector('.analysis-timeline');
const analysisStage = document.getElementById('analysisStage');

const stageContent = {
  clean: {
    title: '数据清洗',
    text: '统计离群点去除（SOR）与地面反射噪声剔除，确保点云数据真实可靠。'
  },
  sample: {
    title: '体素降采样',
    text: '将点云划分为微体素，取质心代表，平衡计算效率与几何精度。'
  },
  measure: {
    title: '指标计算',
    text: '虚拟靠尺遍历箱梁顶面，记录最大偏差；最小二乘拟合获取排水坡度。'
  },
  visual: {
    title: '热力图渲染',
    text: '生成三维伪彩图，将偏高与偏低区域以不同颜色直观呈现。'
  },
  feedback: {
    title: '闭环反馈',
    text: '将坐标与偏差值传输至整平设备，完成刮板高度、角度或振动频率调整。'
  }
};

analysisTimeline?.addEventListener('click', event => {
  if (event.target instanceof HTMLButtonElement) {
    const stage = event.target.getAttribute('data-stage');
    if (!stage || !stageContent[stage]) return;
    analysisTimeline.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    const { title, text } = stageContent[stage];
    analysisStage.querySelector('h4').textContent = title;
    analysisStage.querySelector('p').textContent = text;
  }
});

analysisTimeline?.querySelector('button')?.classList.add('active');

const nodes = document.querySelectorAll('.deployment-map .node');
const deploymentInfo = document.getElementById('deploymentInfo');

const nodeDetails = {
  scanner: '激光扫描站：固定支架与自动校准模块，保障扫描路径稳定与数据连贯。',
  server: '数据处理中心：部署高性能服务器，运行点云预处理、拟合与热力图渲染算法。',
  control: '整平设备：通过PLC接收偏差数据，实时调节刮板、补浆与振捣动作。',
  quality: '质量管理区：实时监看预警信息，确认指标达标后生成验收报告。'
};

nodes.forEach(node => {
  const role = node.getAttribute('data-role');
  const updateInfo = () => {
    nodes.forEach(n => n.classList.remove('active'));
    node.classList.add('active');
    const detail = nodeDetails[role];
    if (detail) {
      deploymentInfo.querySelector('p').textContent = detail;
    }
  };

  node.addEventListener('mouseenter', updateInfo);
  node.addEventListener('focus', updateInfo);
  node.addEventListener('click', updateInfo);
});

document.querySelector('[data-fake-submit]')?.addEventListener('click', () => {
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
  closeModal(document.getElementById('contactModal'));
});

window.addEventListener('scroll', () => {
  if (navLinks?.classList.contains('open') && window.innerWidth < 820) {
    navLinks.classList.remove('open');
  }
});

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
