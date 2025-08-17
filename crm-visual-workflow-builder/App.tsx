
import React, { useState, useCallback, useRef, DragEvent } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { WorkflowCanvas } from './components/WorkflowCanvas';
import { PropertiesPanel } from './components/PropertiesPanel';
import { ReportingModal } from './components/ReportingModal';
import { AIGeneratorModal } from './components/AIGeneratorModal';
import { Node, Edge, WorkflowNode, NodeType, DraggableNode } from './types';
import { INITIAL_NODES, INITIAL_EDGES } from './constants';

const App: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>(INITIAL_NODES);
  const [edges, setEdges] = useState<Edge[]>(INITIAL_EDGES);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isReportingModalOpen, setReportingModalOpen] = useState(false);
  const [isAIGeneratorOpen, setAIGeneratorOpen] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);

  const updateNode = useCallback((id: string, data: Partial<Node['data']>) => {
    setNodes((currentNodes) =>
      currentNodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, ...data } } : node
      )
    );
  }, []);

  const addNode = (node: DraggableNode, position: { x: number; y: number }) => {
    const newNode: Node = {
      id: `${node.type.toLowerCase()}_${Date.now()}`,
      type: node.type,
      position,
      data: { ...node.data, label: `${node.type} Node` },
    };
    setNodes((nds) => [...nds, newNode]);
  };
  
  const addEdge = useCallback((sourceId: string, targetId: string) => {
    // Prevent self-connections or duplicate edges
    if (sourceId === targetId || edges.some(e => e.source === sourceId && e.target === targetId)) {
      return;
    }
    const newEdge: Edge = {
      id: `e${sourceId}-${targetId}_${Date.now()}`,
      source: sourceId,
      target: targetId,
    };
    setEdges((eds) => [...eds, newEdge]);
  }, [edges]);


  const onDrop = useCallback((event: DragEvent<HTMLDivElement>, position: {x: number; y: number}) => {
    event.preventDefault();
    if (!canvasRef.current) return;

    const draggableNodeString = event.dataTransfer.getData('application/reactflow');
    if (!draggableNodeString) return;

    const draggableNode: DraggableNode = JSON.parse(draggableNodeString);

    addNode(draggableNode, position);
  }, []);

  const onDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const selectedNode = nodes.find((node) => node.id === selectedNodeId) || null;

  const loadGeneratedWorkflow = (workflow: { nodes: Node[], edges: Edge[] }) => {
    setNodes(workflow.nodes);
    setEdges(workflow.edges);
    setSelectedNodeId(null);
  };


  return (
    <div className="flex flex-col h-screen font-sans antialiased text-gray-800">
      <Header
        onToggleReporting={() => setReportingModalOpen(true)}
        onGenerateWithAI={() => setAIGeneratorOpen(true)}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex bg-slate-200">
          <WorkflowCanvas
            ref={canvasRef}
            nodes={nodes}
            edges={edges}
            onNodeClick={(id) => setSelectedNodeId(id)}
            onDrop={onDrop}
            onDragOver={onDragOver}
            selectedNodeId={selectedNodeId}
            setNodes={setNodes}
            onAddEdge={addEdge}
          />
          {selectedNode && (
            <PropertiesPanel
              key={selectedNode.id}
              node={selectedNode}
              nodes={nodes}
              edges={edges}
              onUpdate={updateNode}
              onClose={() => setSelectedNodeId(null)}
            />
          )}
        </main>
      </div>
      {isReportingModalOpen && (
        <ReportingModal onClose={() => setReportingModalOpen(false)} />
      )}
      {isAIGeneratorOpen && (
        <AIGeneratorModal 
          onClose={() => setAIGeneratorOpen(false)} 
          onApply={loadGeneratedWorkflow}
        />
      )}
    </div>
  );
};

export default App;