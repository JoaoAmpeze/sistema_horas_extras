import { useState, useRef } from 'react'
import { saveSession } from '../db/database'
import { Camera, X, Check, Paperclip } from 'lucide-react'
import { formatDurationDetailed } from '../utils/formatTime'

export default function SessionModal({ duration, startTime, onSave, onCancel }) {
  const [description, setDescription] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [attachments, setAttachments] = useState([])
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    // Convertendo as imagens para Base64 para salvar no IndexedDB
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAttachments(prev => [...prev, { name: file.name, dataUrl: reader.result }])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    if (!description.trim()) {
      alert("Por favor, adicione uma descrição do que foi feito.")
      return
    }

    setIsSaving(true)
    const endTime = new Date().toISOString()
    
    await saveSession({
      startTime,
      endTime,
      duration,
      description,
      attachments
    })
    
    setIsSaving(false)
    onSave()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-slate-700 animate-fade-in-up">
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Salvar Sessão</h2>
          <button onClick={onCancel} className="text-textMuted hover:text-white p-1 rounded-full bg-slate-800">
            <X size={20} />
          </button>
        </div>

        <div className="mb-6 p-4 bg-slate-800/50 rounded-xl flex justify-between items-center">
          <div>
            <p className="text-sm text-textMuted">Tempo Registrado</p>
            <p className="text-lg font-bold text-primary">{formatDurationDetailed(duration)}</p>
          </div>
          <Check className="text-emerald-500" size={24} />
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-textMuted mb-2">
              O que você fez?
            </label>
            <textarea 
              className="input-field min-h-[100px] resize-none"
              placeholder="Ex: Desenvolvimento da tela de login..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-textMuted mb-2">
              Anexos (Opcional)
            </label>
            
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              multiple
              onChange={handleFileChange}
            />
            
            <button 
              onClick={() => fileInputRef.current.click()}
              className="w-full py-3 border-2 border-dashed border-slate-700 hover:border-primary/50 hover:bg-slate-800/50 rounded-xl flex items-center justify-center gap-2 text-textMuted transition-colors"
            >
              <Camera size={20} />
              <span>Adicionar Foto ou Print</span>
            </button>

            {attachments.length > 0 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
                {attachments.map((file, index) => (
                  <div key={index} className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-slate-700">
                    <img src={file.dataUrl} alt="anexo" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => removeAttachment(index)}
                      className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 text-white hover:text-red-400"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="btn-primary w-full mt-8 flex justify-center items-center gap-2"
        >
          {isSaving ? 'Salvando...' : 'Salvar Registro'}
        </button>
      </div>
    </div>
  )
}
