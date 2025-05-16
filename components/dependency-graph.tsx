"use client"

import { useState, useCallback, useMemo } from "react"
import ReactFlow, {
  type Node,
  type Edge,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type NodeTypes,
  type NodeProps,
  Handle,
  Position,
  useReactFlow,
  ReactFlowProvider,
} from "reactflow"
import { FileText, Package, Settings, Database, Layout, Globe, Server } from "lucide-react"
import "reactflow/dist/style.css"

// Custom node components for different file types
const FileNode = ({ data, selected }: NodeProps) => {
  const Icon = data.icon || FileText

  return (
    <div className={`px-4 py-2 shadow-md rounded-md border ${selected ? "border-primary" : "border-border"} bg-card`}>
      <div className="flex items-center">
        <Icon className={`mr-2 h-5 w-5 ${data.iconColor || "text-muted-foreground"}`} />
        <div>
          <div className="text-sm font-medium">{data.label}</div>
          <div className="text-xs text-muted-foreground">{data.type}</div>
        </div>
      </div>
      <Handle type="target" position={Position.Top} className="w-2 h-2" />
      <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
    </div>
  )
}

// Sample data representing a typical React/Next.js project
const initialNodes: Node[] = [
  {
    id: "app-page",
    type: "file",
    data: { label: "page.tsx", type: "Page Component", icon: Layout, iconColor: "text-blue-500" },
    position: { x: 250, y: 0 },
  },
  {
    id: "app-layout",
    type: "file",
    data: { label: "layout.tsx", type: "Layout Component", icon: Layout, iconColor: "text-blue-500" },
    position: { x: 250, y: 100 },
  },
  {
    id: "components-header",
    type: "file",
    data: { label: "header.tsx", type: "UI Component", icon: Layout, iconColor: "text-indigo-500" },
    position: { x: 100, y: 200 },
  },
  {
    id: "components-footer",
    type: "file",
    data: { label: "footer.tsx", type: "UI Component", icon: Layout, iconColor: "text-indigo-500" },
    position: { x: 400, y: 200 },
  },
  {
    id: "lib-utils",
    type: "file",
    data: { label: "utils.ts", type: "Utility", icon: Settings, iconColor: "text-gray-500" },
    position: { x: 0, y: 300 },
  },
  {
    id: "lib-api",
    type: "file",
    data: { label: "api.ts", type: "API Client", icon: Globe, iconColor: "text-green-500" },
    position: { x: 200, y: 300 },
  },
  {
    id: "components-button",
    type: "file",
    data: { label: "button.tsx", type: "UI Component", icon: Layout, iconColor: "text-indigo-500" },
    position: { x: 400, y: 300 },
  },
  {
    id: "app-api-route",
    type: "file",
    data: { label: "route.ts", type: "API Route", icon: Server, iconColor: "text-red-500" },
    position: { x: 600, y: 300 },
  },
  {
    id: "db-schema",
    type: "file",
    data: { label: "schema.ts", type: "Database Schema", icon: Database, iconColor: "text-yellow-500" },
    position: { x: 200, y: 400 },
  },
  {
    id: "package-json",
    type: "file",
    data: { label: "package.json", type: "Config", icon: Package, iconColor: "text-orange-500" },
    position: { x: 400, y: 400 },
  },
]

const initialEdges: Edge[] = [
  { id: "e1-2", source: "app-page", target: "app-layout", animated: true },
  { id: "e1-3", source: "app-layout", target: "components-header", animated: true },
  { id: "e1-4", source: "app-layout", target: "components-footer", animated: true },
  { id: "e2-5", source: "components-header", target: "lib-utils", animated: true },
  { id: "e2-6", source: "components-header", target: "lib-api", animated: true },
  { id: "e3-6", source: "components-footer", target: "components-button", animated: true },
  { id: "e4-7", source: "lib-api", target: "app-api-route", animated: true },
  { id: "e5-8", source: "app-api-route", target: "db-schema", animated: true },
  { id: "e6-9", source: "lib-api", target: "db-schema", animated: true },
]

// Inner component that uses ReactFlow hooks
function Flow() {
  // Define node types
  const nodeTypes: NodeTypes = useMemo(() => ({ file: FileNode }), [])

  // Set up state for nodes and edges
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const { setCenter } = useReactFlow()

  // Handle new connections between nodes
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges],
  )

  // Handle node selection to highlight dependencies
  const onNodeClick = useCallback(
    (_, node: Node) => {
      setSelectedNode(node.id === selectedNode ? null : node.id)

      // Update nodes and edges to highlight dependencies
      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          style: {
            ...n.style,
            opacity:
              !selectedNode ||
              n.id === node.id ||
              edges.some(
                (e) => (e.source === node.id && e.target === n.id) || (e.target === node.id && e.source === n.id),
              )
                ? 1
                : 0.25,
          },
        })),
      )

      setEdges((eds) =>
        eds.map((e) => ({
          ...e,
          style: {
            ...e.style,
            opacity: !selectedNode || e.source === node.id || e.target === node.id ? 1 : 0.25,
            stroke: e.source === node.id || e.target === node.id ? "#3b82f6" : undefined,
            strokeWidth: e.source === node.id || e.target === node.id ? 2 : 1,
          },
        })),
      )

      // Center view on selected node
      if (node.id !== selectedNode) {
        const nodePosition = node.position
        setCenter(nodePosition.x, nodePosition.y, { duration: 800, zoom: 1.5 })
      }
    },
    [selectedNode, setNodes, setEdges, edges, setCenter],
  )

  // Reset highlighting when clicking on the background
  const onPaneClick = useCallback(() => {
    if (selectedNode) {
      setSelectedNode(null)
      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          style: { ...n.style, opacity: 1 },
        })),
      )
      setEdges((eds) =>
        eds.map((e) => ({
          ...e,
          style: { ...e.style, opacity: 1, stroke: undefined, strokeWidth: 1 },
        })),
      )
    }
  }, [selectedNode, setNodes, setEdges])

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeClick={onNodeClick}
      onPaneClick={onPaneClick}
      nodeTypes={nodeTypes}
      fitView
      attributionPosition="bottom-right"
    >
      <Controls />
      <MiniMap
        nodeStrokeColor={(n) => {
          return n.style?.stroke || "#555"
        }}
        nodeColor={(n) => {
          return n.data.iconColor || "#fff"
        }}
        nodeBorderRadius={2}
      />
      <Background color="#aaa" gap={16} />
    </ReactFlow>
  )
}

// Main component that provides the ReactFlow context
export default function DependencyGraph() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  )
}
