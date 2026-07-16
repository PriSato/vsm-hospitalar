import { useState } from 'react'
import { Handle, Position } from 'reactflow'
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { useVSMStore } from '@/store/vsm-store'
import { sectorById } from '@/lib/sectors'
import { FieldLabel } from '@/components/field-label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { ProcessBox } from '@/types/vsm'

export interface ProcessBoxNodeData {
  box: ProcessBox
  projectId: string
  isBottleneck: boolean
}

/** Nó do editor visual — etapa do atendimento, com divulgação progressiva dos campos avançados. */
export function ProcessBoxNode({ data }: { data: ProcessBoxNodeData }) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const updateProcessBox = useVSMStore((s) => s.updateProcessBox)
  const removeProcessBox = useVSMStore((s) => s.removeProcessBox)
  const sector = sectorById(data.box.sectorId)

  const patch = (fields: Partial<ProcessBox>) => updateProcessBox(data.projectId, data.box.id, fields)

  return (
    <div
      className="w-56 rounded-lg border-2 bg-background shadow-sm"
      style={{ borderColor: data.isBottleneck ? 'var(--color-danger)' : (sector?.color ?? 'var(--color-border)') }}
    >
      <Handle type="target" position={Position.Left} className="!bg-muted-foreground" />
      <Handle type="source" position={Position.Right} className="!bg-muted-foreground" />

      <div
        className="flex items-center justify-between gap-1 rounded-t-md px-2 py-1"
        style={{ background: sector?.color ?? 'var(--color-muted)' }}
      >
        <input
          value={data.box.name}
          onChange={(e) => patch({ name: e.target.value })}
          className="w-full bg-transparent text-xs font-semibold text-white placeholder-white/70 focus:outline-none"
        />
        <button
          type="button"
          aria-label="Remover etapa"
          onClick={() => removeProcessBox(data.projectId, data.box.id)}
          className="text-white/80 hover:text-white"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {data.isBottleneck && (
        <p className="bg-danger-bg px-2 py-1 text-[11px] font-medium text-danger">Gargalo detectado</p>
      )}

      <div className="flex flex-col gap-2 p-2">
        <div>
          <FieldLabel glossaryTermId="tempo-de-ciclo" />
          <Input
            type="number"
            min={0}
            placeholder="Ex: 8"
            value={data.box.cycleTime || ''}
            onChange={(e) => patch({ cycleTime: Number(e.target.value) })}
            className="mt-1 h-7 text-xs"
          />
        </div>

        <div>
          <FieldLabel glossaryTermId="operadores" />
          <Input
            type="number"
            min={0}
            value={data.box.operators || ''}
            onChange={(e) => patch({ operators: Number(e.target.value) })}
            className="mt-1 h-7 text-xs"
          />
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 w-fit gap-1 px-1 text-[11px] text-muted-foreground"
          onClick={() => setShowAdvanced((v) => !v)}
        >
          {showAdvanced ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          {showAdvanced ? 'Ocultar detalhes' : 'Mostrar mais detalhes'}
        </Button>

        {showAdvanced && (
          <>
            <div>
              <FieldLabel glossaryTermId="setup" />
              <Input
                type="number"
                min={0}
                placeholder="Ex: 5"
                value={data.box.setupTime || ''}
                onChange={(e) => patch({ setupTime: Number(e.target.value) })}
                className="mt-1 h-7 text-xs"
              />
            </div>
            <div>
              <FieldLabel glossaryTermId="uptime" />
              <Input
                type="number"
                min={0}
                max={100}
                placeholder="Ex: 90"
                value={Math.round(data.box.uptime * 100) || ''}
                onChange={(e) => patch({ uptime: Number(e.target.value) / 100 })}
                className="mt-1 h-7 text-xs"
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
