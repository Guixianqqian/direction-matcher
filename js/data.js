// 测评题目 + 赛道库 + 匹配算法

// === 12 道测评题 ===
const QUESTIONS = [
  {
    id: 'time',
    textKey: 'q1',
    options: [
      { value: 'low', label: '每周少于10小时', score: { timeAvailable: 1 } },
      { value: 'mid', label: '每周10-30小时', score: { timeAvailable: 3 } },
      { value: 'high', label: '每周30小时以上（全职投入）', score: { timeAvailable: 5 } },
    ]
  },
  {
    id: 'capital',
    textKey: 'q2',
    options: [
      { value: 'low', label: '0-1000元（零成本起步）', score: { startupCapital: 1 } },
      { value: 'mid', label: '1000-10000元', score: { startupCapital: 3 } },
      { value: 'high', label: '10000元以上', score: { startupCapital: 5 } },
    ]
  },
  {
    id: 'teamwork',
    textKey: 'q3',
    options: [
      { value: 'solo', label: '完全独立工作，不想依赖任何人', score: { independence: 5 } },
      { value: 'small', label: '可以接受小团队协作', score: { independence: 3 } },
      { value: 'partner', label: '我需要搭档/合伙人一起', score: { independence: 1 } },
    ]
  },
  {
    id: 'risk',
    textKey: 'q4',
    options: [
      { value: 'safe', label: '收入必须稳定，受不了波动', score: { riskTolerance: 1 } },
      { value: 'balanced', label: '可以接受一定波动', score: { riskTolerance: 3 } },
      { value: 'high', label: '高风险高回报，不惧波动', score: { riskTolerance: 5 } },
    ]
  },
  {
    id: 'skill',
    textKey: 'q5',
    options: [
      { value: 'tech', label: '技术/编程/AI工具', score: { techSkill: 5 } },
      { value: 'writing', label: '写作/内容创作/表达', score: { techSkill: 2 } },
      { value: 'sales', label: '销售/沟通/谈判', score: { techSkill: 1 } },
      { value: 'design', label: '设计/创意/审美', score: { techSkill: 3 } },
      { value: 'management', label: '管理/组织/统筹', score: { techSkill: 2 } },
    ]
  },
  {
    id: 'social',
    textKey: 'q6',
    options: [
      { value: 'charge', label: '充电！跟人聊天让我更有能量', score: { socialEnergy: 5 } },
      { value: 'neutral', label: '还行，不多不少', score: { socialEnergy: 3 } },
      { value: 'drain', label: '放电……社交让我很累', score: { socialEnergy: 1 } },
    ]
  },
  {
    id: 'incomeSpeed',
    textKey: 'q7',
    options: [
      { value: '1m', label: '1个月内必须有收入', score: { incomeTimeline: 1 } },
      { value: '3m', label: '3个月内', score: { incomeTimeline: 2 } },
      { value: '6m', label: '半年内', score: { incomeTimeline: 3 } },
      { value: '1y', label: '一年以上也可以，我看长期', score: { incomeTimeline: 5 } },
    ]
  },
  {
    id: 'face',
    textKey: 'q8',
    options: [
      { value: 'yes', label: '愿意出镜，不排斥', score: { facePublic: 5 } },
      { value: 'voice', label: '不出镜但可以语音/文字', score: { facePublic: 3 } },
      { value: 'no', label: '绝对不出镜，只做幕后', score: { facePublic: 1 } },
    ]
  },
  {
    id: 'industry',
    textKey: 'q9',
    options: [
      { value: 'tech', label: '互联网/科技/IT', score: { industryExp: 'tech' } },
      { value: 'traditional', label: '传统实业/制造/贸易', score: { industryExp: 'traditional' } },
      { value: 'finance', label: '金融/房产/保险', score: { industryExp: 'finance' } },
      { value: 'education', label: '教育/培训/人力资源', score: { industryExp: 'education' } },
      { value: 'none', label: '没有特定行业经验', score: { industryExp: 'none' } },
    ]
  },
  {
    id: 'techAttitude',
    textKey: 'q10',
    options: [
      { value: 'geek', label: '极客——最早尝试新技术', score: { learningWillingness: 5 } },
      { value: 'follower', label: '跟得上主流就行', score: { learningWillingness: 3 } },
      { value: 'slow', label: '需要有人带我', score: { learningWillingness: 1 } },
    ]
  },
  {
    id: 'motivation',
    textKey: 'q11',
    options: [
      { value: 'money', label: '赚钱——我想变富', score: { motivation: 'money' } },
      { value: 'freedom', label: '自由——不想被束缚', score: { motivation: 'freedom' } },
      { value: 'create', label: '创造——我想做出有影响力的东西', score: { motivation: 'create' } },
      { value: 'security', label: '安全感——我需要稳定的保障', score: { motivation: 'security' } },
    ]
  },
  {
    id: 'learnStyle',
    textKey: 'q12',
    options: [
      { value: 'doing', label: '边干边学，直接上手', score: { learnStyle: 'doing' } },
      { value: 'structured', label: '花1-3个月系统学习再开始', score: { learnStyle: 'structured' } },
      { value: 'avoid', label: '不想学新东西，用现有技能变现', score: { learnStyle: 'avoid' } },
    ]
  },
];

