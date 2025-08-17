
import React, { forwardRef, useRef, DragEvent, useState, MouseEvent, WheelEvent } from 'react';
import { Node, Edge } from '../types';
import { NodeComponent } from './Node';
import { PlusIcon, MinusIcon, FrameIcon } from './icons';

interface WorkflowCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodeClick: (id: string) => void;
  onDrop: (event: DragEvent<HTMLDivElement>, position: {x:number, y:number}) => void;
  onDragOver: (event: DragEvent<HTMLDivElement>) => void;
  selectedNodeId: string | null;
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  onAddEdge: (sourceId: string, targetId: string) => void;
}

const SvgEdge: React.FC<{ edge: Edge; nodes: Node[] }> = ({ edge, nodes }) => {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);

    if (!sourceNode || !targetNode) return null;

    const startX = sourceNode.position.x + 208; // width of node
    const startY = sourceNode.position.y + 36; // half height
    const endX = targetNode.position.x;
    const endY = targetNode.position.y + 36;

    const dx = endX - startX;
    
    const path = `M ${startX},${startY} C ${startX + Math.abs(dx)*0.6},${startY} ${endX - Math.abs(dx)*0.6},${endY} ${endX},${endY}`;
    
    return (
        <g>
            <path d={path} stroke="#9ca3af" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" />
            <path d={path} id={`path-${edge.id}`} fill="none" />
            {edge.label && (
                 <text dy="-6" textAnchor="middle" fill="#6b7280" fontSize="12" fontWeight="500" className="pointer-events-none">
                    <textPath href={`#path-${edge.id}`} startOffset="50%">
                        {edge.label}
                    </textPath>
                </text>
            )}
        </g>
    );
};


