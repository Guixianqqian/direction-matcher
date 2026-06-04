// ============================================
// 方向匹配器 — 核心应用逻辑
// 架构: Store(状态) → Matcher(算法) → Render(视图)
// 版本: v1.0.0 MVP
// ============================================

// === 状态管理器 (Single Source of Truth) ===
const Store = {
  state: {
    currentStep: -1,        // -1=首页, 0-11=答题, 12=结果
    answers: [],             // [{questionId, value, label}]
    results: null,           // [{track, score, details}]
    paid: false,             // 是否已付费
    lang: 'zh',
  },

  listeners: new Set(),

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  },

  dispatch(action, payload) {
    const prev = JSON.stringify(this.state);
    switch (action) {
      case 'START_QUIZ':
        this.state.currentStep = 0;
        this.state.answers = [];
        this.state.results = null;
        this.state.paid = false;
        Analytics.track('quiz_start');
        break;

      case 'ANSWER':
        // payload: { questionId, value, label, scores }
        const idx = this.state.answers.findIndex(a => a.questionId === payload.questionId);
        if (idx >= 0) {
          this.state.answers[idx] = payload;
        } else {
          this.state.answers.push(payload);
        }
        break;

      case 'NEXT':
        if (this.state.currentStep < 11) {
          this.state.currentStep++;
        } else if (this.state.currentStep === 11) {
          // 最后一题 → 计算结果
          this.state.results = matchAll(buildUserProfile(this.state.answers));
          this.state.currentStep = 12;
          Analytics.track('quiz_complete', { top1: this.state.results[0]?.track?.name || 'unknown' });
        }
        break;

      case 'PREV':
        if (this.state.currentStep > 0) {
          this.state.currentStep--;
        }
        break;

      case 'GO_HOME':
        this.state.currentStep = -1;
        break;

      case 'UNLOCK':
        this.state.paid = true;
        break;

      default:
        console.warn('Unknown action:', action);
    }

    if (JSON.stringify(this.state) !== prev) {
      this.listeners.forEach(fn => fn(this.state));
    }
  },

  getState() {
    return this.state;
  }
};

// === 辅助：从答案构建用户画像 ===
function buildUserProfile(answers) {
  const profile = {
    timeAvailable: 3,
    startupCapital: 3,
    independence: 3,
    riskTolerance: 3,
    techSkill: 3,
    socialEnergy: 3,
    incomeTimeline: 3,
    facePublic: 3,
    learningWillingness: 3,
    motivation: 'freedom',
    learnStyle: 'doing',
  };

  answers.forEach(a => {
    if (!a.scores) return;
    Object.entries(a.scores).forEach(([key, val]) => {
      if (typeof val === 'number') {
        profile[key] = val;
      } else if (typeof val === 'string') {
        profile[key] = val;
      }
    });
  });

  // 从 5 个 skill 选项中提取 techSkill
  // （已在 data.js 的 options 里通过 score 映射）

  return profile;
}

// === 通用工具 ===
function copyToClipboard(text, onSuccess, onError) {
  // 优先 navigator.clipboard
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function() {
      if (onSuccess) onSuccess();
    }).catch(function() {
      fallbackCopy(text, onSuccess, onError);
    });
  } else {
    fallbackCopy(text, onSuccess, onError);
  }

  function fallbackCopy(t, ok, fail) {
    var ta = document.createElement('textarea');
    ta.value = t;
    ta.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0;';
    ta.setAttribute('readonly', '');
    document.body.appendChild(ta);
    // iOS 兼容：需要设置 contentEditable + range
    if (navigator.userAgent.match(/ipad|iphone/i)) {
      ta.contentEditable = true;
      ta.readOnly = false;
      var range = document.createRange();
      range.selectNodeContents(ta);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      ta.setSelectionRange(0, 999999);
    } else {
      ta.select();
      ta.setSelectionRange(0, 999999);
    }
    try {
      document.execCommand('copy');
      if (ok) ok();
    } catch(e) {
      if (fail) fail(e);
    }
    document.body.removeChild(ta);
  }
}

