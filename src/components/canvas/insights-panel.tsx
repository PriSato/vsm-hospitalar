import { AlertTriangle, Info as InfoIcon } from 'lucide-react'
import { InfoTooltip } from '@/components/info-tooltip'
import { GLOSSARY_TERMS } from '@/lib/glossary'
import type { Insight } from '@/lib/insights'
import { cn } from '@/lib/utils'

/** Painel de insights ao lado do mapa — conecta o dado ao impacto no paciente. Ver plano, seção 5. */
export function InsightsPanel({ insights }: { insights: Insight[] }) {
  if (insights.length === 0) {
    return (
      <div className="border-t border-border bg-background p-4 text-xs text-muted-foreground">
        Nenhum ponto de atenção identificado até agora — preencha os tempos das etapas para ver os insights.
      </div>
    )
  }

  return (
    <div className="max-h-56 overflow-y-auto border-t border-border bg-background p-4">
      <h2 className="mb-2 text-sm font-semibold text-foreground">Insights</h2>
      <ul className="flex flex-col gap-2">
        {insights.map((insight) => {
          const term = GLOSSARY_TERMS.find((t) => t.id === insight.glossaryTermId)
          return (
            <li
              key={insight.id}
              className={cn(
                'flex items-start gap-2 rounded-md p-2 text-xs',
                insight.severity === 'alerta' ? 'bg-danger-bg text-danger' : 'bg-warning-bg text-warning',
              )}
            >
              {insight.severity === 'alerta' ? (
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              ) : (
                <InfoIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              )}
              <span className="flex-1">{insight.message}</span>
              {term && <InfoTooltip term={term} />}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