export const WorkflowCanvas = forwardRef<HTMLDivElement, WorkflowCanvasProps>(
  ({ nodes, edges, onNodeClick, onDrop, onDragOver, selectedNodeId, setNodes, onAddEdge }, ref) => {
    
    const dragRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);
    const panRef = useRef<{ x: number; y: number } | null>(null);
    const [connecting, setConnecting] = useState<{ startNodeId: string; startPos: { x: number; y: number }; endPos: { x: number; y: number } } | null>(null);
    const [viewTransform, setViewTransform] = useState({ x: 0, y: 0, scale: 1 });

    const transformToCanvasSpace = (clientX: number, clientY: number) => {
        if (!ref || !('current' in ref) || !ref.current) return { x: 0, y: 0 };
        const canvasRect = ref.current.getBoundingClientRect();
        return {
            x: (clientX - canvasRect.left - viewTransform.x) / viewTransform.scale,
            y: (clientY - canvasRect.top - viewTransform.y) / viewTransform.scale,
        };
    };

    const handleNodeDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
        const nodePosition = transformToCanvasSpace(e.clientX, e.clientY);
        const node = nodes.find(n => n.id === id);
        if (!node) return;
        
        dragRef.current = {
            id,
            offsetX: nodePosition.x - node.position.x,
            offsetY: nodePosition.y - node.position.y,
        };
        const img = new Image();
        img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        e.dataTransfer.setDragImage(img, 0, 0);
    };

    const handleStartConnection = (e: MouseEvent<HTMLDivElement>, nodeId: string) => {
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return;
        const startX = node.position.x + 208;
        const startY = node.position.y + 36;
        const endPos = transformToCanvasSpace(e.clientX, e.clientY);

        setConnecting({ startNodeId: nodeId, startPos: { x: startX, y: startY }, endPos });
    };
    
    const handleFinishConnection = (targetNodeId: string) => {
        if (connecting) { onAddEdge(connecting.startNodeId, targetNodeId); }
        setConnecting(null);
    };
    
    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (connecting) {
            setConnecting(c => c && { ...c, endPos: transformToCanvasSpace(e.clientX, e.clientY) });
        }
        if (panRef.current) {
            setViewTransform(prev => ({
                ...prev,
                x: prev.x + e.clientX - panRef.current!.x,
                y: prev.y + e.clientY - panRef.current!.y,
            }));
            panRef.current = { x: e.clientX, y: e.clientY };
        }
    };
    
    const handleMouseUp = () => {
        setConnecting(null);
        panRef.current = null;
    };
    
    const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            panRef.current = { x: e.clientX, y: e.clientY };
        }
    };

    const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
        e.preventDefault();
        const scaleAmount = -e.deltaY * 0.001;
        const newScale = Math.max(0.2, Math.min(2, viewTransform.scale + scaleAmount));
        setViewTransform(t => ({...t, scale: newScale}));
    };

    const handleCanvasDragOver = (e: DragEvent<HTMLDivElement>) => {
        onDragOver(e);
        if (dragRef.current) {
            e.preventDefault();
            const { x, y } = transformToCanvasSpace(e.clientX, e.clientY);
            const newX = x - dragRef.current.offsetX;
            const newY = y - dragRef.current.offsetY;
            setNodes(nds => nds.map(n => n.id === dragRef.current?.id ? { ...n, position: { x: newX, y: newY } } : n));
        }
    };
    
    const handleCanvasDrop = (e: DragEvent<HTMLDivElement>) => {
        if (dragRef.current) {
             dragRef.current = null;
        } else {
            const position = transformToCanvasSpace(e.clientX, e.clientY);
            onDrop(e, { x: position.x - 104, y: position.y - 36 }); // Adjust for node center
        }
    };
    
    const zoom = (direction: 'in' | 'out') => {
        const scaleAmount = direction === 'in' ? 1.2 : 1 / 1.2;
        setViewTransform(t => ({...t, scale: Math.max(0.2, Math.min(2, t.scale * scaleAmount))}));
    }
    const resetView = () => setViewTransform({x:0, y:0, scale: 1});

    return (
      <div
        ref={ref}
        className="flex-1 relative overflow-hidden bg-dots cursor-grab"
        onDrop={handleCanvasDrop}
        onDragOver={handleCanvasDragOver}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
        style={{
            backgroundImage: 'radial-gradient(#d1d5db 1.5px, transparent 0)',
            backgroundSize: '25px 25px',
        }}
      >
        <div className="absolute inset-0 transition-transform duration-100 ease-out" style={{ transform: `translate(${viewTransform.x}px, ${viewTransform.y}px) scale(${viewTransform.scale})`, transformOrigin: 'top left' }}>
            <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 0, transform: 'scale(1)', width: '10000px', height: '10000px' }}>
                <defs>
                    <marker id="arrowhead" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#9ca3af" />
                    </marker>
                </defs>
                 {edges.map((edge) => (
                    <SvgEdge key={edge.id} edge={edge} nodes={nodes} />
                ))}
                {connecting && (
                    <path 
                        d={`M ${connecting.startPos.x},${connecting.startPos.y} C ${connecting.startPos.x + 50},${connecting.startPos.y} ${connecting.endPos.x - 50},${connecting.endPos.y} ${connecting.endPos.x},${connecting.endPos.y}`} 
                        stroke="#2563eb" 
                        strokeWidth="2" 
                        strokeDasharray="5,5" 
                        fill="none" 
                    />
                )}
            </svg>

            {nodes.map((node) => (
              <NodeComponent
                key={node.id}
                node={node}
                onClick={onNodeClick}
                isSelected={node.id === selectedNodeId}
                onDragStart={(e) => handleNodeDragStart(e, node.id)}
                onStartConnection={handleStartConnection}
                onFinishConnection={handleFinishConnection}
              />
            ))}
        </div>
        <div className="absolute bottom-4 right-4 z-10 flex items-center space-x-2 bg-white/70 backdrop-blur-sm p-2 rounded-lg shadow-md border border-slate-200">
            <button onClick={() => zoom('out')} className="p-2 rounded-md hover:bg-slate-200 transition-colors"><MinusIcon className="w-5 h-5 text-slate-600"/></button>
            <span className="text-sm font-medium text-slate-600 min-w-[40px] text-center">{Math.round(viewTransform.scale * 100)}%</span>
            <button onClick={() => zoom('in')} className="p-2 rounded-md hover:bg-slate-200 transition-colors"><PlusIcon className="w-5 h-5 text-slate-600"/></button>
            <button onClick={resetView} className="p-2 rounded-md hover:bg-slate-200 transition-colors"><FrameIcon className="w-5 h-5 text-slate-600"/></button>
        </div>
      </div>
    );
  }
);