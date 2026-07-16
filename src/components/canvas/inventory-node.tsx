import { Handle, Position } from 'reactflow'
import { useVSMStore } from '@/store/vsm-store'
import { FieldLabel } from '@/components/field-label'
import { Input } from '@/components/ui/input'
import type { InventoryNode as InventoryNodeType } from '@/types/vsm'

export interface InventoryNodeData {
  node: InventoryNodeType
  projectId: string
}

/** Fila/espera entre etapas — chamado de "estoque" no vocabulário de VSM. */
export function InventoryNodeComponent({ data }: { data: InventoryNodeData }) {
  const updateInventoryNode = useVSMStore((s) => s.updateInventoryNode)

  return (
    <div className="w-32 rounded-md border-2 border-dashed border-muted-foreground/40 bg-muted px-2 py-2">
      <Handle type="target" position={Position.Left} className="!bg-muted-foreground" />
      <Handle type="source" position={Position.Right} className="!bg-muted-foreground" />
      <FieldLabel glossaryTermId="estoque" />
      <Input
        type="number"
        min={0}
        placeholder="Pacientes"
        value={data.node.patientsWaiting || ''}
        onChange={(e) =>
          updateInventoryNode(data.projectId, data.node.id, { patientsWaiting: Number(e.target.value) })
        }
        className="mt-1 h-7 text-xs"
      />
    </div>
  )
}
