
import React from 'react';
import { XIcon, MailIcon, MessageSquareTextIcon, PhoneIcon } from './icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ReportingModalProps {
  onClose: () => void;
}

const performanceData = [
  { name: 'Welcome Email', sent: 400, opened: 320, clicked: 80 },
  { name: 'Follow-up SMS', sent: 240, delivered: 235, replied: 48 },
  { name: 'Call Task', created: 100, completed: 75, outcome_positive: 30 },
  { name: 'Re-engage Email', sent: 50, opened: 20, clicked: 5 },
];

const bottleneckData = [
  { name: 'Initial Contact', value: 400 },
  { name: 'Email Opened', value: 320 },
  { name: 'Engaged', value: 128 },
  { name: 'Converted', value: 75 },
];

const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const ReportingModal: React.FC<ReportingModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-full max-h-[90vh] flex flex-col">
        <header className="p-4 bg-slate-800 rounded-t-lg border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-100">Workflow Performance Report</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <XIcon className="w-6 h-6" />
          </button>
        </header>

        <main className="flex-1 p-6 overflow-y-auto bg-slate-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex items-center space-x-4">
              <div className="bg-blue-100 text-blue-600 p-3 rounded-full"><MailIcon className="w-6 h-6"/></div>
              <div>
                <p className="text-sm text-gray-500">Emails Sent</p>
                <p className="text-2xl font-bold text-slate-800">450</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex items-center space-x-4">
              <div className="bg-indigo-100 text-indigo-600 p-3 rounded-full"><MessageSquareTextIcon className="w-6 h-6"/></div>
              <div>
                <p className="text-sm text-gray-500">SMS Sent</p>
                <p className="text-2xl font-bold text-slate-800">240</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex items-center space-x-4">
               <div className="bg-rose-100 text-rose-600 p-3 rounded-full"><PhoneIcon className="w-6 h-6"/></div>
              <div>
                <p className="text-sm text-gray-500">Tasks Created</p>
                <p className="text-2xl font-bold text-slate-800">100</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-8">
            <h3 className="font-semibold text-lg mb-4 text-gray-700">Action Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sent" fill="#8884d8" name="Sent/Created" />
                <Bar dataKey="opened" fill="#82ca9d" name="Opened/Completed" />
                <Bar dataKey="clicked" fill="#ffc658" name="Clicked/Replied" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="font-semibold text-lg mb-4 text-gray-700">Conversion Funnel & Bottlenecks</h3>
             <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                 <Pie data={bottleneckData} cx="50%" cy="50%" labelLine={false} outerRadius={120} fill="#8884d8" dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {bottleneckData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </main>
      </div>
    </div>
  );
};