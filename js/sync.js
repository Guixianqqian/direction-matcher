// ============================================
// 方向匹配器 — 共享存储（jsonblob.com）
// 解决用户浏览器和管理员后台之间的数据同步
// 版本: ES5 兼容
// ============================================

var Sync = {
  BLOB_ID: '019e8d11-ecf2-7649-9b59-0f186efc44b0',
  BASE_URL: 'https://jsonblob.com/api/jsonBlob',

  _url: function() {
    return this.BASE_URL + '/' + this.BLOB_ID;
  },

  // 读取全部数据
  read: function() {
    var self = this;
    return fetch(this._url()).then(function(res) {
      if (!res.ok) throw new Error('Sync read failed: ' + res.status);
      return res.json();
    }).then(function(data) {
      return (data && data.codes) || {};
    }).catch(function(e) {
      console.warn('Sync.read failed, using local fallback:', e.message);
      return self._localFallback();
    });
  },

  // 写入全部数据
  _write: function(codes) {
    return fetch(this._url(), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codes: codes }),
    }).then(function(res) {
      if (!res.ok) throw new Error('Sync write failed: ' + res.status);
      return true;
    }).catch(function(e) {
      console.warn('Sync._write failed:', e.message);
      return false;
    });
  },

  // 添加新解锁码
  addCode: function(code) {
    var self = this;
    return this.read().then(function(codes) {
      if (!codes[code]) {
        codes[code] = { time: Date.now(), activated: false };
        return self._write(codes);
      }
    }).then(function() {
      self._localAdd(code, false);
    }).catch(function(e) {
      console.warn('Sync.addCode failed:', e.message);
      self._localAdd(code, false);
    });
  },

  // 激活解锁码
  activateCode: function(code) {
    var self = this;
    return this.read().then(function(codes) {
      if (codes[code]) {
        codes[code].activated = true;
        codes[code].activatedAt = Date.now();
        return self._write(codes);
      }
    }).then(function() {
      self._localActivate(code);
    }).catch(function(e) {
      console.warn('Sync.activateCode failed:', e.message);
      self._localActivate(code);
    });
  },

  // 停用解锁码
  deactivateCode: function(code) {
    var self = this;
    return this.read().then(function(codes) {
      if (codes[code]) {
        codes[code].activated = false;
        delete codes[code].activatedAt;
        return self._write(codes);
      }
    }).then(function() {
      self._localDeactivate(code);
    }).catch(function(e) {
      console.warn('Sync.deactivateCode failed:', e.message);
      self._localDeactivate(code);
    });
  },

  // 检查码是否已激活
  isActivated: function(code) {
    return this.read().then(function(codes) {
      return !!(codes[code] && codes[code].activated);
    }).catch(function() {
      return false;
    });
  },

  // 标记码已使用
  markUsed: function(code) {
    var self = this;
    return this.read().then(function(codes) {
      if (codes[code]) {
        codes[code].used = true;
        codes[code].usedAt = Date.now();
        return self._write(codes);
      }
    }).then(function() {
      self._localMarkUsed(code);
    }).catch(function(e) {
      console.warn('Sync.markUsed failed:', e.message);
      self._localMarkUsed(code);
    });
  },

  // === 本地 fallback ===
  _localFallback: function() {
    try {
      var raw = localStorage.getItem('dm_issued_codes');
      if (raw) {
        var list = JSON.parse(raw);
        var codes = {};
        list.forEach(function(c) {
          codes[c.code] = { time: c.time, activated: !!c.activated, used: !!c.used, usedAt: c.usedAt, activatedAt: c.activatedAt };
        });
        return codes;
      }
    } catch(e) {}
    return {};
  },

  _localAdd: function(code, activated) {
    if (typeof Renderer === 'undefined' || !Renderer._getIssuedCodes) return;
    var issued = Renderer._getIssuedCodes();
    issued.push({ code: code, time: Date.now(), activated: !!activated, used: false });
    localStorage.setItem('dm_issued_codes', JSON.stringify(issued));
  },

  _localActivate: function(code) {
    if (typeof Renderer === 'undefined' || !Renderer._getActivatedCodes) return;
    var activated = Renderer._getActivatedCodes();
    if (activated.indexOf(code) === -1) {
      activated.push(code);
      localStorage.setItem('dm_activated_codes', JSON.stringify(activated));
    }
    var issued = Renderer._getIssuedCodes();
    var f = null;
    for (var i = 0; i < issued.length; i++) {
      if (issued[i].code === code) { f = issued[i]; break; }
    }
    if (f) { f.activated = true; f.activatedAt = Date.now(); }
    localStorage.setItem('dm_issued_codes', JSON.stringify(issued));
  },

  _localDeactivate: function(code) {
    if (typeof Renderer === 'undefined' || !Renderer._getActivatedCodes) return;
    var activated = Renderer._getActivatedCodes().filter(function(c) { return c !== code; });
    localStorage.setItem('dm_activated_codes', JSON.stringify(activated));
    var issued = Renderer._getIssuedCodes();
    var f = null;
    for (var i = 0; i < issued.length; i++) {
      if (issued[i].code === code) { f = issued[i]; break; }
    }
    if (f) { f.activated = false; delete f.activatedAt; }
    localStorage.setItem('dm_issued_codes', JSON.stringify(issued));
  },

  _localMarkUsed: function(code) {
    if (typeof Renderer === 'undefined' || !Renderer._getIssuedCodes) return;
    var issued = Renderer._getIssuedCodes();
    var f = null;
    for (var i = 0; i < issued.length; i++) {
      if (issued[i].code === code) { f = issued[i]; break; }
    }
    if (f) { f.used = true; f.usedAt = Date.now(); }
    localStorage.setItem('dm_issued_codes', JSON.stringify(issued));
  },
};
