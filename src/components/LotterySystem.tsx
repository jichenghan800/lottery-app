import { useState, useEffect, useRef } from 'react'
import { Trophy, Users, RotateCcw, Star, Sparkles, Upload, Music, Image, Settings, Play, Pause, Volume2, Hand } from 'lucide-react'
import * as XLSX from 'xlsx'

interface Employee {
  name: string
  department: string
}

interface Winner {
  employee: Employee
  round: number
}

// 抽奖状态类型
type LotteryState = 'idle' | 'drawing' | 'stopped'

const LotterySystem = () => {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [availableEmployees, setAvailableEmployees] = useState<Employee[]>([])
  const [winners, setWinners] = useState<Winner[]>([])
  const [currentWinner, setCurrentWinner] = useState<Winner | null>(null)
  const [lotteryState, setLotteryState] = useState<LotteryState>('idle')
  const [currentRound, setCurrentRound] = useState(1)
  const [loading, setLoading] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [backgroundImage, setBackgroundImage] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [displayEmployee, setDisplayEmployee] = useState<Employee | null>(null)
  
  const audioRef = useRef<HTMLAudioElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const musicInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const animationIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // 加载员工数据
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const response = await fetch('/data/employees.json')
        const data = await response.json()
        setEmployees(data)
        setAvailableEmployees(data)
        setLoading(false)
      } catch (error) {
        console.error('加载员工数据失败:', error)
        setLoading(false)
      }
    }
    loadEmployees()
  }, [])

  // Excel文件上传处理
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    console.log('开始处理Excel文件:', file.name)

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]
        
        console.log('Excel解析结果:', jsonData)
        
        // 解析数据，跳过标题行
        const newEmployees: Employee[] = []
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i]
          if (row && row[0] && row[1] && 
              String(row[0]).trim() !== '' && 
              String(row[1]).trim() !== '') {
            newEmployees.push({
              name: String(row[0]).trim(),
              department: String(row[1]).trim()
            })
          }
        }
        
        console.log('解析的员工数据:', newEmployees)
        
        if (newEmployees.length > 0) {
          setEmployees(newEmployees)
          setAvailableEmployees(newEmployees)
          setWinners([])
          setCurrentWinner(null)
          setCurrentRound(1)
          alert(`✅ 成功导入 ${newEmployees.length} 名员工！`)
        } else {
          alert('❌ 文件中没有找到有效的员工数据！\n请确保Excel文件包含"姓名"和"部门"两列，且有数据行。')
        }
      } catch (error) {
        console.error('文件解析失败:', error)
        alert('❌ 文件解析失败，请确保上传的是有效的Excel文件（.xlsx或.xls格式）！')
      }
    }
    reader.onerror = () => {
      alert('❌ 文件读取失败，请重试！')
    }
    reader.readAsArrayBuffer(file)
    
    // 清空input值，允许重复选择同一文件
    event.target.value = ''
  }

  // 背景音乐上传处理
  const handleMusicUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    console.log('开始处理音乐文件:', file.name, file.type)

    // 检查文件类型
    const allowedTypes = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4']
    if (!allowedTypes.some(type => file.type.includes(type.split('/')[1]))) {
      alert('❌ 请上传音频文件（MP3、WAV、OGG格式）！')
      return
    }

    try {
      const url = URL.createObjectURL(file)
      if (audioRef.current) {
        // 停止当前播放
        audioRef.current.pause()
        setIsPlaying(false)
        
        // 设置新音频
        audioRef.current.src = url
        audioRef.current.load()
        
        // 添加加载完成事件
        audioRef.current.onloadeddata = () => {
          alert('✅ 背景音乐上传成功！点击播放按钮开始播放。')
        }
        
        audioRef.current.onerror = () => {
          alert('❌ 音频文件加载失败，请尝试其他音频文件！')
        }
      }
    } catch (error) {
      console.error('音乐上传失败:', error)
      alert('❌ 音乐上传失败，请重试！')
    }
    
    // 清空input值
    event.target.value = ''
  }

  // 背景图片上传处理
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    console.log('开始处理图片文件:', file.name, file.type)

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      alert('❌ 请上传图片文件！')
      return
    }

    // 检查文件大小（限制10MB）
    if (file.size > 10 * 1024 * 1024) {
      alert('❌ 图片文件太大，请选择小于10MB的图片！')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string
        setBackgroundImage(result)
        console.log('背景图片设置成功')
        alert('✅ 背景图片更换成功！')
      } catch (error) {
        console.error('图片处理失败:', error)
        alert('❌ 图片处理失败，请重试！')
      }
    }
    reader.onerror = () => {
      alert('❌ 图片读取失败，请重试！')
    }
    reader.readAsDataURL(file)
    
    // 清空input值
    event.target.value = ''
  }

  // 音乐播放控制
  const toggleMusic = () => {
    if (audioRef.current && audioRef.current.src) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true)
          })
          .catch(e => {
            console.error('播放失败:', e)
            alert('播放失败，请检查音频文件或尝试用户交互后再播放')
          })
      }
    } else {
      alert('请先上传音频文件！')
    }
  }

  // 开始音乐播放
  const startMusic = () => {
    if (audioRef.current && audioRef.current.src) {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true)
        })
        .catch(e => {
          console.error('自动播放失败:', e)
        })
    }
  }

  // 暂停音乐播放
  const pauseMusic = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  // 停止音乐播放
  const stopMusic = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlaying(false)
    }
  }

  // 清理动画定时器
  const clearAnimation = () => {
    if (animationIntervalRef.current) {
      clearInterval(animationIntervalRef.current)
      animationIntervalRef.current = null
    }
  }

  // 抽奖功能 - 开始抽奖或停止抽奖
  const handleLotteryAction = () => {
    if (availableEmployees.length === 0) {
      alert('所有人员都已中奖！')
      return
    }

    if (lotteryState === 'idle') {
      // 开始抽奖
      startLottery()
    } else if (lotteryState === 'drawing') {
      // 手动停止抽奖
      stopLottery()
    }
  }

  // 开始抽奖
  const startLottery = () => {
    setLotteryState('drawing')
    setDisplayEmployee(null)
    
    // 开始播放背景音乐
    startMusic()
    
    // 开始抽奖动画效果 - 快速滚动显示候选人姓名
    animationIntervalRef.current = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * availableEmployees.length)
      setDisplayEmployee(availableEmployees[randomIndex])
    }, 80) // 80ms 间隔，营造快速滚动效果
  }

  // 停止抽奖
  const stopLottery = () => {
    // 清除动画
    clearAnimation()
    
    // 暂停音乐
    pauseMusic()
    
    // 最终抽奖结果
    const finalRandomIndex = Math.floor(Math.random() * availableEmployees.length)
    const finalWinner: Winner = {
      employee: availableEmployees[finalRandomIndex],
      round: currentRound
    }
    
    setCurrentWinner(finalWinner)
    setDisplayEmployee(null)
    setWinners(prev => [...prev, finalWinner])
    
    // 从可抽奖名单中移除中奖者
    setAvailableEmployees(prev => 
      prev.filter(emp => emp.name !== finalWinner.employee.name)
    )
    
    setCurrentRound(prev => prev + 1)
    setLotteryState('idle')
    
    // 播放中奖音效或延迟后的庆祝效果
    setTimeout(() => {
      // 可以在这里添加中奖音效
    }, 100)
  }

  // 重置抽奖
  const resetLottery = () => {
    // 如果正在抽奖，先停止
    if (lotteryState === 'drawing') {
      clearAnimation()
    }
    
    // 停止音乐
    stopMusic()
    
    // 重置所有状态
    setAvailableEmployees(employees)
    setWinners([])
    setCurrentWinner(null)
    setDisplayEmployee(null)
    setCurrentRound(1)
    setLotteryState('idle')
  }

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      clearAnimation()
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'linear-gradient(to bottom right, #3b82f6, #8b5cf6, #f59e0b)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-8 text-white text-center">
          <div className="animate-spin w-12 h-12 border-4 border-white/30 border-t-white rounded-full mx-auto mb-4"></div>
          <p className="text-xl">正在加载员工数据...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 flex flex-col items-center justify-center relative" style={{
      backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'linear-gradient(to bottom right, #3b82f6, #8b5cf6, #f59e0b)',
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}>
      {/* 背景音乐 */}
      <audio ref={audioRef} loop />
      
      {/* 隐藏的文件输入 */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".xlsx,.xls"
        style={{ display: 'none' }}
      />
      <input
        type="file"
        ref={musicInputRef}
        onChange={handleMusicUpload}
        accept=".mp3,.wav,.ogg"
        style={{ display: 'none' }}
      />
      <input
        type="file"
        ref={imageInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        style={{ display: 'none' }}
      />

      {/* 设置按钮 */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="fixed top-4 right-4 bg-white/20 backdrop-blur-lg text-white p-3 rounded-2xl border-2 border-white/30 hover:bg-white/30 transition-all duration-200"
      >
        <Settings className="w-6 h-6" />
      </button>

      {/* 设置面板 */}
      {showSettings && (
        <div className="fixed top-4 left-4 bg-white/20 backdrop-blur-lg rounded-2xl p-6 text-white border-2 border-white/30 z-10 max-w-sm">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            抽奖设置
          </h3>
          
          <div className="space-y-3">
            {/* Excel文件上传 */}
            <div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center gap-2 px-4 py-3 bg-blue-500/70 hover:bg-blue-600/70 rounded-xl transition-all duration-200"
              >
                <Upload className="w-5 h-5" />
                上传Excel名单
              </button>
              <p className="text-xs text-white/60 mt-1">支持.xlsx .xls格式，需包含"姓名"和"部门"列</p>
            </div>
            
            {/* 背景音乐上传 */}
            <div>
              <button
                onClick={() => musicInputRef.current?.click()}
                className="w-full flex items-center gap-2 px-4 py-3 bg-purple-500/70 hover:bg-purple-600/70 rounded-xl transition-all duration-200"
              >
                <Music className="w-5 h-5" />
                上传背景音乐
              </button>
              <p className="text-xs text-white/60 mt-1">支持MP3、WAV、OGG格式</p>
            </div>
            
            {/* 音乐播放控制 */}
            <button
              onClick={toggleMusic}
              className="w-full flex items-center gap-2 px-4 py-3 bg-green-500/70 hover:bg-green-600/70 rounded-xl transition-all duration-200"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              {isPlaying ? '暂停音乐' : '播放音乐'}
            </button>
            
            {/* 背景图片上传 */}
            <div>
              <button
                onClick={() => imageInputRef.current?.click()}
                className="w-full flex items-center gap-2 px-4 py-3 bg-orange-500/70 hover:bg-orange-600/70 rounded-xl transition-all duration-200"
              >
                <Image className="w-5 h-5" />
                更换背景图片
              </button>
              <p className="text-xs text-white/60 mt-1">支持JPG、PNG等格式，大小小于10MB</p>
            </div>
            
            {/* 恢复默认背景 */}
            {backgroundImage && (
              <button
                onClick={() => setBackgroundImage('')}
                className="w-full flex items-center gap-2 px-4 py-3 bg-gray-500/70 hover:bg-gray-600/70 rounded-xl transition-all duration-200"
              >
                <RotateCcw className="w-5 h-5" />
                恢复默认背景
              </button>
            )}
          </div>
        </div>
      )}

      {/* 音乐控制指示器 */}
      {isPlaying && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-white/20 backdrop-blur-lg rounded-2xl px-4 py-2 text-white flex items-center gap-2">
          <Volume2 className="w-4 h-4 animate-pulse" />
          <span className="text-sm">正在播放背景音乐</span>
        </div>
      )}

      {/* 标题 */}
      <div className="text-center mb-8">
        <h1 className="text-6xl font-bold text-white mb-4 flex items-center justify-center gap-4">
          <Star className="w-16 h-16 text-yellow-300" />
          研发之星抽奖
          <Star className="w-16 h-16 text-yellow-300" />
        </h1>
        <div className="flex items-center justify-center gap-2 text-white/80 text-xl">
          <Sparkles className="w-6 h-6" />
          <span>让幸运降临到你身上</span>
          <Sparkles className="w-6 h-6" />
        </div>
      </div>

      {/* 统计信息 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 w-full max-w-4xl">
        <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 text-center text-white">
          <Users className="w-8 h-8 mx-auto mb-2 text-blue-200" />
          <p className="text-sm opacity-80">剩余人数</p>
          <p className="text-3xl font-bold">{availableEmployees.length}</p>
        </div>
        
        <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 text-center text-white">
          <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-300" />
          <p className="text-sm opacity-80">当前轮次</p>
          <p className="text-3xl font-bold">第 {currentRound} 轮</p>
        </div>
        
        <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 text-center text-white">
          <Star className="w-8 h-8 mx-auto mb-2 text-orange-300" />
          <p className="text-sm opacity-80">已中奖人数</p>
          <p className="text-3xl font-bold">{winners.length}</p>
        </div>
      </div>

      {/* 抽奖展示区域 */}
      <div className="bg-white/25 backdrop-blur-lg rounded-3xl p-8 mb-8 w-full max-w-2xl text-center">
        {lotteryState === 'drawing' && displayEmployee ? (
          // 抽奖进行中 - 显示滚动效果
          <div className="mb-4">
            <Sparkles className="w-16 h-16 mx-auto text-yellow-300 mb-4 animate-spin" />
            <h2 className="text-2xl font-bold text-white mb-2 animate-pulse">
              正在抽奖中...
            </h2>
            <div className="transition-all duration-100">
              <p className="text-5xl font-bold text-white mb-4 animate-bounce">
                {displayEmployee.name}
              </p>
              <p className="text-xl text-white/80 mb-2">
                {displayEmployee.department}
              </p>
              <div className="flex items-center justify-center gap-2 text-white/60">
                <Hand className="w-5 h-5 animate-pulse" />
                <span>点击"停止抽奖"确定中奖者</span>
              </div>
            </div>
          </div>
        ) : currentWinner ? (
          // 显示中奖结果
          <div className="mb-4">
            <Trophy className="w-16 h-16 mx-auto text-yellow-300 mb-4 animate-bounce" />
            <h2 className="text-2xl font-bold text-white mb-2">
              🎉 恭喜中奖 🎉
            </h2>
            <div className="transition-all duration-300">
              <p className="text-5xl font-bold text-white mb-4">
                {currentWinner.employee.name}
              </p>
              <p className="text-xl text-white/80 mb-2">
                {currentWinner.employee.department}
              </p>
              <p className="text-lg text-white/60">
                第 {currentWinner.round} 轮中奖者
              </p>
            </div>
          </div>
        ) : (
          // 等待抽奖状态
          <div className="mb-4">
            <Star className="w-16 h-16 mx-auto text-yellow-300 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
              准备抽奖
            </h2>
            <p className="text-lg text-white/60">
              点击"开始抽奖"按钮开始第 {currentRound} 轮抽奖
            </p>
          </div>
        )}
      </div>

      {/* 抽奖按钮 */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={handleLotteryAction}
          disabled={availableEmployees.length === 0}
          className={`px-12 py-4 text-white text-xl font-bold rounded-2xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 ${
            lotteryState === 'drawing'
              ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 animate-pulse'
              : 'bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600'
          }`}
        >
          {lotteryState === 'drawing' ? (
            <span className="flex items-center gap-2">
              <Hand className="w-6 h-6" />
              停止抽奖
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Play className="w-6 h-6" />
              开始抽奖
            </span>
          )}
        </button>
        
        <button
          onClick={resetLottery}
          disabled={lotteryState === 'drawing'}
          className="px-8 py-4 bg-white/20 backdrop-blur-lg text-white text-lg font-semibold rounded-2xl border-2 border-white/30 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
        >
          <RotateCcw className="w-5 h-5" />
          重置抽奖
        </button>
      </div>

      {/* 中奖历史 */}
      {winners.length > 0 && (
        <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 w-full max-w-4xl">
          <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Trophy className="w-6 h-6" />
            中奖历史
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {winners.map((winner, index) => (
              <div key={index} className="bg-white/20 rounded-xl p-4 text-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-semibold">{winner.employee.name}</span>
                  <span className="text-sm bg-white/20 px-2 py-1 rounded-full">
                    第{winner.round}轮
                  </span>
                </div>
                <p className="text-sm text-white/70">{winner.employee.department}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 底部信息 */}
      <div className="mt-8 text-center text-white/60">
        <p>总共 {employees.length} 人参与抽奖</p>
      </div>
    </div>
  )
}

export default LotterySystem