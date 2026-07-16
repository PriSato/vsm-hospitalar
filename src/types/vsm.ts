// Modelo de dados — ver plano de arquitetura, seção 3

export interface Organization {
  id: string
  name: string
}

export interface Sector {
  id: string
  organizationId: string
  name: string
  color: string
  active: boolean
}

export type VSMVersionKind = 'atual' | 'futuro' | 'ideal'

export interface Position {
  x: number
  y: number
}

export interface ProcessBox {
  id: string
  name: string
  sectorId: string
  /** minutos — tempo de atendimento de um paciente nesta etapa */
  cycleTime: number
  /** minutos — tempo de preparo da sala/equipamento entre atendimentos */
  setupTime: number
  /** 0–1 — disponibilidade da equipe/sala para atender */
  uptime: number
  /** profissionais necessários simultaneamente nesta etapa */
  operators: number
  position: Position
}

export interface InventoryNode {
  id: string
  /** rótulo exibido: "Estoque (fila de espera)" */
  name: string
  /** número de pacientes aguardando nesta fila */
  patientsWaiting: number
  position: Position
}

export type ConnectionKind = 'paciente' | 'informacao'

export interface Connection {
  id: string
  kind: ConnectionKind
  fromId: string
  toId: string
}

export interface VSMMetadata {
  /** pacientes no período de referência */
  demand: number
  /** minutos disponíveis de atendimento no período de referência */
  availableTime: number
  referencePeriodLabel: string
}

export interface Comment {
  id: string
  author: string
  text: string
  createdAt: string
}

export interface HistoryEntry {
  id: string
  author: string
  action: string
  createdAt: string
}

export interface VSMVersion {
  id: string
  kind: VSMVersionKind
  processBoxes: ProcessBox[]
  inventoryNodes: InventoryNode[]
  connections: Connection[]
  metadata: VSMMetadata
}

export interface VSMProject {
  id: string
  name: string
  sectorId: string
  isMultiSector: boolean
  versions: VSMVersion[]
  comments: Comment[]
  history: HistoryEntry[]
  createdAt: string
  updatedAt: string
}
