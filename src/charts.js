/**
 * IndoPress - Charts & Analytics Module
 * Chart.js wrapper for Source Bar Chart and Topic Donut Chart.
 */

// Colors corresponding to category themes
const CATEGORY_COLORS = {
  politics: '#3b82f6',     // Blue
  economy: '#10b981',      // Emerald
  sports: '#f59e0b',       // Amber
  environment: '#22c55e',  // Green
  health: '#f43f5e',       // Rose
  diplomacy: '#6366f1',    // Indigo
  other: '#94a3b8'         // Slate
};

let sourceChartInstance = null;
let topicChartInstance = null;

/**
 * Checks if Chart.js is loaded in the window.
 * @returns {boolean}
 */
function isChartJsAvailable() {
  return typeof window !== 'undefined' && typeof window.Chart !== 'undefined';
}

/**
 * Initializes or updates the Source Tracker horizontal bar chart.
 * @param {HTMLCanvasElement} canvasElem
 * @param {Array<{name: string, count: number}>} sources
 */
export function initSourceChart(canvasElem, sources = []) {
  if (!canvasElem || !isChartJsAvailable()) return null;

  if (sourceChartInstance) {
    sourceChartInstance.destroy();
    sourceChartInstance = null;
  }

  const topSources = sources.slice(0, 6);
  const labels = topSources.map(s => s.name);
  const data = topSources.map(s => s.count);

  const ctx = canvasElem.getContext('2d');

  sourceChartInstance = new window.Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Articles',
          data: data,
          backgroundColor: 'rgba(220, 38, 38, 0.85)',
          hoverBackgroundColor: 'rgba(185, 28, 28, 1)',
          borderRadius: 6,
          borderSkipped: false,
          maxBarThickness: 24
        }
      ]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: '#0f172a',
          titleFont: { size: 12, weight: 'bold', family: 'Inter, system-ui' },
          bodyFont: { size: 12, family: 'Inter, system-ui' },
          padding: 10,
          cornerRadius: 8,
          callbacks: {
            label: (context) => ` ${context.raw} articles published`
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            color: '#64748b',
            font: { family: 'Inter, system-ui', size: 11 }
          },
          grid: {
            color: '#f1f5f9'
          }
        },
        y: {
          ticks: {
            color: '#1e293b',
            font: { family: 'Inter, system-ui', size: 12, weight: '500' }
          },
          grid: {
            display: false
          }
        }
      }
    }
  });

  return sourceChartInstance;
}

/**
 * Initializes or updates the Topic Breakdown donut chart.
 * @param {HTMLCanvasElement} canvasElem
 * @param {object} categoryCounts
 * @param {object} categories
 */
export function initTopicChart(canvasElem, categoryCounts = {}, categories = {}) {
  if (!canvasElem || !isChartJsAvailable()) return null;

  if (topicChartInstance) {
    topicChartInstance.destroy();
    topicChartInstance = null;
  }

  const activeCategories = Object.values(categories).filter(cat => (categoryCounts[cat.id] || 0) > 0);

  const labels = activeCategories.map(cat => `${cat.icon} ${cat.label}`);
  const data = activeCategories.map(cat => categoryCounts[cat.id] || 0);
  const backgroundColors = activeCategories.map(cat => CATEGORY_COLORS[cat.id] || CATEGORY_COLORS.other);

  const ctx = canvasElem.getContext('2d');

  topicChartInstance = new window.Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: backgroundColors,
          borderWidth: 2,
          borderColor: '#ffffff',
          hoverOffset: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '68%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            boxWidth: 12,
            boxHeight: 12,
            usePointStyle: true,
            pointStyle: 'circle',
            font: { family: 'Inter, system-ui', size: 11 },
            color: '#475569',
            padding: 14
          }
        },
        tooltip: {
          backgroundColor: '#0f172a',
          titleFont: { size: 12, weight: 'bold', family: 'Inter, system-ui' },
          bodyFont: { size: 12, family: 'Inter, system-ui' },
          padding: 10,
          cornerRadius: 8,
          callbacks: {
            label: (context) => {
              const value = context.raw || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
              return ` ${value} articles (${percentage}%)`;
            }
          }
        }
      }
    }
  });

  return topicChartInstance;
}

/**
 * Cleanly renders or updates all dashboard charts.
 * @param {object} params
 */
export function renderDashboardCharts({ sourceCanvas, topicCanvas, sources, categoryCounts, categories }) {
  if (sourceCanvas) {
    initSourceChart(sourceCanvas, sources);
  }
  if (topicCanvas) {
    initTopicChart(topicCanvas, categoryCounts, categories);
  }
}
