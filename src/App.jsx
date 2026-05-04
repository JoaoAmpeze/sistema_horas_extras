import { useState, useEffect } from 'react'
import Timer from './components/Timer'
import History from './components/History'
import { getAllSessions } from './db/database'
import { FileText, Clock } from 'lucide-react'

function App() {
  const [activeTab, setActiveTab] = useState('timer')
  const [sessions, setSessions] = useState([])

  const loadSessions = async () => {
    const data = await getAllSessions()
    setSessions(data)
  }

  useEffect(() => {
    loadSessions()
  }, [])

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto bg-background relative shadow-2xl">
      {/* Header */}
      <header className="pt-8 pb-4 px-6 sticky top-0 bg-background/80 backdrop-blur-md z-10 border-b border-slate-800">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
          Horas Extras
        </h1>
        <p className="text-sm text-textMuted mt-1">Controle offline</p>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        {activeTab === 'timer' ? (
          <Timer onSessionSaved={loadSessions} />
        ) : (
          <History sessions={sessions} onSessionsChanged={loadSessions} />
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-surface border-t border-slate-700/50 pb-safe">
        <div className="flex justify-around items-center p-4">
          <button 
            onClick={() => setActiveTab('timer')}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'timer' ? 'text-primary' : 'text-textMuted hover:text-textLight'}`}
          >
            <Clock size={24} />
            <span className="text-xs font-medium">Cronômetro</span>
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'history' ? 'text-primary' : 'text-textMuted hover:text-textLight'}`}
          >
            <FileText size={24} />
            <span className="text-xs font-medium">Histórico</span>
          </button>
        </div>
      </nav>
    </div>
  )
}

export default App
