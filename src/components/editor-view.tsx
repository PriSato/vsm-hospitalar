import { useMemo, useRef, useState } from 'react'
import { ArrowLeft, BookOpen, Plus } from 'lucide-react'
import { useVSMStore } from '@/store/vsm-store'
import { calculateVSMMetrics } from '@/lib/vsm-engine'
import { buildInsights } from '@/lib/insights'
import { VSMCanvas } from '@/components/canvas/vsm-canvas'
import { MetricsBar } from '@/components/canvas/metrics-bar'
import { InsightsPanel } from '@/components/canvas/insights-panel'
import { ExportMenu } from '@/components/canvas/export-menu'
import { GlossaryPanel } from '@/components/glossary-panel'
import { Button } from '@/components/ui/button'

export function EditorView({ projectId, onBack }: { projectId: string; onBack: () => void }) {
  const project = useVSMStore((s) => s.projects.find((p) => p.id === projectId))
  const addProcessBox = useVSMStore((s) => s.addProcessBox)
  const [glossaryOpen, setGlossaryOpen] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)

  const version = project?.versions[0]

  const metrics = useMemo(() => {
    if (!version) return null
    return calculateVSMMetrics(version.processBoxes, version.inventoryNodes, version.metadata)
  }, [version])

  const insights = useMemo(() => {
    if (!version || !metrics) return []
    return buildInsights(version.processBoxes, version.inventoryNodes, metrics)
  }, [version, metrics])

  if (!project || !version || !metrics) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Mapa não encontrado.
        <Button variant="ghost" onClick={onBack} className="ml-2">
          Voltar
        </Button>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b border-border bg-background px-4 py-2">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} aria-label="Voltar">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-sm font-semibold text-foreground">{project.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => addProcessBox(project.id, 'Nova etapa', project.sectorId)}
          >
            <Plus className="h-3.5 w-3.5" />
            Etapa
          </Button>
          <ExportMenu targetRef={canvasRef} fileName={project.name} />
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setGlossaryOpen((v) => !v)}>
            <BookOpen className="h-3.5 w-3.5" />
            Glossário
          </Button>
        </div>
      </header>

      <MetricsBar project={project} metrics={metrics} />

      <div className="min-h-0 flex-1" ref={canvasRef}>
        <VSMCanvas project={project} />
      </div>

      <InsightsPanel insights={insights} />

      <GlossaryPanel open={glossaryOpen} onClose={() => setGlossaryOpen(false)} />
    </div>
  )
}
