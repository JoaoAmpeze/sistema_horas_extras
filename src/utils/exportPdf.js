import { jsPDF } from "jspdf"
import autoTable from 'jspdf-autotable'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { formatDurationDetailed, formatTimeOnly } from './formatTime'

export default async function exportToPdf(sessions) {
  const doc = new jsPDF()
  
  // Cores do tema
  const primaryColor = [59, 130, 246] // blue-500
  const textColor = [40, 40, 40]
  const mutedColor = [100, 100, 100]

  // Agrupar sessões por mês/ano
  const sessionsByMonth = {}
  
  sessions.forEach(session => {
    const date = parseISO(session.createdAt)
    const monthKey = format(date, "MMMM 'de' yyyy", { locale: ptBR })
    
    if (!sessionsByMonth[monthKey]) {
      sessionsByMonth[monthKey] = {
        totalDuration: 0,
        sessions: []
      }
    }
    
    sessionsByMonth[monthKey].sessions.push(session)
    sessionsByMonth[monthKey].totalDuration += session.duration
  })

  // Para cada mês, gerar uma seção
  const months = Object.keys(sessionsByMonth)
  
  for (let mIndex = 0; mIndex < months.length; mIndex++) {
    const month = months[mIndex]
    const monthData = sessionsByMonth[month]
    
    if (mIndex > 0) {
      doc.addPage()
    }

    // --- CABEÇALHO DO MÊS ---
    doc.setFontSize(22)
    doc.setTextColor(...primaryColor)
    doc.text("Relatório de Horas Extras", 14, 20)
    
    doc.setFontSize(14)
    doc.setTextColor(...textColor)
    // Capitalizar o mês
    const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1)
    doc.text(`Período: ${capitalizedMonth}`, 14, 28)

    // --- TABELA RESUMO MENSAL ---
    const tableData = monthData.sessions.map(s => [
      format(parseISO(s.createdAt), "dd/MM/yyyy"),
      `${formatTimeOnly(s.startTime)} às ${formatTimeOnly(s.endTime)}`,
      formatDurationDetailed(s.duration)
    ])

    // Adiciona linha de total
    tableData.push([
      { content: 'TOTAL DO MÊS', colSpan: 2, styles: { fontStyle: 'bold', halign: 'right' } },
      { content: formatDurationDetailed(monthData.totalDuration), styles: { fontStyle: 'bold', textColor: [20, 150, 50] } }
    ])

    autoTable(doc, {
      startY: 35,
      head: [['Data', 'Horário (Início - Fim)', 'Tempo Gasto']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: primaryColor, textColor: 255 },
      styles: { fontSize: 10, cellPadding: 3 },
      alternateRowStyles: { fillColor: [245, 248, 255] }
    })

    let yOffset = doc.lastAutoTable.finalY + 15

    // --- DETALHAMENTO (Com descrições e anexos) ---
    doc.setFontSize(14)
    doc.setTextColor(...primaryColor)
    doc.text("Detalhamento das Atividades", 14, yOffset)
    yOffset += 8

    for (let i = 0; i < monthData.sessions.length; i++) {
      const session = monthData.sessions[i]
      
      if (yOffset > 270) {
        doc.addPage()
        yOffset = 20
      }

      doc.setFontSize(11)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(...textColor)
      
      const dateStr = format(parseISO(session.createdAt), "dd/MM/yyyy")
      doc.text(`${dateStr} (${formatDurationDetailed(session.duration)})`, 14, yOffset)
      yOffset += 5

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(...mutedColor)
      
      const splitDescription = doc.splitTextToSize(session.description, 180)
      doc.text(splitDescription, 14, yOffset)
      yOffset += (splitDescription.length * 5) + 3

      // Imagens
      if (session.attachments && session.attachments.length > 0) {
        const imgWidth = 40
        const imgHeight = 40
        let xOffset = 14

        for (let j = 0; j < session.attachments.length; j++) {
          const attachment = session.attachments[j]
          
          if (yOffset + imgHeight > 280) {
            doc.addPage()
            yOffset = 20
            xOffset = 14
          }

          if (xOffset + imgWidth > 196) {
             yOffset += imgHeight + 4
             xOffset = 14
          }

          try {
             doc.addImage(attachment.dataUrl, 'JPEG', xOffset, yOffset, imgWidth, imgHeight)
             xOffset += imgWidth + 4
          } catch (e) {
             console.error("Erro ao adicionar imagem", e)
          }
        }
        yOffset += imgHeight + 6
      } else {
        yOffset += 3
      }

      doc.setDrawColor(230, 230, 230)
      doc.line(14, yOffset, 196, yOffset)
      yOffset += 6
    }
  }

  doc.save(`Relatorio_Horas_${format(new Date(), "MMyyyy")}.pdf`)
}
