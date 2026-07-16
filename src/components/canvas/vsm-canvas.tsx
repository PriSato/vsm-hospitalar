import { useMemo, useCallback } from 'react'
import ReactFlow, { Background, Controls, type Edge, type Node, type NodeDragHandler } from 'reactflow'
import 'reactflow/dist/style.css'
import { useVSMStore } from '@/store/vsm-store'
import { calculateVSMMetrics } from '@/lib/vsm-engine'
import { ProcessBoxNode } from '@/components/canvas/process-box-node'
import { InventoryNodeComponent } from '@/components/canvas/inventory-node'
import type { VSMProject } from '@/types/vsm'

const nodeTypes = {
  processBox: ProcessBoxNode,
  inventory: InventoryNodeComponent,
}

export function VSMCanvas({ project }: { project: VSMProject }) {
  const updateNodePosition = useVSMStore((s) => s.updateNodePosition)
  const version = project.versions[0]

  const metrics = useMemo(
    () => calculateVSMMetrics(version.processBoxes, version.inventoryNodes, version.metadata),
    [version.processBoxes, version.inventoryNodes, version.metadata],
  )

  const nodes: Node[] = useMemo(() => {
    const boxNodes: Node[] = version.processBoxes.map((box) => ({
      id: box.id,
      type: 'processBox',
      position: box.position,
      data: { box, projectId: project.id, isBottleneck: metrics.bottleneck?.processBoxId === box.id },
      draggable: true,
    }))
    const inventoryRfNodes: Node[] = version.inventoryNodes.map((node) => ({
      id: node.id,
      type: 'inventory',
      position: node.position,
      data: { node, projectId: project.id },
      draggable: true,
    }))
    return [...boxNodes, ...inventoryRfNodes]
  }, [version.processBoxes, version.inventoryNodes, project.id, metrics.bottleneck])

  const edges: Edge[] = useMemo(
    () =>
      version.connections.map((conn) => ({
        id: conn.id,
        source: conn.fromId,
        target: conn.toId,
        animated: conn.kind === 'paciente',
        style: conn.kind === 'informacao' ? { strokeDasharray: '4 4' } : undefined,
      })),
    [version.connections],
  )

  const onNodeDragStop: NodeDragHandler = useCallback(
    (_event, node) => {
      updateNodePosition(project.id, node.id, node.position)
    },
    [project.id, updateNodePosition],
  )

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeDragStop={onNodeDragStop}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={20} />
        <Controls />
      </ReactFlow>
    </div>
  )
}
