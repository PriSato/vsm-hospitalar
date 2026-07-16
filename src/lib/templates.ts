import type { Connection, InventoryNode, ProcessBox, VSMMetadata, VSMVersion } from '@/types/vsm'

export interface VSMTemplate {
  id: string
  name: string
  description: string
  steps: string[]
}

// Pontos de partida prontos por tipo de fluxo hospitalar — ver plano de
// arquitetura, seção 6.1. Evita que o usuário comece de uma tela em branco.
export const VSM_TEMPLATES: VSMTemplate[] = [
  {
    id: 'jornada-emergencia',
    name: 'Jornada do paciente na Emergência',
    description: 'Do momento em que o paciente chega até a alta ou internação.',
    steps: ['Recepção', 'Triagem', 'Consulta', 'Exame', 'Decisão', 'Alta/Internação'],
  },
  {
    id: 'fluxo-internacao',
    name: 'Fluxo de internação até alta',
    description: 'Da entrada na unidade de internação até a alta do paciente.',
    steps: ['Admissão', 'Avaliação inicial', 'Tratamento', 'Reavaliação diária', 'Planejamento de alta', 'Alta'],
  },
  {
    id: 'fluxo-exame-imagem',
    name: 'Fluxo de exame de imagem',
    description: 'Da solicitação do exame até o laudo entregue ao médico responsável.',
    steps: ['Solicitação', 'Agendamento', 'Preparo do paciente', 'Realização do exame', 'Laudo', 'Entrega ao médico'],
  },
  {
    id: 'fluxo-cirurgia-eletiva',
    name: 'Fluxo de cirurgia eletiva',
    description: 'Do agendamento da cirurgia até a alta pós-operatória.',
    steps: ['Agendamento cirúrgico', 'Avaliação pré-anestésica', 'Preparo pré-operatório', 'Cirurgia', 'Recuperação pós-anestésica', 'Alta'],
  },
]

const STEP_SPACING_X = 260
const INVENTORY_OFFSET_X = 170
const ROW_Y = 120

/**
 * Gera etapas pré-desenhadas a partir do template; o usuário só ajusta e
 * preenche com os tempos reais, em vez de desenhar do zero.
 */
export function buildVersionFromSteps(
  steps: string[],
  sectorId: string,
): Pick<VSMVersion, 'processBoxes' | 'inventoryNodes' | 'connections'> {
  const processBoxes: ProcessBox[] = steps.map((name, index) => ({
    id: `proc_${cryptoId()}`,
    name,
    sectorId,
    cycleTime: 0,
    setupTime: 0,
    uptime: 0.9,
    operators: 1,
    position: { x: index * STEP_SPACING_X, y: ROW_Y },
  }))

  const inventoryNodes: InventoryNode[] = []
  const connections: Connection[] = []

  for (let i = 0; i < processBoxes.length; i++) {
    if (i > 0) {
      const prev = processBoxes[i - 1]
      const inventory: InventoryNode = {
        id: `inv_${cryptoId()}`,
        name: 'Estoque (fila de espera)',
        patientsWaiting: 0,
        position: { x: prev.position.x + INVENTORY_OFFSET_X, y: ROW_Y + 90 },
      }
      inventoryNodes.push(inventory)

      connections.push({ id: `conn_${cryptoId()}`, kind: 'paciente', fromId: prev.id, toId: inventory.id })
      connections.push({ id: `conn_${cryptoId()}`, kind: 'paciente', fromId: inventory.id, toId: processBoxes[i].id })
    }
  }

  return { processBoxes, inventoryNodes, connections }
}

export function defaultMetadata(): VSMMetadata {
  return { demand: 0, availableTime: 0, referencePeriodLabel: 'Turno de 8h' }
}

function cryptoId(): string {
  return Math.random().toString(36).slice(2, 10)
}
