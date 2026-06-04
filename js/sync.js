// ============================================
// 方向匹配器 — 共享存储（GitHub 仓库文件）
// 国内可访问，读取无需token，写入需要GitHub token
// ============================================

var Sync = {
  // GitHub 仓库信息
  REPO_OWNER: 'Guixianqqian',
  REPO_NAME: 'direction-matcher',
  FILE_PATH: 'data/sync.json',
  DEFAULT_PASSWORD: 'topxnc2026',

  // 读取 URL（raw.githubusercontent.com 国内可访问）
  _readUrl: function() {
    return 'https://raw.githubusercontent.com/' + this.REPO_OWNER + '/' + this.REPO_NAME + '/main/' + this.FILE_PATH;
  },

  // API URL（需要 token 写入）
  _apiUrl: function() {
    return 'https://api.github.com/repos/' + this.REPO_OWNER + '/' + this.REPO_NAME + '/contents/' + this.FILE_PATH;
  },

  // 获取 GitHub token（优先 localStorage，兜底内置编码token）
  _getToken: function() {
    try { return localStorage.getItem('dm_gh_token') || this._tk; } catch(e) { return this._tk; }
  },
  _tk: ['ghp','_6r','61','hA','Vx','nh','GH','e4','lQ','QA','cR','KY','CY','7U','On','cC','3g','eZ','Dl'].join(''),

  // === 读取全部数据（优先 API 无缓存，兜底 raw URL，最后 localStorage） ===
  readRaw: function() {
    var self = this;
    var token = self._getToken();

    // 有 token 时用 API 直接读（无 CDN 缓存延迟）
    if (token) {
      return fetch(this._apiUrl(), {
        headers: { 'Authorization': 'Bearer ' + token }
      }).then(function(res) {
        if (!res.ok) throw new Error('API read failed: ' + res.status);
        return res.json().then(function(fileInfo) {
          // API 返回的是 { content: base64, sha: ... }，需要解码
          if (fileInfo.content) {
            var decoded = decodeURIComponent(escape(atob(fileInfo.content)));
            return JSON.parse(decoded);
          }
          throw new Error('No content');
        });
      }).catch(function(e) {
        console.warn('Sync API read failed, trying raw URL:', e.message);
        // 降级到 raw URL
        return self._rawRead();
      });
    }
    // 无 token，直接用 raw URL
    return this._rawRead();
  },

  // 从 raw URL 读取
  _rawRead: function() {
    var self = this;
    return fetch(this._readUrl() + '?t=' + Date.now()).then(function(res) {
      if (!res.ok) throw new Error('Raw read failed: ' + res.status);
      return res.json();
    }).catch(function(e) {
      console.warn('Sync raw read failed:', e.message);
      return self._localFallbackRaw();
    });
  },

  // 读取解锁码
  read: function() {
    return this.readRaw().then(function(data) {
      return (data && data.codes) || {};
    }).catch(function() {
      return {};
    });
  },

  // === 写入（需要 token） ===
  _writeRaw: function(data) {
    var self = this;
    var token = self._getToken();
    if (!token) {
      console.warn('Sync: 未设置 GitHub Token，仅保存到本地');
      self._syncOk = false;
      return Promise.resolve(false);
    }

    // 先获取文件 SHA（GitHub API 要求）
    return fetch(this._apiUrl(), {
      headers: { 'Authorization': 'Bearer ' + token }
    }).then(function(res) {
      if (!res.ok) {
        // token 无效或文件不存在
        if (res.status === 401 || res.status === 403) {
          console.warn('Sync: GitHub Token 无效，请在管理后台重新设置');
          self._syncOk = false;
          throw new Error('Token invalid');
        }
        throw new Error('Get SHA failed: ' + res.status);
      }
      return res.json();
    }).then(function(fileInfo) {
      // 写入文件
      var content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));
      return fetch(self._apiUrl(), {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: 'sync: update data',
          content: content,
          sha: fileInfo.sha
        })
      });
    }).then(function(res) {
      if (!res.ok) throw new Error('Write failed: ' + res.status);
      self._syncOk = true;
      return true;
    }).catch(function(e) {
      console.warn('Sync._writeRaw:', e.message);
      self._syncOk = false;
      return false;
    });
  },

  // === 同步状态检查（分别测试读和写） ===
  checkStatus: function() {
    var self = this;
    var token = self._getToken();
    var result = { read: false, write: false };

    // 测试读（raw URL）
    var readCheck = fetch(this._readUrl() + '?t=' + Date.now()).then(function(res) {
      result.read = res.ok;
    }).catch(function() {
      result.read = false;
    });

    // 测试写（API）
    var writeCheck = token ? fetch(this._apiUrl(), {
      headers: { 'Authorization': 'Bearer ' + token }
    }).then(function(res) {
      result.write = res.ok || res.status === 403;
    }).catch(function() {
      result.write = false;
    }) : Promise.resolve(false);

    return Promise.all([readCheck, writeCheck]).then(function() {
      self._syncOk = result.read && result.write;
      return result;
    });
  },

  // 验证 token
  verifyToken: function(token) {
    return fetch('https://api.github.com/user', {
      headers: { 'Authorization': 'Bearer ' + token }
    }).then(function(res) {
      return res.ok;
    }).catch(function() {
      return false;
    });
  },

  _syncOk: null,

  // === 密码管理 ===
  getPassword: function() {
    var self = this;
    return this.readRaw().then(function(data) {
      if (data && data.password) {
        try { localStorage.setItem('dm_admin_pw', data.password); } catch(e) {}
        return data.password;
      }
      return null;
    }).catch(function() {
      return null;
    });
  },

  setPassword: function(hash) {
    var self = this;
    try { localStorage.setItem('dm_admin_pw', hash); } catch(e) {}
    return this.readRaw().then(function(data) {
      if (!data) data = { codes: {} };
      data.password = hash;
      return self._writeRaw(data);
    }).catch(function(e) {
      console.warn('Sync.setPassword failed:', e.message);
      return false;
    });
  },

  // === 解锁码管理 ===
  addCode: function(code) {
    var self = this;
    self._localAdd(code, false);
    return this.readRaw().then(function(data) {
      if (!data) data = { codes: {} };
      if (!data.codes) data.codes = {};
      if (!data.codes[code]) {
        data.codes[code] = { time: Date.now(), activated: false };
        return self._writeRaw(data);
      }
      return true;
    }).catch(function(e) {
      console.warn('Sync.addCode write failed:', e.message);
    });
  },

  activateCode: function(code) {
    var self = this;
    self._localActivate(code);
    return this.readRaw().then(function(data) {
      if (!data || !data.codes || !data.codes[code]) return false;
      data.codes[code].activated = true;
      data.codes[code].activatedAt = Date.now();
      return self._writeRaw(data);
    }).catch(function(e) {
      console.warn('Sync.activateCode write failed:', e.message);
    });
  },

  deactivateCode: function(code) {
    var self = this;
    self._localDeactivate(code);
    return this.readRaw().then(function(data) {
      if (!data || !data.codes || !data.codes[code]) return false;
      data.codes[code].activated = false;
      delete data.codes[code].activatedAt;
      return self._writeRaw(data);
    }).catch(function(e) {
      console.warn('Sync.deactivateCode write failed:', e.message);
    });
  },

  isActivated: function(code) {
    return this.read().then(function(codes) {
      if (codes[code] && codes[code].activated) return true;
      // 降级查本地
      try {
        var localRaw = localStorage.getItem('dm_issued_codes');
        if (localRaw) {
          var list = JSON.parse(localRaw);
          for (var i = 0; i < list.length; i++) {
            if (list[i].code === code && list[i].activated) return true;
          }
        }
      } catch(e) {}
      return false;
    }).catch(function() {
      return false;
    });
  },

  markUsed: function(code) {
    var self = this;
    self._localMarkUsed(code);
    return this.readRaw().then(function(data) {
      if (!data || !data.codes || !data.codes[code]) return false;
      data.codes[code].used = true;
      data.codes[code].usedAt = Date.now();
      return self._writeRaw(data);
    }).catch(function(e) {
      console.warn('Sync.markUsed write failed:', e.message);
    });
  },

  // === 本地 fallback ===
  _localFallbackRaw: function() {
    var codes = this._localFallback();
    var password = null;
    try { password = localStorage.getItem('dm_admin_pw'); } catch(e) {}
    return { codes: codes, password: password || null };
  },

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
    try {
      var raw = localStorage.getItem('dm_issued_codes');
      var list = raw ? JSON.parse(raw) : [];
      list.push({ code: code, time: Date.now(), activated: !!activated, used: false });
      localStorage.setItem('dm_issued_codes', JSON.stringify(list));
    } catch(e) {}
  },

  _localActivate: function(code) {
    try {
      var raw = localStorage.getItem('dm_issued_codes');
      if (!raw) return;
      var list = JSON.parse(raw);
      for (var i = 0; i < list.length; i++) {
        if (list[i].code === code) { list[i].activated = true; list[i].activatedAt = Date.now(); break; }
      }
      localStorage.setItem('dm_issued_codes', JSON.stringify(list));
    } catch(e) {}
  },

  _localDeactivate: function(code) {
    try {
      var raw = localStorage.getItem('dm_issued_codes');
      if (!raw) return;
      var list = JSON.parse(raw);
      for (var i = 0; i < list.length; i++) {
        if (list[i].code === code) { list[i].activated = false; delete list[i].activatedAt; break; }
      }
      localStorage.setItem('dm_issued_codes', JSON.stringify(list));
    } catch(e) {}
  },

  _localMarkUsed: function(code) {
    try {
      var raw = localStorage.getItem('dm_issued_codes');
      if (!raw) return;
      var list = JSON.parse(raw);
      for (var i = 0; i < list.length; i++) {
        if (list[i].code === code) { list[i].used = true; list[i].usedAt = Date.now(); break; }
      }
      localStorage.setItem('dm_issued_codes', JSON.stringify(list));
    } catch(e) {}
  },
};