// === 15 个轻资产赛道 ===
const TRACKS = [
  {
    id: 'micro-saas',
    name: '微型 SaaS / 工具开发',
    nameEn: 'Micro SaaS / Tool Builder',
    income: '5K-50K/月（行业案例参考，非承诺）',
    timeToStart: '2-6个月',
    why: '你的技术能力是最强杠杆。做一个小工具，一个人维护，按月收费。做一次，卖多次。',
    startPath: '第1阶段（1-2周）：用「产品猎手法」找痛点。去 Product Hunt、小众软件、V2EX 翻用户吐槽帖，重点关注"这个软件太贵了""要是有个简单版就好了"这类评论。锁定一个 10 分钟内能描述清楚的需求。\n\n第2阶段（1-3周）：用 AI 编程工具（Cursor/Claude Code/v0）3 天内做出第一个可用版本。功能砍到只剩一个——只解决那个核心痛点。不要登录、不要设置页、不要任何多余功能。\n\n第3阶段（1-2周）：定价 19-99 元/月或一次性买断 99-299 元。在 Reddit、Product Hunt、相应垂直社区发布"我做了一个小工具解决XX问题"，附上链接。前 50 个用户免费换反馈。\n\n第4阶段（持续）：根据用户反馈每周迭代一次。当月收入达到 5000 元后，开始投 Google Ads 或在小红书/知乎铺内容做 SEO。',
    // 理想用户画像分数
    profile: {
      timeAvailable: 4,
      startupCapital: 2,
      independence: 5,
      riskTolerance: 3,
      techSkill: 5,
      socialEnergy: 2,
      incomeTimeline: 3,
      facePublic: 1,
      learningWillingness: 5,
    },
    motivationMatch: ['money', 'freedom', 'create'],
  },
  {
    id: 'ai-consultant',
    name: 'AI 应用顾问 / 自动化服务',
    nameEn: 'AI Consultant / Automation Service',
    income: '8K-30K/月（行业案例参考，非承诺）',
    timeToStart: '1-3个月',
    why: '中小企业正在焦虑"AI 会淘汰我但我不知道怎么用"。你帮他们搭自动化流程，用你的技术 + 行业经验收咨询费。不是传统软件实施，是做 AI 提效方案。',
    startPath: '第1阶段（1-2周）：选定一个垂直行业（餐饮、零售、电商、教培、房产中介等），深入了解该行业最常见的 3 个效率痛点——去小红书搜"XX行业累""XX行业加班"，看从业者在抱怨什么。\n\n第2阶段（2-4周）：用 AI 工具搭建 3 个自动化模板，例如：自动生成周报、客户数据自动整理、发票识别+入账。每个模板解决一个具体痛点。做成演示视频，标注"帮你每天省 2 小时"。\n\n第3阶段（1-2周）：找 3 个该行业的中小老板免费试用（通过朋友圈、行业群、甚至直接上门）。用他们的反馈优化模板，同时请他们写一段推荐语。\n\n第4阶段（持续）：定价 3000-8000 元/套（含部署+1个月维护），在小红书、抖音发案例视频引流。每做一个客户就把案例写成内容，形成"案例→内容→新客户"的正循环。',
    profile: {
      timeAvailable: 3,
      startupCapital: 1,
      independence: 4,
      riskTolerance: 2,
      techSkill: 4,
      socialEnergy: 3,
      incomeTimeline: 2,
      facePublic: 1,
      learningWillingness: 4,
    },
    motivationMatch: ['money', 'freedom', 'security'],
  },
  {
    id: 'newsletter',
    name: '付费 Newsletter / 内容订阅',
    nameEn: 'Paid Newsletter / Content Subscription',
    income: '3K-50K/月（行业案例参考，非承诺）',
    timeToStart: '3-6个月',
    why: '把你对一个领域的深度认知写成定期邮件，读者按月/年付费。不需要服务客户，不需要出镜。写作本身有复利——一篇好文章可以被反复读。',
    startPath: '第1阶段（1-2周）：选定一个细分话题——越窄越好。"AI工具测评"太宽，"非程序员用AI提效的100个场景"更好。去 Substack、小报童、知识星球看同品类 Top 10 账号在研究什么。\n\n第2阶段（2-6周）：免费写 8-12 篇高质量内容，每篇 1500-3000 字，解决一个具体问题。发布在知乎、即刻、少数派、个人博客。每篇末尾引导订阅"每周一篇深度内容"。\n\n第3阶段（第 8-10 篇起）：开通付费订阅（小报童/知识星球/Substack），定价 29-99 元/月或 199-599 元/年。付费内容比免费内容更深、更系统化——例如免费版是"用 AI 写周报"，付费版是"AI 自动化办公完整 SOP"。\n\n第4阶段（持续）：每周至少 1 篇付费内容 + 1 篇免费内容。在知乎相关问题下用免费内容引流，文末附订阅链接。目标：6 个月内 200 付费订户。',
    profile: {
      timeAvailable: 3,
      startupCapital: 1,
      independence: 5,
      riskTolerance: 2,
      techSkill: 2,
      socialEnergy: 1,
      incomeTimeline: 4,
      facePublic: 1,
      learningWillingness: 3,
    },
    motivationMatch: ['freedom', 'create', 'security'],
  },
  {
    id: 'content-writer',
    name: '自媒体内容创作（文字向）',
    nameEn: 'Content Creator (Text-based)',
    income: '2K-30K/月（行业案例参考，非承诺）',
    timeToStart: '3-12个月',
    why: '公众号/知乎/小红书文字内容，靠广告 + 知识付费变现。适合喜欢写、不喜欢说的人。文字内容的复利效应强——一篇爆款能持续引流一年。',
    startPath: '第1阶段（1-2周）：选定一个内容定位——用"三圈交集法"：你擅长的 × 有市场需求的 × 你能持续写的。定位公式："帮[某类人]解决[某问题]"。例如"帮职场新人用AI提效""帮宝妈做副业"。\n\n第2阶段（1-4周）：选定 1 个主力平台（新手推荐小红书或公众号）。研究 5 个同定位的对标账号，拆解他们最近 30 篇爆款内容的标题结构、开头钩子、信息密度。建立自己的选题库（至少 30 个选题）。\n\n第3阶段（连续30天）：每天发 1 篇，不中断。用 AI 辅助写初稿（节省 60% 时间），但必须人工修改开头、结尾和个人观点部分。记录每篇的阅读量、互动率和涨粉数。\n\n第4阶段（第31天起）：分析数据，找出阅读量最高的 3 个选题方向，此后 80% 的内容围绕这 3 个方向。粉丝过 1000 后开通平台广告分成或接品牌合作。同步把爆款内容改写成长文发知乎做搜索流量。',
    profile: {
      timeAvailable: 3,
      startupCapital: 1,
      independence: 5,
      riskTolerance: 3,
      techSkill: 2,
      socialEnergy: 1,
      incomeTimeline: 4,
      facePublic: 1,
      learningWillingness: 2,
    },
    motivationMatch: ['freedom', 'create', 'money'],
  },
  {
    id: 'content-video',
    name: '自媒体内容创作（视频向）',
    nameEn: 'Content Creator (Video-based)',
    income: '3K-100K/月（行业案例参考，非承诺）',
    timeToStart: '6-18个月',
    why: '抖音/B站/小红书视频，天花板最高但启动最慢。适合愿意出镜、有表达欲的人。视频信任感强，转化率是文字的 5-10 倍。',
    startPath: '第1阶段（1-2周）：确定视频风格——口播、Vlog、或者AI配音+素材混剪。其中"AI配音+素材画面"门槛最低、出片最快。选定一个细分赛道（如"AI工具实测""冷门搞钱项目拆解"），赛道宽度控制在3个关键词能描述。\n\n第2阶段（2-4周）：用抖音搜索你的赛道关键词，刷最近 30 天点赞过万的视频。把每个爆款视频的核心结构拆出来：前 3 秒说了什么→中间怎么论证→结尾怎么引导互动。建立自己的爆款模板库。\n\n第3阶段（3-6个月）：每周保证发布 3 条，坚持 3 个月以上。前 30 条的目标是找到感觉——什么风格播放高、什么话题互动多。用 AI 工具辅助写脚本（ChatGPT/Claude）+ 自动剪辑（剪映/CapCut），单条制作时间控制在 2 小时内。\n\n第4阶段（粉丝过 1 万后）：开通平台创作者激励计划。接品牌合作（口播广告、产品植入），一条广告费约粉丝数的 1%-3%。同步把视频内容同步到 YouTube Shorts 获取国际流量。',
    profile: {
      timeAvailable: 4,
      startupCapital: 2,
      independence: 3,
      riskTolerance: 3,
      techSkill: 3,
      socialEnergy: 4,
      incomeTimeline: 5,
      facePublic: 5,
      learningWillingness: 4,
    },
    motivationMatch: ['money', 'create', 'freedom'],
  },
  {
    id: 'virtual-products',
    name: '虚拟资料 / 模板售卖',
    nameEn: 'Digital Products / Templates',
    income: '3K-20K/月（行业案例参考，非承诺）',
    timeToStart: '1-3个月',
    why: '把专业知识打包成可下载的资料——Excel 模板、SOP 文档、合同范本、学习笔记。做一次，无限卖。不需要服务客户，不需要露脸。启动最快。',
    startPath: '第1阶段（1周）：盘点你已有的一切——工作中的 SOP 文档、笔记模板、Excel 报表模板、合同范本、学习笔记。任何你做过两次以上的事情都可以标准化成模板。挑选 3-5 个"如果有人帮我做了就不用加班"的内容。\n\n第2阶段（1-2周）：把每个产品包装成一个完整解决方案。不是卖一个Excel模板，是卖"小企业主月度财务报表自动生成系统"——含模板+使用视频+30分钟咨询。提升感知价值 10 倍。\n\n第3阶段（1-2周）：定价策略：基础版 9.9-29 元（单产品）、进阶版 49-99 元（产品包+教程）、高级版 199-499 元（全量产品+1v1答疑）。在小红书/即刻/知乎发产品效果展示（结果对比图、使用前后对比），引导私信购买。\n\n第4阶段（持续）：每售出 50 份就升级一次——收集买家反馈，优化模板，增加新品类。建立一个买家微信群，新品首发在群里限时折扣，群友推荐新客户各得 20% 佣金。',
    profile: {
      timeAvailable: 2,
      startupCapital: 1,
      independence: 5,
      riskTolerance: 1,
      techSkill: 2,
      socialEnergy: 1,
      incomeTimeline: 1,
      facePublic: 1,
      learningWillingness: 1,
    },
    motivationMatch: ['money', 'security', 'freedom'],
  },
  {
    id: 'knowledge-course',
    name: '知识付费课程',
    nameEn: 'Online Course Creator',
    income: '5K-100K/月（行业案例参考，非承诺）',
    timeToStart: '3-9个月',
    why: '把你对一个领域的系统知识录成课程。前期投入大（录课需要时间），但后期几乎零成本。一门好课可以卖 2-3 年。',
    startPath: '第1阶段（1-2周）：选课题目——用"关键词搜索验证法"：去小红书、知乎、B站搜关键词，看相关问题有多少浏览量。浏览量过百万的问题代表真实需求。例如"AI怎么用""Excel怎么学"。\n\n第2阶段（2-4周）：免费试讲 3 次验证——在社群或直播平台（腾讯会议/小红书直播）免费讲，每次 40-60 分钟。收集听众的提问，这些问题就是你课程大纲的素材。反馈最好的内容方向就是课程方向。\n\n第3阶段（3-6周）：制作课程——用录屏软件（OBS，免费）+ 麦克风录制。每节课 10-20 分钟，一门课 10-20 节。不需要出镜，重点在内容密度。开头用"学完这节课你能解决XX问题"钩住学员。\n\n第4阶段（持续销售）：定价 99-599 元。上架知识星球/小鹅通/网易云课堂。核心获客方式不是投广告，是把自己的免费内容当作课程"试吃装"——在知乎回答相关问题时，文末附"系统学习请移步XX课程"。',
    profile: {
      timeAvailable: 3,
      startupCapital: 2,
      independence: 4,
      riskTolerance: 2,
      techSkill: 2,
      socialEnergy: 3,
      incomeTimeline: 3,
      facePublic: 2,
      learningWillingness: 3,
    },
    motivationMatch: ['money', 'create', 'freedom'],
  },
  {
    id: 'paid-community',
    name: '付费社群主理人',
    nameEn: 'Paid Community Builder',
    income: '5K-80K/月（行业案例参考，非承诺）',
    timeToStart: '6-12个月',
    why: '建一个付费圈子，围绕一个主题（如"AI 搞钱""一人公司"）持续输出价值。社群会员费 = 人数 × 年费。100人×998元/年 = 年入10万。',
    startPath: '第1阶段（1-2周）：选定社群主题——必须是"有人愿意天天聊"的话题。推荐公式："行业/技能 + 变现/成长"。例如"AI产品经理搞钱群""独立开发者出海群"。去知识星球看同类社群的人数规模和活跃度验证需求。\n\n第2阶段（1-3个月）：免费运营期——建立一个免费微信群或飞书群。每周提供 2-3 次价值输出（行业周报+资源分享+话题讨论）。重点是积累一批活跃的种子用户，让他们形成"这个群有用"的口碑。\n\n第3阶段（3个月后）：开启付费——社群迁移到知识星球或小报童付费圈，定价 365-998 元/年。付费群提供独家内容：每周深度报告、嘉宾分享、资源对接、成员互助。免费群继续保留作为引流入口。\n\n第4阶段（持续）：核心增长引擎是"老带新"——每个付费会员推荐 1 个新会员，双方各得 1-3 个月免费期。同时把社群精华内容定期整理成公开文章发布，从公域持续引流。',
    profile: {
      timeAvailable: 3,
      startupCapital: 1,
      independence: 3,
      riskTolerance: 2,
      techSkill: 2,
      socialEnergy: 4,
      incomeTimeline: 4,
      facePublic: 3,
      learningWillingness: 3,
    },
    motivationMatch: ['freedom', 'create', 'money'],
  },
  {
    id: 'cross-border-ecom',
    name: '跨境电商（AI 辅助）',
    nameEn: 'Cross-Border E-Commerce (AI-Powered)',
    income: '5K-50K/月（行业案例参考，非承诺）',
    timeToStart: '3-6个月',
    why: '用 AI 写产品描述、做多语言客服、优化 Listing。中国供应链 + AI 工具 = 一个人就能做跨境。你提到想用英语做跨境——这个赛道天然适合。',
    startPath: '第1阶段（1-3周）：选品——用"数据驱动选品法"。在 Temu/Amazon/Etsy 上搜索目标品类，用 Jungle Scout 或卖家精灵查看竞品月销量和评价。寻找"月销量>500 且评分<4.0"的产品——说明需求大但现有产品有缺陷，你的机会在此。\n\n第2阶段（2-4周）：用 AI 辅助建店——ChatGPT/Claude 写产品标题和 5 点描述（包含 SEO 关键词），AI 翻译成目标市场语言。产品图片用 AI 生成场景图（Midjourney/DALL-E），比找摄影师省钱且效果好。\n\n第3阶段（1-2个月）：先上 3-5 个产品测试，重点关注点击率和转化率而非销量。每周分析数据，差的淘汰、好的追加。初期不囤货，用一件代发或少量备货降低风险。\n\n第4阶段（持续）：找到 1-2 个稳定出单的"现金牛"产品后，注册商标、优化供应链、开通 FBA（亚马逊）或海外仓。同时用同一套方法开拓第二个品类。',
    profile: {
      timeAvailable: 3,
      startupCapital: 2,
      independence: 4,
      riskTolerance: 4,
      techSkill: 3,
      socialEnergy: 1,
      incomeTimeline: 3,
      facePublic: 1,
      learningWillingness: 4,
    },
    motivationMatch: ['money', 'freedom'],
  },
  {
    id: 'xiaohongshu-kol',
    name: '小红书带货 / 种草博主',
    nameEn: 'Xiaohongshu KOL / Affiliate',
    income: '2K-30K/月（行业案例参考，非承诺）',
    timeToStart: '3-6个月',
    why: '小红书是目前最适合新手的带货平台——不需要大量粉丝就能通过笔记带货。图文门槛低，用 AI 做图效率高。',
    startPath: '第1阶段（1-2周）：选定一个垂直品类——家居好物、办公效率工具、平价穿搭、母婴用品，四选一。在小红书搜索该品类，看最近 30 天点赞过 500 的笔记标题和封面风格，建立自己的"爆款模板"。\n\n第2阶段（1-2个月）：每天发 1-2 篇笔记，封面是决定点击率的唯二因素（另一个是标题）。封面原则：高清+对比+文字标签。内容原则：真实体验感（"用了 30 天后的真实感受"比"这个产品太好用了"点击率高 5 倍）。\n\n第3阶段（持续）：粉丝过 1000 后开通小红书好物推荐功能，在相关笔记下挂商品链接赚取佣金。同时申请成为品牌合作人，接付费推广笔记（一篇 500-3000 元不等，视粉丝量和互动率）。\n\n第4阶段（进阶）：积累到 5000 粉后，开自己的小红书店铺卖自有品牌或贴牌产品。你的粉丝就是你最好的种子用户。',
    profile: {
      timeAvailable: 3,
      startupCapital: 1,
      independence: 4,
      riskTolerance: 2,
      techSkill: 2,
      socialEnergy: 3,
      incomeTimeline: 3,
      facePublic: 3,
      learningWillingness: 2,
    },
    motivationMatch: ['money', 'freedom', 'security'],
  },
  {
    id: 'indie-dev',
    name: '独立开发（App / 插件）',
    nameEn: 'Indie Developer (App / Plugin)',
    income: '3K-100K/月（行业案例参考，非承诺）',
    timeToStart: '2-6个月',
    why: '开发一个解决特定问题的小 App 或浏览器插件，上架应用商店/Chrome Web Store。全球市场，24 小时自动销售。天花板极高。',
    startPath: '第1阶段（1-2周）：找需求。浏览 Product Hunt、Hacker News、Reddit 的 r/SideProject 和 r/Entrepreneur 板块，找"我付费买了某软件但有这 3 个不爽"的评论。或者去看 Chrome Web Store 中评分 2-3 星的插件——需求已验证但体验差，你重做一个更好的。\n\n第2阶段（2-4周）：用 AI 编程工具（Cursor/Claude Code）快速开发 MVP——一个Chrome插件或简单的Web App。只做一个核心功能，不要登录系统、不要复杂的设置页。开发完成后用 TestFlight 或直接给朋友测试。\n\n第3阶段（1-2周）：上架——Chrome Web Store（一次性 $5 开发者费）、iOS App Store（$99/年）或做成 Web App（$0 上架成本）。定价策略：免费版+Pro版，或 $1-5/月订阅。在 Product Hunt 发布日（周二到周四效果最好），提前准备 10 个朋友帮忙首日点赞评论。\n\n第4阶段（持续）：根据 App Store 评论和用户反馈，每 1-2 周迭代一次。当 MRR（月经常性收入）超过 $1000 后，开始投 Apple Search Ads 或 Google Ads 付费获客。',
    profile: {
      timeAvailable: 4,
      startupCapital: 1,
      independence: 5,
      riskTolerance: 4,
      techSkill: 5,
      socialEnergy: 1,
      incomeTimeline: 3,
      facePublic: 1,
      learningWillingness: 5,
    },
    motivationMatch: ['money', 'create', 'freedom'],
  },
  {
    id: 'freelancer',
    name: '远程自由职业',
    nameEn: 'Remote Freelancer',
    income: '5K-30K/月（行业案例参考，非承诺）',
    timeToStart: '1-3个月',
    why: '在 Upwork/国内平台接单，用你的技能换钱。启动最快，但收入有天花板（你的时间有限）。适合作为现金流过渡，同时做复利产品。',
    startPath: '第1阶段（1周）：选定 1-2 个技能方向——目前自由职业平台需求最大的技能：AI开发/自动化脚本、数据分析/Excel、文案写作/翻译、UI/UX设计、短视频剪辑。选你最擅长且市场单价最高的那个。\n\n第2阶段（1-3周）：注册 2-3 个平台——海外：Upwork、Fiverr、Toptal。国内：猪八戒、程序员客栈、电鸭社区。完善个人主页：头像用真人照片（信任感提升 3 倍）、技能标签精准、作品集展示 3 个最佳项目。\n\n第3阶段（1个月）：快速起步——前 5 单定价低于市场均价 20%-30%，目标是拿 5 星好评而非赚钱。每个客户交付后请他们写一句话推荐。5 个好评到手后，逐步提价到市场均价。\n\n第4阶段（持续）：目标是将 40% 的收入来源从平台转为自有客户（利润更高、不受平台规则限制）。同时把接单过程中反复被要求的需求，开发成标准化产品——用产品养自由职业。',
    profile: {
      timeAvailable: 2,
      startupCapital: 1,
      independence: 5,
      riskTolerance: 1,
      techSkill: 3,
      socialEnergy: 2,
      incomeTimeline: 1,
      facePublic: 1,
      learningWillingness: 2,
    },
    motivationMatch: ['money', 'security'],
  },
  {
    id: 'second-hand',
    name: '二手交易 / 闲置变现',
    nameEn: 'Second-Hand / Flipping',
    income: '2K-15K/月（行业案例参考，非承诺）',
    timeToStart: '1-2个月',
    why: '低买高卖，信息差套利。闲鱼、转转、Facebook Marketplace。不需要技能，不需要露脸，启动最快。天花板低但门槛最低。',
    startPath: '第1阶段（1周）：选定一个品类深耕——二手电子产品（iPhone/相机/游戏机）利润最高但需要鉴别能力，闲置母婴用品周转最快，中古家具/装饰品溢价空间最大。选定一个你能快速判断品相和价格的品类。\n\n第2阶段（1-2周）：建立价格数据库——每天刷闲鱼/转转上该品类的"已售出"列表，记录成交价。同时在拼多多/1688 上搜索新品价格。差价>30% 的品类就是可做的。记住几个关键数字：平均进价、平均售价、月销量 Top 10 的卖家定价。\n\n第3阶段（1-2个月）：开始实操——从低价品类（50-200元进价）开始练手，小批量试错。闲鱼标题包含 3 个核心搜索关键词（品类+品牌+型号），描述写真实的使用感受而非复制粘贴。照片用自然光实拍，比官方图更让人信任。\n\n第4阶段（持续）：月利润稳定在 3000 元以上后，开始系统化——用闲鱼自动回复工具管理客服、固定货源、标准化拍照流程。之后可以扩展到转转、Facebook Marketplace（做跨境闲置差价）。',
    profile: {
      timeAvailable: 2,
      startupCapital: 2,
      independence: 5,
      riskTolerance: 2,
      techSkill: 1,
      socialEnergy: 2,
      incomeTimeline: 1,
      facePublic: 1,
      learningWillingness: 1,
    },
    motivationMatch: ['money', 'security'],
  },
  {
    id: 'dropshipping',
    name: '无货源电商',
    nameEn: 'Dropshipping',
    income: '2K-20K/月（行业案例参考，非承诺）',
    timeToStart: '1-3个月',
    why: '不囤货、不发货的电商模式。在抖音小店/淘宝开店，有人下单再从 1688 代发。利润薄但模式轻。用 AI 写商品描述、做客服可以大规模操作。',
    startPath: '第1阶段（1-2周）：选品是最关键的一步——去抖音/快手刷"好物推荐"类视频，记录点赞过万的商品。或者用蝉妈妈/抖查查看最近7天销量飙升的商品。关键词：新奇特、性价比高、有视觉冲击力（适合短视频展示）。\n\n第2阶段（1-2周）：在 1688/义乌购上找 3-5 家供应商，对比价格、发货速度、售后政策。优先选择支持一件代发的供应商，降低库存风险。用 AI 批量写商品标题（含高频搜索词）、详情页文案和客服话术模板。\n\n第3阶段（1-2个月）：在抖音小店或淘宝开店，首批上 10-20 个产品。每天投 50-100 元做"随心推"或"直通车"，测试哪个产品点击率和转化率最高。3 天内没出单的产品下架，出单的追加预算。\n\n第4阶段（持续）：找到 1-2 个爆品后，利润的大头来自复购和交叉销售——给已购买客户推送相关产品优惠券。月销售额稳定在 5000 元以上后，考虑自己贴牌/包装，打造自有品牌。',
    profile: {
      timeAvailable: 3,
      startupCapital: 2,
      independence: 4,
      riskTolerance: 2,
      techSkill: 2,
      socialEnergy: 2,
      incomeTimeline: 2,
      facePublic: 1,
      learningWillingness: 2,
    },
    motivationMatch: ['money', 'security'],
  },
  {
    id: 'skill-coach',
    name: '技能培训 / 教练',
    nameEn: 'Skill Coach / Trainer',
    income: '5K-30K/月（行业案例参考，非承诺）',
    timeToStart: '3-6个月',
    why: '把你已经掌握的技能教给想学的人。可以是 AI 工具使用、Excel 技巧、编程入门……你比新手多的每一年经验，都是可以定价的知识资产。1v1 教练是最快变现的方式，但长期要产品化。',
    startPath: '第1阶段（1周）：选定你要教的技能——遵循"你有 3 年以上经验 + 市场有人愿意付费学"的原则。验证方法：在小红书/知乎搜"XX怎么学""XX培训"，看问答量和竞品价格。定价在 200-500 元/小时的技能最容易被接受。\n\n第2阶段（2-4周）：免费带 3-5 个人——可以是朋友、前同事、社群里的陌生人。每次教练课后记录：学员最困惑的 3 个问题是什么、什么东西帮他们最快理解了。这些就是你未来课程的"知识地图"。\n\n第3阶段（1个月后）：正式收费——定价 200-500 元/小时或 1500-3000 元/月（含 4 次课+随时答疑）。获客渠道：在知乎/小红书发布"XX学习路线"类长文（提供免费价值），文末引导私信咨询付费教练服务。\n\n第4阶段（持续）：当你服务完 20 个以上的学员后，把最高频的问题和解决方案整理成 SOP。把 1v1 教练转型为"录播课+社群答疑"的混合模式——课程卖 99-299 元（被动收入），社群答疑收年费（复利收入），不再用时间换钱。',
    profile: {
      timeAvailable: 2,
      startupCapital: 1,
      independence: 4,
      riskTolerance: 1,
      techSkill: 2,
      socialEnergy: 3,
      incomeTimeline: 2,
      facePublic: 2,
      learningWillingness: 1,
    },
    motivationMatch: ['money', 'security', 'create'],
  },
  {
    id: 'street-food',
    name: '摆摊 / 夜市小吃',
    nameEn: 'Street Food Vendor',
    income: '3K-20K/月（行业案例参考，非承诺）',
    timeToStart: '1-4周',
    why: '门槛最低的实体生意。不需要学历、不需要技能、启动资金几百块就能开始。夜市、学校门口、地铁口——人流在哪里，钱就在哪里。适合想快速见钱、不介意体力劳动的人。',
    startPath: '第1阶段（3-5天）：选品+踩点。去当地最热闹的夜市/集市蹲点 3 天，记录什么品类排队最长、什么价格卖得最好。热门品类：淀粉肠/烤面筋（成本1-2元，卖5-8元）、手打柠檬茶（成本2-3元，卖10-15元）、铁板鱿鱼（成本3-5元，卖15-20元）。\n\n第2阶段（3-5天）：采购+试做。在拼多多/1688采购设备（小推车、炉具、餐具）和首批原料，总投入控制在 500-1000 元内。在家试做 3 次以上，找朋友试吃给反馈。\n\n第3阶段（1-2周）：出摊——第一周跟着人流走，不固定位置。记录每个位置的销量、高峰时段、客户画像。找到最赚钱的位置和时段后，申请固定摊位（城管许可，通常月租 200-500 元）。\n\n第4阶段（持续）：单品稳定日销 50+ 份后，增加 1-2 个互补品类。建微信顾客群，在群里预告出摊时间、接受预定。把"摆摊日记"发小红书/抖音——摆摊人设自带流量，带货+收徒又是一笔收入。',
    profile: { timeAvailable: 2, startupCapital: 1, independence: 4, riskTolerance: 2, techSkill: 1, socialEnergy: 4, incomeTimeline: 1, facePublic: 3, learningWillingness: 1 },
    motivationMatch: ['money', 'security'],
  },
  {
    id: 'housekeeping',
    name: '上门家政 / 清洁服务',
    nameEn: 'Home Cleaning Service',
    income: '4K-18K/月（行业案例参考，非承诺）',
    timeToStart: '1-3周',
    why: '永远有需求的服务行业。双职工家庭越来越多、老龄化社会需要陪护——市场在持续扩大。不需要学历，不需要经验，只要认真、细心、有耐心。单人做月入 5000-8000，带一个小团队能到 15000+。',
    startPath: '第1阶段（1周）：从身边做起。向朋友、亲戚、邻居提供免费或低价（50-80元/次）清洁服务，换 3-5 个好评和推荐。同时拍下清洁前后对比照作为"作品集"。\n\n第2阶段（1周）：在 58同城、天鹅到家、小红书、小区业主群发布服务信息。定价：日常保洁 30-50元/小时，深度保洁 60-80元/小时，开荒保洁 15-20元/平米。明确服务范围（含/不含有哪些项目）。\n\n第3阶段（2-4周）：建立标准化流程——进门穿鞋套+工作前拍照+分区清洁+完工拍照+请客户验收签字。标准化带来 3 个好处：效率提升、投诉减少、好评率提高。\n\n第4阶段（持续）：好评积累到 30+ 以后，适当提价。老客户转介绍给 20% 佣金（或下次服务 8 折）。一个月接 30 单以上时，考虑带 1-2 个帮手。',
    profile: { timeAvailable: 2, startupCapital: 1, independence: 5, riskTolerance: 1, techSkill: 1, socialEnergy: 3, incomeTimeline: 1, facePublic: 1, learningWillingness: 1 },
    motivationMatch: ['money', 'security'],
  },
  {
    id: 'pet-service',
    name: '宠物服务（遛狗 / 寄养 / 上门喂养）',
    nameEn: 'Pet Care Service',
    income: '2K-12K/月（行业案例参考，非承诺）',
    timeToStart: '1-2周',
    why: '中国宠物经济年增速超 20%，养宠人群超 1 亿。年轻人出差/旅游时猫狗没人管、上班族加班时没空遛狗——这就是你的机会。不需要学历，不需要技能，只需要喜欢动物、有耐心。',
    startPath: '第1阶段（1周）：先服务身边养宠的朋友，免费或低价（20-30元/次）遛狗/上门喂猫，积累 5-10 个案例和好评照片。同时学习宠物急救基础知识（网上免费课程）。\n\n第2阶段（1周）：在小红书（宠物类笔记流量大）、闲鱼（搜索"上门喂猫"看同行定价）、小区业主群、宠物医院/宠物店门口贴广告发布服务。定价：遛狗 30-50元/次（30-45分钟）、上门喂猫 40-60元/次、家庭式寄养 50-80元/天。\n\n第3阶段（持续）：每次服务拍视频/照片发给主人（这是最打动人心的增值服务——"你的毛孩子今天很开心"）。建立客户微信群，老客户介绍新客户双方各送一次免费服务。\n\n第4阶段（扩展）：节假日（春节/国庆）是爆发期——寄养费可提价 50%-100%。客户积累到 50+ 以后，可以发展兼职帮你分担，你抽成 30%。',
    profile: { timeAvailable: 2, startupCapital: 1, independence: 4, riskTolerance: 1, techSkill: 1, socialEnergy: 3, incomeTimeline: 1, facePublic: 2, learningWillingness: 1 },
    motivationMatch: ['money', 'security', 'freedom'],
  },
  {
    id: 'ride-delivery',
    name: '网约车 / 同城配送 / 代驾',
    nameEn: 'Ride-Hailing / Delivery Driver',
    income: '5K-15K/月（行业案例参考，非承诺）',
    timeToStart: '1-4周（取决于驾照/车辆）',
    why: '最大的灵活就业入口。有驾照就能跑网约车/代驾，有电动车就能跑外卖/配送。不需要面试、不需要学历、想干就上线、想停就下线。收入即时到账，适合应急和过渡期。',
    startPath: '第1阶段（1-2周）：选平台。滴滴/高德（网约车，需3年以上驾龄+无犯罪记录）、美团/饿了么（外卖配送）、货拉拉/快狗（同城货运）、e代驾/滴滴代驾（酒后代驾，晚上7点-凌晨）。每个平台跑 3-5 天，对比单位时间收入。\n\n第2阶段（1-2周）：研究"赚钱时段"——网约车早高峰（7-9点）和晚高峰（17-19点）有溢价、代驾周五周六晚 9-12 点单量最多、外卖午晚高峰双开（同时接美团+饿了么）。在赚钱时段出勤，平峰时段休息。\n\n第3阶段（持续）：成本控制——电动车比燃油车每公里省 0.3-0.5 元。每天记录"在线时长 vs 实际收入"，算出真实时薪。时薪低于 25 元——要么换平台、换时段、换区域。\n\n第4阶段（转型）：这是最灵活的"过渡收入"——跑车的同时学习其他技能、孵化其他项目。养家糊口没问题，但不建议做超过 2 年。身体损耗+平台抽成越来越高，长远看要向其他轻资产赛道转型。',
    profile: { timeAvailable: 3, startupCapital: 2, independence: 5, riskTolerance: 1, techSkill: 1, socialEnergy: 2, incomeTimeline: 1, facePublic: 3, learningWillingness: 1 },
    motivationMatch: ['money', 'security'],
  },
  {
    id: 'community-leader',
    name: '社区团购团长 / 私域分销',
    nameEn: 'Community Group-Buy Organizer',
    income: '2K-15K/月（行业案例参考，非承诺）',
    timeToStart: '2-4周',
    why: '社区团购的枢纽角色——不需要开店、囤货、发货。平台供货，你负责在业主群里推品+收货分货，赚佣金（8%-15%）。适合对社区熟、人缘好、会聊天的人。',
    startPath: '第1阶段（1周）：加入平台——美团优选、多多买菜、淘菜菜，直接在小程序申请"成为团长"。需要一个收货点（车库、一楼客厅、或小区门口便利店合作）。\n\n第2阶段（1-2周）：引流——加入小区所有业主群、物业群、家长群。不要直接发广告（会被踢）。先提供价值：分享生活小妙招、团购省钱对比、帮邻居解决小问题。建立"这个人是邻居不是卖货的"认知。\n\n第3阶段（1个月后）：推品——每天精选 2-3 个自己先买过的商品做"开箱测评"发到群里。文案公式：原价XX → 团购价XX → 省了XX元 → 限时今天。诚实比什么文案都管用——"这个不好别买" → 信任建立了。\n\n第4阶段（持续）：月佣金稳定在 3000 元+ 后，加私域分销——卖自己选品的高利润产品（地方特产、季节性水果、手工食品），利润率 30%-50%，远超平台佣金。',
    profile: { timeAvailable: 2, startupCapital: 1, independence: 3, riskTolerance: 1, techSkill: 1, socialEnergy: 5, incomeTimeline: 2, facePublic: 3, learningWillingness: 1 },
    motivationMatch: ['money', 'security'],
  },
  {
    id: 'content-clip',
    name: '短视频切片 / 二次创作',
    nameEn: 'Video Clipping / Content Repurposing',
    income: '3K-30K/月（行业案例参考，非承诺）',
    timeToStart: '2-4周',
    why: '不需要自己拍视频、不需要出镜、不需要原创内容。把热门直播录屏剪成精彩片段、把长视频拆成短视频、把国外内容翻译搬运——二次创作门槛比原创低 10 倍，流量可一样大。',
    startPath: '第1阶段（1周）：选方向——直播切片（大主播的高光片段，挂小黄车赚佣金）、影视解说（老电影+AI配音+精彩剪辑）、知识翻译（翻译搬运 YouTube/TikTok 热门内容，注明出处）。下载剪映（免费），花 3 天学基本操作。\n\n第2阶段（1-2周）：每天做 2-3 条 15-60 秒视频，发抖音/小红书/视频号。前 30 条目标是跑通流程——从下载素材到发布不超过 30 分钟。用 AI 工具写标题（提取视频最炸裂的一句话）和字幕（剪映自动生成）。\n\n第3阶段（1个月后）：分析数据——哪类内容完播率高（>30%优秀）、互动率高。80% 精力放在表现最好的内容类型上。开通中视频计划/创作者激励，按播放量分成。\n\n第4阶段（持续）：一个账号稳定月入 3000 元+ 后，复制第二个、第三个账号——内容可复用。注意：二次创作需加入自己的解说/剪辑/观点，纯粹搬运会被平台降权甚至封号。',
    profile: { timeAvailable: 3, startupCapital: 1, independence: 5, riskTolerance: 2, techSkill: 2, socialEnergy: 1, incomeTimeline: 2, facePublic: 1, learningWillingness: 2 },
    motivationMatch: ['money', 'freedom', 'create'],
  },
  {
    id: 'handcraft',
    name: '手工制作 / 手工艺品售卖',
    nameEn: 'Handcraft / Artisan Products',
    income: '2K-20K/月（行业案例参考，非承诺）',
    timeToStart: '2-8周',
    why: '总有 20% 的人愿意为"手工""独一无二""有温度"买单。编织、黏土、香薰、银饰——选一个品类。不需要学历，不需要大资金，需要审美和耐心。',
    startPath: '第1阶段（1-2周）：选品类——在小红书搜"手工DIY"看什么品类互动量高。热门：石塑黏土饰品（材料 50-200 元）、手工编织包/围巾、手作香薰蜡烛、定制手机壳/钥匙扣。选一个做完会开心、愿意反复做的品类。\n\n第2阶段（2-4周）：做出 10-20 个成品，每个拍 3-5 张高质量照片（自然光+干净背景+场景图）。照片是手工品的"半条命"——同样东西，好照片能卖贵 3 倍。\n\n第3阶段（持续销售）：渠道组合——闲鱼（零成本上架，标题含"手工定制"）、小红书（发制作过程视频+成品展示）、朋友圈（朋友转发是最好广告）、周末创意市集（摊位费 50-200 元/天）。定价：材料成本 × 3-5 + 时薪。\n\n第4阶段（扩展）：订单稳定后，制作过程拍成教程售卖（B站/小红书）、接受定制订单（溢价 50%-100%）、发展代理（你设计+他们制作，你抽成）。',
    profile: { timeAvailable: 3, startupCapital: 1, independence: 5, riskTolerance: 2, techSkill: 1, socialEnergy: 2, incomeTimeline: 2, facePublic: 2, learningWillingness: 2 },
    motivationMatch: ['freedom', 'create', 'money'],
  },
  {
    id: 'escort-service',
    name: '陪诊陪护 / 跑腿代办',
    nameEn: 'Medical Escort / Errand Service',
    income: '3K-12K/月（行业案例参考，非承诺）',
    timeToStart: '1-3周',
    why: '中国 60 岁以上人口超 3 亿，子女在外地无法陪同父母看病——巨大刚需。陪诊员帮老人挂号、排队、取药、记录医嘱。不需要医疗知识，需要细心、耐心和责任心。一二线城市单次 200-500 元。',
    startPath: '第1阶段（1周）：先免费帮身边老人/朋友父母跑 3-5 次医院，摸清就医流程——怎么挂号最快、各科室位置、取药流程、医保报销手续。建立一本"医院攻略笔记"。\n\n第2阶段（1周）：在 58同城、闲鱼、小红书、本地生活公众号发布服务。定位："老人的临时子女——陪同看病、代为取药、代办住院手续"。定价：半天 200-300 元、全天 350-500 元。\n\n第3阶段（持续）：每次服务做三件事——1）把医嘱整理成文字发给子女；2）服务全程录音（征得同意）让子女安心；3）结束后给子女发一句"今天叔叔/阿姨状态很好，不用担心"。转介绍率能到 50% 以上。\n\n第4阶段（扩展）：跟本地养老机构、保险公司、健康管理公司合作，成为签约陪诊服务商。量上来招兼职陪诊员，你负责派单+品控+抽成。',
    profile: { timeAvailable: 2, startupCapital: 1, independence: 5, riskTolerance: 1, techSkill: 1, socialEnergy: 4, incomeTimeline: 1, facePublic: 1, learningWillingness: 1 },
    motivationMatch: ['money', 'security', 'freedom'],
  },
  {
    id: 'remote-basic',
    name: '线上基础工作（客服 / 审核 / 数据标注）',
    nameEn: 'Online Basic Work (CS / Review / Data Labeling)',
    income: '2K-8K/月（行业案例参考，非承诺）',
    timeToStart: '1-2周',
    why: '互联网最基础但刚需的岗位。不需要学历、经验、面对真人、在家就能做。适合刚起步、没有明确技能方向、想先有一个稳定收入来源的人。不是长久之计，但是最好的跳板。',
    startPath: '第1阶段（3-5天）：选平台——数据标注：百度众测、京东众智、龙猫数据（图片标注/语音转文字，计件付费）。在线客服：阿里巴巴云客服、蚂蚁云客服、美团云客服（15-25元/小时）。内容审核：字节跳动/快手内容审核（远程兼职，需培训考岗）。\n\n第2阶段（1周）：选定 1-2 个平台注册并通过考核。云客服类考"服务规范"（平台提供培训），数据标注类考"标注规范"。花 2-3 天认真刷题，一次考过。\n\n第3阶段（1-2个月）：前 2 个月搞清——每小时赚多少钱、哪个平台单价最高、什么时段单量最大。每天记录"在线时长 vs 实际收入"，算出真实时薪。\n\n第4阶段（转型）：时薪天花板约 25-30 元——不建议做超过 6 个月。利用省下的通勤时间（2-3 小时/天）学一个高收入技能（AI工具、短视频剪辑、电商运营），6 个月后转型。',
    profile: { timeAvailable: 4, startupCapital: 1, independence: 5, riskTolerance: 1, techSkill: 1, socialEnergy: 1, incomeTimeline: 1, facePublic: 1, learningWillingness: 1 },
    motivationMatch: ['money', 'security'],
  },
  {
    id: 'recycling',
    name: '二手回收 / 废品分类变现',
    nameEn: 'Recycling / Waste Sorting Business',
    income: '3K-15K/月（行业案例参考，非承诺）',
    timeToStart: '1-4周',
    why: '被严重低估的赛道。旧手机、旧家电、废纸箱、废金属——这些被当垃圾扔掉的东西就是利润。不需要学历、技能、启动资金。从小区回收站到细分品类专营，天花板比想象的高。',
    startPath: '第1阶段（1周）：选定一个细分品类——旧手机/电子产品（利润最高但要会看型号成色）、废纸/废塑料（量大稳定，跟回收站谈价）、旧书/旧衣物（闲鱼/多抓鱼/闲转上转卖）、旧家电（拆解分类卖废金属）。从自己家做实验——把不要的东西挂闲鱼看能卖多少钱。\n\n第2阶段（1-2周）：锁收货渠道——小区业主群、公司内部群（搬家/换新时常白送）、58同城/闲鱼（搜"搬家处理""免费送"）、跟小区保洁/物业搞关系（他们知道谁在搬家）。\n\n第3阶段（持续）：分类+定价——电子产品在闲鱼/转转搜同型号"已售出"价格，按 70%-80% 定价。废品定期拉回收站分类卖——纸 0.8-1.2元/kg、铁 1.5-2.5元/kg、铜 40-60元/kg。\n\n第4阶段（扩展）：月利润 3000 元+ 后，租小仓库做分拣中心系统化运营。环保+赚钱+不丢人，这个赛道未来 5 年只会更大。',
    profile: { timeAvailable: 2, startupCapital: 1, independence: 5, riskTolerance: 1, techSkill: 1, socialEnergy: 2, incomeTimeline: 1, facePublic: 1, learningWillingness: 1 },
    motivationMatch: ['money', 'security'],
  },
];

