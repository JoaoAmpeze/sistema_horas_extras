export function formatDurationDetailed(totalSeconds) {
  const hrs = Math.floor(totalSeconds / 3600)
  const mins = Math.floor((totalSeconds % 3600) / 60)
  const secs = totalSeconds % 60
  
  const parts = []
  if (hrs > 0) parts.push(`${hrs}h`)
  if (mins > 0 || hrs > 0) parts.push(`${mins}m`) // Mostra minutos mesmo se for 0, mas tiver horas
  parts.push(`${secs}s`)
  
  return parts.join(' ')
}

export function formatTimeOnly(isoString) {
  if (!isoString) return ''
  const date = new Date(isoString)
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}
