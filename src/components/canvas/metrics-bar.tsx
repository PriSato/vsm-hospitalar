import { FieldLabel } from '@/components/field-label'
import { Input } from '@/components/ui/input'
import { useVSMStore } from '@/store/vsm-store'
import type { VSMMetrics } from '@/lib/vsm-engine'
import type { VSMProject } from '@/types/vsm'

function formatMinutes(value: number): string {
  return `${Math.round(value)} min`
}

export function MetricsBar({ project, metrics }: { project: VSMProject; metrics: VSMMetrics }) {
  const updateMetadata = useVSMStore((s) => s.updateMetadata)
  const metadata = project.versions[0].metadata

  return (
    <div className="flex flex-wrap items-end gap-4 border-b border-border bg-background px-4 py-3">
      <div>
        <FieldLabel glossaryTermId="demanda" htmlFor="demand" />
        <Input
          id="demand"
          type="number"
          min={0}
          placeholder="Ex: 60"
          value={metadata.demand || ''}
          onChange={(e) => updateMetadata(project.id, { demand: Number(e.target.value) })}
          className="mt-1 h-8 w-28 text-xs"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground" htmlFor="availableTime">
          Tempo disponível (min)
        </label>
        <Input
          id="availableTime"
          type="number"
          min={0}
          placeholder="Ex: 480"
          value={metadata.availableTime || ''}
          onChange={(e) => updateMetadata(project.id, { availableTime: Number(e.target.value) })}
          className="mt-1 h-8 w-28 text-xs"
        />
      </div>

      <div className="ml-auto flex flex-wrap gap-6">
        <Metric glossaryTermId="takt-time" value={formatMinutes(metrics.taktTime)} />
        <Metric glossaryTermId="lead-time" value={formatMinutes(metrics.leadTime)} />
        <Metric glossaryTermId="va" value={`${Math.round(metrics.percentValueAdded)}%`} />
      </div>
    </div>
  )
}

function Metric({ glossaryTermId, value }: { glossaryTermId: string; value: string }) {
  return (
    <div className="text-right">
      <FieldLabel glossaryTermId={glossaryTermId} />
      <p className="mt-1 text-lg font-semibold text-foreground">{value}</p>
    </div>
  )
}
