
export enum NodeType {
  Trigger = 'Trigger',
  Action = 'Action',
  Condition = 'Condition',
  Delay = 'Delay',
}

export enum ActionType {
  SendEmail = 'SendEmail',
  SendSMS = 'SendSMS',
  MakeCall = 'MakeCall',
  UpdateLead = 'UpdateLead',
  AssignTo = 'AssignTo',
}

export interface NodeData {
  label: string;
  description?: string;
  actionType?: ActionType;
  // Condition specific
  field?: string;
  operator?: 'equals' | 'contains' | 'greater_than' | 'less_than';
  value?: string | number;
  // Delay specific
  delayValue?: number;
  delayUnit?: 'minutes' | 'hours' | 'days';
  // Email/SMS specific
  templateId?: string;
  // Assign specific
  assigneeId?: string;
}

export interface Node {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: NodeData;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  label?: string; // e.g., 'Yes'/'No' for conditions
}

export interface DraggableNode {
  type: NodeType;
  data: Partial<NodeData>;
}

export type WorkflowNode = {
    id: string;
    type: NodeType;
    position: { x: number; y: number };
    data: {
      label:string;
      description?: string;
      actionType?: ActionType;
    }
}

export interface WorkflowSuggestion {
  type: 'improvement' | 'warning' | 'info';
  suggestion: string;
}