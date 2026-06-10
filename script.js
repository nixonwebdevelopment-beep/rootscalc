// ── Build 10 input rows on load ──────────────────────────────────
function buildRows(platform) {
  const container = document.getElementById(`${platform}-rows`);
  for (let i = 1; i <= 10; i++) {
    const row = document.createElement('div');
    row.className = 'post-row';
    row.innerHTML = `
      <input type="number" min="0" placeholder="0" id="${platform}-l-${i}" oninput="calcAvg('${platform}')"/>
      <input type="number" min="0" placeholder="0" id="${platform}-c-${i}" oninput="calcAvg('${platform}')"/>
      <input type="number" min="0" placeholder="0" id="${platform}-s-${i}" oninput="calcAvg('${platform}')"/>`;
    container.appendChild(row);
  }
}

document.addEventListener('DOMContentLoaded', function() {
  buildRows('ig');
  buildRows('tt');
});

// ── Average calculator ───────────────────────────────────────────
function calcAvg(platform) {
  let totalL = 0, totalC = 0, totalS = 0, count = 0;

  for (let i = 1; i <= 10; i++) {
    const l = parseFloat(document.getElementById(`${platform}-l-${i}`).value) || 0;
    const c = parseFloat(document.getElementById(`${platform}-c-${i}`).value) || 0;
    const s = parseFloat(document.getElementById(`${platform}-s-${i}`).value) || 0;
    if (l || c || s) {
      totalL += l; totalC += c; totalS += s; count++;
    }
  }

  const avgBox = document.getElementById(`${platform}-avg`);
  const useBtn = document.getElementById(`${platform}-use-btn`);

  if (count === 0) {
    avgBox.innerHTML = '';
    useBtn.style.display = 'none';
    return;
  }

  const avgL = Math.round(totalL / count);
  const avgC = Math.round(totalC / count);
  const avgS = Math.round(totalS / count);

  avgBox.innerHTML = `
    <div class="avg-row"><span class="avg-label">Avg likes</span><span class="avg-val">${avgL.toLocaleString()}</span></div>
    <div class="avg-row"><span class="avg-label">Avg comments</span><span class="avg-val">${avgC.toLocaleString()}</span></div>
    <div class="avg-row"><span class="avg-label">Avg shares</span><span class="avg-val">${avgS.toLocaleString()}</span></div>
    <div class="avg-row"><span class="avg-label">Posts counted</span><span class="avg-val">${count}</span></div>`;

  useBtn.style.display = 'block';
  useBtn.dataset.likes = avgL;
  useBtn.dataset.comments = avgC;
  useBtn.dataset.shares = avgS;
}

function useAverages(platform) {
  const btn = document.getElementById(`${platform}-use-btn`);
  document.getElementById(`${platform}-likes`).value    = btn.dataset.likes;
  document.getElementById(`${platform}-comments`).value = btn.dataset.comments;
  document.getElementById(`${platform}-shares`).value   = btn.dataset.shares;
  calc();
  document.querySelector('.averages-section:last-of-type').scrollIntoView({ behavior: 'smooth' });
}

// ── Engagement rate calculator ───────────────────────────────────
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
  const igBarW  = maxRate > 0 && igRate !== null ? Math.round((igRate / maxRate) * 100) : 0;
  const ttBarW  = maxRate > 0 && ttRate !== null ? Math.round((ttRate / maxRate) * 100) : 0;

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
    ${verdictHtml}`;
}
