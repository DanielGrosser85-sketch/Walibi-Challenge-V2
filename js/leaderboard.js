/**
 * Dynamische Rangliste für Mr. oder Mrs. Walibi, Häuser-Battle & Pegel-Turnier
 */
const LeaderboardModule = {
  currentView: "players",
  genderFilter: "all", // "all" | "male" | "female"

  init() {
    this.setupSubtabs();
    this.renderLeaderboard();
  },

  setupSubtabs() {
    const btnPlayers = document.getElementById("btnRankPlayers");
    const btnHouses = document.getElementById("btnRankHouses");
    const btnPromille = document.getElementById("btnRankPromille");

    const setSubtab = (view) => {
      this.currentView = view;
      if (btnPlayers) btnPlayers.classList.toggle("active", view === "players");
      if (btnHouses) btnHouses.classList.toggle("active", view === "houses");
      if (btnPromille) btnPromille.classList.toggle("active", view === "promille");
      if (window.GameAudio) window.GameAudio.playClick();
      this.renderLeaderboard();
    };

    if (btnPlayers) btnPlayers.addEventListener("click", () => setSubtab("players"));
    if (btnHouses) btnHouses.addEventListener("click", () => setSubtab("houses"));
    if (btnPromille) btnPromille.addEventListener("click", () => setSubtab("promille"));
  },

  setGenderFilter(filter) {
    if (window.GameAudio) window.GameAudio.playClick();
    this.genderFilter = filter;

    const btnAll = document.getElementById("btnGenderAll");
    const btnMale = document.getElementById("btnGenderMale");
    const btnFemale = document.getElementById("btnGenderFemale");

    if (btnAll) btnAll.classList.toggle("active", filter === "all");
    if (btnMale) btnMale.classList.toggle("active", filter === "male");
    if (btnFemale) btnFemale.classList.toggle("active", filter === "female");

    this.renderLeaderboard();
  },

  renderLeaderboard() {
    const container = document.getElementById("leaderboardListContainer");
    const filterRow = document.getElementById("leaderboardGenderFiltersRow");
    if (!container) return;

    if (filterRow) {
      filterRow.style.display = (this.currentView === "houses") ? "none" : "flex";
    }

    if (this.currentView === "players") {
      this.renderPlayerRankings(container);
    } else if (this.currentView === "houses") {
      this.renderHouseRankings(container);
    } else if (this.currentView === "promille") {
      this.renderPromilleTournament(container);
    }
  },

  renderPlayerRankings(container) {
    const sorted = window.store.getSortedPlayers(this.genderFilter);
    const currentUser = window.store.state.currentUser;

    let filterTitleHtml = "";
    if (this.genderFilter === "male") {
      filterTitleHtml = `
        <div style="background: rgba(59, 130, 246, 0.15); border: 1.5px solid #3b82f6; border-radius: 10px; padding: 8px 12px; margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 20px;">👑♂️</span>
            <div>
              <strong style="font-size: 13px; color: #93c5fd; text-transform: uppercase;">Mr. Walibi Rangliste</strong>
              <div style="font-size: 10.5px; color: #cbd5e1;">Wer holt die Krone zum Mr. Walibi? (${sorted.length} Teilnehmer)</div>
            </div>
          </div>
          <span class="map-tag-pill" style="background: rgba(59, 130, 246, 0.3); border-color: #60a5fa; color: #fff;">♂️ Mr. Walibi</span>
        </div>
      `;
    } else if (this.genderFilter === "female") {
      filterTitleHtml = `
        <div style="background: rgba(244, 114, 182, 0.15); border: 1.5px solid #ec4899; border-radius: 10px; padding: 8px 12px; margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 20px;">👑♀️</span>
            <div>
              <strong style="font-size: 13px; color: #fbcfe8; text-transform: uppercase;">Mrs. Walibi Rangliste</strong>
              <div style="font-size: 10.5px; color: #cbd5e1;">Wer holt die Krone zur Mrs. Walibi? (${sorted.length} Teilnehmerinnen)</div>
            </div>
          </div>
          <span class="map-tag-pill" style="background: rgba(244, 114, 182, 0.3); border-color: #f472b6; color: #fff;">♀️ Mrs. Walibi</span>
        </div>
      `;
    }

    if (sorted.length === 0) {
      container.innerHTML = filterTitleHtml + `
        <div style="text-align: center; padding: 24px 16px; background: rgba(0,0,0,0.3); border: 2px dashed rgba(255,255,255,0.15); border-radius: 12px; color: var(--text-muted);">
          <div style="font-size: 32px; margin-bottom: 6px;">👥</div>
          <p>Noch keine Teilnehmer in dieser Kategorie registriert.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filterTitleHtml + sorted.map((player, index) => {
      const rank = index + 1;
      let rankBadge = `<span class="rank-num">#${rank}</span>`;
      let cardClass = "rank-card";
      let titleTag = "";

      if (rank === 1) {
        rankBadge = `<span class="rank-crown">👑 1.</span>`;
        cardClass += " rank-first";
        if (this.genderFilter === "male") {
          titleTag = `<span class="feed-house-tag" style="background: rgba(59, 130, 246, 0.3); color: #93c5fd; border-color: #60a5fa;">👑 1. Mr. Walibi</span>`;
        } else if (this.genderFilter === "female") {
          titleTag = `<span class="feed-house-tag" style="background: rgba(244, 114, 182, 0.3); color: #fbcfe8; border-color: #f472b6;">👑 1. Mrs. Walibi</span>`;
        } else {
          titleTag = `<span class="feed-house-tag" style="background: rgba(251, 191, 36, 0.2); color: #fbbf24; border-color: #fbbf24;">👑 Spitzenreiter</span>`;
        }
      } else if (rank === 2) {
        rankBadge = `<span class="rank-medal">🥈 2.</span>`;
        cardClass += " rank-second";
      } else if (rank === 3) {
        rankBadge = `<span class="rank-medal">🥉 3.</span>`;
        cardClass += " rank-third";
      } else if (index === sorted.length - 1 && sorted.length > 3) {
        rankBadge = `<span class="rank-jester">🤡 #${rank}</span>`;
        cardClass += " rank-jester-card";
        titleTag = `<span class="feed-house-tag" style="background: rgba(239, 68, 68, 0.15); color: #f87171;">🤡 Hofnarr</span>`;
      }

      const isMe = currentUser && currentUser.id === player.id;
      if (isMe) cardClass += " rank-me";

      const userClass = (window.RPG_CLASSES || []).find(c => c.id === player.rpgClass) || { icon: "🎢", name: "Walibi Abenteurer" };
      const completedQuestsCount = (player.completedQuests || []).length;
      const completedSideQuestsCount = (player.completedSideQuests || []).length;
      const unlockedTitlesCount = (player.unlockedTitles || []).length;
      const drinksCount = player.drinksCount || 0;

      const genderIcon = player.gender === "female" ? '<span style="color: #f472b6; font-size: 12px;" title="Mrs. Walibi">♀️</span>' : '<span style="color: #60a5fa; font-size: 12px;" title="Mr. Walibi">♂️</span>';

      return `
        <div class="${cardClass}" onclick="LeaderboardModule.openPlayerDetailModal('${player.id}')">
          <div class="rank-position-col">
            ${rankBadge}
          </div>
          
          <img src="${player.avatar || ProfileModule.generateDefaultAvatar(player.name)}" class="rank-avatar" />

          <div class="rank-info-col">
            <div class="rank-player-name">
              ${player.name} ${genderIcon} ${isMe ? '<span class="you-badge">(Du)</span>' : ''}
              ${titleTag}
            </div>
            <div class="rank-sub-meta">
              <span class="rank-house-badge">${player.house || 'Haus'}</span>
              <span style="color: var(--walibi-yellow); font-weight: 800; font-size: 11px;">${userClass.icon} ${userClass.name}</span>
            </div>
            <div style="font-size: 10px; color: var(--text-dim); margin-top: 2px;">
              🎯 ${completedQuestsCount} Quests • ${unlockedTitlesCount > 0 ? `🎖️ ${unlockedTitlesCount} Titel • ` : ''}🍺 ${drinksCount} Drinks
            </div>
          </div>

          <div class="rank-score-col">
            <div class="rank-points-val">${player.points}</div>
            <div class="rank-points-lbl">Punkte</div>
          </div>
        </div>
      `;
    }).join("");
  },

  renderHouseRankings(container) {
    const houseStats = window.store.getHouseLeaderboard();

    if (houseStats.length === 0) {
      container.innerHTML = `<p class="text-muted">Keine Häuser vorhanden.</p>`;
      return;
    }

    container.innerHTML = houseStats.map((h, index) => {
      const rank = index + 1;
      const avg = h.playerCount > 0 ? (h.totalPoints / h.playerCount).toFixed(1) : "0";

      return `
        <div class="rank-card house-rank-card ${rank === 1 ? 'rank-first' : ''}">
          <div class="rank-position-col">
            <span class="rank-num">#${rank}</span>
          </div>

          <div class="house-shield-icon" style="font-size: 26px;">🏰</div>

          <div class="rank-info-col">
            <div class="rank-player-name">${h.name}</div>
            <div class="rank-sub-meta">
              <span>👥 ${h.playerCount} Mitglieder • Ø ${avg} Pkt / Spieler</span>
            </div>
            <div class="house-members-avatars" style="display: flex; gap: 4px; margin-top: 4px;">
              ${h.members.map(m => `
                <img src="${m.avatar || ProfileModule.generateDefaultAvatar(m.name)}" title="${m.name} (${m.points} Pkt)" class="mini-avatar" />
              `).join("")}
            </div>
          </div>

          <div class="rank-score-col">
            <div class="rank-points-val">${h.totalPoints}</div>
            <div class="rank-points-lbl">Gesamt</div>
          </div>
        </div>
      `;
    }).join("");
  },

  // --- 🍺 OFFIZIELLES PEGEL-TURNIER LEADERBOARD ---
  renderPromilleTournament(container) {
    const tourney = window.store.getPromilleLeaderboard(this.genderFilter);
    const currentUser = window.store.state.currentUser;

    const optInBanner = `
      <div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.18), rgba(0,0,0,0.6)); border: 2px solid var(--walibi-yellow); border-radius: 12px; padding: 12px; margin-bottom: 14px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 24px;">🚨🍻</span>
            <div>
              <strong style="font-size: 13px; color: var(--walibi-yellow); text-transform: uppercase;">Pegel-Turnier 2026</strong>
              <div style="font-size: 10.5px; color: #cbd5e1;">2 Live-Rankings • Messwerte vom offiziellen Testgerät</div>
            </div>
          </div>
          <button type="button" class="btn-primary" style="padding: 6px 10px; font-size: 11.5px; background: var(--gradient-gold); color: #000; font-weight: 900; border-radius: 8px;" onclick="FeedModule.openPromilleModal()">
            ➕ Messen (+10 XP)
          </button>
        </div>
        ${currentUser ? `
          <div style="font-size: 11px; color: var(--text-muted); display: flex; align-items: center; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 6px; margin-top: 6px;">
            <span>Dein Turnier-Status: <strong>${currentUser.promilleOptIn !== false ? '✅ Angemeldet' : '❌ Opt-out'}</strong></span>
            <button type="button" style="background: none; border: none; color: var(--walibi-yellow); font-size: 11px; cursor: pointer; text-decoration: underline; font-weight: 700;" onclick="ProfileModule.openMyProfileModal()">Ändern</button>
          </div>
        ` : ''}
      </div>
    `;

    if (tourney.totalParticipants === 0) {
      container.innerHTML = optInBanner + `
        <div style="text-align: center; padding: 24px 16px; background: rgba(0,0,0,0.4); border: 2px dashed rgba(255,255,255,0.15); border-radius: 12px;">
          <div style="font-size: 32px; margin-bottom: 8px;">💨🧪</div>
          <h3 style="font-size: 15px; color: var(--walibi-yellow); margin-bottom: 4px;">Noch keine Messungen im Turnier!</h3>
          <p style="font-size: 12px; color: var(--text-muted); max-width: 320px; margin: 0 auto 12px;">Puste ins Testgerät und trage deinen ersten Promille-Wert ein, um die Live-Rankings zu eröffnen.</p>
          <button type="button" class="btn-primary" style="background: var(--gradient-gold); color: #000; font-weight: 900; padding: 10px 18px; font-size: 13px;" onclick="FeedModule.openPromilleModal()">
            🚨 ERSTE MESSUNG EINTRAGEN (+10 XP)
          </button>
        </div>
      `;
      return;
    }

    // 1. HIGHSCORES (SPITZENWERT)
    const highscoreHtml = `
      <div style="margin-bottom: 18px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
          <div style="font-size: 12px; font-weight: 900; color: #fbbf24; text-transform: uppercase; letter-spacing: 0.5px;">
            🏆 1. Highscore-Könige (Höchster Spitzenwert):
          </div>
          <span style="font-size: 10px; color: var(--text-muted);">${tourney.highscores.length} Teilnehmer</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${tourney.highscores.map((item, idx) => {
            const rank = idx + 1;
            const p = item.player;
            const isMe = currentUser && currentUser.id === p.id;
            const userClass = (window.RPG_CLASSES || []).find(c => c.id === p.rpgClass) || { icon: "🎢", name: "Walibi Abenteurer" };
            const genderIcon = p.gender === "female" ? '<span style="color: #f472b6; font-size: 12px;" title="Weiblein">♀️</span>' : (p.gender === "other" ? '<span style="color: #c084fc; font-size: 12px;" title="Divers">🌈</span>' : '<span style="color: #60a5fa; font-size: 12px;" title="Männlein">♂️</span>');
            return `
              <div class="rank-card ${rank === 1 ? 'rank-first' : ''} ${isMe ? 'rank-me' : ''}" onclick="LeaderboardModule.openPlayerDetailModal('${p.id}')">
                <div class="rank-position-col">
                  ${rank === 1 ? '<span class="rank-crown">👑 1.</span>' : (rank === 2 ? '<span class="rank-medal">🥈 2.</span>' : (rank === 3 ? '<span class="rank-medal">🥉 3.</span>' : `<span class="rank-num">#${rank}</span>`))}
                </div>
                <img src="${p.avatar || ProfileModule.generateDefaultAvatar(p.name)}" class="rank-avatar" />
                <div class="rank-info-col">
                  <div class="rank-player-name">
                    ${p.name} ${genderIcon} ${isMe ? '<span class="you-badge">(Du)</span>' : ''}
                    ${rank === 1 ? '<span class="feed-house-tag" style="background: rgba(251, 191, 36, 0.2); color: #fbbf24; border-color: #fbbf24;">👑 Pegel-König</span>' : ''}
                  </div>
                  <div class="rank-sub-meta">
                    <span class="rank-house-badge">${p.house || 'Haus'}</span>
                    <span style="color: var(--walibi-yellow); font-size: 10.5px;">${userClass.icon} ${userClass.name}</span>
                  </div>
                  <div style="font-size: 10px; color: var(--text-dim); margin-top: 2px;">
                    ⏰ Gemessen um ${item.peakTime || 'k.A.'} ${item.peakNote ? `• <em>"${item.peakNote}"</em>` : ''}
                  </div>
                </div>
                <div class="rank-score-col" style="text-align: right;">
                  <div class="rank-points-val" style="color: #f43f5e; font-size: 20px;">${item.peakValue.toFixed(2)} ‰</div>
                  <div class="rank-points-lbl">${item.logsCount} ${item.logsCount === 1 ? 'Messung' : 'Messungen'}</div>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;

    // 2. KONSTANZ-KÖNIGE (DURCHSCHNITT)
    const consistencyHtml = `
      <div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
          <div style="font-size: 12px; font-weight: 900; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.5px;">
            👑 2. Konstanz-Könige (Höchster Durchschnitt):
          </div>
          <span style="font-size: 10px; color: var(--text-muted);">Marathon-Pegel</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${tourney.consistency.map((item, idx) => {
            const rank = idx + 1;
            const p = item.player;
            const isMe = currentUser && currentUser.id === p.id;
            const genderIcon = p.gender === "female" ? '<span style="color: #f472b6; font-size: 12px;" title="Weiblein">♀️</span>' : (p.gender === "other" ? '<span style="color: #c084fc; font-size: 12px;" title="Divers">🌈</span>' : '<span style="color: #60a5fa; font-size: 12px;" title="Männlein">♂️</span>');
            return `
              <div class="rank-card ${rank === 1 ? 'rank-first' : ''} ${isMe ? 'rank-me' : ''}" onclick="LeaderboardModule.openPlayerDetailModal('${p.id}')">
                <div class="rank-position-col">
                  ${rank === 1 ? '<span class="rank-crown">👑 1.</span>' : `<span class="rank-num">#${rank}</span>`}
                </div>
                <img src="${p.avatar || ProfileModule.generateDefaultAvatar(p.name)}" class="rank-avatar" />
                <div class="rank-info-col">
                  <div class="rank-player-name">
                    ${p.name} ${genderIcon} ${isMe ? '<span class="you-badge">(Du)</span>' : ''}
                    ${rank === 1 ? '<span class="feed-house-tag" style="background: rgba(56, 189, 248, 0.2); color: #38bdf8; border-color: #38bdf8;">👑 Konstanz-König</span>' : ''}
                  </div>
                  <div class="rank-sub-meta">
                    <span class="rank-house-badge">${p.house || 'Haus'}</span>
                    <span style="color: #38bdf8; font-size: 10.5px; font-weight: 800;">Min: ${item.minVal}‰ / Max: ${item.maxVal}‰</span>
                  </div>
                  <div style="font-size: 10px; color: var(--text-dim); margin-top: 2px;">
                    Gesamt: ${item.logsCount} ${item.logsCount === 1 ? 'Messwert' : 'Messwerte'}
                  </div>
                </div>
                <div class="rank-score-col" style="text-align: right;">
                  <div class="rank-points-val" style="color: #38bdf8; font-size: 20px;">Ø ${item.avgFormatted} ‰</div>
                  <div class="rank-points-lbl">Schnitt</div>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;

    container.innerHTML = optInBanner + highscoreHtml + consistencyHtml;
  },

  openPlayerDetailModal(playerId) {
    const player = window.store.state.players.find(p => p.id === playerId);
    if (!player) return;

    const modal = document.getElementById("playerDetailModal");
    if (!modal) return;

    document.getElementById("modalPlayerName").textContent = player.name;
    const genderTag = player.gender === "female" ? "♀️ Mrs. Walibi" : "♂️ Mr. Walibi";
    document.getElementById("modalPlayerHouse").textContent = `${player.house || 'Haus 1'} • ${genderTag}`;
    document.getElementById("modalPlayerAvatar").src = player.avatar || ProfileModule.generateDefaultAvatar(player.name);
    document.getElementById("modalPlayerPoints").textContent = `${player.points} Punkte`;

    // 1. RPG CHARAKTER-KARTE & STATUSWERTE
    const rpgCardEl = document.getElementById("modalPlayerRpgCard");
    if (rpgCardEl) {
      const userClass = (window.RPG_CLASSES || []).find(c => c.id === player.rpgClass) || {
        icon: "🎢",
        name: "Walibi Abenteurer",
        tagline: "Bereit für jedes Fahrgeschäft",
        desc: "Erforscht die Attraktionen des Parks.",
        buff: "Universal-Abenteurer"
      };
      const stats = player.stats || { magen: 5, blase: 5, geduld: 5, durst: 5, adrenalin: 5 };
      const statsDefs = window.RPG_STATS || [];

      rpgCardEl.innerHTML = `
        <div style="background: rgba(15, 23, 42, 0.85); border: 2px solid var(--walibi-yellow); border-radius: 12px; padding: 12px;">
          <!-- KLASSEN HEADER -->
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 24px;">${userClass.icon}</span>
              <div>
                <strong style="font-size: 14px; color: var(--walibi-yellow);">${userClass.name}</strong>
                <div style="font-size: 10.5px; color: #38bdf8; font-weight: 700;">„${userClass.tagline}“</div>
              </div>
            </div>
            <span class="map-tag-pill" style="font-size: 9px;">${(userClass.category || 'ACTION').toUpperCase()}</span>
          </div>
          <p style="font-size: 11px; color: #cbd5e1; margin-bottom: 8px; line-height: 1.35;">${userClass.desc}</p>
          <div style="background: rgba(255,204,0,0.15); border: 1px solid var(--walibi-yellow); color: var(--walibi-yellow); border-radius: 6px; padding: 4px 8px; font-size: 10.5px; font-weight: 800; margin-bottom: 10px;">
            ⚡ Buff: ${userClass.buff}
          </div>

          <!-- 5 STATUSWERTE -->
          <div style="font-size: 11px; font-weight: 900; color: #38bdf8; text-transform: uppercase; margin-bottom: 6px;">📊 Statuswerte:</div>
          <div style="display: flex; flex-direction: column; gap: 6px;">
            ${statsDefs.map(s => {
              const val = Math.max(1, Math.min(10, Number(stats[s.id] !== undefined ? stats[s.id] : 5)));
              const percent = (val / 10) * 100;
              return `
                <div style="background: rgba(0,0,0,0.4); border-radius: 6px; padding: 4px 8px;">
                  <div style="display: flex; justify-content: space-between; font-size: 10.5px; margin-bottom: 2px;">
                    <span>${s.icon} <strong style="color: #fff;">${s.name}</strong></span>
                    <span style="color: ${s.color}; font-weight: 900;">${val}/10</span>
                  </div>
                  <div style="height: 4px; background: rgba(255,255,255,0.1); border-radius: 999px; overflow: hidden;">
                    <div style="width: ${percent}%; height: 100%; background: ${s.color}; border-radius: 999px;"></div>
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        </div>
      `;
    }

    // 2. FREIGESCHALTETE TITEL
    const titlesListEl = document.getElementById("modalPlayerTitlesList");
    if (titlesListEl) {
      const userTitleIds = Array.isArray(player.unlockedTitles) ? player.unlockedTitles : [];
      const allTitles = [...(window.PROMILLE_MILESTONES || []), ...(window.ACTION_TITLES || [])];
      const unlocked = allTitles.filter(t => userTitleIds.includes(t.id));

      if (unlocked.length === 0) {
        titlesListEl.innerHTML = `
          <div style="background: rgba(0,0,0,0.3); border: 1px dashed rgba(255,255,255,0.15); border-radius: 8px; padding: 8px 10px; font-size: 11px; color: var(--text-dim); text-align: center;">
            Noch keine Titel freigeschaltet.
          </div>
        `;
      } else {
        titlesListEl.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px;">
            ${unlocked.map(t => `
              <div style="display: flex; align-items: center; justify-content: space-between; background: linear-gradient(135deg, rgba(255,204,0,0.15), rgba(0,0,0,0.5)); border: 1.5px solid var(--walibi-yellow); border-radius: 8px; padding: 6px 10px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-size: 16px;">${t.icon || '🎖️'}</span>
                  <div>
                    <strong style="font-size: 11.5px; color: var(--walibi-yellow);">${t.title}</strong>
                    <div style="font-size: 10px; color: var(--text-muted);">${t.desc || ''}</div>
                  </div>
                </div>
                <span style="color: #34d399; font-size: 9px; font-weight: 900; background: rgba(16,185,129,0.2); border: 1px solid #10b981; padding: 2px 6px; border-radius: 4px;">AKTIV</span>
              </div>
            `).join("")}
          </div>
        `;
      }
    }

    // Getränke-Übersicht des Spielers
    const drinksDetail = player.drinksDetail || { beer: 0, shot: 0, longdrink: 0, joint: 0, water: 0 };
    const items = window.store.state.counterItems || window.COUNTER_ITEMS;
    const drinksHtml = `
      <div style="margin-bottom: 12px; padding: 10px; background: var(--bg-comic-card-light); border-radius: var(--radius-md); border: 1.5px solid rgba(255,255,255,0.1);">
        <div style="font-size: 12px; font-weight: 800; color: var(--comic-yellow); margin-bottom: 6px; text-transform: uppercase;">🍺 Getränke-Konto (${player.drinksCount || 0} Gesamt):</div>
        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
          ${items.map(it => `
            <div style="background: rgba(0,0,0,0.3); padding: 4px 8px; border-radius: 8px; font-size: 11px; font-weight: 700; display: flex; align-items: center; gap: 4px;">
              <span>${it.icon}</span>
              <span>${it.name.split("/")[0]}:</span>
              <span style="color: var(--comic-yellow); font-weight: 800;">${drinksDetail[it.id] || 0}x</span>
            </div>
          `).join("")}
        </div>
      </div>
    `;

    // Nebenquests des Spielers
    const allSideQuests = window.SIDE_QUESTS || [];
    const playerSideQuestIds = player.completedSideQuests || [];
    const playerSideQuests = allSideQuests.filter(sq => playerSideQuestIds.includes(sq.id));
    const sideQuestPoints = playerSideQuests.reduce((sum, s) => sum + (s.points || 0), 0);

    let sideQuestsHtml = "";
    if (playerSideQuests.length > 0) {
      sideQuestsHtml = `
        <div style="margin-bottom: 12px; padding: 10px; background: rgba(0, 0, 0, 0.35); border: 2px solid rgba(255, 204, 0, 0.4); border-radius: var(--radius-md);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 11px; font-weight: 900; color: var(--walibi-yellow); text-transform: uppercase;">🏅 Nebenquest-Orden (${playerSideQuests.length}/${allSideQuests.length}):</span>
            <span class="points-badge" style="font-size: 10px;">+${sideQuestPoints} Pkt</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 6px;">
            ${playerSideQuests.map(sq => `
              <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(0, 0, 0, 0.5)); border: 1.5px solid #10b981; border-radius: 8px; padding: 6px 10px; display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-size: 16px;">🏆</span>
                  <div>
                    <div style="font-size: 12px; font-weight: 900; color: #fff;">${sq.title}</div>
                    <div style="font-size: 10px; color: #94a3b8;">${sq.desc}</div>
                  </div>
                </div>
                <span style="font-size: 11px; font-weight: 900; color: #34d399; white-space: nowrap;">+${sq.points} P</span>
              </div>
            `).join("")}
          </div>
        </div>
      `;
    }

    // Haupt-Challenges des Spielers
    const completedIds = player.completedQuests || [];
    const allQuests = window.store.state.quests || [];
    const myQuests = allQuests.filter(q => completedIds.includes(q.id));
    const mainQuestPoints = myQuests.reduce((sum, q) => sum + (q.points || 0), 0);

    let mainQuestsHtml = "";
    if (myQuests.length > 0) {
      mainQuestsHtml = `
        <div style="margin-bottom: 12px; padding: 10px; background: rgba(0, 0, 0, 0.35); border: 2px solid rgba(225, 29, 72, 0.45); border-radius: var(--radius-md);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 11px; font-weight: 900; color: #fda4af; text-transform: uppercase;">🎯 Gemeisterte Haupt-Challenges (${myQuests.length}/${allQuests.length}):</span>
            <span class="points-badge" style="font-size: 10px; background: var(--gradient-rose); color: #fff;">+${mainQuestPoints} Pkt</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 6px;">
            ${myQuests.map(q => `
              <div style="background: linear-gradient(135deg, rgba(225, 29, 72, 0.22), rgba(0, 0, 0, 0.5)); border: 1.5px solid #e11d48; border-radius: 8px; padding: 6px 10px; display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-size: 16px;">${q.icon || '🎯'}</span>
                  <div>
                    <div style="font-size: 12px; font-weight: 900; color: #fff;">${q.title}</div>
                    <div style="font-size: 10px; color: #cbd5e1;">${q.description || q.desc || ''}</div>
                  </div>
                </div>
                <span style="font-size: 11px; font-weight: 900; color: #fb7185; white-space: nowrap;">+${q.points} P</span>
              </div>
            `).join("")}
          </div>
        </div>
      `;
    } else {
      mainQuestsHtml = `
        <div style="margin-bottom: 12px; padding: 10px; background: rgba(255,255,255,0.03); border-radius: var(--radius-md); text-align: center; font-size: 12px; color: var(--text-dim);">
          Noch keine Haupt-Challenges eingereicht.
        </div>
      `;
    }

    const questsList = document.getElementById("modalPlayerQuestsList");
    questsList.innerHTML = drinksHtml + mainQuestsHtml + sideQuestsHtml + `
      <button type="button" class="btn-primary" style="margin-top: 10px; font-size: 13px; font-weight: 900; background: var(--gradient-gold); color: #000;" onclick="LeaderboardModule.openFullCertificate('${player.id}')">
        📜 VOLLSTÄNDIGES ZEUGNIS ÖFFNEN
      </button>
    `;

    modal.classList.remove("hidden");

    const closeBtn = document.getElementById("closePlayerDetailModal");
    if (closeBtn) {
      closeBtn.onclick = () => modal.classList.add("hidden");
    }
  },

  openFullCertificate(playerId) {
    const modal = document.getElementById("playerDetailModal");
    if (modal) modal.classList.add("hidden");
    if (window.AwardsModule) {
      window.AwardsModule.openCelebrationModal(false, playerId);
    }
  }
};

window.LeaderboardModule = LeaderboardModule;
