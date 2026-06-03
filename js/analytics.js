// ============================================
// 方向匹配器 — 分析系统
// 记录用户行为到 localStorage，无需后端
// 访问 /index.html#admin 查看数据面板
// ============================================

const Analytics = {
  // 初始化，加载已有数据
  data: null,

  init() {
    const raw = localStorage.getItem('dm_analytics');
    if (raw) {
      try { this.data = JSON.parse(raw); } catch (e) { this.data = this.emptyData(); }
    } else {
      this.data = this.emptyData();
    }
    // 记录页面访问
    this.track('page_view');
  },

  emptyData() {
    return {
      events: [],           // [{event, timestamp, data}]
      visitors: {},         // {date: count}  每日独立访问
      firstVisit: Date.now(),
      lastVisit: Date.now(),
    };
  },

  // 记录一个事件
  track(event, payload = {}) {
    if (!this.data) this.init();
    const record = {
      event,
      timestamp: Date.now(),
      date: new Date().toISOString().split('T')[0],
      hour: new Date().getHours(),
      payload,
    };
    this.data.events.push(record);
    this.data.lastVisit = Date.now();

    // 每日访问统计
    const today = record.date;
    this.data.visitors[today] = (this.data.visitors[today] || 0) + 1;

    // 限制事件总量防止 localStorage 溢出（保留最近 10000 条）
    if (this.data.events.length > 10000) {
      this.data.events = this.data.events.slice(-5000);
    }

    this.save();
  },

  save() {
    try {
      localStorage.setItem('dm_analytics', JSON.stringify(this.data));
    } catch (e) {
      // localStorage 满了，清理一半
      this.data.events = this.data.events.slice(-2000);
      localStorage.setItem('dm_analytics', JSON.stringify(this.data));
    }
  },

  // ===== 聚合查询 =====

  // 总事件数
  count(eventName) {
    return this.data.events.filter(e => e.event === eventName).length;
  },

  // 今日事件数
  countToday(eventName) {
    const today = new Date().toISOString().split('T')[0];
    return this.data.events.filter(e => e.event === eventName && e.date === today).length;
  },

  // 转化漏斗
  funnel() {
    return {
      visits: this.count('page_view'),
      quizStarts: this.count('quiz_start'),
      quizCompletes: this.count('quiz_complete'),
      paywallViews: this.count('paywall_view'),
      payClicks: this.count('pay_click'),
      unlocks: this.count('unlock_success'),
      unlockFails: this.count('unlock_fail'),
      shares: this.count('result_share'),
    };
  },

  // 今日漏斗
  funnelToday() {
    const today = new Date().toISOString().split('T')[0];
    const events = this.data.events.filter(e => e.date === today);
    const count = (name) => events.filter(e => e.event === name).length;
    return {
      visits: count('page_view'),
      quizStarts: count('quiz_start'),
      quizCompletes: count('quiz_complete'),
      paywallViews: count('paywall_view'),
      payClicks: count('pay_click'),
      unlocks: count('unlock_success'),
      unlockFails: count('unlock_fail'),
      shares: count('result_share'),
    };
  },

  // 结果分布：Top 1 赛道分布
  topResults(limit = 10) {
    const results = this.data.events
      .filter(e => e.event === 'quiz_complete' && e.payload.top1)
      .map(e => e.payload.top1);
    const counts = {};
    results.forEach(r => { counts[r] = (counts[r] || 0) + 1; });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);
  },

  // 题目完成率：每题完成人数
  questionFlow() {
    const flow = Array(12).fill(0);
    this.data.events
      .filter(e => e.event === 'question_answered')
      .forEach(e => {
        const idx = e.payload.questionIndex;
        if (idx >= 0 && idx < 12) flow[idx]++;
      });
    return flow.map((count, i) => ({ question: i + 1, count, dropRate: i === 0 ? 0 : Math.round((1 - count / Math.max(1, flow[i-1])) * 100) }));
  },

  // 每日趋势（最近 30 天）
  dailyTrend(eventName) {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const dateStr = d.toISOString().split('T')[0];
      const count = this.data.events.filter(e => e.event === eventName && e.date === dateStr).length;
      days.push({ date: dateStr, count });
    }
    return days;
  },

  // 时间段分布
  hourlyDistribution(eventName) {
    const hours = Array(24).fill(0);
    this.data.events
      .filter(e => e.event === eventName)
      .forEach(e => { hours[e.hour]++; });
    return hours;
  },

  // 导出全部数据
  exportData() {
    return JSON.stringify(this.data, null, 2);
  },

  // 清空数据
  clearData() {
    this.data = this.emptyData();
    this.save();
  },
};
