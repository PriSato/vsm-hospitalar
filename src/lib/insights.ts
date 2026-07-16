import type { InventoryNode, ProcessBox } from '@/types/vsm'
import type { VSMMetrics } from '@/lib/vsm-engine'

export type InsightSeverity = 'atencao' | 'alerta'

export interface Insight {
  id: string
  severity: InsightSeverity
  /** id do termo no glossário (ver glossary.ts), pra reaproveitar a explicação do conceito */
  glossaryTermId: string
  message: string
}

// Limiares das regras determinísticas — ver plano de arquitetura, seção 5.
const UPTIME_THRESHOLD = 0.85
const SETUP_TO_CYCLE_RATIO_THRESHOLD = 0.5
const WAIT_SHARE_OF_LEAD_TIME_THRESHOLD = 0.3
const LOW_VA_THRESHOLD_PERCENT = 15

/**
 * Regras determinísticas (sem ML), fáceis de auditar. Cada alerta conecta o
 * dado ao impacto no paciente, evitando soar como "otimização de fábrica".
 */
export function buildInsights(
  processBoxes: ProcessBox[],
  inventoryNodes: InventoryNode[],
  metrics: VSMMetrics,
): Insight[] {
  const insights: Insight[] = []

  if (metrics.bottleneck) {
    insights.push({
      id: `gargalo-${metrics.bottleneck.processBoxId}`,
      severity: 'alerta',
      glossaryTermId: 'gargalo',
      message: `Gargalo detectado em ${metrics.bottleneck.processBoxName}: o tempo de ciclo está acima do takt time — isso tende a gerar fila nas etapas seguintes.`,
    })
  }

  for (const box of processBoxes) {
    if (box.uptime < UPTIME_THRESHOLD) {
      insights.push({
        id: `uptime-${box.id}`,
        severity: 'atencao',
        glossaryTermId: 'uptime',
        message: `Uptime de ${box.name} está em ${Math.round(box.uptime * 100)}% — vale investigar paradas, manutenção ou falta de profissional.`,
      })
    }

    if (box.cycleTime > 0 && box.setupTime > box.cycleTime * SETUP_TO_CYCLE_RATIO_THRESHOLD) {
      insights.push({
        id: `setup-${box.id}`,
        severity: 'atencao',
        glossaryTermId: 'setup',
        message: `Setup elevado em ${box.name} — pode valer revisar a rotina de higienização/troca de sala.`,
      })
    }
  }

  if (metrics.leadTime > 0) {
    for (const node of inventoryNodes) {
      const waitTime = node.patientsWaiting * metrics.taktTime
      const shareOfLeadTime = waitTime / metrics.leadTime
      if (shareOfLeadTime > WAIT_SHARE_OF_LEAD_TIME_THRESHOLD) {
        insights.push({
          id: `espera-${node.id}`,
          severity: 'alerta',
          glossaryTermId: 'estoque',
          message: `Tempo de espera em ${node.name}: ${Math.round(waitTime)} minutos, o que representa ${Math.round(shareOfLeadTime * 100)}% do lead time.`,
        })
      }
    }
  }

  if (processBoxes.length > 0 && metrics.percentValueAdded < LOW_VA_THRESHOLD_PERCENT) {
    insights.push({
      id: 'va-baixo',
      severity: 'atencao',
      glossaryTermId: 'va',
      message: `% VA está abaixo de ${LOW_VA_THRESHOLD_PERCENT}% neste fluxo — bom indicador de onde focar melhorias.`,
    })
  }

  return insights
}