// === 行业 → 赛道亲和力映射 ===
const INDUSTRY_AFFINITY = {
  'tech':        ['micro-saas', 'ai-consultant', 'indie-dev', 'newsletter', 'content-writer', 'xiaohongshu-kol', 'freelancer', 'knowledge-course', 'virtual-products', 'paid-community'],
  'traditional': ['cross-border-ecom', 'dropshipping', 'second-hand', 'street-food', 'handcraft', 'recycling', 'housekeeping', 'ride-delivery', 'pet-service'],
  'finance':     ['ai-consultant', 'knowledge-course', 'paid-community', 'freelancer', 'skill-coach', 'cross-border-ecom'],
  'education':   ['newsletter', 'knowledge-course', 'skill-coach', 'paid-community', 'content-writer', 'content-video', 'content-clip'],
  'none':        [], // 无特定行业经验，对所有赛道中立
};

// === 匹配算法 ===
function calculateMatch(userProfile, track) {
  let totalScore = 0;
  let maxScore = 0;

  const dims = [
    'timeAvailable', 'startupCapital', 'independence', 'riskTolerance',
    'techSkill', 'socialEnergy', 'incomeTimeline', 'facePublic', 'learningWillingness'
  ];

  dims.forEach(dim => {
    if (userProfile[dim] !== undefined && track.profile[dim] !== undefined) {
      const diff = Math.abs(userProfile[dim] - track.profile[dim]);
      // 距离越小分越高，满分 10
      const score = Math.max(0, 10 - diff * 2.5);
      totalScore += score;
      maxScore += 10;
    }
  });

  // 动机匹配加分（最多 +10）
  const motivationBonus = track.motivationMatch.includes(userProfile.motivation) ? 10 : 0;
  maxScore += 10;

  // 行业经验加分（最多 +5）
  let industryBonus = 0;
  if (userProfile.industryExp && userProfile.industryExp !== 'none') {
    const affinityList = INDUSTRY_AFFINITY[userProfile.industryExp] || [];
    industryBonus = affinityList.includes(track.id) ? 5 : 0;
  }
  maxScore += 5;

  // 学习方式加分（最多 +5）
  let learnStyleBonus = 0;
  const ls = userProfile.learnStyle;
  const lw = track.profile.learningWillingness;
  if (ls === 'doing' && lw <= 2) {
    learnStyleBonus = 5; // 边干边学 → 低门槛赛道
  } else if (ls === 'structured' && lw >= 4) {
    learnStyleBonus = 5; // 系统学习 → 高技术壁垒赛道
  } else if (ls === 'avoid' && lw <= 1) {
    learnStyleBonus = 5; // 不想学新东西 → 极低技能赛道
  } else if (ls === 'doing' && lw <= 4) {
    learnStyleBonus = 2; // 部分匹配
  } else if (ls === 'structured' && lw >= 2) {
    learnStyleBonus = 2; // 部分匹配
  }
  maxScore += 5;

  const matchPercent = Math.round((totalScore + motivationBonus + industryBonus + learnStyleBonus) / maxScore * 100);

  return {
    track,
    score: matchPercent,
    details: generateMatchDetails(userProfile, track, matchPercent),
  };
}

