/**
 * Aufgaben & Quest-System mit zuverlässigem Modal-Handling,
 * abwechselnden Maskottchen und Audio-Effekten
 */
const QuestsModule = {
  currentCategoryFilter: "all",
  activeQuest: null,
  capturedPhotoBase64: null,
  selectedOutcomeId: null,
  selectedWitnessIds: [],
  isFaithBased: false,
  currentPromilleValue: null,
  stopwatchInterval: null,
  stopwatchTimeLeft: 60,
  stopwatchRunning: false,
  selectedBossDuelCategory: "overall",
  selectedBossWinnerId: null,

  init() {
    this.setupCategoryFilters();
    this.setupQuestModal();
    this.renderQuests();
  },

  setupCategoryFilters() {
    const filterButtons = document.querySelectorAll(".quest-filter-btn");
    filterButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        if (window.GameAudio) window.GameAudio.playClick();
        filterButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.currentCategoryFilter = btn.dataset.category;
        this.renderQuests();
      });
    });
  },

  renderQuests() {
    const container = document.getElementById("questsGridContainer");
    if (!container) return;

    const quests = (window.store && window.store.state && window.store.state.quests) || window.DEFAULT_QUESTS || [];
    const currentUser = window.store ? window.store.state.currentUser : null;
    const completedList = (currentUser && currentUser.completedQuests) || [];

    const filtered = quests.filter(q => {
      if (this.currentCategoryFilter === "all") return true;
      if (this.currentCategoryFilter === "open") return !completedList.includes(q.id);
      if (this.currentCategoryFilter === "completed") return completedList.includes(q.id);
      return q.category === this.currentCategoryFilter;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="text-align: center; padding: 24px; color: var(--text-muted);">
          <span style="font-size: 36px; display: block; margin-bottom: 8px;">🎯</span>
          <p>Keine Aufgaben in dieser Kategorie gefunden.</p>
        </div>
      `;
      return;
    }

    const isHH = window.store && window.store.isHappyHourActive();
    const multiplier = isHH ? 2 : 1;

    container.innerHTML = filtered.map((q, idx) => {
      const isCompletedByMe = completedList.includes(q.id);
      const playersCompleted = (window.store ? window.store.state.players : []).filter(p => p.completedQuests && p.completedQuests.includes(q.id));

      const displayPoints = q.points * multiplier;
      let badgeHtml = `<span class="points-badge ${isHH ? 'happy-hour-glow' : ''}">+${displayPoints} Pkt${isHH ? ' ⚡ 2X' : ''}</span>`;
      if (q.hasPromilleInput) {
        badgeHtml += ` <span style="background: rgba(225,29,72,0.3); color: #fda4af; font-size: 10px; font-weight: 900; padding: 2px 6px; border-radius: 999px; border: 1px solid #e11d48;">📈 +5 Pkt/0.1‰</span>`;
      }
      if (q.hasStopwatch) {
        badgeHtml += ` <span style="background: rgba(14,165,233,0.3); color: #7dd3fc; font-size: 10px; font-weight: 900; padding: 2px 6px; border-radius: 999px; border: 1px solid #0ea5e9;">⏱️ 60 Sek.</span>`;
      }
      if (q.isEndBossQuest) {
        badgeHtml += ` <span style="background: linear-gradient(135deg, #ffcc00, #e11d48); color: #000; font-size: 10px; font-weight: 900; padding: 2px 6px; border-radius: 999px;">👑 4 Finale</span>`;
      }
      if (q.bonusPoints) {
        badgeHtml += ` <span style="background: rgba(255,204,0,0.3); color: #ffcc00; font-size: 10px; font-weight: 900; padding: 2px 6px; border-radius: 999px; border: 1px solid #ffcc00;">🔥 +${q.bonusPoints} Pkt Gruppe</span>`;
      }
      if (q.penaltyPoints) {
        badgeHtml += ` <span style="background: rgba(239,68,68,0.3); color: #fca5a5; font-size: 10px; font-weight: 900; padding: 2px 6px; border-radius: 999px; border: 1px solid #ef4444;">🔴 ${q.penaltyPoints} Malus</span>`;
      }
      if (q.outcomes && q.outcomes.some(o => o.points < 0)) {
        const minVal = Math.min(...q.outcomes.map(o => o.points));
        badgeHtml += ` <span style="background: rgba(239,68,68,0.3); color: #fca5a5; font-size: 10px; font-weight: 900; padding: 2px 6px; border-radius: 999px; border: 1px solid #ef4444;">🔴 ${minVal} Malus</span>`;
      }
      if (q.difficultyLabel) {
        badgeHtml = `<span class="difficulty-badge difficulty-${q.difficulty}">${q.difficultyLabel}</span> ` + badgeHtml;
      }
      if (q.witnessRequirement === "required" || q.requiresWitness) {
        badgeHtml += ` <span style="background: rgba(59,130,246,0.3); color: #93c5fd; font-size: 10px; font-weight: 900; padding: 2px 6px; border-radius: 999px; border: 1px solid #3b82f6;">👁️ Zeuge Pflicht</span>`;
      }
      if (q.requiresVoting) {
        badgeHtml += ` <span class="voting-badge">⭐ Voting</span>`;
      }
      if (q.type === "video") {
        badgeHtml += ` <span style="background: rgba(225,29,72,0.3); color: #fda4af; font-size: 10px; font-weight: 900; padding: 2px 6px; border-radius: 999px; border: 1px solid #e11d48;">🎥 Video</span>`;
      } else if (q.requirePhoto) {
        badgeHtml += ` <span style="background: rgba(225,29,72,0.3); color: #fda4af; font-size: 10px; font-weight: 900; padding: 2px 6px; border-radius: 999px; border: 1px solid #e11d48;">📸 Foto</span>`;
      }

      return `
        <div class="quest-card ${isCompletedByMe ? 'completed' : ''}" onclick="QuestsModule.openQuestDetails('${q.id}')">
          <div class="quest-card-header">
            <span class="quest-icon">${q.icon || '🎢'}</span>
            <div class="quest-badges">
              ${badgeHtml}
            </div>
          </div>
          <h3 class="quest-title">${q.title}</h3>
          <p class="quest-desc-snippet">${q.description}</p>
          
          <div class="quest-card-footer">
            <div class="completed-avatars">
              ${playersCompleted.slice(0, 3).map(p => `
                <img src="${p.avatar || ProfileModule.generateDefaultAvatar(p.name)}" title="${p.name}" class="mini-avatar" />
              `).join("")}
              ${playersCompleted.length > 3 ? `<span class="more-count">+${playersCompleted.length - 3}</span>` : ''}
              ${playersCompleted.length === 0 ? `<span class="text-muted">Noch unberührt</span>` : ''}
            </div>
            <button class="btn-quest-action">
              ${isCompletedByMe ? '✅ Erledigt' : 'Details & Mission 👉'}
            </button>
          </div>
        </div>
      `;
    }).join("");
  },

  openQuestDetails(questId) {
    if (window.GameAudio) window.GameAudio.playClick();

    const allQuests = (window.store && window.store.state && window.store.state.quests) || window.DEFAULT_QUESTS || [];
    let quest = allQuests.find(q => q.id === questId);
    if (!quest) {
      quest = window.DEFAULT_QUESTS.find(q => q.id === questId);
    }
    if (!quest) return;

    this.activeQuest = quest;
    this.capturedPhotoBase64 = null;
    this.selectedWitnessIds = [];
    this.isFaithBased = false;
    this.selectedBossWinnerId = null;

    // Reset Faith Checkbox
    const faithCheckbox = document.getElementById("questFaithCheckbox");
    if (faithCheckbox) faithCheckbox.checked = false;

    const modal = document.getElementById("questDetailModal");
    if (!modal) return;

    document.getElementById("modalQuestTitle").textContent = quest.title;
    document.getElementById("modalQuestDesc").textContent = quest.description;

    // 1. Maskottchen Zuweisung
    const mascots = window.WALIBI_MASCOTS || [];
    const questIndex = window.DEFAULT_QUESTS.findIndex(q => q.id === quest.id);
    
    let assignedMascot = null;
    if (quest.mascotId) {
      assignedMascot = mascots.find(m => m.id === quest.mascotId);
    }
    if (!assignedMascot && mascots.length > 0) {
      const targetIdx = (questIndex >= 0 ? questIndex : 0) % mascots.length;
      assignedMascot = mascots[targetIdx];
    }
    if (!assignedMascot) {
      assignedMascot = mascots[0];
    }

    const mascotAvatarEl = document.getElementById("modalMascotAvatar");
    const mascotNameEl = document.getElementById("modalMascotName");
    const speakerLabelEl = document.getElementById("modalMascotSpeakerLabel");
    const quoteEl = document.getElementById("modalMascotQuote");

    if (mascotAvatarEl) mascotAvatarEl.src = assignedMascot.avatar;
    if (mascotNameEl) mascotNameEl.textContent = assignedMascot.name;
    if (speakerLabelEl) speakerLabelEl.textContent = `💬 ${assignedMascot.name} erklärt:`;
    if (quoteEl) quoteEl.textContent = `"${quest.mascotQuote || assignedMascot.quote}"`;

    // 2. PROMILLE-MESSGERÄT SECTION
    const promilleSec = document.getElementById("questPromilleSection");
    const promilleInp = document.getElementById("questPromilleInput");
    if (quest.hasPromilleInput) {
      if (promilleSec) promilleSec.classList.remove("hidden");
      const defaultP = (quest.minPromille || 1.0).toFixed(2);
      if (promilleInp) {
        promilleInp.min = quest.minPromille || 0.8;
        promilleInp.value = defaultP;
        this.currentPromilleValue = parseFloat(defaultP);
      }
      this.handlePromilleInput(defaultP);
    } else {
      if (promilleSec) promilleSec.classList.add("hidden");
      this.currentPromilleValue = null;
    }

    // 3. STOPPUHR SECTION (FÜR WEGZOLL)
    const stopwatchSec = document.getElementById("questStopwatchSection");
    if (quest.hasStopwatch) {
      if (stopwatchSec) stopwatchSec.classList.remove("hidden");
      this.resetStopwatch();
    } else {
      if (stopwatchSec) stopwatchSec.classList.add("hidden");
      this.resetStopwatch();
    }

    // 4. END-BOSS 4-KÄMPFE DUELLE SECTION
    const endBossSec = document.getElementById("questEndBossSection");
    if (quest.isEndBossQuest) {
      if (endBossSec) endBossSec.classList.remove("hidden");
      this.selectedBossDuelCategory = "overall";
      this.selectedBossWinnerId = null;
      document.querySelectorAll(".end-boss-tab-btn").forEach(btn => {
        btn.classList.toggle("active", btn.id === "bossDuelTab_overall");
      });
      this.renderEndBossDuelUI();
    } else {
      if (endBossSec) endBossSec.classList.add("hidden");
    }

    // 5. ERGEBNISSE / OUTCOMES (Erfolg vs. Kotz-Malus / Coaster Auswahl)
    const outcomeSection = document.getElementById("questOutcomeSection");
    const outcomeList = document.getElementById("questOutcomeOptionsList");
    const isHH = window.store && window.store.isHappyHourActive();
    const multiplier = isHH ? 2 : 1;

    if (quest.outcomes && quest.outcomes.length > 0) {
      this.selectedOutcomeId = quest.outcomes[0].id;
      if (outcomeSection) outcomeSection.classList.remove("hidden");
      const labelEl = document.getElementById("questOutcomeLabel");
      if (labelEl) {
        labelEl.textContent = quest.outcomeLabel || "🎯 Wie ist die Challenge ausgegangen?";
      }
      if (outcomeList) {
        outcomeList.innerHTML = quest.outcomes.map(o => {
          const outcomePts = o.points > 0 ? (o.points * multiplier) : o.points;
          return `
            <div class="quest-outcome-card ${o.id === this.selectedOutcomeId ? 'active' : ''} ${o.points < 0 ? 'outcome-penalty' : 'outcome-success'}" onclick="QuestsModule.selectOutcome('${o.id}')">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 16px;">${o.id === this.selectedOutcomeId ? '🔘' : '⚪'}</span>
                <span style="font-weight: 800; font-size: 13px; color: #fff;">${o.label}</span>
              </div>
              <span class="outcome-points-badge ${o.points < 0 ? 'negative' : 'positive'} ${isHH && o.points > 0 ? 'happy-hour-glow' : ''}">
                ${outcomePts > 0 ? `+${outcomePts}` : outcomePts} Pkt${isHH && o.points > 0 ? ' ⚡ 2X' : ''}
              </span>
            </div>
          `;
        }).join("");
      }
    } else {
      this.selectedOutcomeId = null;
      if (outcomeSection) outcomeSection.classList.add("hidden");
    }

    // 6. ZEUGEN-AUSWAHL RENDERN
    this.renderWitnessSelector(quest);

    // 7. Foto- / Video-Bedingung anzeigen & Punkte-Vorschau aktualisieren
    this.updatePointsPreview();
    this.updateMediaRequirementsUI();

    // 8. Voting Hinweis
    const votingNote = document.getElementById("modalVotingNote");
    if (votingNote) {
      if (quest.requiresVoting) {
        votingNote.classList.remove("hidden");
        votingNote.innerHTML = `⭐ <strong>Gruppen-Voting:</strong> Diese Challenge wird von der Gruppe bewertet! Die Punkte werden gutgeschrieben, sobald <strong>60% der Freunde</strong> abgestimmt haben.`;
      } else {
        votingNote.classList.add("hidden");
      }
    }

    // 9. Kommentar-Feld leeren
    const commentInput = document.getElementById("questCommentInput");
    if (commentInput) commentInput.value = "";

    // 10. Wildcard-Felder einblenden, falls eigene kreative Aufgabe
    const wildcardSection = document.getElementById("wildcardCustomSection");
    if (wildcardSection) {
      if (quest.id === "visitor_wildcard_creative") {
        wildcardSection.classList.remove("hidden");
        document.getElementById("wildcardTitleInput").value = "";
        document.getElementById("wildcardDescInput").value = "";
      } else {
        wildcardSection.classList.add("hidden");
      }
    }

    // Reset Camera & Preview
    this.removeCapturedPhoto();

    // 11. Liste der Freunde rendern
    this.renderCompletedFriendsList(quest.id);

    // Modal anzeigen
    modal.classList.remove("hidden");
  },

  handlePromilleInput(val) {
    const num = parseFloat(val);
    this.currentPromilleValue = isNaN(num) ? null : num;
    
    const quest = this.activeQuest;
    const calcEl = document.getElementById("questPromilleCalculatedPts");
    if (quest && quest.hasPromilleInput && calcEl) {
      const minP = quest.minPromille || 1.0;
      const basePts = quest.basePoints || quest.points || 40;
      let total = basePts;
      if (this.currentPromilleValue && this.currentPromilleValue >= minP) {
        const excess = Math.max(0, this.currentPromilleValue - minP);
        const steps = Math.floor((excess + 0.001) / (quest.promilleStepSize || 0.10));
        const bonus = steps * (quest.promilleStepPoints || 5);
        total += bonus;
      }
      calcEl.textContent = `+${total} Pkt`;
    }

    this.updatePointsPreview();
  },

  // --- ⏱️ STOPPUHR CONTROLLER (FÜR WEGZOLL) ---
  toggleStopwatch() {
    const btn = document.getElementById("btnStartStopwatch");
    const display = document.getElementById("stopwatchDisplay");

    if (this.stopwatchRunning) {
      // Pause
      clearInterval(this.stopwatchInterval);
      this.stopwatchRunning = false;
      if (btn) btn.textContent = "▶️ Weiter";
      if (window.GameAudio) window.GameAudio.playClick();
    } else {
      // Start
      this.stopwatchRunning = true;
      if (btn) btn.textContent = "⏸️ Pause";
      if (window.GameAudio) window.GameAudio.playFanfare();

      this.stopwatchInterval = setInterval(() => {
        this.stopwatchTimeLeft--;
        const mins = Math.floor(this.stopwatchTimeLeft / 60);
        const secs = this.stopwatchTimeLeft % 60;
        if (display) {
          display.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }

        if (this.stopwatchTimeLeft <= 0) {
          clearInterval(this.stopwatchInterval);
          this.stopwatchRunning = false;
          if (btn) btn.textContent = "⏰ ZEIT UM!";
          if (display) {
            display.textContent = "00:00";
            display.style.color = "#ef4444";
          }
          if (window.GameAudio) window.GameAudio.playClick();
          if (window.app && window.app.showToast) {
            window.app.showToast("⏰ 60 SEKUNDEN ABGELAUFEN! Mautstellen-Zeit ist um!");
          }
        }
      }, 1000);
    }
  },

  resetStopwatch() {
    clearInterval(this.stopwatchInterval);
    this.stopwatchRunning = false;
    this.stopwatchTimeLeft = 60;
    const btn = document.getElementById("btnStartStopwatch");
    const display = document.getElementById("stopwatchDisplay");
    if (btn) btn.textContent = "▶️ Start";
    if (display) {
      display.textContent = "01:00";
      display.style.color = "#fff";
    }
  },

  // --- 👑 END-BOSS 4-KÄMPFE DUELLE SYSTEM ---
  selectBossDuel(category) {
    if (window.GameAudio) window.GameAudio.playClick();
    this.selectedBossDuelCategory = category;
    this.selectedBossWinnerId = null;

    document.querySelectorAll(".end-boss-tab-btn").forEach(btn => {
      btn.classList.toggle("active", btn.id === `bossDuelTab_${category}`);
    });

    this.renderEndBossDuelUI();
  },

  renderEndBossDuelUI() {
    const container = document.getElementById("endBossFighterContainer");
    if (!container) return;

    const players = (window.store && window.store.state && window.store.state.players) || [];
    if (players.length === 0) {
      container.innerHTML = `<div style="text-align: center; color: var(--text-muted); font-size: 12px; padding: 10px;">Keine registrierten Spieler für das Finale vorhanden.</div>`;
      return;
    }

    let finalists = [];
    let duelTitle = "";
    let duelDesc = "";

    const isFemale = (p) => p.gender === "female" || p.name.toLowerCase() === "heidi" || (p.avatar && p.avatar.includes("prinzessin"));
    const isMale = (p) => !isFemale(p);

    if (this.selectedBossDuelCategory === "overall") {
      duelTitle = "🏆 GESAMT-FINALE (Platz 1 vs. Platz 2)";
      duelDesc = "Der ultimative Showdown um den Gesamtsieg der Walibi Sauftour 2026!";
      const sorted = [...players].sort((a, b) => (b.points || 0) - (a.points || 0));
      finalists = sorted.slice(0, 2);
    } else if (this.selectedBossDuelCategory === "mr") {
      duelTitle = "🎩 MR. WALIBI FINALE (Top 2 Männer)";
      duelDesc = "Duell der führenden Männer um den Titel 'Mr. Walibi 2026'!";
      const males = players.filter(isMale).sort((a, b) => (b.points || 0) - (a.points || 0));
      finalists = males.slice(0, 2);
    } else if (this.selectedBossDuelCategory === "mrs") {
      duelTitle = "👑 MRS. WALIBI FINALE (Damen-Wertung)";
      duelDesc = "Duell der führenden Frauen um den Titel 'Mrs. Walibi 2026'!";
      const females = players.filter(isFemale).sort((a, b) => (b.points || 0) - (a.points || 0));
      finalists = females.slice(0, 2);
    } else if (this.selectedBossDuelCategory === "promille") {
      duelTitle = "🍺 PROMILLE-KÖNIG FINALE (Top 2 Promille)";
      duelDesc = "Das Duell der beiden trinkfestesten Tour-Teilnehmer mit dem höchsten Pegel!";
      const calcPromille = (p) => {
        const d = p.drinksDetail || { beer: 0, shot: 0, longdrink: 0 };
        const logs = p.promilleLogs || [];
        const maxLog = logs.length > 0 ? Math.max(...logs.map(l => l.value || l.promille || 0)) : 0;
        const calc = (d.beer * 0.3) + (d.shot * 0.15) + (d.longdrink * 0.25);
        return Math.max(calc, maxLog);
      };
      const sorted = [...players].sort((a, b) => calcPromille(b) - calcPromille(a));
      finalists = sorted.slice(0, 2);
    }

    if (finalists.length === 0) {
      container.innerHTML = `
        <div style="font-size: 12px; font-weight: 900; color: #ffcc00; margin-bottom: 2px;">${duelTitle}</div>
        <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 10px;">${duelDesc}</div>
        <div style="text-align: center; color: var(--text-muted); font-size: 12px; padding: 16px; background: rgba(0,0,0,0.3); border-radius: 8px;">
          ❌ Keine qualifizierten Teilnehmerinnen/Teilnehmer in dieser Kategorie registriert.
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div style="font-size: 12px; font-weight: 900; color: #ffcc00; margin-bottom: 2px;">${duelTitle}</div>
      <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 10px;">${duelDesc}</div>
      <div style="font-size: 11px; font-weight: 800; color: #fff; margin-bottom: 6px;">
        👉 Wähle den Sieger des Duells (+70 Pkt):
      </div>
      ${finalists.map((f, idx) => {
        const isSelected = this.selectedBossWinnerId === f.id;
        const rankLabel = finalists.length === 1 ? '👑 Einzige Finalistin' : (idx === 0 ? '🥇 1. Platz' : '🥈 2. Platz');
        return `
          <div class="end-boss-fighter-card ${isSelected ? 'winner-selected' : ''}" onclick="QuestsModule.selectBossWinner('${f.id}')">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 18px;">${isSelected ? '👑' : (idx === 0 ? '🥇' : '🥈')}</span>
              <img src="${f.avatar || ProfileModule.generateDefaultAvatar(f.name)}" class="end-boss-fighter-avatar" />
              <div>
                <div style="font-weight: 900; font-size: 14px; color: #fff;">${f.name}</div>
                <div style="font-size: 11px; color: var(--walibi-yellow);">${rankLabel} • ${f.points || 0} Pkt • ${f.house || 'Haus 1'}</div>
              </div>
            </div>
            <div>
              <span class="outcome-points-badge ${isSelected ? 'positive happy-hour-glow' : 'positive'}" style="font-size: 12px;">
                ${isSelected ? '✅ SIEGER (+70 PKT)' : 'Auswählen ⚔️'}
              </span>
            </div>
          </div>
        `;
      }).join("")}
    `;
  },

  selectBossWinner(winnerId) {
    if (window.GameAudio) window.GameAudio.playClick();
    this.selectedBossWinnerId = winnerId;
    this.renderEndBossDuelUI();
    this.updateMediaRequirementsUI();
  },

  selectOutcome(outcomeId) {
    if (window.GameAudio) window.GameAudio.playClick();
    this.selectedOutcomeId = outcomeId;

    const isHH = window.store && window.store.isHappyHourActive();
    const multiplier = isHH ? 2 : 1;

    // UI aktualisieren
    const outcomeList = document.getElementById("questOutcomeOptionsList");
    if (outcomeList && this.activeQuest && this.activeQuest.outcomes) {
      outcomeList.innerHTML = this.activeQuest.outcomes.map(o => {
        const outcomePts = o.points > 0 ? (o.points * multiplier) : o.points;
        return `
          <div class="quest-outcome-card ${o.id === this.selectedOutcomeId ? 'active' : ''} ${o.points < 0 ? 'outcome-penalty' : 'outcome-success'}" onclick="QuestsModule.selectOutcome('${o.id}')">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 16px;">${o.id === this.selectedOutcomeId ? '🔘' : '⚪'}</span>
              <span style="font-weight: 800; font-size: 13px; color: #fff;">${o.label}</span>
            </div>
            <span class="outcome-points-badge ${o.points < 0 ? 'negative' : 'positive'} ${isHH && o.points > 0 ? 'happy-hour-glow' : ''}">
              ${outcomePts > 0 ? `+${outcomePts}` : outcomePts} Pkt${isHH && o.points > 0 ? ' ⚡ 2X' : ''}
            </span>
          </div>
        `;
      }).join("");
    }

    this.updatePointsPreview();
  },

  renderWitnessSelector(quest) {
    const listEl = document.getElementById("questWitnessList");
    const badgeEl = document.getElementById("questWitnessReqBadge");
    if (!listEl) return;

    const currentUser = window.store ? window.store.state.currentUser : null;
    const myId = currentUser ? currentUser.id : null;
    const players = (window.store ? window.store.state.players : []).filter(p => p.id !== myId);

    if (badgeEl) {
      const isReq = quest.witnessRequirement === "required" || quest.requiresWitness;
      badgeEl.textContent = isReq ? "🔴 Zeuge Pflicht" : "Optional";
      badgeEl.style.color = isReq ? "#ef4444" : "var(--text-dim)";
    }

    if (players.length === 0) {
      listEl.innerHTML = `<span style="font-size: 11px; color: var(--text-dim); font-style: italic;">Keine weiteren aktiven Spieler vorhanden</span>`;
      return;
    }

    listEl.innerHTML = players.map(p => {
      const isSel = this.selectedWitnessIds.includes(p.id);
      return `
        <div class="witness-chip ${isSel ? 'selected' : ''}" onclick="QuestsModule.toggleWitness('${p.id}')">
          <img src="${p.avatar || ProfileModule.generateDefaultAvatar(p.name)}" class="witness-chip-avatar" />
          <span class="witness-chip-name">${p.name}</span>
          <span style="font-size: 12px; margin-left: 2px;">${isSel ? '✅' : '➕'}</span>
        </div>
      `;
    }).join("");
  },

  toggleWitness(userId) {
    if (window.GameAudio) window.GameAudio.playClick();
    const idx = this.selectedWitnessIds.indexOf(userId);
    if (idx >= 0) {
      this.selectedWitnessIds.splice(idx, 1);
    } else {
      this.selectedWitnessIds.push(userId);
    }
    if (this.activeQuest) {
      this.renderWitnessSelector(this.activeQuest);
    }
    this.updateMediaRequirementsUI();
  },

  handleFaithToggle() {
    if (window.GameAudio) window.GameAudio.playClick();
    const checkbox = document.getElementById("questFaithCheckbox");
    this.isFaithBased = checkbox ? checkbox.checked : false;

    this.updatePointsPreview();
    this.updateMediaRequirementsUI();
  },

  updatePointsPreview() {
    if (!this.activeQuest) return;
    const pointsEl = document.getElementById("modalQuestPoints");
    if (!pointsEl) return;

    const isHH = window.store && window.store.isHappyHourActive();
    const multiplier = isHH ? 2 : 1;

    let basePoints = this.activeQuest.points;
    if (this.selectedOutcomeId && this.activeQuest.outcomes) {
      const outcome = this.activeQuest.outcomes.find(o => o.id === this.selectedOutcomeId);
      if (outcome) basePoints = outcome.points;
    }

    // Promille-Bonus hinzurechnen
    let promilleBonus = 0;
    if (this.activeQuest.hasPromilleInput && this.currentPromilleValue) {
      const minP = this.activeQuest.minPromille || 1.0;
      if (this.currentPromilleValue >= minP) {
        const excess = Math.max(0, this.currentPromilleValue - minP);
        const steps = Math.floor((excess + 0.001) / (this.activeQuest.promilleStepSize || 0.10));
        promilleBonus = steps * (this.activeQuest.promilleStepPoints || 5);
      }
    }

    let calculatedPoints = basePoints + promilleBonus;
    if (this.isFaithBased && calculatedPoints > 0) {
      calculatedPoints = Math.round(calculatedPoints * 0.8);
    }

    let finalPoints = calculatedPoints > 0 ? (calculatedPoints * multiplier) : calculatedPoints;

    if (finalPoints < 0) {
      pointsEl.textContent = `${finalPoints} PKT (MALUS)`;
      pointsEl.style.color = "#ef4444";
    } else {
      const hhSuffix = isHH ? ' ⚡ 2X HAPPY HOUR!' : '';
      const faithSuffix = this.isFaithBased ? ' (-20% Ehren-Abzug)' : '';
      const promilleSuffix = promilleBonus > 0 ? ` (+${promilleBonus} 📈 Pegel-Bonus)` : '';
      pointsEl.textContent = `+${finalPoints} XP / PKT${hhSuffix}${promilleSuffix}${faithSuffix}`;
      pointsEl.style.color = "var(--walibi-yellow)";
    }
  },

  updateMediaRequirementsUI() {
    if (!this.activeQuest) return;
    const reqBadge = document.getElementById("modalPhotoRequirementBadge");
    const camHeading = document.getElementById("cameraBoxHeading");
    const submitBtn = document.getElementById("btnSubmitQuest");
    const quest = this.activeQuest;

    const hasMedia = !!this.capturedPhotoBase64;
    const hasWitness = this.selectedWitnessIds.length > 0;
    const isFaith = this.isFaithBased;
    const isWitnessRequired = (quest.witnessRequirement === "required" || quest.requiresWitness === true) && !quest.allowWitnessAsMediaAlternative;
    const isPhotoRequired = quest.requirePhoto === true;
    const isVideoRequired = quest.type === "video";

    if (isFaith) {
      if (reqBadge) {
        reqBadge.textContent = "📜 Auf gut Glauben (-20%)";
        reqBadge.className = "game-status-pill req-optional";
      }
      if (camHeading) camHeading.textContent = "Beweis-Tool (Foto / Video - Entfällt bei gutem Glauben)";
      if (submitBtn) {
        submitBtn.disabled = false;
        const txt = submitBtn.querySelector(".arcade-btn-text");
        if (txt) txt.textContent = "📜 AUF GUT GLAUBEN ABSCHLIESSEN (-20%)";
      }
    } else if (quest.isEndBossQuest) {
      if (reqBadge) {
        reqBadge.textContent = this.selectedBossWinnerId ? "👑 Sieger gewählt" : "⚔️ Sieger wählen";
        reqBadge.className = this.selectedBossWinnerId ? "game-status-pill req-optional" : "game-status-pill req-mandatory";
      }
      if (submitBtn) {
        submitBtn.disabled = !this.selectedBossWinnerId;
        const txt = submitBtn.querySelector(".arcade-btn-text");
        if (txt) txt.textContent = this.selectedBossWinnerId ? "👑 SIEGER KRÖNEN (+70 PKT)" : "⚔️ BITTE SIEGER AUSWÄHLEN";
      }
    } else if (isWitnessRequired && !hasWitness) {
      if (reqBadge) {
        reqBadge.textContent = "👥 Zeuge Pflicht";
        reqBadge.className = "game-status-pill req-mandatory";
      }
      if (submitBtn) {
        submitBtn.disabled = true;
        const txt = submitBtn.querySelector(".arcade-btn-text");
        if (txt) txt.textContent = "👥 BITTE ZEUGEN AUSWÄHLEN";
      }
    } else if (isPhotoRequired && !hasMedia) {
      if (reqBadge) {
        reqBadge.textContent = quest.hasPromilleInput ? "📸 Messgerät-Foto Pflicht" : "📸 Foto Pflicht";
        reqBadge.className = "game-status-pill req-mandatory";
      }
      if (camHeading) camHeading.textContent = quest.hasPromilleInput ? "📸 Beweisfoto des Messgeräts erforderlich" : "📸 Beweisfoto erforderlich";
      if (submitBtn) {
        submitBtn.disabled = true;
        const txt = submitBtn.querySelector(".arcade-btn-text");
        if (txt) txt.textContent = quest.hasPromilleInput ? "📸 FOTO VOM MESSGERÄT HOCHLADEN" : "📸 FOTO HOCHLADEN";
      }
    } else if (isVideoRequired && !hasMedia && !hasWitness && !quest.allowWitnessAsMediaAlternative) {
      if (reqBadge) {
        reqBadge.textContent = "🎥 Video Pflicht";
        reqBadge.className = "game-status-pill req-mandatory";
      }
      if (submitBtn) {
        submitBtn.disabled = true;
        const txt = submitBtn.querySelector(".arcade-btn-text");
        if (txt) txt.textContent = "🎥 VIDEO HOCHLADEN";
      }
    } else if (quest.allowWitnessAsMediaAlternative && !hasMedia && !hasWitness) {
      if (reqBadge) {
        reqBadge.textContent = "🎥 Video oder Zeuge Pflicht";
        reqBadge.className = "game-status-pill req-mandatory";
      }
      if (submitBtn) {
        submitBtn.disabled = true;
        const txt = submitBtn.querySelector(".arcade-btn-text");
        if (txt) txt.textContent = "🎥 VIDEO HOCHLADEN ODER ZEUGEN WÄHLEN";
      }
    } else {
      if (reqBadge) {
        reqBadge.textContent = hasWitness ? `👁️ ${this.selectedWitnessIds.length} Zeuge(n) gewählt` : (hasMedia ? "📸 Medien bereit" : "📸 Foto Optional");
        reqBadge.className = "game-status-pill req-optional";
      }
      if (camHeading) camHeading.textContent = "Schnappschuss-Tool (Optional)";
      if (submitBtn) {
        submitBtn.disabled = false;
        const txt = submitBtn.querySelector(".arcade-btn-text");
        if (txt) txt.textContent = "🚀 MISSION ABSCHLIESSEN! 🚀";
      }
    }
  },

  closeModal() {
    if (window.GameAudio) window.GameAudio.playClick();
    this.resetStopwatch();
    const modal = document.getElementById("questDetailModal");
    if (modal) {
      modal.classList.add("hidden");
    }
    this.activeQuest = null;
    this.selectedBossWinnerId = null;
  },

  renderCompletedFriendsList(questId) {
    const container = document.getElementById("questCompletedByContainer");
    if (!container) return;

    const players = (window.store ? window.store.state.players : []).filter(p => p.completedQuests && p.completedQuests.includes(questId));

    if (players.length === 0) {
      container.innerHTML = `<p class="text-muted" style="text-align: center; margin: 4px 0;">Sei der Erste aus deiner Gruppe, der diese Challenge meistert!</p>`;
      return;
    }

    container.innerHTML = `
      <div style="font-size: 11px; font-weight: 800; color: var(--walibi-yellow); margin-bottom: 6px; text-transform: uppercase;">Bereits gemeistert von (${players.length}):</div>
      <div class="completed-players-row">
        ${players.map(p => `
          <div class="completed-player-chip">
            <img src="${p.avatar || ProfileModule.generateDefaultAvatar(p.name)}" class="chip-avatar" />
            <span>${p.name}</span>
          </div>
        `).join("")}
      </div>
    `;
  },

  setupQuestModal() {
    const modal = document.getElementById("questDetailModal");
    const closeBtn = document.getElementById("closeQuestModal");
    const galleryInput = document.getElementById("questGalleryInput");
    const submitBtn = document.getElementById("btnSubmitQuest");

    if (closeBtn) {
      closeBtn.onclick = (e) => {
        e.stopPropagation();
        this.closeModal();
      };
    }

    if (modal) {
      modal.onclick = (e) => {
        if (e.target === modal) {
          this.closeModal();
        }
      };
    }

    if (galleryInput) {
      galleryInput.onchange = (e) => this.handlePhotoCapture(e);
    }

    if (submitBtn) {
      submitBtn.onclick = () => this.submitQuestCompletion();
    }
  },

  openCamera() {
    if (window.CameraModule) {
      window.CameraModule.open({
        title: this.activeQuest ? `📸 ${this.activeQuest.title}` : "📸 Walibi Live-Kamera",
        facingMode: "environment",
        onCapture: (b64, isVideo) => {
          this.setCapturedPhoto(b64, isVideo);
        }
      });
    }
  },

  setCapturedPhoto(b64, isVideo = false) {
    this.capturedPhotoBase64 = b64;
    const previewImg = document.getElementById("photoUploadPreview");
    const previewVid = document.getElementById("videoUploadPreview");
    const placeholder = document.getElementById("cameraPlaceholder");
    const removeBtn = document.getElementById("btnRemovePhoto");

    if (isVideo) {
      if (previewImg) previewImg.classList.add("hidden");
      if (previewVid) {
        try {
          if (b64.startsWith("data:video")) {
            const marker = ";base64,";
            const idx = b64.indexOf(marker);
            if (idx !== -1) {
              const mime = b64.substring(5, idx);
              const b64Data = b64.substring(idx + marker.length);
              const byteChars = atob(b64Data);
              const byteNums = new Array(byteChars.length);
              for (let i = 0; i < byteChars.length; i++) byteNums[i] = byteChars.charCodeAt(i);
              const blob = new Blob([new Uint8Array(byteNums)], { type: mime });
              previewVid.src = URL.createObjectURL(blob);
            } else {
              previewVid.src = b64;
            }
          } else {
            previewVid.src = b64;
          }
        } catch (e) {
          previewVid.src = b64;
        }
        previewVid.classList.remove("hidden");
        previewVid.load();
      }
    } else {
      if (previewVid) previewVid.classList.add("hidden");
      if (previewImg) {
        previewImg.src = b64;
        previewImg.classList.remove("hidden");
      }
    }
    if (placeholder) placeholder.classList.add("hidden");
    if (removeBtn) removeBtn.classList.remove("hidden");

    this.updateMediaRequirementsUI();
  },

  removeCapturedPhoto() {
    this.capturedPhotoBase64 = null;
    const preview = document.getElementById("photoUploadPreview");
    const videoPreview = document.getElementById("videoUploadPreview");
    const placeholder = document.getElementById("cameraPlaceholder");
    const removeBtn = document.getElementById("btnRemovePhoto");

    if (preview) {
      preview.classList.add("hidden");
      preview.src = "";
    }
    if (videoPreview) {
      videoPreview.classList.add("hidden");
      videoPreview.src = "";
    }
    if (placeholder) placeholder.classList.remove("hidden");
    if (removeBtn) removeBtn.classList.add("hidden");

    this.updateMediaRequirementsUI();
  },

  handlePhotoCapture(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    if (window.GameAudio) window.GameAudio.playClick();

    const isVideo = file.type.startsWith('video/') || file.name.match(/\.(mp4|mov|webm|m4v|3gp)$/i);
    const reader = new FileReader();

    if (isVideo) {
      reader.onload = (e) => {
        this.setCapturedPhoto(e.target.result, true);
      };
      reader.readAsDataURL(file);
    } else {
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          const maxDim = 1080;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDim) {
              height *= maxDim / width;
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width *= maxDim / height;
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          const compressed = canvas.toDataURL("image/jpeg", 0.85);
          this.setCapturedPhoto(compressed, false);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  },

  async submitQuestCompletion() {
    let currentUser = window.store && window.store.state ? window.store.state.currentUser : null;
    if (!currentUser) {
      const savedId = localStorage.getItem("walibi_active_user_id") || localStorage.getItem("walibi_current_user_id");
      if (savedId && window.store && window.store.state && Array.isArray(window.store.state.players)) {
        currentUser = window.store.state.players.find(p => p.id === savedId);
      }
    }
    if (!currentUser && window.ProfileModule && window.ProfileModule.isAdminUser && window.ProfileModule.isAdminUser()) {
      currentUser = window.store && window.store.state && window.store.state.players.find(p => p.name.toLowerCase() === "grossek");
    }
    if (!currentUser && window.store && window.store.state && Array.isArray(window.store.state.players) && window.store.state.players.length > 0) {
      currentUser = window.store.state.players[0];
    }
    if (currentUser && window.store && window.store.state) {
      window.store.state.currentUser = currentUser;
    }
    if (!currentUser) {
      alert("👤 Bitte wähle zuerst dein Mitspieler-Profil aus!");
      if (window.ProfileModule && window.ProfileModule.openProfileSelectModal) {
        window.ProfileModule.openProfileSelectModal();
      }
      return;
    }
    if (!this.activeQuest) return;

    const quest = this.activeQuest;
    const isFaith = this.isFaithBased;
    const hasWitness = Array.isArray(this.selectedWitnessIds) && this.selectedWitnessIds.length > 0;
    const hasMedia = !!this.capturedPhotoBase64;
    const isWitnessRequired = (quest.witnessRequirement === "required" || quest.requiresWitness === true) && !quest.allowWitnessAsMediaAlternative;
    const isPhotoRequired = quest.requirePhoto === true;
    const isVideoRequired = quest.type === "video";

    // 1. END-BOSS SPEZIAL-VALIDIERUNG
    if (quest.isEndBossQuest) {
      if (!this.selectedBossWinnerId) {
        const endBossSec = document.getElementById("questEndBossSection");
        if (endBossSec) endBossSec.scrollIntoView({ behavior: "smooth", block: "center" });
        alert("👑 Bitte wähle aus, welcher der beiden Finalisten das Duell gewonnen hat!");
        return;
      }
    }

    // 2. PROMILLE-MESSGERÄT VALIDIERUNG
    let measuredPromille = null;
    let promilleBonus = 0;
    if (quest.hasPromilleInput) {
      const promilleInp = document.getElementById("questPromilleInput");
      measuredPromille = promilleInp ? parseFloat(promilleInp.value) : NaN;
      const minP = quest.minPromille || 0.8;
      if (isNaN(measuredPromille) || measuredPromille < minP) {
        if (promilleInp) promilleInp.focus();
        alert(`📈 Bitte gib deinen gemessenen Promille-Wert ein (mindestens ${minP.toFixed(1)}‰)!`);
        return;
      }
      if (!hasMedia && !isFaith) {
        alert("📸 Für diese Challenge ist ein Beweisfoto deines Alkoholtesters / Messgeräts Pflicht!\n\n(Tipp: Du kannst auch 'Auf gut Glauben' aktivieren)");
        return;
      }
      const excess = Math.max(0, measuredPromille - minP);
      const steps = Math.floor((excess + 0.001) / (quest.promilleStepSize || 0.10));
      promilleBonus = steps * (quest.promilleStepPoints || 5);
    }

    // 3. STRIKTE ZEUGEN-PFLICHT PRÜFUNG
    if (isWitnessRequired && !hasWitness && !isFaith) {
      const witnessSec = document.getElementById("questWitnessSection");
      if (witnessSec) witnessSec.scrollIntoView({ behavior: "smooth", block: "center" });
      alert("👥 Für diese Challenge ist mindestens ein benannter Zeuge aus deiner Gruppe Pflicht!\n\nBitte tippe unten auf den/die Mitspieler, die deine Aktion bezeugen können.\n\n(Oder aktiviere das Häkchen 'Auf gut Glauben')");
      return;
    }

    // 4. STRIKTE FOTO- / VIDEO-PFLICHT PRÜFUNG
    if (isPhotoRequired && !hasMedia && !isFaith) {
      alert((quest.hasPromilleInput ? "📸 Für diese Challenge ist ein Beweisfoto deines Alkoholtesters / Messgeräts Pflicht!" : "📸 Für diese Challenge ist ein Beweisfoto Pflicht!") + "\n\n(Oder aktiviere das Häkchen 'Auf gut Glauben')");
      return;
    }

    if (isVideoRequired && !hasMedia && !hasWitness && !quest.allowWitnessAsMediaAlternative && !isFaith) {
      alert("🎥 Für diese Challenge ist ein Video-Beweis Pflicht!\n\n(Oder aktiviere das Häkchen 'Auf gut Glauben')");
      return;
    }

    if (quest.allowWitnessAsMediaAlternative && !hasMedia && !hasWitness && !isFaith) {
      alert("📹 Für diese Challenge ist entweder ein Video-Beweis ODER ein benannter Zeuge erforderlich!\n\n(Oder aktiviere das Häkchen 'Auf gut Glauben')");
      return;
    }

    let customTitle = null;
    let customDesc = null;

    // Wildcard Überprüfung
    if (this.activeQuest.id === "visitor_wildcard_creative") {
      const titleInp = document.getElementById("wildcardTitleInput").value.trim();
      const descInp = document.getElementById("wildcardDescInput").value.trim();
      if (!titleInp || !descInp) {
        alert("Bitte gib einen Titel und eine kurze Beschreibung deiner kreativen Aktion ein!");
        return;
      }
      customTitle = `💡 Kreativ-Aktion: ${titleInp}`;
      customDesc = descInp;
    }

    const commentInput = document.getElementById("questCommentInput");
    const userComment = commentInput ? commentInput.value.trim() : "";

    // Ausgewähltes Ergebnis & Punkte ermitteln
    let selectedOutcome = null;
    let outcomePoints = this.activeQuest.points;
    if (this.selectedOutcomeId && this.activeQuest.outcomes) {
      selectedOutcome = this.activeQuest.outcomes.find(o => o.id === this.selectedOutcomeId);
      if (selectedOutcome) {
        outcomePoints = selectedOutcome.points;
      }
    }

    // In den Store speichern & Feed-Eintrag generieren
    try {
      await window.store.completeQuest(
        currentUser.id,
        this.activeQuest.id,
        this.capturedPhotoBase64,
        customTitle,
        customDesc,
        userComment,
        {
          selectedOutcome: selectedOutcome,
          outcomePoints: outcomePoints,
          witnessIds: this.selectedWitnessIds,
          isFaithBased: this.isFaithBased,
          measuredPromille: measuredPromille,
          promilleBonus: promilleBonus,
          bossWinnerId: this.selectedBossWinnerId,
          bossDuelCategory: this.selectedBossDuelCategory
        }
      );

      // Modal schließen
      this.closeModal();

      // Game Sound & Konfetti-Animation
      if (outcomePoints >= 0) {
        if (window.GameAudio) window.GameAudio.playFanfare();
        if (window.app && window.app.fireConfetti) window.app.fireConfetti();
      } else {
        if (window.GameAudio) window.GameAudio.playClick();
      }

      // Zur Feed-Ansicht wechseln und alles aktualisieren
      ProfileModule.updateHeaderProfile();
      this.renderQuests();
      window.app.switchTab("feed");
      window.FeedModule.renderFeed();
    } catch (err) {
      console.error("Fehler beim Abschließen der Quest:", err);
      alert("⚠️ Fehler beim Einreichen der Mission: " + (err.message || err));
    }
  }
};

window.QuestsModule = QuestsModule;

