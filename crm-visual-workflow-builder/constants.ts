
import { Node, Edge, DraggableNode, NodeType, ActionType } from './types';
import { MailIcon, MessageSquareTextIcon, PhoneIcon, UserCheckIcon, UsersIcon, SplitIcon, TimerIcon, PlayIcon } from './components/icons';

export const NODE_TYPES: DraggableNode[] = [
  { type: NodeType.Trigger, data: { label: 'New Lead' } },
  { type: NodeType.Action, data: { label: 'Send Email', actionType: ActionType.SendEmail } },
  { type: NodeType.Action, data: { label: 'Send SMS', actionType: ActionType.SendSMS } },
  { type: NodeType.Action, data: { label: 'Make Call Task', actionType: ActionType.MakeCall } },
  { type: NodeType.Action, data: { label: 'Update Lead', actionType: ActionType.UpdateLead } },
  { type: NodeType.Action, data: { label: 'Assign To', actionType: ActionType.AssignTo } },
  { type: NodeType.Condition, data: { label: 'Check Field' } },
  { type: NodeType.Delay, data: { label: 'Wait' } },
];

export const NODE_VISUALS: { [key in NodeType | ActionType]: { icon: React.FC<any>; style: { border: string; iconContainer: string; } } } = {
  [NodeType.Trigger]: { icon: PlayIcon, style: { border: 'border-green-500', iconContainer: 'bg-green-100 text-green-600' } },
  [NodeType.Action]: { icon: UserCheckIcon, style: { border: 'border-blue-500', iconContainer: 'bg-blue-100 text-blue-600' } },
  [NodeType.Condition]: { icon: SplitIcon, style: { border: 'border-yellow-500', iconContainer: 'bg-yellow-100 text-yellow-600' } },
  [NodeType.Delay]: { icon: TimerIcon, style: { border: 'border-purple-500', iconContainer: 'bg-purple-100 text-purple-600' } },
  [ActionType.SendEmail]: { icon: MailIcon, style: { border: 'border-sky-500', iconContainer: 'bg-sky-100 text-sky-600' } },
  [ActionType.SendSMS]: { icon: MessageSquareTextIcon, style: { border: 'border-indigo-500', iconContainer: 'bg-indigo-100 text-indigo-600' } },
  [ActionType.MakeCall]: { icon: PhoneIcon, style: { border: 'border-rose-500', iconContainer: 'bg-rose-100 text-rose-600' } },
  [ActionType.UpdateLead]: { icon: UserCheckIcon, style: { border: 'border-teal-500', iconContainer: 'bg-teal-100 text-teal-600' } },
  [ActionType.AssignTo]: { icon: UsersIcon, style: { border: 'border-orange-500', iconContainer: 'bg-orange-100 text-orange-600' } },
};

export const INITIAL_NODES: Node[] = [
  {
    id: '1',
    type: NodeType.Trigger,
    position: { x: 50, y: 150 },
    data: { label: 'New Lead Created' },
  },
  {
    id: '2',
    type: NodeType.Action,
    position: { x: 300, y: 150 },
    data: { label: 'Send Welcome Email', actionType: ActionType.SendEmail, templateId: 'template_welcome' },
  },
  {
    id: '3',
    type: NodeType.Delay,
    position: { x: 550, y: 150 },
    data: { label: 'Wait 2 Days', delayValue: 2, delayUnit: 'days' },
  },
  {
    id: '4',
    type: NodeType.Condition,
    position: { x: 800, y: 150 },
    data: { label: 'Lead Opened Email?', field: 'last_email_opened', operator: 'equals', value: 'true' },
  },
   {
    id: '5',
    type: NodeType.Action,
    position: { x: 1050, y: 50 },
    data: { label: 'Assign to Sales Rep', actionType: ActionType.AssignTo, assigneeId: 'user_sales_1' },
  },
  {
    id: '6',
    type: NodeType.Action,
    position: { x: 1050, y: 250 },
    data: { label: 'Send Follow-up SMS', actionType: ActionType.SendSMS, templateId: 'template_followup' },
  },
];

export const INITIAL_EDGES: Edge[] = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e2-3', source: '2', target: '3' },
  { id: 'e3-4', source: '3', target: '4' },
  { id: 'e4-5', source: '4', target: '5', label: 'Yes' },
  { id: 'e4-6', source: '4', target: '6', label: 'No' },
];