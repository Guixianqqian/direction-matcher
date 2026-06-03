// ============================================
// 方向匹配器 — 共享存储（jsonblob.com）
// 解决用户浏览器和管理员后台之间的数据同步
// ============================================

const Sync = {
  BLOB_ID: '019e8d11-ecf2-7649-9b59-0f186efc44b0',
  BASE_URL: 'https://jsonblob.com/api/jsonBlob',

  _url() {
    return this.BASE_URL + '/' + this.BLOB_ID;
  },

  // 读取全部数据
  async read() {
    try {
      const res = await fetch(this._url());
      if (!res.ok) throw new Error('Sync read failed: ' + res.status);
      const data = await res.json();
      return data.codes || {};
    } catch (e) {
      console.warn('Sync.read failed, using local fallback:', e.message);
      return this._localFallback();
    }
  },

  // 写入全部数据
  async _write(codes) {
    try {
      const res = await fetch(this._url(), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codes }),
      });
      if (!res.ok) throw new Error('Sync write failed: ' + res.status);
      return true;
    } catch (e) {
      console.warn('Sync._write failed:', e.message);
      return false;
    }
  },

  // 添加新解锁码
  async addCode(code) {
    const codes = await this.read();
    if (!codes[code]) {
      codes[code] = { time: Date.now(), activated: false };
      await this._write(codes);
    }
    // 同时写本地备份
    this._localAdd(code, false);
  },

  // 激活解锁码
  async activateCode(code) {
    const codes = await this.read();
    if (codes[code]) {
      codes[code].activated = true;
      codes[code].activatedAt = Date.now();
      await this._write(codes);
    }
    // 同时更新本地
    this._localActivate(code);
  },

  // 停用解锁码
  async deactivateCode(code) {
    const codes = await this.read();
    if (codes[code]) {
      codes[code].activated = false;
      delete codes[code].activatedAt;
      await this._write(codes);
    }
    this._localDeactivate(code);
  },

  // 检查码是否已激活
  async isActivated(code) {
    const codes = await this.read();
    return !!(codes[code] && codes[code].activated);
  },

  // 检查码是否已使用
  async markUsed(code) {
    const codes = await this.read();
    if (codes[code]) {
      codes[code].used = true;
      codes[code].usedAt = Date.now();
      await this._write(codes);
    }
    this._localMarkUsed(code);
  },

  // === 本地 fallback ===
  _localFallback() {
    try {
      const raw = localStorage.getItem('dm_issued_codes');
      if (raw) {
        const list = JSON.parse(raw);
        const codes = {};
        list.forEach(c => { codes[c.code] = { time: c.time, activated: !!c.activated, used: !!c.used, usedAt: c.usedAt, activatedAt: c.activatedAt }; });
        return codes;
      }
    } catch (e) {}
    return {};
  },

  _localAdd(code, activated) {
    const issued = Renderer._getIssuedCodes();
    issued.push({ code, time: Date.now(), activated, used: false });
    localStorage.setItem('dm_issued_codes', JSON.stringify(issued));
  },

  _localActivate(code) {
    const activated = Renderer._getActivatedCodes();
    if (!activated.includes(code)) {
      activated.push(code);
      localStorage.setItem('dm_activated_codes', JSON.stringify(activated));
    }
    const issued = Renderer._getIssuedCodes();
    const f = issued.find(c => c.code === code);
    if (f) { f.activated = true; f.activatedAt = Date.now(); }
    localStorage.setItem('dm_issued_codes', JSON.stringify(issued));
  },

  _localDeactivate(code) {
    const activated = Renderer._getActivatedCodes().filter(c => c !== code);
    localStorage.setItem('dm_activated_codes', JSON.stringify(activated));
    const issued = Renderer._getIssuedCodes();
    const f = issued.find(c => c.code === code);
    if (f) { f.activated = false; delete f.activatedAt; }
    localStorage.setItem('dm_issued_codes', JSON.stringify(issued));
  },

  _localMarkUsed(code) {
    const issued = Renderer._getIssuedCodes();
    const f = issued.find(c => c.code === code);
    if (f) { f.used = true; f.usedAt = Date.now(); }
    localStorage.setItem('dm_issued_codes', JSON.stringify(issued));
  },
};
