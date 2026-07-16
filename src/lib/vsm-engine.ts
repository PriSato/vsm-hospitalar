import type { InventoryNode, ProcessBox, VSMMetadata } from '@/types/vsm'

export interface BottleneckInfo {
  processBoxId: string
  processBoxName: string
  cycleTime: number
}

export interface VSMMetrics {
  /** ritmo de atendimento necessário para dar conta da demanda, em minutos/paciente */
  taktTime: number
  /** tempo total que o paciente passa no fluxo, do início ao fim, em minutos */
  leadTime: number
  /** tempo em que o paciente está de fato sendo atendido, em minutos */
  valueAddedTime: number
  /** percentual do lead time que é atendimento de fato (0–100) */
  percentValueAdded: number
  /** etapa que trava o fluxo por não acompanhar o ritmo necessário, se houver */
  bottleneck: BottleneckInfo | null
  /** tempo total de espera em filas, em minutos */
  totalWaitTime: number
}

/**
 * Função pura, reaproveitada no editor (cálculo ao vivo) e em relatórios.
 * Ver plano de arquitetura, seção 4.
 */
export function calculateVSMMetrics(
  processBoxes: ProcessBox[],
  inventoryNodes: InventoryNode[],
  metadata: VSMMetadata,
): VSMMetrics {
  const taktTime = metadata.demand > 0 ? metadata.availableTime / metadata.demand : 0

  const valueAddedTime = processBoxes.reduce((sum, box) => sum + box.cycleTime, 0)

  // aproximação clássica de VSM: pacientes na fila × takt time
  const totalWaitTime = inventoryNodes.reduce(
    (sum, node) => sum + node.patientsWaiting * taktTime,
    0,
  )

  const leadTime = valueAddedTime + totalWaitTime

  const percentValueAdded = leadTime > 0 ? (valueAddedTime / leadTime) * 100 : 0

  const bottleneck = findBottleneck(processBoxes, taktTime)

  return {
    taktTime,
    leadTime,
    valueAddedTime,
    percentValueAdded,
    bottleneck,
    totalWaitTime,
  }
}

function findBottleneck(processBoxes: ProcessBox[], taktTime: number): BottleneckInfo | null {
  if (taktTime <= 0) return null

  let worst: ProcessBox | null = null
  for (const box of processBoxes) {
    if (box.cycleTime >= taktTime && (worst === null || box.cycleTime > worst.cycleTime)) {
      worst = box
    }
  }

  if (!worst) return null

  return {
    processBoxId: worst.id,
    processBoxName: worst.name,
    cycleTime: worst.cycleTime,
  }
}
