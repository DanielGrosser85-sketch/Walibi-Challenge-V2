const CounterModule = {
  init() {
    // Initialisierung für Pegel-Tracker
  },

  logItem(itemId) {
    // 1. Aktiven Benutzer ermitteln / sicherstellen
    let user = window.store && window.store.state ? window.store.state.currentUser : null;
    if (!user) {
      const savedId = localStorage.getItem("walibi_active_user_id") || localStorage.getItem("walibi_current_user_id");
      if (savedId && window.store && window.store.state && Array.isArray(window.store.state.players)) {
        user = window.store.state.players.find(p => p.id === savedId);
      }
    }
    if (!user && window.ProfileModule && window.ProfileModule.isAdminUser && window.ProfileModule.isAdminUser()) {
      user = window.store && window.store.state && window.store.state.players.find(p => p.name.toLowerCase() === "grossek");
    }
    if (!user && window.store && window.store.state && Array.isArray(window.store.state.players) && window.store.state.players.length > 0) {
      user = window.store.state.players[0];
    }
    if (!user && window.store) {
      user = {
        id: "p_" + Date.now(),
        name: "Spieler",
        house: "Haus 1",
        avatar: "assets/mascot_fox.jpg",
        points: 0,
        drinksCount: 0,
        completedQuests: [],
        completedSideQuests: [],
        rideCounts: {},
        drinksDetail: { beer: 0, shot: 0, longdrink: 0, joint: 0, water: 0 },
        gutGlaubenCount: 0
      };
      if (!Array.isArray(window.store.state.players)) window.store.state.players = [];
      window.store.state.players.push(user);
    }

    if (user && window.store && window.store.state) {
      window.store.state.currentUser = user;
      localStorage.setItem("walibi_active_user_id", user.id);
      localStorage.setItem("walibi_current_user_id", user.id);
    }

    // 2. Soundeffekte sofort abspielen
    try {
      if (window.GameAudio) {
        if (itemId === "water") {
          window.GameAudio.playClick();
        } else {
          window.GameAudio.playDrink();
          setTimeout(() => {
            if (window.GameAudio) window.GameAudio.playCoin();
          }, 120);
        }
      }
    } catch(e) {}

    // 3. Im Store buchen (sofort & synchron)
    if (window.store && window.store.logCounterItem) {
      window.store.logCounterItem(user ? user.id : null, itemId);
    }

    // 4. Haptisches Feedback
    try {
      if (navigator.vibrate) navigator.vibrate(50);
    } catch(e) {}

    const updatedUser = (window.store && window.store.state && window.store.state.players.find(p => p.id === (user ? user.id : ''))) || (window.store && window.store.state ? window.store.state.currentUser : null);
    const count = (updatedUser && updatedUser.drinksDetail && updatedUser.drinksDetail[itemId]) || 1;

    // 5. Zufälligen Trinkspruch oder Meilenstein ermitteln
    let quote = "";
    try {
      if (window.getRandomPartyQuote) {
        quote = window.getRandomPartyQuote(itemId);
      }
    } catch(e) {}

    const item = (window.store && window.store.state && window.store.state.counterItems || window.COUNTER_ITEMS || []).find(i => i.id === itemId);
    const itemName = item ? item.name.split("/")[0].trim() : "Getränk";

    const isHH = window.store && window.store.isHappyHourActive();
    const multiplier = isHH ? 2 : 1;
    const basePts = item && typeof item.points === 'number' ? item.points : 5;
    const earnedPts = basePts * multiplier;
    const hhBadge = isHH ? ` (+${earnedPts} Pkt ⚡ 2X)` : ` (+${earnedPts} Pkt)`;

    try {
      if (count === 5 || count === 10 || count === 15 || count === 20) {
        if (window.GameAudio && window.GameAudio.playFanfare) window.GameAudio.playFanfare();
        if (window.app && window.app.fireConfetti) window.app.fireConfetti();
        if (window.app && window.app.showToast) {
          window.app.showToast(`🏆 <strong>${count}. ${itemName}!</strong>${hhBadge} ${quote}`);
        }
      } else {
        if (window.app && window.app.showToast) {
          window.app.showToast(`${item ? item.icon : '🍺'} <strong>+1 ${itemName}</strong> (#${count})${hhBadge}: <em>${quote}</em>`);
        }
      }
    } catch(e) {}

    // 6. Ansichten & Zähler im UI sofort aktualisieren
    try {
      if (window.FeedModule && window.FeedModule.renderPersonalDrinksTracker) {
        window.FeedModule.renderPersonalDrinksTracker();
      }
      if (window.FeedModule && window.FeedModule.renderHeaderStats) {
        window.FeedModule.renderHeaderStats();
      }
      if (window.ProfileModule && window.ProfileModule.updateHeaderProfile) {
        window.ProfileModule.updateHeaderProfile();
      }
      if (window.app && window.app.renderAllViews) {
        window.app.renderAllViews();
      }
    } catch(e) {}
  },

  // 🚨 MALUS LOGGEN (-5, -10, -20 PKT)
  logMalus(malusId) {
    let user = window.store && window.store.state ? window.store.state.currentUser : null;
    if (!user) {
      const savedId = localStorage.getItem("walibi_active_user_id") || localStorage.getItem("walibi_current_user_id");
      if (savedId && window.store && window.store.state && Array.isArray(window.store.state.players)) {
        user = window.store.state.players.find(p => p.id === savedId);
      }
    }
    if (!user && window.ProfileModule && window.ProfileModule.isAdminUser && window.ProfileModule.isAdminUser()) {
      user = window.store && window.store.state && window.store.state.players.find(p => p.name.toLowerCase() === "grossek");
    }
    if (!user && window.store && window.store.state && Array.isArray(window.store.state.players) && window.store.state.players.length > 0) {
      user = window.store.state.players[0];
    }
    if (!user) return;

    // Soundeffekt
    try {
      if (window.GameAudio && window.GameAudio.playClick) {
        window.GameAudio.playClick();
      }
    } catch(e) {}

    // Haptik
    try {
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    } catch(e) {}

    // Malus-Item Info
    const malusItems = window.MALUS_ITEMS || [
      { id: "nein", name: "Ein Nein", icon: "🚫", points: -5 },
      { id: "toilet", name: "Toilettengang", icon: "🚽", points: -10 },
      { id: "vomit", name: "Übergeben", icon: "🤮", points: -20 }
    ];
    const item = malusItems.find(m => m.id === malusId) || { id: malusId, name: malusId, icon: "⚠️", points: -5 };

    // Im Store buchen
    if (window.store && window.store.logMalusItem) {
      window.store.logMalusItem(user.id, malusId);
    }

    const updatedUser = (window.store && window.store.state && window.store.state.players.find(p => p.id === user.id)) || user;
    const malusCount = (updatedUser && updatedUser.malusDetail && updatedUser.malusDetail[malusId]) || 1;

    // Toast Nachricht
    try {
      if (window.app && window.app.showToast) {
        window.app.showToast(`${item.icon} <strong>${item.points} PKT STRAFE!</strong> ${item.name} (#${malusCount}) verbucht!`, true);
      }
    } catch(e) {}

    // UI Aktualisieren
    try {
      if (window.FeedModule && window.FeedModule.renderPersonalDrinksTracker) {
        window.FeedModule.renderPersonalDrinksTracker();
      }
      if (window.FeedModule && window.FeedModule.renderHeaderStats) {
        window.FeedModule.renderHeaderStats();
      }
      if (window.ProfileModule && window.ProfileModule.updateHeaderProfile) {
        window.ProfileModule.updateHeaderProfile();
      }
      if (window.FeedModule && window.FeedModule.renderFeed) {
        window.FeedModule.renderFeed();
      }
      if (window.app && window.app.renderAllViews) {
        window.app.renderAllViews();
      }
    } catch(e) {}
  }
};

window.CounterModule = CounterModule;
