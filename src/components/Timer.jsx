import { useState, useEffect, useRef } from 'react'
import { Play, Pause, Square } from 'lucide-react'
import SessionModal from './SessionModal'

export default function Timer({ onSessionSaved }) {
  // Inicialização de estados buscando do localStorage para persistência em background
  const [isRunning, setIsRunning] = useState(() => localStorage.getItem('timer_isRunning') === 'true')
  const [realStartTime, setRealStartTime] = useState(() => localStorage.getItem('timer_realStartTime') || null)
  const [lastResumeTime, setLastResumeTime] = useState(() => Number(localStorage.getItem('timer_lastResumeTime')) || null)
  const [accumulatedTime, setAccumulatedTime] = useState(() => Number(localStorage.getItem('timer_accumulated')) || 0)
  
  const [elapsedTime, setElapsedTime] = useState(0) // Apenas para exibição (em segundos)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const intervalRef = useRef(null)

  // Atualiza o relógio a cada 500ms comparando com a hora do sistema (funciona em background)
  useEffect(() => {
    if (isRunning && lastResumeTime) {
      // Quando monta o componente ou muda estado, calcular tempo atual e iniciar loop
      const updateDisplay = () => {
        const now = Date.now()
        const currentChunk = Math.floor((now - lastResumeTime) / 1000)
        setElapsedTime(accumulatedTime + currentChunk)
      }
      
      updateDisplay() // Atualiza imediatamente
      intervalRef.current = setInterval(updateDisplay, 500)
    } else {
      setElapsedTime(accumulatedTime)
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [isRunning, lastResumeTime, accumulatedTime])

  const formatTime = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600)
    const mins = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleStart = () => {
    if (!realStartTime) {
      const nowIso = new Date().toISOString()
      setRealStartTime(nowIso)
      localStorage.setItem('timer_realStartTime', nowIso)
    }
    
    const nowMs = Date.now()
    setLastResumeTime(nowMs)
    localStorage.setItem('timer_lastResumeTime', nowMs.toString())
    
    setIsRunning(true)
    localStorage.setItem('timer_isRunning', 'true')
  }

  const handlePause = () => {
    setIsRunning(false)
    localStorage.setItem('timer_isRunning', 'false')
    
    const nowMs = Date.now()
    const currentChunk = Math.floor((nowMs - lastResumeTime) / 1000)
    const newAccumulated = accumulatedTime + currentChunk
    
    setAccumulatedTime(newAccumulated)
    localStorage.setItem('timer_accumulated', newAccumulated.toString())
    setElapsedTime(newAccumulated)
  }

  const handleStop = () => {
    let finalTime = elapsedTime;
    if (isRunning) {
      setIsRunning(false)
      localStorage.setItem('timer_isRunning', 'false')
      
      const nowMs = Date.now()
      const currentChunk = Math.floor((nowMs - lastResumeTime) / 1000)
      const newAccumulated = accumulatedTime + currentChunk
      
      setAccumulatedTime(newAccumulated)
      localStorage.setItem('timer_accumulated', newAccumulated.toString())
      setElapsedTime(newAccumulated)
      finalTime = newAccumulated
    }
    
    if (finalTime > 0) {
      setIsModalOpen(true)
    }
  }

  const handleSaveSuccess = () => {
    setElapsedTime(0)
    setAccumulatedTime(0)
    setRealStartTime(null)
    setLastResumeTime(null)
    setIsModalOpen(false)
    
    // Limpar cache de background
    localStorage.removeItem('timer_isRunning')
    localStorage.removeItem('timer_realStartTime')
    localStorage.removeItem('timer_lastResumeTime')
    localStorage.removeItem('timer_accumulated')
    
    onSessionSaved()
  }

  const handleCancelSave = () => {
    setIsModalOpen(false)
  }

  return (
    <div className="flex flex-col items-center justify-center h-full py-8">
      <div className="relative mb-12">
        {/* Glow effect */}
        <div className={`absolute inset-0 rounded-full blur-3xl transition-opacity duration-1000 ${isRunning ? 'bg-primary/40 opacity-100' : 'bg-transparent opacity-0'}`}></div>
        
        <div className="relative z-10 w-64 h-64 rounded-full border-[6px] border-slate-800 flex flex-col items-center justify-center bg-surface shadow-2xl">
          <span className="text-sm font-medium text-textMuted mb-2 tracking-widest uppercase">
            {isRunning ? 'Em Andamento' : (elapsedTime > 0 ? 'Pausado' : 'Pronto')}
          </span>
          <div className="text-5xl font-bold font-mono tracking-wider bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">
            {formatTime(elapsedTime)}
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {!isRunning ? (
          <button 
            onClick={handleStart}
            className="w-16 h-16 rounded-full bg-primary hover:bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 transition-all active:scale-95"
          >
            <Play size={28} className="ml-1" />
          </button>
        ) : (
          <button 
            onClick={handlePause}
            className="w-16 h-16 rounded-full bg-amber-500 hover:bg-amber-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/30 transition-all active:scale-95"
          >
            <Pause size={28} />
          </button>
        )}

        <button 
          onClick={handleStop}
          disabled={elapsedTime === 0}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all active:scale-95 ${elapsedTime > 0 ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
        >
          <Square size={24} />
        </button>
      </div>

      {isModalOpen && (
        <SessionModal 
          duration={elapsedTime} 
          startTime={realStartTime}
          onSave={handleSaveSuccess} 
          onCancel={handleCancelSave} 
        />
      )}
    </div>
  )
}
