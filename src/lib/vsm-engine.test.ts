import { describe, expect, it } from 'vitest'
import { calculateVSMMetrics } from './vsm-engine'
import type { InventoryNode, ProcessBox, VSMMetadata } from '@/types/vsm'

function makeBox(overrides: Partial<ProcessBox>): ProcessBox {
  return {
    id: 'proc_1',
    name: 'Triagem',
    sectorId: 'sec_emergencia',
    cycleTime: 8,
    setupTime: 5,
    uptime: 0.9,
    operators: 2,
    position: { x: 0, y: 0 },
    ...overrides,
  }
}

function makeInventory(overrides: Partial<InventoryNode>): InventoryNode {
  return {
    id: 'inv_1',
    name: 'Estoque (fila de espera)',
    patientsWaiting: 0,
    position: { x: 0, y: 0 },
    ...overrides,
  }
}

const metadata: VSMMetadata = {
  demand: 60,
  availableTime: 480, // 8h de turno = 480 min
  referencePeriodLabel: 'Turno de 8h',
}

describe('calculateVSMMetrics', () => {
  it('calcula takt time = tempo disponível / demanda', () => {
    const metrics = calculateVSMMetrics([], [], metadata)
    expect(metrics.taktTime).toBe(8) // 480 / 60 = 8 min/paciente
  })

  it('retorna takt time 0 quando não há demanda (evita divisão por zero)', () => {
    const metrics = calculateVSMMetrics([], [], { ...metadata, demand: 0 })
    expect(metrics.taktTime).toBe(0)
  })

  it('soma o tempo de atendimento efetivo (valor agregado) das etapas', () => {
    const boxes = [makeBox({ cycleTime: 8 }), makeBox({ id: 'proc_2', cycleTime: 12 })]
    const metrics = calculateVSMMetrics(boxes, [], metadata)
    expect(metrics.valueAddedTime).toBe(20)
  })

  it('calcula tempo de espera em fila como pacientes na fila × takt time', () => {
    const inventory = [makeInventory({ patientsWaiting: 3 })]
    const metrics = calculateVSMMetrics([], inventory, metadata)
    // takt time = 8, 3 pacientes * 8 = 24
    expect(metrics.totalWaitTime).toBe(24)
  })

  it('lead time = valor agregado + tempo de espera', () => {
    const boxes = [makeBox({ cycleTime: 8 })]
    const inventory = [makeInventory({ patientsWaiting: 3 })]
    const metrics = calculateVSMMetrics(boxes, inventory, metadata)
    expect(metrics.leadTime).toBe(8 + 24)
  })

  it('%VA = valor agregado / lead time', () => {
    const boxes = [makeBox({ cycleTime: 8 })]
    const inventory = [makeInventory({ patientsWaiting: 3 })]
    const metrics = calculateVSMMetrics(boxes, inventory, metadata)
    expect(metrics.percentValueAdded).toBeCloseTo((8 / 32) * 100)
  })

  it('retorna %VA 0 quando lead time é 0 (evita divisão por zero)', () => {
    const metrics = calculateVSMMetrics([], [], metadata)
    expect(metrics.percentValueAdded).toBe(0)
  })

  it('identifica gargalo: etapa cujo tempo de ciclo é >= takt time', () => {
    const boxes = [makeBox({ id: 'proc_1', name: 'Triagem', cycleTime: 5 }), makeBox({ id: 'proc_2', name: 'Consulta', cycleTime: 10 })]
    const metrics = calculateVSMMetrics(boxes, [], metadata) // takt = 8
    expect(metrics.bottleneck?.processBoxId).toBe('proc_2')
    expect(metrics.bottleneck?.processBoxName).toBe('Consulta')
  })

  it('não identifica gargalo quando todas as etapas estão abaixo do takt time', () => {
    const boxes = [makeBox({ cycleTime: 5 })]
    const metrics = calculateVSMMetrics(boxes, [], metadata) // takt = 8
    expect(metrics.bottleneck).toBeNull()
  })

  it('escolhe o pior gargalo quando há mais de uma etapa acima do takt time', () => {
    const boxes = [
      makeBox({ id: 'proc_1', name: 'Triagem', cycleTime: 9 }),
      makeBox({ id: 'proc_2', name: 'Consulta', cycleTime: 15 }),
    ]
    const metrics = calculateVSMMetrics(boxes, [], metadata) // takt = 8
    expect(metrics.bottleneck?.processBoxId).toBe('proc_2')
  })
})
