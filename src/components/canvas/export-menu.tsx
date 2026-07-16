import { useState, type RefObject } from 'react'
import { toPng } from 'html-to-image'
import jsPDF from 'jspdf'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Exportação client-side (sem backend ainda) para PNG/PDF, pra apresentar em
 * reunião de melhoria de processo. Ver plano de arquitetura, seção 2.
 */
export function ExportMenu({ targetRef, fileName }: { targetRef: RefObject<HTMLElement | null>; fileName: string }) {
  const [busy, setBusy] = useState(false)

  const capture = async () => {
    if (!targetRef.current) return null
    return toPng(targetRef.current, { backgroundColor: '#ffffff', pixelRatio: 2 })
  }

  const exportPng = async () => {
    setBusy(true)
    try {
      const dataUrl = await capture()
      if (!dataUrl) return
      const link = document.createElement('a')
      link.download = `${fileName}.png`
      link.href = dataUrl
      link.click()
    } finally {
      setBusy(false)
    }
  }

  const exportPdf = async () => {
    setBusy(true)
    try {
      const dataUrl = await capture()
      if (!dataUrl || !targetRef.current) return
      const { width, height } = targetRef.current.getBoundingClientRect()
      const pdf = new jsPDF({ orientation: width > height ? 'landscape' : 'portrait', unit: 'px', format: [width, height] })
      pdf.addImage(dataUrl, 'PNG', 0, 0, width, height)
      pdf.save(`${fileName}.pdf`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" disabled={busy} onClick={exportPng} className="gap-1.5">
        <Download className="h-3.5 w-3.5" />
        PNG
      </Button>
      <Button variant="outline" size="sm" disabled={busy} onClick={exportPdf} className="gap-1.5">
        <Download className="h-3.5 w-3.5" />
        PDF
      </Button>
    </div>
  )
}
