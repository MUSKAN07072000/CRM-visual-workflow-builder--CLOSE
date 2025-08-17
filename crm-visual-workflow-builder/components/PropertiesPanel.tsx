
import React, { useState, ChangeEvent, useEffect } from 'react';
import { Node, NodeData, NodeType, ActionType, Edge, WorkflowSuggestion } from '../types';
import { XIcon, LightbulbIcon, AlertTriangleIcon } from './icons';
import { getWorkflowSuggestions } from '../services/geminiService';


interface PropertiesPanelProps {
  node: Node;
  nodes: Node[];
  edges: Edge[];
  onUpdate: (id: string, data: Partial<NodeData>) => void;
  onClose: () => void;
}

const LabelInput: React.FC<{ label: string; value: string; onChange: (e: ChangeEvent<HTMLInputElement>) => void; name: string; }> = ({ label, value, onChange, name }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <input type="text" name={name} value={value} onChange={onChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm" />
    </div>
);

const SelectInput: React.FC<{ label: string; value: string; onChange: (e: ChangeEvent<HTMLSelectElement>) => void; children: React.ReactNode; name: string; }> = ({ label, value, onChange, children, name }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <select name={name} value={value} onChange={onChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md">
            {children}
        </select>
    </div>
);

const SuggestionIcon: React.FC<{type: WorkflowSuggestion['type']}> = ({type}) => {
    switch (type) {
        case 'improvement': return <LightbulbIcon className="w-5 h-5 text-blue-500" />;
        case 'warning': return <AlertTriangleIcon className="w-5 h-5 text-yellow-500" />;
        case 'info':
        default: return <LightbulbIcon className="w-5 h-5 text-gray-500" />;
    }
}

const suggestionBgColor: {[key in WorkflowSuggestion['type']]: string} = {
    improvement: 'bg-blue-50 border-blue-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-gray-50 border-gray-200',
}


export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ node, nodes, edges, onUpdate, onClose }) => {
    const [formData, setFormData] = useState(node.data);
    const [suggestions, setSuggestions] = useState<WorkflowSuggestion[]>([]);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [suggestionError, setSuggestionError] = useState<string | null>(null);

    useEffect(() => {
        setFormData(node.data);
        setSuggestions([]);
        setSuggestionError(null);
    }, [node.id, node.data]);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const updatedData = { ...formData, [name]: value };
        setFormData(updatedData);
        onUpdate(node.id, { [name]: value });
    };

    const handleGetSuggestions = async () => {
        setIsLoadingSuggestions(true);
        setSuggestionError(null);
        setSuggestions([]);
        try {
            const result = await getWorkflowSuggestions({ nodes, edges });
            setSuggestions(result);
        } catch (error: any) {
            setSuggestionError(error.message || "Failed to get suggestions.");
        } finally {
            setIsLoadingSuggestions(false);
        }
    };
    
    const renderContent = () => {
        switch (node.type) {
            case NodeType.Action:
                return renderActionContent();
            case NodeType.Condition:
                return renderConditionContent();
            case NodeType.Delay:
                return renderDelayContent();
            default:
                return null;
        }
    };

    const renderActionContent = () => {
        const actionType = formData.actionType;
        return (
            <>
                {actionType === ActionType.SendEmail && (
                    <SelectInput label="Email Template" name="templateId" value={formData.templateId || ''} onChange={handleChange}>
                        <option value="template_welcome">Welcome Series</option>
                        <option value="template_followup">Follow-up</option>
                        <option value="template_reengage">Re-engagement</option>
                    </SelectInput>
                )}
                {actionType === ActionType.SendSMS && (
                     <SelectInput label="SMS Template" name="templateId" value={formData.templateId || ''} onChange={handleChange}>
                        <option value="sms_intro">Intro Message</option>
                        <option value="sms_reminder">Appointment Reminder</option>
                    </SelectInput>
                )}
                {actionType === ActionType.AssignTo && (
                     <SelectInput label="Assign To" name="assigneeId" value={formData.assigneeId || ''} onChange={handleChange}>
                        <option value="user_sales_1">John Doe (Sales)</option>
                        <option value="user_sales_2">Jane Smith (Sales)</option>
                        <option value="user_support_1">Mike Ross (Support)</option>
                    </SelectInput>
                )}
                 {actionType === ActionType.UpdateLead && (
                    <div className="flex space-x-2">
                        <input name="field" value={formData.field || ''} onChange={handleChange} placeholder="Field Name" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"/>
                        <input name="value" value={formData.value || ''} onChange={handleChange} placeholder="New Value" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"/>
                    </div>
                 )}
            </>
        )
    };
    
    const renderConditionContent = () => (
         <div className="space-y-4">
             <SelectInput label="Field to Check" name="field" value={formData.field || ''} onChange={handleChange}>
                <option value="status">Lead Status</option>
                <option value="last_email_opened">Last Email Opened</option>
                <option value="deal_value">Deal Value</option>
            </SelectInput>
             <SelectInput label="Operator" name="operator" value={formData.operator || ''} onChange={handleChange}>
                <option value="equals">Equals</option>
                <option value="contains">Contains</option>
                <option value="greater_than">Greater Than</option>
                <option value="less_than">Less Than</option>
            </SelectInput>
            <LabelInput label="Value" name="value" value={String(formData.value || '')} onChange={handleChange} />
         </div>
    );
    
    const renderDelayContent = () => (
         <div className="flex space-x-2 items-end">
            <LabelInput label="Wait for" name="delayValue" value={String(formData.delayValue || '')} onChange={handleChange} />
            <SelectInput label="" name="delayUnit" value={formData.delayUnit || 'days'} onChange={handleChange}>
                <option value="minutes">Minutes</option>
                <option value="hours">Hours</option>
                <option value="days">Days</option>
            </SelectInput>
         </div>
    );

  return (
    <aside className="w-80 bg-white border-l border-gray-200 flex flex-col z-10 shadow-lg">
      <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Properties</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
              <XIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-4">
            <LabelInput label="Label" name="label" value={formData.label} onChange={handleChange} />
            {renderContent()}
          </div>
      </div>
       <div className="p-4 flex-1 overflow-y-auto">
            <h4 className="text-md font-semibold text-gray-700 mb-2">AI Validation</h4>
            <button onClick={handleGetSuggestions} disabled={isLoadingSuggestions} className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-slate-700 rounded-md hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:bg-slate-400 transition-colors">
                 {isLoadingSuggestions ? (
                    <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        <span>Analyzing...</span>
                    </>
                ) : (
                    <>
                        <LightbulbIcon className="w-4 h-4" />
                        <span>Validate & Suggest</span>
                    </>
                )}
            </button>

            <div className="mt-4 space-y-2">
                {suggestionError && <p className="text-sm text-red-600 bg-red-100 p-2 rounded-md">{suggestionError}</p>}
                {suggestions.map((s, i) => (
                    <div key={i} className={`p-3 rounded-md border flex items-start space-x-3 ${suggestionBgColor[s.type]}`}>
                        <div className="flex-shrink-0 pt-0.5">
                            <SuggestionIcon type={s.type} />
                        </div>
                        <p className="text-sm text-gray-800">{s.suggestion}</p>
                    </div>
                ))}
            </div>
        </div>
    </aside>
  );
};