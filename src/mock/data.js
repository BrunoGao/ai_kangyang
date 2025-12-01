// Mock 数据 - 养老院老人体征管理系统

// 生成随机数
const random = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)
const randomFloat = (min, max, decimals = 1) =>
  (Math.random() * (max - min) + min).toFixed(decimals)

// 老人基本信息
export const elderlyList = [
  {
    id: 1,
    name: '王桂兰',
    age: 87,
    gender: 'female',
    room: '305',
    floor: 3,
    avatar: '👵',
    healthScore: 82,
    status: 'normal', // normal, warning, danger
    mood: '😊',
    contactFamily: '王明（儿子）',
    contactPhone: '138****5678',
    admissionDate: '2022-03-15',
    medicalHistory: ['高血压', '轻度糖尿病'],
    allergies: ['青霉素'],
    devices: [
      { type: 'smartWatch', name: '智能手表', battery: 85, status: 'online' },
      { type: 'infrared', name: '床边红外', battery: 100, status: 'online' }
    ]
  },
  {
    id: 2,
    name: '李建国',
    age: 79,
    gender: 'male',
    room: '208',
    floor: 2,
    avatar: '👴',
    healthScore: 45,
    status: 'danger',
    mood: '😟',
    contactFamily: '李芳（女儿）',
    contactPhone: '139****1234',
    admissionDate: '2021-11-20',
    medicalHistory: ['心脏病', '高血压', '冠心病'],
    allergies: [],
    devices: [
      { type: 'smartWatch', name: '智能手表', battery: 35, status: 'online' },
      { type: 'infrared', name: '床边红外', battery: 100, status: 'online' },
      { type: 'ecg', name: '心电监护', battery: 78, status: 'online' }
    ]
  },
  {
    id: 3,
    name: '张秀英',
    age: 82,
    gender: 'female',
    room: '412',
    floor: 4,
    avatar: '👵',
    healthScore: 68,
    status: 'warning',
    mood: '🙂',
    contactFamily: '张伟（儿子）',
    contactPhone: '137****9876',
    admissionDate: '2023-01-10',
    medicalHistory: ['骨质疏松', '轻度贫血'],
    allergies: ['海鲜'],
    devices: [
      { type: 'smartWatch', name: '智能手表', battery: 92, status: 'online' },
      { type: 'infrared', name: '床边红外', battery: 100, status: 'online' }
    ]
  },
  {
    id: 4,
    name: '刘福根',
    age: 91,
    gender: 'male',
    room: '103',
    floor: 1,
    avatar: '👴',
    healthScore: 91,
    status: 'normal',
    mood: '😀',
    contactFamily: '刘华（孙女）',
    contactPhone: '136****4567',
    admissionDate: '2020-06-08',
    medicalHistory: ['老年性耳聋'],
    allergies: [],
    devices: [
      { type: 'smartWatch', name: '智能手表', battery: 88, status: 'online' },
      { type: 'infrared', name: '床边红外', battery: 100, status: 'online' }
    ]
  },
  {
    id: 5,
    name: '赵玉梅',
    age: 76,
    gender: 'female',
    room: '507',
    floor: 5,
    avatar: '👵',
    healthScore: 75,
    status: 'normal',
    mood: '😊',
    contactFamily: '赵强（儿子）',
    contactPhone: '135****2345',
    admissionDate: '2023-05-22',
    medicalHistory: ['糖尿病', '高血脂'],
    allergies: ['花粉'],
    devices: [
      { type: 'smartWatch', name: '智能手表', battery: 67, status: 'online' },
      { type: 'infrared', name: '床边红外', battery: 100, status: 'online' }
    ]
  },
  {
    id: 6,
    name: '陈德华',
    age: 84,
    gender: 'male',
    room: '301',
    floor: 3,
    avatar: '👴',
    healthScore: 58,
    status: 'warning',
    mood: '😐',
    contactFamily: '陈丽（女儿）',
    contactPhone: '138****7890',
    admissionDate: '2022-09-15',
    medicalHistory: ['中风后遗症', '高血压'],
    allergies: [],
    devices: [
      { type: 'smartWatch', name: '智能手表', battery: 45, status: 'online' },
      { type: 'infrared', name: '床边红外', battery: 100, status: 'online' }
    ]
  }
]

// 生成实时体征数据
export const generateVitalSigns = (elderlyId) => {
  const elderly = elderlyList.find(e => e.id === elderlyId)

  // 根据健康评分调整数据范围
  const healthFactor = elderly.healthScore / 100

  return {
    elderlyId,
    timestamp: new Date().toISOString(),
    heartRate: elderly.status === 'danger' ? random(95, 110) :
               elderly.status === 'warning' ? random(75, 90) :
               random(65, 78),
    bloodOxygen: elderly.status === 'danger' ? random(88, 93) :
                 elderly.status === 'warning' ? random(94, 96) :
                 random(97, 99),
    temperature: elderly.status === 'danger' ? randomFloat(37.5, 38.2) :
                 elderly.status === 'warning' ? randomFloat(37.0, 37.4) :
                 randomFloat(36.2, 36.8),
    bloodPressure: {
      systolic: elderly.status === 'danger' ? random(150, 170) :
                elderly.status === 'warning' ? random(135, 149) :
                random(110, 130),
      diastolic: elderly.status === 'danger' ? random(95, 105) :
                 elderly.status === 'warning' ? random(85, 94) :
                 random(70, 85)
    },
    sleepQuality: {
      hours: randomFloat(5, 9, 1),
      deepSleep: randomFloat(1.5, 3.5, 1),
      lightSleep: randomFloat(3, 5, 1),
      score: elderly.status === 'danger' ? random(45, 60) :
             elderly.status === 'warning' ? random(61, 75) :
             random(76, 95)
    },
    activityLevel: random(1000, 5000), // 步数
    movement: random(5, 30) // 体动次数
  }
}

