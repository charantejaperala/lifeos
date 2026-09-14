import React, { useState, useEffect, useRef } from 'react';
import { Goal } from '../types';
import { formatCurrency } from '../utils/calculations';
import { askOllamaAIChat, generateGoalsWithOllama, fetchAIModelConfig, updateAIModelConfig } from '../api';
import { 
  Sparkles, 
  X, 
  CheckCircle, 
  Cpu, 
  Settings, 
  Paperclip, 
  FileText, 
  Trash2, 
  Send,
  User,
  Plus,
  ArrowRight,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';

interface AttachedFile {
  id: string;
  name: string;
  size: string;
  type: 'image' | 'document';
  previewUrl?: string;
  contentSnippet?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  files?: AttachedFile[];
  goalsExtracted?: Partial<Goal>[];
  timestamp: string;
  isAdded?: boolean;
}

interface AskAIModalProps {
  initialPrompt?: string;
  onClose: () => void;
  onBatchCreateGoals: (goals: Partial<Goal>[]) => void;
}

export const AskAIModal: React.FC<AskAIModalProps> = ({ 
  initialPrompt = '', 
  onClose, 
  onBatchCreateGoals 
}) => {
  const [promptText, setPromptText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('llama3');
  const [availableModels, setAvailableModels] = useState<string[]>(['llama3', 'mistral', 'gemma', 'codellama', 'phi3']);
  const [aiEngineName, setAiEngineName] = useState<string>('Ollama (llama3)');
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: `👋 **Welcome to LIFEOS Financial AI Assistant!**\n\nAsk me any financial question — e.g. *"Can I afford an ₹80L house in 2028?"*, *"How much tax will I pay?"*, *"What is an emergency fund?"*, *"Create a retirement plan"*, or upload receipt images for instant analysis.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const initialPromptProcessed = useRef(false);

  useEffect(() => {
    fetchAIModelConfig().then((cfg) => {
      if (cfg.currentModel) setSelectedModel(cfg.currentModel);
      if (cfg.availableModels && cfg.availableModels.length > 0) setAvailableModels(cfg.availableModels);
      setAiEngineName(`Ollama (${cfg.currentModel || 'llama3'})`);
    });
  }, []);

  useEffect(() => {
    const prompt = typeof initialPrompt === 'string' ? initialPrompt : '';
    if (prompt.trim() && !initialPromptProcessed.current) {
      initialPromptProcessed.current = true;
      handleSendMessage(prompt.trim());
    }
  }, [initialPrompt]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAnalyzing]);

  const handleModelChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newModel = e.target.value;
    setSelectedModel(newModel);
    setAiEngineName(`Ollama (${newModel})`);
    await updateAIModelConfig(newModel);
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const isImg = file.type.startsWith('image/');
      const reader = new FileReader();

      reader.onload = (e) => {
        const previewUrl = isImg ? (e.target?.result as string) : undefined;
        const newFile: AttachedFile = {
          id: Math.random().toString(36).substring(2, 9),
          name: file.name,
          size: (file.size / 1024).toFixed(1) + ' KB',
          type: isImg ? 'image' : 'document',
          previewUrl,
          contentSnippet: `[Attached ${isImg ? 'Receipt Image' : 'Document'}: ${file.name}]`,
        };

        setAttachedFiles((prev) => [...prev, newFile]);
      };

      if (isImg) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    });
  };

  const handleRemoveFile = (id: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || promptText;
    if (!query.trim() && attachedFiles.length === 0) return;
    // Prevent duplicate sends while already analyzing
    if (isAnalyzing) return;

    const userMsgId = Math.random().toString(36).substring(2, 9);
    const userMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      text: query,
      files: [...attachedFiles],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setPromptText('');
    const currentFiles = [...attachedFiles];
    setAttachedFiles([]);
    setIsAnalyzing(true);

    try {
      // Build prompt with file info
      let fullPrompt = query;
      if (currentFiles.length > 0) {
        const fileDesc = currentFiles.map((f) => `Attached file: ${f.name} (${f.size})`).join('; ');
        fullPrompt = `${fullPrompt}\n\n[System Context: ${fileDesc}]`;
      }

      // Check if prompt implies goal or budget item
      const isGoalQuery = /afford|buy|house|car|marriage|purchase|save|goal|invest|target|plan/i.test(query) || currentFiles.length > 0;

      let aiResponseText = '';
      let extractedGoals: Partial<Goal>[] = [];

      // 1. Get Chat Answer
      const chatRes = await askOllamaAIChat(fullPrompt, undefined, selectedModel);
      aiResponseText = chatRes.response;

      // 2. Extract Goals if relevant
      if (isGoalQuery) {
        try {
          const generated = await generateGoalsWithOllama(fullPrompt, selectedModel);
          if (generated && generated.length > 0) {
            extractedGoals = generated;
          }
        } catch (err) {
          console.warn('Goal extraction skipped:', err);
        }
      }

      // If response is from client fallback engine, use smart formatter instead
      const isClientFallback = chatRes.engine?.includes('Client Fallback');
      if (!aiResponseText || isClientFallback) {
        aiResponseText = formatSmartFinancialResponse(query, extractedGoals);
      }

      const assistantMsg: ChatMessage = {
        id: Math.random().toString(36).substring(2, 9),
        role: 'assistant',
        text: aiResponseText,
        goalsExtracted: extractedGoals.length > 0 ? extractedGoals : undefined,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: Math.random().toString(36).substring(2, 9),
        role: 'assistant',
        text: `⚠️ **AI Engine Response:**\nI analyzed your query "${query}". To optimize your finances, we recommend maintaining an emergency fund equal to 6 months of expenses, allocating 70% to equity/mutual funds, and tracking goals with a 6-7% inflation buffer.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCreateGoalFromMsg = (msgId: string, goals: Partial<Goal>[]) => {
    onBatchCreateGoals(goals);
    setMessages((prev) => prev.map((m) => m.id === msgId ? { ...m, isAdded: true } : m));
  };

  const quickPrompts = [
    'Can I afford an ₹80L house in 2028?',
    'Show my investment performance',
    'How much tax will I pay?',
    'Create a retirement plan'
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: 740, width: '100%', height: '85vh', maxHeight: 780, display: 'flex', flexDirection: 'column', padding: 0 }} onClick={(e) => e.stopPropagation()}>
        <div className="native-sheet-pill" />
        <div className="ask-ai-modal-header">
          <div className="ask-ai-header-main">
            <div className="ai-logo-box">
              <Cpu size={20} color="#ffffff" />
            </div>
            <div className="ask-ai-header-titles">
              <h2 className="modal-title-ai">LIFEOS AI Financial Advisor</h2>
              <p className="modal-desc-ai">
                Interactive chat with AI intelligence, file extraction, and automatic goal creation.
              </p>
            </div>
          </div>

          <div className="ask-ai-header-actions">
            <div className="ai-model-selector-pill" title="Change Ollama AI Engine Model">
              <Sparkles size={13} color="#38bdf8" />
              <span className="ai-model-pill-label">MODEL</span>
              <select
                value={selectedModel}
                onChange={handleModelChange}
                className="ai-model-select"
              >
                {availableModels.map((m) => (
                  <option key={m} value={m} style={{ background: 'var(--bg-card)', color: 'var(--text-main)', padding: 8 }}>
                    ⚡ {m} (Ollama Local)
                  </option>
                ))}
              </select>
            </div>

            <button className="icon-btn" onClick={onClose} title="Close Modal">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Chat History Container */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 16, background: 'var(--bg-main)' }}>
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start', maxWidth: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>
                  {isUser ? (
                    <>
                      <span>You</span>
                      <User size={12} color="#38bdf8" />
                    </>
                  ) : (
                    <>
                      <Sparkles size={12} color="#60a5fa" />
                      <span>LIFEOS AI ({selectedModel})</span>
                    </>
                  )}
                  <span>• {msg.timestamp}</span>
                </div>

                <div
                  style={{
                    maxWidth: '88%',
                    padding: '14px 16px',
                    borderRadius: isUser ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                    background: isUser ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'var(--bg-card)',
                    color: isUser ? '#ffffff' : 'var(--text-main)',
                    border: isUser ? 'none' : '1px solid var(--border-color)',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                    fontSize: 13,
                    lineHeight: 1.6,
                  }}
                >
                  {renderFormattedText(msg.text)}

                  {/* Render User Attached Files */}
                  {msg.files && msg.files.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                      {msg.files.map((f) => (
                        <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.2)', padding: '4px 8px', borderRadius: 6, fontSize: 11 }}>
                          <FileText size={12} />
                          <span>{f.name}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Render Assistant Extracted Goal Cards with Action Button */}
                  {msg.goalsExtracted && msg.goalsExtracted.length > 0 && (
                    <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#10b981', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <CheckCircle size={14} />
                        <span>AI Extracted Goal Proposal ({msg.goalsExtracted.length}):</span>
                      </div>

                      {msg.goalsExtracted.map((g, i) => (
                        <div key={i} style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: 10, padding: 12, marginBottom: 8 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <strong style={{ fontSize: 14, color: 'var(--text-main)' }}>{g.name}</strong>
                              <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>{g.category} • Target Year: {g.targetDate ? new Date(g.targetDate).getFullYear() : '2028'}</span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: 14, fontWeight: 800, color: '#38bdf8' }}>{formatCurrency(g.targetAmount || 0)}</div>
                              <div style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>Req: {formatCurrency(g.monthlyContribution || 0)}/mo</div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {msg.isAdded ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10b981', fontWeight: 700, fontSize: 12, marginTop: 8 }}>
                          <CheckCircle size={16} />
                          <span>Goals Created & Added to LIFEOS Engine!</span>
                        </div>
                      ) : (
                        <button
                          className="btn-primary"
                          style={{ padding: '6px 14px', fontSize: 12, marginTop: 6, width: '100%', justifyContent: 'center' }}
                          onClick={() => handleCreateGoalFromMsg(msg.id, msg.goalsExtracted!)}
                        >
                          <Plus size={14} />
                          <span>Add Proposal as Goal to LIFEOS</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isAnalyzing && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#60a5fa', fontSize: 12, padding: 8 }}>
              <Sparkles size={16} className="animate-spin" />
              <span>Ollama AI is analyzing prompt & calculating financial metrics...</span>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Quick Suggested Prompts */}
        <div style={{ padding: '8px 16px', background: 'var(--bg-card)', borderTop: '1px solid var(--border-color)', display: 'flex', gap: 8, overflowX: 'auto', flexShrink: 0 }}>
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              type="button"
              className="ai-prompt-chip"
              style={{ fontSize: 11, padding: '4px 10px', whiteSpace: 'nowrap', width: 'auto', flexShrink: 0 }}
              onClick={() => handleSendMessage(qp)}
            >
              <Sparkles size={12} color="#3b82f6" />
              <span>{qp}</span>
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border-color)', background: 'var(--bg-card)', flexShrink: 0 }}>
          <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            
            {/* File Previews Bar */}
            {attachedFiles.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 4 }}>
                {attachedFiles.map((file) => (
                  <div key={file.id} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '4px 8px', borderRadius: 8, fontSize: 11 }}>
                    <FileText size={14} color="#38bdf8" />
                    <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
                    <button type="button" onClick={() => handleRemoveFile(file.id)} style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer' }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => handleFileUpload(e.target.files)}
                accept="image/*,.pdf,.csv,.xlsx,.txt"
                multiple
                style={{ display: 'none' }}
              />

              <button
                type="button"
                className="icon-btn"
                onClick={() => fileInputRef.current?.click()}
                title="Attach receipt or document"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', width: 40, height: 40, borderRadius: 10, flexShrink: 0 }}
              >
                <Paperclip size={18} color="var(--text-muted)" />
              </button>

              <input
                type="text"
                className="form-control"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder='Ask any financial question or type "Buy ₹80L house in 2028"...'
                style={{ flex: 1, padding: '9px 12px', fontSize: 13 }}
              />

              <button
                type="submit"
                className="btn-primary"
                style={{ padding: '10px 16px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}
                disabled={isAnalyzing || (!promptText.trim() && attachedFiles.length === 0)}
              >
                <Send size={15} />
                <span>Send</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Helper function to render bold/italic inline markdown elements smoothly
function renderFormattedText(text: string) {
  if (!text) return null;
  const lines = text.split('\n');
  return lines.map((line, lineIdx) => {
    const parts = line.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
    const renderedParts = parts.map((part, partIdx) => {
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
        return (
          <strong key={partIdx} style={{ fontWeight: 800 }}>
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
        return <em key={partIdx}>{part.slice(1, -1)}</em>;
      }
      if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
        return (
          <code key={partIdx} style={{ background: 'var(--bg-main)', padding: '2px 6px', borderRadius: 4, fontSize: 12, fontFamily: 'monospace' }}>
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });

    return (
      <React.Fragment key={lineIdx}>
        {renderedParts}
        {lineIdx < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
}

// Helper function for smart structured financial advice & general knowledge fallback
function formatSmartFinancialResponse(query: string, goals?: Partial<Goal>[]): string {
  const lower = query.toLowerCase();

  const totalSaved = goals ? goals.reduce((acc, g) => acc + (g.currentAmount || 0), 0) : 600000;
  const totalTarget = goals ? goals.reduce((acc, g) => acc + (g.targetAmount || 0), 0) : 2500000;
  const formattedSaved = formatCurrency(totalSaved, 'INR');
  const formattedTarget = formatCurrency(totalTarget, 'INR');

  if (lower.includes('telangana') || lower.includes('revanth') || lower.includes('cm') || lower.includes('chief minister')) {
    return `🏛️ **General Knowledge: Telangana Leadership**\n\n• **Chief Minister of Telangana**: **Anumula Revanth Reddy** (A. Revanth Reddy) has been serving as Chief Minister since December 7, 2023.\n• **Capital**: Hyderabad\n• **Economic Target**: Expanding IT, Pharma, and Fintech corridors.\n\n💡 *Ask me any financial question or type "Buy house in 2028" to plan your goals!*`;
  }

  if (lower.includes('prime minister') || lower.includes('pm of india') || lower.includes('modi')) {
    return `🏛️ **General Knowledge: Government Leadership**\n\n• **Prime Minister of India**: **Narendra Modi** (serving as PM since May 2014).\n• **Key Financial Initiatives**: PM Jan Dhan Yojana, UPI Payments Network, PM Awas Yojana.\n\n💡 *How can I assist you with your financial goals, tax planning, or investments today?*`;
  }

  if (lower.includes('hi') || lower.includes('hello') || lower.includes('hey') || lower.includes('who are you') || lower.includes('who is this')) {
    return `👋 **Hello! I am LIFEOS AI Financial Assistant**\n\nI am your interactive wealth strategist. Ask me anything about:\n• **Goal Planning**: *"Can I afford a new house in 2028?"*\n• **Tax & Salary**: *"How to save tax on income?"*\n• **Precious Metals**: *"What is current gold price and allocation?"*\n• **Receipt Extraction**: Attach receipts or invoices for auto-logging!`;
  }

  if (lower.includes('house') || lower.includes('afford') || lower.includes('flat')) {
    return `🏠 **Home Purchase & Real Estate Analysis**\n\n• **Current Saved Total across Goals**: ${formattedSaved}\n• **Overall Target Corpus**: ${formattedTarget}\n• Target a **20% down payment** to minimise EMI burden and avoid excessive interest\n• Hidden costs: Registration (6%), Stamp Duty (5–7%), Renovation (+15%), Interiors (+10%)\n• **EMI Rule**: Keep total monthly EMIs strictly below 35% of net monthly income\n• **Mortgage Rates (2024-25)**: Home loan rates range 8.5–9.5% p.a. — opt for floating rates for long tenures\n• **Recommendation**: For an ₹80L property, save at least ₹16–20L as down payment and maintain 6 months of EMI as emergency reserve.`;
  }

  if (lower.includes('tax')) {
    return `📊 **Tax Planning Analysis (FY 2024-25)**\n\n• **Old Regime vs New Regime**: New Tax Regime offers standard deduction of ₹75,000 with lower slab rates, but Old Regime allows full deductions (80C, 80D, HRA, 24b).\n• **Deductions Available (Old Regime)**: Section 80C (EPF/PPF/ELSS: ₹1.5L), Section 80CCD(1B) NPS (₹50k), Section 80D Health Insurance (Self ₹25k + Parents ₹25k = ₹50,000), Section 24(b) Home Loan Interest (up to ₹2L).\n• **Recommendation**: If total deductions exceed ~₹3.75L, Old Regime is better. Also harvest LTCG up to ₹1.25L/year tax-free under Section 112A.`;
  }

  if (lower.includes('performance') || lower.includes('investment') || lower.includes('gold')) {
    return `📈 **Portfolio & Asset Allocation Strategy**\n\n• **Total Saved Across Active Goals**: ${formattedSaved}\n• **Equity (Mutual Funds / Stocks)**: ~50%\n• **Gold & Real Estate**: ~30%\n• **Cash & Emergency Liquidity**: ~20%\n• **Recommendation**: Step up annual SIPs by 10% on your next salary increment.`;
  }

  if (lower.includes('retirement')) {
    return `🌅 **Comprehensive Retirement Blueprint**\n\n• **Target Corpus**: ${formattedTarget}\n• **Current Accumulated Savings**: ${formattedSaved}\n• **Allocation**: 70% Equity Index Funds + 30% Debt/PPF.\n• **Inflation Safety Margin**: Calculated at 6.5% annual inflation.`;
  }

  return `⚡ **LIFEOS AI Response**\n\nRegarding your inquiry: "${query}"\n\n• **Financial Assessment**: Your total accumulated goal savings stand at ${formattedSaved} towards a total target of ${formattedTarget}.\n• **Recommendation**: Maintain a 6-month emergency reserve in liquid funds and step up annual SIPs by 10%.\n• **Next Steps**: Feel free to ask any goal-related or financial question!`;
}
