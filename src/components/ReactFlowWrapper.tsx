import { useCallback } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap,
  useNodesState,
  useEdgesState,
  Panel
} from 'reactflow';
import html2canvas from 'html2canvas';

interface Node {
  id: string;
  label: string;
  children?: string[];
}

interface ReactFlowWrapperProps {
  nodesData: Node[];
}

const generateFlow = (nodesData: Node[]) => {
  const nodeMap = new Map();
  const edges: Array<{ id: string; source: string; target: string; type: string; animated: boolean; style: { stroke: string } }> = [];
  
  // Calculate levels for vertical positioning
  const levels = new Map<string, number>();
  const processLevel = (nodeId: string, level: number) => {
    levels.set(nodeId, level);
    const node = nodesData.find(n => n.id === nodeId);
    node?.children?.forEach(childId => {
      processLevel(childId, level + 1);
    });
  };
  
  // Start with root nodes (those with no parents)
  const childrenSet = new Set(nodesData.flatMap(n => n.children || []));
  const rootNodes = nodesData.filter(n => !Array.from(childrenSet).includes(n.id));
  rootNodes.forEach(node => processLevel(node.id, 0));

  // Build nodes with proper positioning
  const nodes = nodesData.map((node) => {
    nodeMap.set(node.id, node.label);
    const level = levels.get(node.id) || 0;
    const nodesAtLevel = nodesData.filter(n => levels.get(n.id) === level).length;
    const index = nodesData.filter(n => levels.get(n.id) === level && n.id <= node.id).length;
    
    return {
      id: node.id,
      type: 'default',
      data: { label: node.label },
      position: { 
        x: (index - nodesAtLevel/2) * 200 + 500, 
        y: level * 100 + 50
      },
      style: {
        background: '#f5f5f5',
        padding: 10,
        borderRadius: 5,
        border: '1px solid #ccc',
        width: 'auto',
        minWidth: 150
      }
    };
  });

  // Build edges
  nodesData.forEach((node) => {
    node.children?.forEach((childId) => {
      edges.push({
        id: `${node.id}-${childId}`,
        source: node.id,
        target: childId,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#555' }
      });
    });
  });

  return { initialNodes: nodes, initialEdges: edges };
};

export default function ReactFlowWrapper({ nodesData }: ReactFlowWrapperProps) {
  const { initialNodes, initialEdges } = generateFlow(nodesData);
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const handleExport = useCallback(() => {
    const element = document.querySelector('.react-flow') as HTMLElement;
    if (element) {
      html2canvas(element, {
        backgroundColor: '#fff'
      }).then((canvas) => {
        const link = document.createElement('a');
        link.download = 'mindmap.png';
        link.href = canvas.toDataURL();
        link.click();
      });
    }
  }, []);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        attributionPosition="bottom-left"
      >
        <Background />
        <Controls />
        <MiniMap />
        <Panel position="top-right">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Export as PNG
          </button>
        </Panel>
      </ReactFlow>
    </div>
  );
}