// === 渲染引擎 ===
const Renderer = {
  root: null,

  init() {
    this.root = document.getElementById('app');
    if (window.location.hash === '#admin') {
      if (sessionStorage.getItem('dm_admin_auth') !== '1') {
        window.location.href = '/admin';
        return;
      }
      this.renderAdmin();
      return;
    }
    Store.subscribe(state => this.render(state));
    // 渲染首页（错误边界）
    try {
      this.render(Store.getState());
    } catch(e) {
      this.root.innerHTML = '<div class="page home-page" style="text-align:center;padding-top:80px;"><p style="color:#e8e8f0;">加载失败，请刷新页面重试</p><p style="color:#606080;font-size:0.8rem;margin-top:12px;">若多次失败，请尝试用系统浏览器打开</p></div>';
    }
  },

  render(state) {
    if (state.currentStep === -1) {
      this.renderHome();
    } else if (state.currentStep >= 0 && state.currentStep <= 11) {
      this.renderQuiz(state);
    } else if (state.currentStep === 12) {
      this.renderResult(state);
    }
  },

  // === 首页 ===
  renderHome() {
    this.root.innerHTML = `
      <div class="page home-page">
        <div class="hero">
          <div class="hero-badge">🧭 AI 驱动的方向匹配</div>
          <h1 class="hero-title">${t('siteTitle')}</h1>
          <p class="hero-desc">${t('siteDesc')}</p>
          <p class="hero-sub">${t('subtitle')}</p>
          <button class="btn btn-primary btn-lg" id="startBtn">
            ${t('startBtn')}
            <span class="btn-arrow">→</span>
          </button>
          <p class="hero-hint">${t('timeHint')}</p>
        </div>

        <div class="features">
          <div class="feature-item">
            <span class="feature-icon">📊</span>
            <span class="feature-text">25 个轻资产赛道</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">🎯</span>
            <span class="feature-text">个性化匹配评分</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">🗺️</span>
            <span class="feature-text">详细入门路径</span>
          </div>
        </div>

        <div class="trust-bar">
          <span>基于真实数据</span>
          <span class="dot">·</span>
          <span>3 分钟完成</span>
          <span class="dot">·</span>
          <span>前 1 名免费</span>
        </div>

        <!-- 案例墙 -->
        <div class="social-proof">
          <h3>🧪 首期公测用户反馈</h3>
          <div class="testimonial-list">
            <div class="testimonial">
              <div class="testimonial-avatar">👨‍💻</div>
              <div class="testimonial-body">
                <p class="testimonial-text">"做了12道题，结果竟然真的戳中我了——微型SaaS。我之前从没想过这个方向，现在已经开始用Claude Code写第一版了。"</p>
                <span class="testimonial-name">阿杰 · 前大厂程序员</span>
                <span class="testimonial-tag">🎯 匹配：微型SaaS</span>
              </div>
            </div>
            <div class="testimonial">
              <div class="testimonial-avatar">👩‍💼</div>
              <div class="testimonial-body">
                <p class="testimonial-text">"我一直纠结是继续上班还是自己干，测完发现AI顾问匹配率87%，现在已经接了2个中小企业客户的自动化改造单子了。"</p>
                <span class="testimonial-name">小米 · 企业信息化8年</span>
                <span class="testimonial-tag">🎯 匹配：AI顾问</span>
              </div>
            </div>
            <div class="testimonial">
              <div class="testimonial-avatar">🧑‍🎨</div>
              <div class="testimonial-body">
                <p class="testimonial-text">"9.9元买了份完整报告，说实话比我花3000块报的职业规划课有用。入门路径写得很具体，不是泛泛而谈。"</p>
                <span class="testimonial-name">小鹿 · 自由设计师</span>
                <span class="testimonial-tag">🎯 匹配：虚拟资料</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 品牌标识 -->
        <div class="brand-section">
          <div class="brand-avatar">🧭</div>
          <p class="brand-name">方向匹配器 · Direction Matcher</p>
          <p class="brand-bio">
            AI 驱动的个人方向匹配工具<br>
            由一位正在探索一人公司的独立开发者打造<br>
            你正在经历的迷茫，我也正在经历
          </p>
        </div>

        <!-- 邮箱反馈 -->
        <div class="feedback-section">
          <h4>💬 有建议或合作想法？</h4>
          <p class="feedback-email-text">📧 QQ邮箱：176372551@qq.com <button class="btn-copy-inline" id="copyEmailHome">📋 复制</button></p>
          <p class="feedback-hint">每条反馈我都会认真读，用 AI 快速迭代</p>
        </div>

        <p class="footer-note">${t('footer')}</p>

        <div class="legal-footer">
          <p>⚠️ 免责声明</p>
          <p>本测试仅供娱乐参考，不构成职业建议、投资建议或收入承诺。所有收入数据来源于行业公开案例，不代表个人实际收益。</p>
          <p>本工具不收集、不存储任何个人信息。付费解锁码为非实物虚拟服务，一经使用不支持退款。</p>
        </div>
      </div>
    `;

    document.getElementById('startBtn').addEventListener('click', () => {
      Store.dispatch('START_QUIZ');
    });

    document.getElementById('copyEmailHome').addEventListener('click', function() {
      var btn = this;
      copyToClipboard('176372551@qq.com', function() {
        btn.textContent = '✅ 已复制';
        btn.classList.add('copied');
        setTimeout(function() { btn.textContent = '📋 复制'; btn.classList.remove('copied'); }, 2000);
      });
    });

  },

  // === 答题页 ===
  renderQuiz(state) {
    const q = QUESTIONS[state.currentStep];
    const currentAnswer = state.answers.find(a => a.questionId === q.id);

    this.root.innerHTML = `
      <div class="page quiz-page">
        <div class="quiz-header">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${(state.currentStep + 1) / 12 * 100}%"></div>
          </div>
          <p class="progress-text">${t('qProgress').replace('{n}', state.currentStep + 1)}</p>
        </div>

        <div class="quiz-body">
          <h2 class="question-text">${t(q.textKey)}</h2>
          <div class="options-list" id="optionsList">
            ${q.options.map((opt, i) => `
              <button class="option-btn ${currentAnswer?.value === opt.value ? 'selected' : ''}"
                      data-value="${opt.value}"
                      data-label="${opt.label.replace(/"/g, '&quot;')}"
                      data-scores='${JSON.stringify(opt.score)}'>
                <span class="option-radio">${String.fromCharCode(65 + i)}</span>
                <span class="option-label">${opt.label}</span>
              </button>
            `).join('')}
          </div>
        </div>

        <div class="quiz-footer">
          <button class="btn btn-outline" id="prevBtn"
                  ${state.currentStep === 0 ? 'disabled' : ''}>
            ← ${t('prevBtn')}
          </button>
          <span class="step-indicator">${state.currentStep + 1} / 12</span>
          ${state.currentStep === 11
            ? `<button class="btn btn-primary" id="submitBtn" ${!currentAnswer ? 'disabled' : ''}>
                ${t('submitBtn')}
              </button>`
            : `<button class="btn btn-primary" id="nextBtn" ${!currentAnswer ? 'disabled' : ''}>
                ${t('nextBtn')} →
              </button>`
          }
        </div>
      </div>
    `;

    // 选项点击
    document.querySelectorAll('.option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const value = btn.dataset.value;
        const label = btn.dataset.label;
        const scores = JSON.parse(btn.dataset.scores);
                Store.dispatch('ANSWER', {
          questionId: q.id,
          value,
          label,
          scores,
        });
        Analytics.track('question_answered', { questionIndex: state.currentStep, questionId: q.id, answer: value });
        // 自动跳到下一题（除了最后一题）
        setTimeout(() => Store.dispatch('NEXT'), 300);
      });
    });

    // 下一题
    const nextBtn = document.getElementById('nextBtn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => Store.dispatch('NEXT'));
    }

    // 提交
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => Store.dispatch('NEXT'));
    }

    // 上一题
    const prevBtn = document.getElementById('prevBtn');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => Store.dispatch('PREV'));
    }
  },

  // === 结果页 ===
  renderResult(state) {
    if (!state.results || state.results.length === 0) return;

    const top3 = state.results.slice(0, 3);
    const top1 = top3[0];

    this.root.innerHTML = `
      <div class="page result-page">
        <div class="result-header">
          <div class="result-badge">🎉 ${t('resultTitle')}</div>
          <h2 class="result-subtitle">${t('resultSub')}</h2>
        </div>

        <!-- 第 1 名 — 免费 -->
        <div class="match-card match-card--top1" id="card-0">
          <div class="match-rank">🥇 ${t('top1Free')}</div>
          <div class="match-header">
            <h3 class="match-name">${top1.track.name}</h3>
            <span class="match-score">${top1.score}% ${t('matchScore')}</span>
          </div>
          <div class="match-meta">
            <span class="meta-tag">💰 ${top1.track.income}</span>
            <span class="meta-tag">⏱️ ${top1.track.timeToStart}</span>
          </div>
          <div class="match-why">
            <h4>💡 ${t('whyMatch')}</h4>
            <ul>${top1.details.map(d => `<li>${d}</li>`).join('')}</ul>
          </div>
          <div class="match-path">
            <h4>🗺️ ${t('startPath')}</h4>
            <p>${top1.track.startPath}</p>
          </div>
        </div>

        <!-- 付费墙 -->
        ${state.paid
          ? `
            <!-- 第 2 名 -->
            <div class="match-card" id="card-1">
              <div class="match-rank">🥈 第 2 名</div>
              <div class="match-header">
                <h3 class="match-name">${top3[1].track.name}</h3>
                <span class="match-score">${top3[1].score}% ${t('matchScore')}</span>
              </div>
              <div class="match-meta">
                <span class="meta-tag">💰 ${top3[1].track.income}</span>
                <span class="meta-tag">⏱️ ${top3[1].track.timeToStart}</span>
              </div>
              <div class="match-why">
                <h4>💡 ${t('whyMatch')}</h4>
                <ul>${top3[1].details.map(d => `<li>${d}</li>`).join('')}</ul>
              </div>
              <div class="match-path">
                <h4>🗺️ ${t('startPath')}</h4>
                <p>${top3[1].track.startPath}</p>
              </div>
            </div>

            <!-- 第 3 名 -->
            <div class="match-card" id="card-2">
              <div class="match-rank">🥉 第 3 名</div>
              <div class="match-header">
                <h3 class="match-name">${top3[2].track.name}</h3>
                <span class="match-score">${top3[2].score}% ${t('matchScore')}</span>
              </div>
              <div class="match-meta">
                <span class="meta-tag">💰 ${top3[2].track.income}</span>
                <span class="meta-tag">⏱️ ${top3[2].track.timeToStart}</span>
              </div>
              <div class="match-why">
                <h4>💡 ${t('whyMatch')}</h4>
                <ul>${top3[2].details.map(d => `<li>${d}</li>`).join('')}</ul>
              </div>
              <div class="match-path">
                <h4>🗺️ ${t('startPath')}</h4>
                <p>${top3[2].track.startPath}</p>
              </div>
            </div>
          `
          : `
            <!-- 付费墙 -->
            <div class="paywall" id="paywall">
              <div class="paywall-content">
                <h3>🔒 ${t('unlockFull')}</h3>
                <p class="paywall-desc">${t('payDesc')}</p>
                <div class="price-tag">
                  <span class="price-amount">${t('unlockPrice')}</span>
                </div>
                <button class="btn btn-gold btn-lg" id="payBtn">
                  💳 ${t('unlockFull')}
                </button>
                <p class="paywall-hint">${t('contactHint')}</p>
              </div>
            </div>
          `
        }

        <!-- 暖心收尾 -->
        <div class="warm-closing">
          <p class="warm-emoji">🌱</p>
          <p class="warm-title">每一个在找方向的人，都已经在路上</p>
          <p class="warm-text">迷茫不是因为你不努力，而是因为你看到了更多的可能性。<br>这份报告不是终点，是你探索的起点。<br>选一个方向，迈出第一步，哪怕很小——然后回来告诉我你的进展。</p>
          <p class="warm-sign">— 方向匹配器，写给正在找路的你</p>
        </div>

        ${state.paid ? `
        <!-- 分享区（付费后可见） -->
        <div class="share-section">
          <h3>📤 ${t('shareTitle')}</h3>
          <button class="btn btn-share" id="shareCardBtn">
            🧬 ${t('shareBtn')}
          </button>
          <p class="share-hint">${t('shareHint')}</p>
        </div>
        ` : ''}

        <!-- 重测 -->
        <div class="retake-section">
          <button class="btn btn-outline" id="retakeBtn">🔄 重新测试</button>
        </div>

        <canvas id="shareCanvas" style="display:none;" width="800" height="1200"></canvas>

        <!-- 邮箱反馈 -->
        <div class="feedback-section">
          <h4>💬 结果不准？有更好的赛道推荐？</h4>
          <p class="feedback-email-text">📧 QQ邮箱：176372551@qq.com <button class="btn-copy-inline" id="copyEmailHome">📋 复制</button></p>
          <p class="feedback-hint">你的反馈 = 产品的下一次迭代</p>
        </div>

        <p class="footer-note">${t('footer')}</p>

        <div class="legal-footer">
          <p>⚠️ 免责声明</p>
          <p>本测试仅供娱乐参考，不构成职业建议、投资建议或收入承诺。所有收入数据来源于行业公开案例，不代表个人实际收益。</p>
          <p>本工具不收集、不存储任何个人信息。付费解锁码为非实物虚拟服务，一经使用不支持退款。</p>
        </div>
      </div>
    `;

    // 付费按钮
    const payBtn = document.getElementById('payBtn');
    if (payBtn) {
      Analytics.track('paywall_view');
      payBtn.addEventListener('click', () => { Analytics.track('pay_click'); this.showPayModal(); });
    }

    // 分享按钮
    const shareBtn = document.getElementById('shareCardBtn');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => { Analytics.track('result_share'); this.generateShareCard(state); });
    }

    // 重测按钮
    const retakeBtn = document.getElementById('retakeBtn');
    if (retakeBtn) {
      retakeBtn.addEventListener('click', () => Store.dispatch('START_QUIZ'));
    }

    // 复制邮箱
    const copyBtn2 = document.getElementById('copyEmailHome');
    if (copyBtn2) {
      copyBtn2.addEventListener('click', function() {
        var btn = this;
        copyToClipboard('176372551@qq.com', function() {
          btn.textContent = '✅ 已复制';
          btn.classList.add('copied');
          setTimeout(function() { btn.textContent = '📋 复制'; btn.classList.remove('copied'); }, 2000);
        });
      });
    }
  },

  // === 付费弹窗（人工激活模式：用户付款→加微信→客服激活→解锁） ===

  showPayModal() {
    const genCode = () => {
      const code = String(Math.floor(1000 + Math.random() * 9000));
      // 写入共享存储 + 本地
      Sync.addCode(code);
      Analytics.track('code_issued', { code });
      return code;
    };

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal modal--wide modal--wechat">
        <button class="modal-close">&times;</button>

        <!-- 第一步：支付 -->
        <div id="payStep">
          <h3>💳 扫码支付 ¥9.9</h3>
          <p style="font-size:0.82rem;color:var(--color-text-secondary);margin-bottom:12px;">
            微信或支付宝二选一即可
          </p>
          <div class="qr-row">
            <div class="qr-item">
              <div class="qr-box" id="wechatQR">
                <p style="color:var(--color-text-muted);">加载中...</p>
              </div>
              <p class="qr-label">🟢 微信支付</p>
            </div>
            <div class="qr-item">
              <div class="qr-box" id="alipayQR">
                <p style="color:var(--color-text-muted);">加载中...</p>
              </div>
              <p class="qr-label">🔵 支付宝</p>
            </div>
          </div>
          <button class="btn btn-gold btn-lg" id="paidBtn" style="width:100%;margin-top:16px;">
            ✅ 我已支付完成，获取解锁码
          </button>
        </div>

        <!-- 第二步：发送付款截图激活（初始隐藏） -->
        <div id="codeStep" style="display:none;">
          <h3>📱 最后一步：发送付款截图</h3>

          <div class="code-reveal-box">
            <p class="code-reveal-label">🔑 你的解锁码</p>
            <p class="code-reveal-value" id="revealedCode"></p>
            <p class="code-reveal-status" id="codeStatus">⏳ 等待激活</p>
            <button class="btn-copy-inline" id="copyCodeBtn">📋 复制解锁码</button>
          </div>

          <!-- 微信联系引导 -->
          <div class="activate-guide">
            <div class="qr-box qr-box--medium" id="wechatContactQR">
              <p style="color:var(--color-text-muted);">加载中...</p>
            </div>
            <p class="activate-title">📱 扫码添加微信</p>
            <p class="activate-desc">发送<strong>解锁码 + 付款截图</strong>，激活后即可解锁</p>
          </div>

          <div class="verify-section" style="margin-top:16px;">
            <p class="verify-label" style="margin-bottom:6px;">激活后输入解锁码验证</p>
            <input type="text" class="verify-input" id="verifyInput"
                   placeholder="输入 4 位解锁码" maxlength="4" autocomplete="off" inputmode="numeric">
            <p class="verify-error" id="verifyError" style="display:none;"></p>
          </div>

          <button class="btn btn-gold btn-lg" id="confirmPayBtn" disabled style="width:100%;">
            🔓 解锁完整报告
          </button>

          <p style="text-align:center;font-size:0.72rem;color:var(--color-text-muted);margin-top:8px;">
            ⏱️ 发送截图后一般 5 分钟内激活 · 激活后永久有效
          </p>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    let currentCode = null;
    let pollTimer = null;

    // 加载QR图片
    const loadQR = (type, boxId) => {
      const box = overlay.querySelector(`#${boxId}`);
      if (!box) return;
      const exts = ['png', 'jpg', 'jpeg'];
      let idx = 0;
      const img = new Image();
      img.onload = () => { box.innerHTML = ''; box.appendChild(img); };
      img.onerror = () => {
        if (++idx < exts.length) img.src = `img/${type}-qr.${exts[idx]}`;
        else box.innerHTML = '<p style="color:var(--color-text-muted);">未找到收款码</p>';
      };
      img.src = `img/${type}-qr.${exts[0]}`;
    };
    loadQR('wechat', 'wechatQR');
    loadQR('alipay', 'alipayQR');
    loadQR('wechat-contact', 'wechatContactQR');


    // 关闭 & 清理
    const closeModal = () => {
      if (pollTimer) clearInterval(pollTimer);
      overlay.remove();
    };
    overlay.querySelector('.modal-close').addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });

    // DOM refs
    const payStep = overlay.querySelector('#payStep');
    const codeStep = overlay.querySelector('#codeStep');
    const paidBtn = overlay.querySelector('#paidBtn');
    const revealedCode = overlay.querySelector('#revealedCode');
    const codeStatus = overlay.querySelector('#codeStatus');
    const copyCodeBtn = overlay.querySelector('#copyCodeBtn');
    const verifyInput = overlay.querySelector('#verifyInput');
    const confirmBtn = overlay.querySelector('#confirmPayBtn');
    const verifyError = overlay.querySelector('#verifyError');

    // 检查码是否已激活（通过共享存储）
    const isActivated = async function(code) {
      try { return await Sync.isActivated(code); } catch(e) { return false; }
    };

    // 更新解锁按钮状态
    const updateUnlockState = async () => {
      if (!currentCode) return;
      const activated = await isActivated(currentCode);
      const inputVal = verifyInput.value.trim();

      if (activated) {
        codeStatus.textContent = '✅ 已激活';
        codeStatus.className = 'code-reveal-status code-active';
      } else {
        codeStatus.textContent = '⏳ 等待激活';
        codeStatus.className = 'code-reveal-status code-pending';
      }

      if (inputVal === currentCode && activated) {
        confirmBtn.disabled = false;
        confirmBtn.textContent = '✅ 解锁完整报告';
        confirmBtn.classList.add('btn-verified');
        verifyError.style.display = 'none';
      } else if (inputVal === currentCode && !activated) {
        confirmBtn.disabled = true;
        verifyError.textContent = '解锁码尚未激活，请稍候…客服正在处理中';
        verifyError.style.display = 'block';
      } else if (inputVal.length >= 2 && inputVal !== currentCode) {
        confirmBtn.disabled = true;
        verifyError.textContent = '解锁码不匹配，请检查后重试';
        verifyError.style.display = 'block';
      } else {
        confirmBtn.disabled = true;
        verifyError.style.display = 'none';
      }
    };

    // 第一步 → 第二步
    paidBtn.addEventListener('click', async () => {
      currentCode = genCode();
      revealedCode.textContent = currentCode;
      payStep.style.display = 'none';
      codeStep.style.display = 'block';
      await updateUnlockState();

      // 轮询激活状态（每 3 秒检查一次共享存储）
      pollTimer = setInterval(async () => {
        const activated = await isActivated(currentCode);
        if (activated) {
          await updateUnlockState();
          clearInterval(pollTimer);
        }
      }, 3000);
    });

    // 一键复制解锁码
    copyCodeBtn.addEventListener('click', function() {
      var text = currentCode;
      var btn = copyCodeBtn;
      copyToClipboard(text, function() {
        btn.textContent = '✅ 已复制';
        btn.classList.add('copied');
        setTimeout(function() { btn.textContent = '📋 复制解锁码'; btn.classList.remove('copied'); }, 2000);
      }, function() {
        btn.textContent = '❌ 请手动复制';
        setTimeout(function() { btn.textContent = '📋 复制解锁码'; btn.classList.remove('copied'); }, 2000);
      });
    });

    // 解锁码输入
    verifyInput.addEventListener('input', function() { updateUnlockState(); });

    // 解锁（仅管理员激活后可用）
    confirmBtn.addEventListener('click', async function() {
      var codeMatch = verifyInput.value.trim() === currentCode;
      var activated = await isActivated(currentCode);

      if (codeMatch && activated) {
        clearInterval(pollTimer);
        try { Sync.markUsed(currentCode); } catch(e) {}
        Store.dispatch('UNLOCK');
        overlay.remove();
        Analytics.track('unlock_success', { code: currentCode });
        setTimeout(() => {
          const toast = document.createElement('div');
          toast.className = 'unlock-toast';
          toast.innerHTML = '🔓 解锁成功！这份报告是你探索的起点。选一个方向，迈出第一步，哪怕很小——未来的你会感谢今天这个决定 🌱';
          document.body.appendChild(toast);
          setTimeout(() => { toast.classList.add('show'); }, 50);
          setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 400); }, 3500);
        }, 300);
      }
    });

    // 回车提交
    overlay.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && codeStep.style.display !== 'none') {
        confirmBtn.click();
      }
    });
  },

  // === 解锁码管理 ===
  _getIssuedCodes() {
    try {
      const raw = localStorage.getItem('dm_issued_codes');
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  },

  _getActivatedCodes() {
    try {
      const raw = localStorage.getItem('dm_activated_codes');
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  },

  async _activateCode(code) {
    await Sync.activateCode(code);
  },

  async _deactivateCode(code) {
    await Sync.deactivateCode(code);
  },

  _markCodeUsed(code) {
    const issued = this._getIssuedCodes();
    const found = issued.find(c => c.code === code);
    if (found) { found.used = true; found.usedAt = Date.now(); }
    localStorage.setItem('dm_issued_codes', JSON.stringify(issued));
  },

  // === 生成分享卡片（内联显示，支持微信长按保存） ===
  SITE_URL: 'https://www.topxnc.com',

  generateShareCard(state) {
    const canvas = document.getElementById('shareCanvas');
    const ctx = canvas.getContext('2d');
    const top3 = state.results.slice(0, 3);
    const self = this;

    // 绘制卡片
    const drawBase = () => {
      // 背景渐变
      const gradient = ctx.createLinearGradient(0, 0, 0, 1200);
      gradient.addColorStop(0, '#0f0c29');
      gradient.addColorStop(0.5, '#302b63');
      gradient.addColorStop(1, '#24243e');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 800, 1200);

      // 顶部装饰线
      ctx.fillStyle = 'rgba(124,92,252,0.4)';
      ctx.fillRect(0, 0, 800, 4);

      // 标题
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 44px "PingFang SC", "Microsoft YaHei", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🧭 我的赚钱DNA', 400, 80);

      ctx.font = '18px "PingFang SC", "Microsoft YaHei", sans-serif';
      ctx.fillStyle = '#a0a0cc';
      ctx.fillText('方向匹配器 · 个性化赚钱方向报告', 400, 118);

      // 分隔线
      ctx.strokeStyle = 'rgba(124,92,252,0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(60, 145);
      ctx.lineTo(740, 145);
      ctx.stroke();

      // Top 3 结果
      const medals = ['🥇', '🥈', '🥉'];
      const colors = ['#ffd700', '#c0c0c0', '#cd7f32'];
      top3.forEach((match, i) => {
        const y = 175 + i * 270;
        
        // 卡片背景
        ctx.fillStyle = i === 0 ? 'rgba(255,215,0,0.08)' : 'rgba(255,255,255,0.04)';
        ctx.strokeStyle = i === 0 ? 'rgba(255,215,0,0.25)' : 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;
        roundRect(ctx, 50, y, 700, 250, 14);
        ctx.fill();
        ctx.stroke();

        // 排名 + 赛道名
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 26px "PingFang SC", "Microsoft YaHei", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`${medals[i]}  ${match.track.name}`, 75, y + 42);

        // 匹配度
        ctx.fillStyle = colors[i];
        ctx.font = 'bold 26px "PingFang SC", "Microsoft YaHei", sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`${match.score}% 匹配`, 725, y + 42);

        // 收入和周期标签
        ctx.fillStyle = '#b0b0d0';
        ctx.font = '16px "PingFang SC", "Microsoft YaHei", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`💰 ${match.track.income}`, 75, y + 78);
        ctx.fillText(`⏱️ ${match.track.timeToStart}`, 250, y + 78);

        // 匹配原因（最多2条）
        ctx.fillStyle = '#9090b8';
        ctx.font = '15px "PingFang SC", "Microsoft YaHei", sans-serif';
        match.details.slice(0, 2).forEach((d, j) => {
          let detail = d;
          if (detail.length > 38) detail = detail.slice(0, 36) + '…';
          ctx.fillText(`✓ ${detail}`, 75, y + 112 + j * 30);
        });
      });

      // 底部：文字在上，QR在下
      const qrY = 1010;
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.fillRect(50, qrY - 15, 700, 195);

      // 引导文字（QR上方）
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px "PingFang SC", "Microsoft YaHei", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('扫码测测你的赚钱方向 →', 400, qrY + 10);

      ctx.fillStyle = '#9090b0';
      ctx.font = '13px "PingFang SC", "Microsoft YaHei", sans-serif';
      ctx.fillText('www.topxnc.com', 400, qrY + 32);
    };

    // 加载 QR 码（放在文字下方，不重叠）
    const qrImg = new Image();
    qrImg.crossOrigin = 'anonymous';
    qrImg.src = 'https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=' + encodeURIComponent(this.SITE_URL) + '&margin=6';
    qrImg.onload = () => {
      drawBase();
      // QR: y=1060, 文字在y=1020-1042，不重叠
      ctx.drawImage(qrImg, 340, 1060, 120, 120);
      self.showCardModal(canvas);
    };
    qrImg.onerror = () => {
      drawBase();
      // 降级：域名占位
      ctx.fillStyle = 'rgba(124,92,252,0.15)';
      ctx.fillRect(280, 1060, 240, 120);
      ctx.fillStyle = '#7c5cfc';
      ctx.font = 'bold 32px "PingFang SC", "Microsoft YaHei", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🧭 方向匹配器', 400, 1130);
      self.showCardModal(canvas);
    };
  },

  // 弹窗展示卡片（桌面端下载 / 手机端长按保存）
  showCardModal(canvas) {
    const dataUrl = canvas.toDataURL('image/png');
    const isMobile = window.innerWidth < 768;
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.zIndex = '2000';

    if (isMobile) {
      // 手机：长按保存
      overlay.innerHTML = '<div class="modal" style="max-width:96vw;padding:12px;background:transparent;border:none;">' +
        '<button class="modal-close" style="color:#fff;background:rgba(0,0,0,0.5);border-radius:50%;width:36px;height:36px;line-height:36px;text-align:center;position:absolute;top:4px;right:4px;z-index:10;">&times;</button>' +
        '<p style="text-align:center;color:#fff;font-size:0.8rem;margin-bottom:6px;">👇 长按图片保存到相册</p>' +
        '<img src="' + dataUrl + '" alt="赚钱DNA" style="width:100%;border-radius:10px;display:block;" />' +
        '<p style="text-align:center;color:#a0a0cc;font-size:0.7rem;margin-top:6px;">分享到朋友圈，让朋友也来测测 →</p>' +
        '</div>';
    } else {
      // 桌面：尺寸约束 + 下载按钮 + 滚动
      overlay.innerHTML = '<div class="modal" style="max-width:420px;max-height:95vh;overflow-y:auto;padding:16px;background:#1a1a2e;border:1px solid var(--color-border);border-radius:var(--radius-lg);">' +
        '<button class="modal-close" style="position:sticky;top:0;float:right;z-index:10;">&times;</button>' +
        '<h3 style="text-align:center;margin-bottom:10px;">🧬 我的赚钱DNA</h3>' +
        '<img src="' + dataUrl + '" alt="赚钱DNA" style="width:100%;max-height:65vh;object-fit:contain;border-radius:8px;display:block;" />' +
        '<button class="btn btn-gold btn-lg" id="downloadCardBtn" style="width:100%;margin-top:12px;">📥 下载图片</button>' +
        '<p style="text-align:center;color:var(--color-text-muted);font-size:0.7rem;margin-top:6px;">分享到朋友圈，让朋友也来测测 →</p>' +
        '</div>';
    }

    document.body.appendChild(overlay);

    const closeModal = () => overlay.remove();
    overlay.querySelector('.modal-close').addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });

    // 桌面端下载按钮
    const dlBtn = overlay.querySelector('#downloadCardBtn');
    if (dlBtn) {
      dlBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = '我的赚钱DNA.png';
        link.href = dataUrl;
        link.click();
      });
    }
  },

  // === 管理后台 ===
  renderAdmin() {
    Analytics.init();
    const f = Analytics.funnel();
    const ft = Analytics.funnelToday();
    const topR = Analytics.topResults(15);
    const qFlow = Analytics.questionFlow();
    const rate = (a, b) => b > 0 ? Math.round(a / b * 100) : 0;

    this.root.innerHTML = `
      <div class="page admin-page">
        <h1>📊 方向匹配器 · 数据后台</h1>
        ${(localStorage.getItem('dm_gh_token') || Sync._getToken()) ? '' : '<div style="background:rgba(240,185,11,0.1);border:1px solid rgba(240,185,11,0.3);border-radius:8px;padding:10px 14px;margin-bottom:12px;text-align:center;"><p style="color:#f0b90b;font-size:0.82rem;font-weight:600;">⚠️ 跨设备同步未启用</p><p style="color:#9090b0;font-size:0.72rem;">点击下方「🔗 跨设备同步」设置 Token</p></div>'}
        <div class="admin-section">
          <h2>📈 转化漏斗（累计）</h2>
          <div class="funnel-grid">
            <div class="funnel-step"><span class="funnel-num">${f.visits}</span><span class="funnel-label">访问</span></div>
            <div class="funnel-arrow">→</div>
            <div class="funnel-step"><span class="funnel-num">${f.quizStarts}</span><span class="funnel-label">开始</span><span class="funnel-rate">${rate(f.quizStarts,f.visits)}%</span></div>
            <div class="funnel-arrow">→</div>
            <div class="funnel-step"><span class="funnel-num">${f.quizCompletes}</span><span class="funnel-label">完成</span><span class="funnel-rate">${rate(f.quizCompletes,f.quizStarts)}%</span></div>
            <div class="funnel-arrow">→</div>
            <div class="funnel-step"><span class="funnel-num">${f.payClicks}</span><span class="funnel-label">点付费</span><span class="funnel-rate">${rate(f.payClicks,f.paywallViews)}%</span></div>
            <div class="funnel-arrow">→</div>
            <div class="funnel-step highlight"><span class="funnel-num">${f.unlocks}</span><span class="funnel-label">🔓付费</span><span class="funnel-rate">${rate(f.unlocks,f.payClicks)}%</span></div>
          </div>
          <p style="font-size:0.78rem;color:var(--color-text-muted);margin-top:8px;">解锁失败 ${f.unlockFails} 次 | 分享 ${f.shares} 次</p>
        </div>
        <div class="admin-section">
          <h2>🕐 今日数据</h2>
          <div class="funnel-grid">
            <div class="funnel-step"><span class="funnel-num">${ft.visits}</span><span class="funnel-label">访问</span></div>
            <div class="funnel-step"><span class="funnel-num">${ft.quizStarts}</span><span class="funnel-label">开始</span></div>
            <div class="funnel-step"><span class="funnel-num">${ft.quizCompletes}</span><span class="funnel-label">完成</span></div>
            <div class="funnel-step"><span class="funnel-num">${ft.payClicks}</span><span class="funnel-label">点付费</span></div>
            <div class="funnel-step highlight"><span class="funnel-num">${ft.unlocks}</span><span class="funnel-label">🔓付费</span></div>
          </div>
        </div>
        <div class="admin-section">
          <h2>🎯 热门结果 Top 10</h2>
          <table class="admin-table"><thead><tr><th>赛道</th><th>次数</th></tr></thead><tbody>${topR.map(([n,c])=>`<tr><td>${n}</td><td>${c}</td></tr>`).join('')||'<tr><td colspan="2">暂无数据</td></tr>'}</tbody></table>
        </div>

        <div class="admin-section">
          <h2>🔑 解锁码签发记录 <span id="syncStatus" style="font-size:0.7rem;color:var(--color-text-muted);"> </span></h2>
          <div id="codesTableContainer" style="text-align:center;color:var(--color-text-muted, #606080);">加载中...</div>
        </div>
        <div class="admin-section">
          <h2>📉 答题流失</h2>
          <table class="admin-table"><thead><tr><th>题号</th><th>完成</th><th>流失率</th></tr></thead><tbody>${qFlow.map(q=>`<tr><td>第${q.question}题</td><td>${q.count}</td><td>${q.dropRate>0?'<span style="color:#ff4757">'+q.dropRate+'%</span>':'-'}</td></tr>`).join('')}</tbody></table>
        </div>
        <div class="admin-section">
          <h2>⚙️ 操作</h2>
          <div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center;">
            <button class="btn btn-outline btn-sm" id="exportBtn">📥 导出 JSON</button>
            <button class="btn btn-outline btn-sm" id="refreshBtn">🔄 刷新</button>
            <button class="btn btn-outline btn-sm" id="changePwBtn">🔒 修改密码</button>
            <button class="btn btn-outline btn-sm" id="setTokenBtn" style="color:#f0b90b;border-color:#f0b90b;" title="设置 GitHub Token 以启用跨设备同步">🔗 跨设备同步</button>
            <button class="btn btn-outline btn-sm" id="logoutBtn" style="color:#ff4757;border-color:#ff4757;">🚪 退出登录</button>
            <button class="btn btn-outline btn-sm" id="clearBtn" style="color:#ffa502;border-color:#ffa502;">🗑️ 清除数据</button>
          </div>
          <div id="syncHelp" style="text-align:center;margin-top:10px;font-size:0.72rem;color:var(--color-text-muted);display:none;">
            <p>📌 跨设备同步需要 GitHub Token</p>
            <p style="margin-top:4px;">👉 <a href="https://github.com/settings/tokens" target="_blank" style="color:#7c5cfc;">点此创建 Token</a>，勾选 <b>public_repo</b> 权限</p>
            <input type="text" class="verify-input" id="ghTokenInput" placeholder="粘贴 GitHub Token" autocomplete="off" style="width:100%;max-width:300px;margin-top:8px;font-size:0.75rem;">
            <button class="btn btn-primary btn-sm" id="saveTokenBtn" style="margin-top:6px;">💾 保存</button>
            <p id="tokenMsg" style="font-size:0.7rem;margin-top:4px;"></p>
          </div>
        </div>
        <p class="footer-note">访问 /admin | 数据仅存本地</p>
      </div>`;
    document.getElementById('exportBtn').addEventListener('click',()=>{const j=Analytics.exportData();const b=new Blob([j],{type:'application/json'});const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download='analytics-'+new Date().toISOString().split('T')[0]+'.json';a.click();URL.revokeObjectURL(u);});
    document.getElementById('refreshBtn').addEventListener('click',()=>this.renderAdmin());
    document.getElementById('changePwBtn').addEventListener('click',()=>this.showChangePwModal());
    document.getElementById('logoutBtn').addEventListener('click',()=>{sessionStorage.removeItem('dm_admin_auth');window.location.href='/';});
    document.getElementById('clearBtn').addEventListener('click',()=>{if(confirm('确定清除全部数据？不可恢复。')){Analytics.clearData();this.renderAdmin();}});



    // GitHub Token 设置
    document.getElementById('setTokenBtn').addEventListener('click', () => {
      const help = document.getElementById('syncHelp');
      help.style.display = help.style.display === 'none' ? 'block' : 'none';
    });
    document.getElementById('saveTokenBtn').addEventListener('click', async () => {
      const input = document.getElementById('ghTokenInput');
      const msg = document.getElementById('tokenMsg');
      const token = input.value.trim();
      if (!token) { msg.textContent = '请输入 Token'; msg.style.color = '#ff4757'; return; }
      msg.textContent = '验证中…'; msg.style.color = '#9090b0';
      const valid = await Sync.verifyToken(token);
      if (valid) {
        localStorage.setItem('dm_gh_token', token);
        msg.textContent = '✅ Token 有效，已保存！跨设备同步已启用';
        msg.style.color = '#00d4aa';
        setTimeout(() => { document.getElementById('syncHelp').style.display = 'none'; this._updateSyncStatus(); }, 1500);
      } else {
        msg.textContent = '❌ Token 无效，请检查后重试';
        msg.style.color = '#ff4757';
      }
    });

    // 异步加载解锁码表 + 自动刷新
    this._renderCodesTable();
    this._updateSyncStatus();
    // 每 10 秒自动刷新解锁码列表
    if (this._codesRefreshTimer) clearInterval(this._codesRefreshTimer);
    this._codesRefreshTimer = setInterval(() => { this._renderCodesTable(); this._updateSyncStatus(); }, 10000);
  },

  async _renderCodesTable() {
    const container = document.getElementById('codesTableContainer');
    if (!container) return;
    try {
      // 从共享存储读取
      let codes = await Sync.read();

      // 合并本地 localStorage 数据（防止 jsonblob 返回空数据）
      try {
        const localRaw = localStorage.getItem('dm_issued_codes');
        if (localRaw) {
          const localList = JSON.parse(localRaw);
          localList.forEach(function(c) {
            if (!codes[c.code]) {
              codes[c.code] = { time: c.time, activated: !!c.activated, used: !!c.used, usedAt: c.usedAt, activatedAt: c.activatedAt };
            } else {
              // 共享存储优先，但补充缺失字段
              if (codes[c.code].time == null) codes[c.code].time = c.time;
            }
          });
        }
      } catch(e) {}

      const entries = Object.entries(codes).sort((a, b) => (b[1].time || 0) - (a[1].time || 0)).slice(0, 50);
      if (entries.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:var(--color-text-muted);">暂未签发过解锁码</p>';
        return;
      }
      container.innerHTML = `<table class="admin-table"><thead><tr><th>解锁码</th><th>签发时间</th><th>激活</th><th>使用</th><th>操作</th></tr></thead><tbody>
        ${entries.map(([code, c]) => `<tr>
          <td style="font-family:monospace;letter-spacing:0.2em;">${code}</td>
          <td>${new Date(c.time).toLocaleString('zh-CN',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'})}</td>
          <td style="color:${c.activated?'var(--color-success)':'var(--color-text-muted)'}">${c.activated ? '✅ 已激活' : '⏳ 待激活'}</td>
          <td>${c.used ? '✅ ' + new Date(c.usedAt).toLocaleString('zh-CN',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}) : '-'}</td>
          <td>
            ${c.activated
              ? '<button class="btn btn-outline btn-sm admin-code-btn" data-code="' + code + '" data-action="deactivate" style="font-size:0.7rem;padding:2px 8px;color:#ff4757;border-color:#ff4757;">停用</button>'
              : '<button class="btn btn-outline btn-sm admin-code-btn" data-code="' + code + '" data-action="activate" style="font-size:0.7rem;padding:2px 8px;color:#00d4aa;border-color:#00d4aa;">✅ 激活</button>'
            }
          </td>
        </tr>`).join('')}
      </tbody></table>`;

      // 绑定激活/停用按钮
      const self = this;
      container.querySelectorAll('.admin-code-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
          const code = this.dataset.code;
          const action = this.dataset.action;
          if (action === 'activate') {
            await self._activateCode(code);
          } else if (action === 'deactivate') {
            await self._deactivateCode(code);
          }
          self._renderCodesTable(); // 刷新
        });
      });
    } catch(e) {
      container.innerHTML = '<p style="text-align:center;color:var(--color-text-muted);">加载失败，请确认网络连接后刷新页面</p>';
    }
  },

  // 同步状态指示
  async _updateSyncStatus() {
    const el = document.getElementById('syncStatus');
    if (!el) return;
    const token = Sync._getToken();
    if (!token) {
      el.textContent = '⚪ 未设置跨设备同步';
      el.style.color = '#9090b0';
      return;
    }
    try {
      const ok = await Sync.checkStatus();
      el.textContent = ok ? '🟢 云端同步正常' : '🔴 GitHub 连接失败';
      el.style.color = ok ? 'var(--color-success)' : '#ff4757';
    } catch(e) {
      el.textContent = '🔴 GitHub 连接失败';
      el.style.color = '#ff4757';
    }
  },

  // === 修改密码弹窗 ===
  showChangePwModal() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal" style="max-width:380px;">
        <button class="modal-close">&times;</button>
        <h3>🔒 修改管理密码</h3>
        <div style="text-align:left;margin-top:16px;">
          <label style="display:block;font-size:0.82rem;color:var(--color-text-secondary);margin-bottom:4px;">旧密码</label>
          <input type="password" class="verify-input" id="changeOldPw" placeholder="输入旧密码" autocomplete="off" style="width:100%;box-sizing:border-box;">
          <label style="display:block;font-size:0.82rem;color:var(--color-text-secondary);margin-top:12px;margin-bottom:4px;">新密码（至少 4 位）</label>
          <input type="password" class="verify-input" id="changeNewPw1" placeholder="输入新密码" autocomplete="off" style="width:100%;box-sizing:border-box;">
          <input type="password" class="verify-input" id="changeNewPw2" placeholder="再次输入新密码" autocomplete="off" style="width:100%;box-sizing:border-box;margin-top:8px;">
          <p id="changePwError" style="display:none;color:#ff4757;font-size:0.78rem;margin-top:8px;"></p>
        </div>
        <button class="btn btn-gold btn-lg" id="confirmChangePwBtn" style="width:100%;margin-top:16px;">✅ 确认修改</button>
      </div>
    `;
    document.body.appendChild(overlay);

    const closeModal = () => overlay.remove();
    overlay.querySelector('.modal-close').addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });

    const oldPw = overlay.querySelector('#changeOldPw');
    const newPw1 = overlay.querySelector('#changeNewPw1');
    const newPw2 = overlay.querySelector('#changeNewPw2');
    const errEl = overlay.querySelector('#changePwError');
    const confirmBtn = overlay.querySelector('#confirmChangePwBtn');

    const showErr = (msg) => { errEl.textContent = msg; errEl.style.display = 'block'; };
    const hideErr = () => { errEl.style.display = 'none'; };

    confirmBtn.addEventListener('click', async () => {
      hideErr();
      const old = oldPw.value.trim();
      const n1 = newPw1.value.trim();
      const n2 = newPw2.value.trim();

      if (!old || !n1 || !n2) {
        showErr('请填写所有密码字段');
        return;
      }

      // 验证旧密码：先查共享存储，再查本地
      const oldHash = await this._hashPw(old);
      let validOld = false;
      try {
        const sharedPw = await Sync.getPassword();
        if (sharedPw && oldHash === sharedPw) { validOld = true; }
      } catch(e) {}
      if (!validOld) {
        const localPw = localStorage.getItem('dm_admin_pw');
        if (localPw && oldHash === localPw) { validOld = true; }
      }
      if (!validOld) {
        showErr('旧密码错误');
        return;
      }

      if (n1.length < 4) {
        showErr('新密码至少需要 4 位');
        return;
      }
      if (n1 !== n2) {
        showErr('两次输入的新密码不一致');
        return;
      }

      // 更新密码：写共享存储 + 本地
      const newHash = await this._hashPw(n1);
      try { await Sync.setPassword(newHash); } catch(e) {}
      localStorage.setItem('dm_admin_pw', newHash);

      confirmBtn.textContent = '✅ 密码已更新';
      confirmBtn.disabled = true;
      confirmBtn.classList.add('btn-verified');
      setTimeout(() => overlay.remove(), 800);
    });

    // 回车提交
    overlay.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') confirmBtn.click();
    });
  },

  // SHA-256 密码哈希（优先 Web Crypto，降级简单哈希）
  async _hashPw(str) {
    // 优先使用 Web Crypto API
    let subtle = null;
    try { subtle = window.crypto && window.crypto.subtle; } catch(e) {}

    if (subtle && subtle.digest) {
      try {
        const data = new TextEncoder().encode(str);
        const buf = await subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(buf))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
      } catch(e) {}
    }

    // 降级：简单哈希
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) - h + str.charCodeAt(i)) | 0;
      h = (h * 16777619) | 0;
    }
    return 'fb_' + Math.abs(h).toString(36);
  },
};

// 辅助：Canvas 圆角矩形
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

// === 启动（双保险：DOMContentLoaded + 立即检查） ===
function bootApp() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { Renderer.init(); });
  } else {
    Renderer.init();
  }
}
bootApp();
