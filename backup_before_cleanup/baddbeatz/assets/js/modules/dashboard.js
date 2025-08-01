/**
 * Dashboard Module
 * Handles dashboard functionality with lazy loading
 */

export default async function loadDashboard() {
  const { showLoading, hideLoading } = await import('../ui-utils.js');
  const { ErrorHandler } = await import('../utils/error-handler.js');
  
  const dashboardContainer = document.getElementById('dashboard-content');
  if (!dashboardContainer) {
    ErrorHandler.handle(new Error('Dashboard container not found'), 'Dashboard could not be loaded');
    return;
  }
  
  showLoading(dashboardContainer);
  
  try {
    // Simulate loading dashboard data
    const dashboardData = await fetchDashboardData();
    
    // Render dashboard
    renderDashboard(dashboardData, dashboardContainer);
    
    // Initialize dashboard interactions
    initializeDashboardEvents();
    
    hideLoading(dashboardContainer);
  } catch (error) {
    hideLoading(dashboardContainer);
    ErrorHandler.handle(error, 'Failed to load dashboard');
  }
}

async function fetchDashboardData() {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        stats: {
          totalPlays: 1234,
          totalLikes: 567,
          totalFollowers: 890
        },
        recentTracks: [
          { id: 1, title: 'Track 1', plays: 123 },
          { id: 2, title: 'Track 2', plays: 456 }
        ]
      });
    }, 1000);
  });
}

function renderDashboard(data, container) {
  container.innerHTML = `
    <div class="dashboard-stats">
      <div class="stat-card">
        <h3>Total Plays</h3>
        <p>${data.stats.totalPlays}</p>
      </div>
      <div class="stat-card">
        <h3>Total Likes</h3>
        <p>${data.stats.totalLikes}</p>
      </div>
      <div class="stat-card">
        <h3>Followers</h3>
        <p>${data.stats.totalFollowers}</p>
      </div>
    </div>
    <div class="recent-tracks">
      <h3>Recent Tracks</h3>
      ${data.recentTracks.map(track => `
        <div class="track-item">
          <span>${track.title}</span>
          <span>${track.plays} plays</span>
        </div>
      `).join('')}
    </div>
  `;
}

function initializeDashboardEvents() {
  // Add event listeners for dashboard interactions
  const statCards = document.querySelectorAll('.stat-card');
  statCards.forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('expanded');
    });
  });
}
