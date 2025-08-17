
import React from 'react';
import { Node as NodeType, ActionType } from '../types';
import { NODE_VISUALS } from '../constants';

interface NodeProps {
  node: NodeType;
  onClick: (id: string) => void;
  isSelected: boolean;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
  onStartConnection: (e: React.MouseEvent<HTMLDivElement>, id: string) => void;
  onFinishConnection: (id: string) => void;
}

export const NodeComponent: React.FC<NodeProps> = ({ node, onClick, isSelected, onDragStart, onStartConnection, onFinishConnection }) => {
  const visualKey = node.data.actionType || node.type;
  const visual = NODE_VISUALS[visualKey] || NODE_VISUALS[ActionType.UpdateLead]; // Fallback
  const Icon = visual.icon;

  const selectionClass = isSelected ? 'ring-2 ring-sky-500 shadow-xl' : 'shadow-lg';

  const handleMouseDownOnSource = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onStartConnection(e, node.id);
  };

  const handleMouseUpOnTarget = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onFinishConnection(node.id);
  };

  return (
    <div
      style={{ top: node.position.y, left: node.position.x }}
      className={`absolute w-52 bg-white rounded-lg border border-slate-300 cursor-pointer transition-all duration-150 ${selectionClass} hover:shadow-xl group border-l-4 ${visual.style.border}`}
      onClick={() => onClick(node.id)}
      onDragStart={(e) => onDragStart(e, node.id)}
      draggable
    >
        <div className="flex items-center p-3 space-x-3">
            <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${visual.style.iconContainer}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{node.data.label}</p>
                <p className="text-xs text-slate-500 truncate">{node.type}</p>
            </div>
        </div>

      {/* Connection handles */}
      <div 
        className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-slate-200 border-2 border-slate-400 rounded-full hover:bg-sky-200 hover:border-sky-500 cursor-crosshair opacity-0 group-hover:opacity-100 transition-opacity"
        data-handle="target"
        onMouseUp={handleMouseUpOnTarget}
      />
      <div 
        className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-slate-200 border-2 border-slate-400 rounded-full hover:bg-sky-200 hover:border-sky-500 cursor-crosshair opacity-0 group-hover:opacity-100 transition-opacity"
        data-handle="source"
        onMouseDown={handleMouseDownOnSource}
      />
    </div>
  );
};