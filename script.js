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

// ── Average calculator ──────────────────────────────────────────

const postCounts = { ig: 0, tt: 0 };

function addPost(platform) {
  const container = document.getElementById(`${platform}-posts`);
  const id = ++postCounts[platform];

  if (id === 1) {
    const labels = document.createElement('div');
    labels.className = 'col-labels';
    labels.id = `${platform}-col-labels`;
    labels.innerHTML = `
      <span class="col-label">Likes</span>
      <span class="col-label">Comments</span>
      <span class="col-label">Shares</span>
      <span></span>`;
    container.before(labels);
  }

  const row = document.createElement('div');
  row.className = 'post-row';
  row.id = `${platform}-post-${id}`;
  row.innerHTML = `
    <input type="number" min="0" placeholder="Likes"    id="${platform}-l-${id}" oninput="calcAvg('${platform}')"/>
    <input type="number" min="0" placeholder="Comments" id="${platform}-c-${id}" oninput="calcAvg('${platform}')"/>
    <input type="number" min="0" placeholder="Shares"   id="${platform}-s-${id}" oninput="calcAvg('${platform}')"/>
    <button class="remove-btn" onclick="removePost('${platform}', ${id})" aria-label="Remove row">×</button>`;
  container.appendChild(row);
  calcAvg(platform);
}

function removePost(platform, id) {
  const row = document.getElementById(`${platform}-post-${id}`);
  if (row) row.remove();
  const labels = document.getElementById(`${platform}-col-labels`);
  const container = document.getElementById(`${platform}-posts`);
  if (labels && container.children.length === 0) labels.remove();
  calcAvg(platform);
}

function calcAvg(platform) {
  const container = document.getElementById(`${platform}-posts`);
  const rows = container.querySelectorAll('.post-row');
  const avgBox = document.getElementById(`${platform}-avg`);

  let totalL = 0, totalC = 0, totalS = 0, count = 0;

  rows.forEach(row => {
    const inputs = row.querySelectorAll('input');
    const l = parseFloat(inputs[0].value) || 0;
    const c = parseFloat(inputs[1].value) || 0;
    const s = parseFloat(inputs[2].value) || 0;
    if (l || c || s) {
      totalL += l; totalC += c; totalS += s; count++;
    }
  });

  if (count === 0) {
    avgBox.classList.remove('visible');
    avgBox.innerHTML = '';
    return;
  }

  const avgL = Math.round(totalL / count);
  const avgC = Math.round(totalC / count);
  const avgS = Math.round(totalS / count);

  avgBox.classList.add('visible');
  avgBox.innerHTML = `
    <div class="avg-row"><span class="avg-label">Avg likes</span><span class="avg-val">${avgL.toLocaleString()}</span></div>
    <div class="avg-row"><span class="avg-label">Avg comments</span><span class="avg-val">${avgC.toLocaleString()}</span></div>
    <div class="avg-row"><span class="avg-label">Avg shares</span><span class="avg-val">${avgS.toLocaleString()}</span></div>
    <div class="avg-row"><span class="avg-label">Posts counted</span><span class="avg-val">${count}</span></div>
    <button class="use-btn" onclick="useAverages('${platform}', ${avgL}, ${avgC}, ${avgS})">Use these averages ↑</button>`;
}

function useAverages(platform, likes, comments, shares) {
  document.getElementById(`${platform}-likes`).value   = likes;
  document.getElementById(`${platform}-comments`).value = comments;
  document.getElementById(`${platform}-shares`).value  = shares;
  calc();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
