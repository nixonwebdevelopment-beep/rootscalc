function val(id) {
  return parseFloat(document.getElementById(id).value) || 0;
}

function engRate(followers, likes, comments, shares) {
  if (!followers) return null;
  return ((likes + comments + shares) / followers) * 100;
}

function ratingLabel(rate) {
  if (rate >= 6) return 'Excellent';
  if (rate >= 3) return 'Good';
  if (rate >= 1) return 'Average';
  return 'Below average';
}

function calc() {
  const igF = val('ig-followers'), igL = val('ig-likes'), igC = val('ig-comments'), igS = val('ig-shares');
  const ttF = val('tt-followers'), ttL = val('tt-likes'), ttC = val('tt-comments'), ttS = val('tt-shares');

  const igRate = engRate(igF, igL, igC, igS);
  const ttRate = engRate(ttF, ttL, ttC, ttS);

  const results = document.getElementById('results');

  if (igRate === null && ttRate === null) {
    results.innerHTML = '<p class="empty">Fill in followers and at least one engagement metric to see results.</p>';
    return;
  }

  const maxRate = Math.max(igRate ?? 0, ttRate ?? 0);
  const igBarW = maxRate > 0 && igRate !== null ? Math.round((igRate / maxRate) * 100) : 0;
  const ttBarW = maxRate > 0 && ttRate !== null ? Math.round((ttRate / maxRate) * 100) : 0;

  let verdictHtml = '';
  if (igRate !== null && ttRate !== null) {
    const diff = Math.abs(igRate - ttRate).toFixed(2);
    if (Math.abs(igRate - ttRate) < 0.1) {
      verdictHtml = `<div class="verdict tie">Both accounts have nearly identical engagement rates.</div>`;
    } else if (igRate > ttRate) {
      verdictHtml = `<div class="verdict ig">Instagram leads by ${diff}% engagement rate.</div>`;
    } else {
      verdictHtml = `<div class="verdict tt">TikTok leads by ${diff}% engagement rate.</div>`;
    }
  }

  results.innerHTML = `
    <p class="results-label">Engagement rate = (likes + comments + shares) ÷ followers × 100</p>
    <div class="metric-grid">
      <div class="metric-card">
        <div class="label">Instagram</div>
        <div class="value">${igRate !== null ? igRate.toFixed(2) + '%' : '—'}</div>
        <div class="rating">${igRate !== null ? ratingLabel(igRate) : 'No data'}</div>
      </div>
      <div class="metric-card">
        <div class="label">TikTok</div>
        <div class="value">${ttRate !== null ? ttRate.toFixed(2) + '%' : '—'}</div>
        <div class="rating">${ttRate !== null ? ratingLabel(ttRate) : 'No data'}</div>
      </div>
    </div>
    <div class="bar-section">
      <div class="bar-row">
        <span class="bar-label">Instagram</span>
        <div class="bar-track"><div class="bar-fill bar-ig" style="width:${igBarW}%"></div></div>
        <span class="bar-val">${igRate !== null ? igRate.toFixed(2) + '%' : '—'}</span>
      </div>
      <div class="bar-row">
        <span class="bar-label">TikTok</span>
        <div class="bar-track"><div class="bar-fill bar-tt" style="width:${ttBarW}%"></div></div>
        <span class="bar-val">${ttRate !== null ? ttRate.toFixed(2) + '%' : '—'}</span>
      </div>
    </div>
    ${verdictHtml}
  `;
}
