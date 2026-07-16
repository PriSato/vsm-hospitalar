import type { Sector } from '@/types/vsm'

// Setores padrão de um hospital de grande porte — ver plano de arquitetura,
// seção 9. Cada setor tem uma cor própria, reaproveitada nos nós do canvas.
export const DEFAULT_SECTORS: Sector[] = [
  { id: 'sec_emergencia', organizationId: 'org_default', name: 'Emergência', color: 'var(--color-sector-1)', active: true },
  { id: 'sec_centro_cirurgico', organizationId: 'org_default', name: 'Centro Cirúrgico', color: 'var(--color-sector-2)', active: true },
  { id: 'sec_uti', organizationId: 'org_default', name: 'UTI', color: 'var(--color-sector-3)', active: true },
  { id: 'sec_laboratorio', organizationId: 'org_default', name: 'Laboratório', color: 'var(--color-sector-4)', active: true },
  { id: 'sec_radiologia', organizationId: 'org_default', name: 'Radiologia', color: 'var(--color-sector-5)', active: true },
  { id: 'sec_farmacia', organizationId: 'org_default', name: 'Farmácia', color: 'var(--color-sector-6)', active: true },
  { id: 'sec_internacao', organizationId: 'org_default', name: 'Internação', color: 'var(--color-sector-7)', active: true },
]

export function sectorById(id: string): Sector | undefined {
  return DEFAULT_SECTORS.find((s) => s.id === id)
}