// 生成历史数据（最近7天）
export const generateHistoricalData = (elderlyId) => {
  const data = []
  const now = new Date()

  for (let i = 6; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)

    data.push({
      date: date.toISOString().split('T')[0],
      heartRate: random(65, 85),
      bloodOxygen: random(95, 99),
      bloodPressureSystolic: random(110, 140),
      bloodPressureDiastolic: random(70, 90),
      sleepHours: randomFloat(6, 9, 1),
      activityLevel: random(1500, 4500)
    })
  }

  return data
}

// 告警数据
export const alerts = [
  {
    id: 1,
    elderlyId: 2,
    elderlyName: '李建国',
    type: 'danger',
    title: '心率异常',
    message: '心率持续超过 105 bpm，请立即处理',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    status: 'active', // active, handled, dismissed
    location: '208房间',
    priority: 'high'
  },
  {
    id: 2,
    elderlyId: 2,
    elderlyName: '李建国',
    type: 'danger',
    title: '血氧偏低',
    message: '血氧饱和度 89%，建议立即检查',
    timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    status: 'active',
    location: '208房间',
    priority: 'high'
  },
  {
    id: 3,
    elderlyId: 3,
    elderlyName: '张秀英',
    type: 'warning',
    title: '睡眠质量下降',
    message: '连续3天睡眠不足6小时，建议关注',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    location: '412房间',
    priority: 'medium'
  },
  {
    id: 4,
    elderlyId: 6,
    elderlyName: '陈德华',
    type: 'warning',
    title: '体温偏高',
    message: '体温 37.3℃，持续观察中',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    status: 'active',
    location: '301房间',
    priority: 'medium'
  },
  {
    id: 5,
    elderlyId: 5,
    elderlyName: '赵玉梅',
    type: 'info',
    title: '设备电量提醒',
    message: '智能手表电量 67%，建议充电',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    location: '507房间',
    priority: 'low'
  }
]

// AI 健康洞察
export const aiInsights = [
  {
    id: 1,
    type: 'trend',
    title: '整体健康趋势向好',
    content: '本周园区老人整体健康评分上升 3.2%，心血管指标稳定，睡眠质量有所改善。建议继续保持当前的康养方案。',
    confidence: 0.92,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    priority: 'info'
  },
  {
    id: 2,
    type: 'alert',
    title: '李建国需要重点关注',
    content: '过去 72 小时心率和血压波动明显，综合评估心血管风险较高。AI 模型建议：增加监测频率，考虑调整药物剂量，必要时联系主治医师。',
    confidence: 0.88,
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    priority: 'high',
    recommendations: [
      '增加心电监护频率至每2小时一次',
      '联系家属和主治医师',
      '准备急救药品和设备',
      '安排专人看护'
    ]
  },
  {
    id: 3,
    type: 'pattern',
    title: '睡眠模式异常检测',
    content: '张秀英、陈德华近期睡眠质量下降，深度睡眠时间减少 40%。可能与季节变化、室内温度或心理因素相关。',
    confidence: 0.85,
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    priority: 'medium',
    recommendations: [
      '调整室内温度至 22-24℃',
      '睡前播放舒缓音乐',
      '增加日间活动量',
      '关注情绪变化'
    ]
  },
  {
    id: 4,
    type: 'success',
    title: '王桂兰康复进展良好',
    content: '血压控制稳定在 120/75 mmHg，活动量增加 28%，情绪状态积极。建议继续现有治疗方案。',
    confidence: 0.94,
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    priority: 'info'
  }
]

// 楼层地图数据
export const floorMap = {
  1: { name: '一楼', rooms: ['101', '102', '103', '104', '105', '106', '107', '108'] },
  2: { name: '二楼', rooms: ['201', '202', '203', '204', '205', '206', '207', '208'] },
  3: { name: '三楼', rooms: ['301', '302', '303', '304', '305', '306', '307', '308'] },
  4: { name: '四楼', rooms: ['401', '402', '403', '404', '405', '406', '407', '408', '409', '410', '411', '412'] },
  5: { name: '五楼', rooms: ['501', '502', '503', '504', '505', '506', '507', '508'] }
}

// 统计数据
export const statistics = {
  totalElderly: elderlyList.length,
  normalCount: elderlyList.filter(e => e.status === 'normal').length,
  warningCount: elderlyList.filter(e => e.status === 'warning').length,
  dangerCount: elderlyList.filter(e => e.status === 'danger').length,
  averageHealthScore: Math.round(
    elderlyList.reduce((sum, e) => sum + e.healthScore, 0) / elderlyList.length
  ),
  activeAlerts: alerts.filter(a => a.status === 'active').length,
  onlineDevices: elderlyList.reduce((sum, e) =>
    sum + e.devices.filter(d => d.status === 'online').length, 0
  ),
  totalDevices: elderlyList.reduce((sum, e) => sum + e.devices.length, 0)
}

// 天气信息
export const weather = {
  temperature: 22,
  condition: '晴',
  icon: '☀️',
  humidity: 65,
  airQuality: '优',
  suggestion: '天气舒适，适合户外活动'
}

export default {
  elderlyList,
  generateVitalSigns,
  generateHistoricalData,
  alerts,
  aiInsights,
  floorMap,
  statistics,
  weather
}
