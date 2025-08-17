
import React, { DragEvent } from 'react';
import { NODE_TYPES, NODE_VISUALS } from '../constants';
import { DraggableNode } from '../types';

const onDragStart = (event: DragEvent, node: DraggableNode) => {
  const nodeString = JSON.stringify(node);
  event.dataTransfer.setData('application/reactflow', nodeString);
  event.dataTransfer.effectAllowed = 'move';
};

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-700 p-4 space-y-4 overflow-y-auto z-10 shadow-lg">
      <h2 className="text-lg font-semibold text-slate-100">Blocks</h2>
      <p className="text-sm text-slate-400 pb-2">Drag blocks onto the canvas to build your workflow.</p>
      {NODE_TYPES.map((node) => {
        const visual = NODE_VISUALS[node.data.actionType || node.type];
        const Icon = visual.icon;
        
        return (
          <div
            key={`${node.type}-${node.data.actionType || ''}`}
            className="p-3 border border-slate-700 rounded-md cursor-grab bg-slate-800 hover:bg-slate-700 hover:border-sky-500/50 transition-all flex items-center space-x-3 group"
            onDragStart={(event: DragEvent) => onDragStart(event, node)}
            draggable
          >
            <div className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${visual.style.iconContainer}`}>
                <Icon className="w-5 h-5" />
            </div>
            <span className="font-medium text-sm text-slate-200 group-hover:text-white transition-colors">{node.data.label}</span>
          </div>
        );
      })}
    </aside>
  );
};