function generateMatchDetails(userProfile, track, score) {
  const reasons = [];

  // 时间匹配
  if (Math.abs((userProfile.timeAvailable || 3) - track.profile.timeAvailable) <= 1) {
    reasons.push('你的时间投入与这个赛道匹配度高');
  }

  // 社交匹配
  if (userProfile.socialEnergy <= 2 && track.profile.socialEnergy <= 2) {
    reasons.push('不需要高频社交，适合你的能量模式');
  } else if (userProfile.socialEnergy >= 4 && track.profile.socialEnergy >= 4) {
    reasons.push('你喜欢跟人打交道，这个赛道需要社交能量');
  }

  // 技术匹配
  if (userProfile.techSkill >= 4 && track.profile.techSkill >= 4) {
    reasons.push('最大化你的技术优势，别人抄不了');
  }

  // 风险匹配
  if (Math.abs((userProfile.riskTolerance || 3) - track.profile.riskTolerance) <= 1) {
    reasons.push('风险水平与你的承受能力匹配');
  }

  // 独立性匹配
  if (userProfile.independence >= 4 && track.profile.independence >= 4) {
    reasons.push('完全独立操作，不需要依赖任何人');
  }

  // 收入速度匹配
  if (userProfile.incomeTimeline <= 2 && track.profile.incomeTimeline <= 2) {
    reasons.push('启动快，符合你需要短期见收入的需求');
  } else if (userProfile.incomeTimeline >= 4 && track.profile.incomeTimeline >= 3) {
    reasons.push('你看长期，这个赛道有复利效应');
  }

  // 动机匹配
  if (track.motivationMatch.includes(userProfile.motivation)) {
    const motivationMap = {
      'money': '直接变现能力强，满足你对赚钱的渴望',
      'freedom': '时间自主，符合你对自由的追求',
      'create': '创造性强，能让你做出有影响力的东西',
      'security': '收入相对稳定，给你安全感',
    };
    reasons.push(motivationMap[userProfile.motivation] || '与你的核心驱动力一致');
  }

  // 行业经验匹配
  if (userProfile.industryExp && userProfile.industryExp !== 'none') {
    const affinityList = INDUSTRY_AFFINITY[userProfile.industryExp] || [];
    if (affinityList.includes(track.id)) {
      const industryNameMap = {
        'tech': '互联网/科技行业',
        'traditional': '传统实业',
        'finance': '金融行业',
        'education': '教育/培训行业',
      };
      reasons.push(`你的${industryNameMap[userProfile.industryExp] || ''}背景是这个赛道的天然优势`);
    }
  }

  // 技术态度匹配
  if (userProfile.learningWillingness >= 4 && track.profile.learningWillingness >= 4) {
    reasons.push('你喜欢尝鲜，这个赛道能充分发挥 AI 杠杆');
  }

  // 学习方式匹配
  const ls = userProfile.learnStyle;
  if (ls === 'doing' && track.profile.learningWillingness <= 2) {
    reasons.push('适合你"边干边学"的风格，启动门槛低');
  } else if (ls === 'structured' && track.profile.learningWillingness >= 4) {
    reasons.push('适合你"系统学习"的风格，壁垒高但护城河深');
  } else if (ls === 'avoid' && track.profile.learningWillingness <= 1) {
    reasons.push('无需学新技能，直接用现有能力变现');
  }

  return reasons.slice(0, 5); // 最多 5 条理由（从4条升级）
}

function matchAll(userProfile) {
  return TRACKS
    .map(track => calculateMatch(userProfile, track))
    .sort((a, b) => b.score - a.score);
}
