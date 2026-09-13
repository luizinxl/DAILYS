import { useMemo, useEffect, useState } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  Handle, 
  Position, 
  useNodesState, 
  useEdgesState,
  EdgeTypes
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { X, Database, Link, Briefcase, Mail, Calendar, Bell, Bot, Server, Smartphone, ExternalLink, Globe, Zap, Activity, CheckCircle, GitFork } from 'lucide-react';
import { integrationFlows, IntegrationKey } from '@/data/integrationFlows';
import { motion, AnimatePresence } from 'framer-motion';

const iconMap: Record<string, React.ElementType> = {
  Database, Link, Briefcase, Mail, Calendar, Bell, Bot, Server, Smartphone, ExternalLink, Globe, Zap, Activity, CheckCircle, GitFork
};

// Custom Node to mimic n8n style
function CustomNode({ data }: { data: any }) {
  const IconComponent = iconMap[data.icon] || Database;
  return (
    <div className="bg-[#1D2029] border border-[#232735] rounded-xl p-3 shadow-lg flex items-center gap-3 w-64">
      <Handle type="target" position={Position.Left} className="w-2 h-2 rounded-full !bg-[#475569] !border-none" />
      <div 
        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${data.color}1A`, color: data.color }}
      >
        <IconComponent size={20} />
      </div>
      <div className="overflow-hidden">
        <p className="text-sm font-semibold text-white truncate">{data.label}</p>
        <p className="text-xs text-[#8E95A5] truncate">{data.subline}</p>
      </div>
      <Handle type="source" position={Position.Right} className="w-2 h-2 rounded-full !bg-[#475569] !border-none" />
    </div>
  );
}

const nodeTypes = {
  customNode: CustomNode,
};

interface IntegrationFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  integrationKey: IntegrationKey | null;
}

export function IntegrationFlowModal({ isOpen, onClose, integrationKey }: IntegrationFlowModalProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  // Update state when modal opens or key changes
  useEffect(() => {
    if (isOpen && integrationKey && integrationFlows[integrationKey]) {
      const flowData = integrationFlows[integrationKey];
      setNodes(flowData.nodes);
      setEdges(flowData.edges);
    }
  }, [isOpen, integrationKey, setNodes, setEdges]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col bg-black/80 backdrop-blur-sm p-4 md:p-8"
        onClick={onClose}
      >
        <motion.div 
          initial={{ y: 20, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0, scale: 0.95 }}
          className="relative w-full h-full max-w-6xl mx-auto flex flex-col bg-[#0f1115] border border-[#232735] rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#232735] bg-[#1D2029]">
            <div>
              <h2 className="text-lg font-bold text-white capitalize flex items-center gap-2">
                Fluxo de Integração: <span className="text-[#8E95A5]">{integrationKey}</span>
              </h2>
              <p className="text-xs text-[#8E95A5]">Como os dados fluem nesta conexão (estilo n8n).</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-lg text-[#8E95A5] hover:text-white hover:bg-[#282E42] transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* React Flow Canvas */}
          <div className="flex-1 w-full bg-[#0a0a0c]">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              fitView
              fitViewOptions={{ padding: 0.2 }}
              minZoom={0.5}
              maxZoom={1.5}
              proOptions={{ hideAttribution: true }} // Hides the React Flow watermark for cleaner look
              colorMode="dark"
            >
              <Background color="#232735" gap={24} size={2} />
              <Controls className="!bg-[#1D2029] !border-[#232735] !text-white fill-white" />
            </ReactFlow>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
