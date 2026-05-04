import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Trash2, Download, Image as ImageIcon, Clock } from 'lucide-react'
import { deleteSession } from '../db/database'
import exportToPdf from '../utils/exportPdf'
import { formatDurationDetailed, formatTimeOnly } from '../utils/formatTime'

export default function History({ sessions, onSessionsChanged }) {
  const [isExporting, setIsExporting] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState('all')

  // Extrair meses únicos para o filtro
  const uniqueMonths = [...new Set(sessions.map(s => 
    format(parseISO(s.createdAt), "MM-yyyy")
  ))]

  // Filtrar sessões com base no mês selecionado
  const filteredSessions = selectedMonth === 'all' 
    ? sessions 
    : sessions.filter(s => format(parseISO(s.createdAt), "MM-yyyy") === selectedMonth)

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este registro?")) {
      await deleteSession(id)
      onSessionsChanged()
    }
  }

  const handleExport = async () => {
    if (filteredSessions.length === 0) {
      alert("Não há dados para exportar.")
      return
    }
    setIsExporting(true)
    try {
      await exportToPdf(filteredSessions)
    } catch (error) {
      console.error("Erro ao exportar PDF:", error)
      alert("Ocorreu um erro ao gerar o PDF.")
    }
    setIsExporting(false)
  }

  const totalTime = filteredSessions.reduce((acc, curr) => acc + curr.duration, 0)

  return (
    <div className="pb-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold">Histórico</h2>
          <p className="text-sm text-textMuted">Total: <span className="font-bold text-primary">{formatDurationDetailed(totalTime)}</span></p>
        </div>
        <div className="flex gap-2">
          {uniqueMonths.length > 0 && (
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-slate-800 text-sm text-textLight px-3 py-2 rounded-xl border border-slate-700 outline-none focus:border-primary transition-colors appearance-none"
            >
              <option value="all">Todos os meses</option>
              {uniqueMonths.map(monthYear => {
                const [m, y] = monthYear.split('-')
                const date = new Date(parseInt(y), parseInt(m) - 1, 1)
                const label = format(date, "MMMM 'de' yyyy", { locale: ptBR })
                return <option key={monthYear} value={monthYear}>{label.charAt(0).toUpperCase() + label.slice(1)}</option>
              })}
            </select>
          )}

          <button 
            onClick={handleExport}
            disabled={isExporting || filteredSessions.length === 0}
            className="bg-slate-800 hover:bg-slate-700 text-primary px-4 py-2 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Download size={20} />
            <span className="text-sm font-medium">{isExporting ? 'Gerando...' : 'Exportar'}</span>
          </button>
        </div>
      </div>

      {filteredSessions.length === 0 ? (
        <div className="text-center py-12 text-textMuted">
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
            <ImageIcon size={24} className="opacity-50" />
          </div>
          <p>Nenhuma hora extra registrada para este filtro.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSessions.map((session) => (
            <div key={session.id} className="card p-4 hover:border-slate-600 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="text-xs text-textMuted mb-1 font-medium">
                    {format(parseISO(session.createdAt), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                  </div>
                  <div className="text-lg font-bold text-emerald-400">
                    {formatDurationDetailed(session.duration)}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                    <Clock size={12} />
                    <span>{formatTimeOnly(session.startTime)} - {formatTimeOnly(session.endTime)}</span>
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(session.id)}
                  className="text-slate-500 hover:text-red-400 p-2 -mr-2 -mt-2 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              
              <p className="text-sm text-textLight mt-2 whitespace-pre-wrap leading-relaxed">
                {session.description}
              </p>

              {session.attachments && session.attachments.length > 0 && (
                <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                  {session.attachments.map((file, idx) => (
                    <div key={idx} className="w-12 h-12 rounded bg-slate-800 shrink-0 border border-slate-700 overflow-hidden cursor-pointer" onClick={() => window.open(file.dataUrl, '_blank')}>
                      <img src={file.dataUrl} alt="anexo" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
