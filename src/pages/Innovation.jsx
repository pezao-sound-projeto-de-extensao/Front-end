import { useState, useEffect, useRef, useCallback } from 'react';
import { Bot, Send, Sparkles, Loader2, X, ChevronDown, FileText, Package, Receipt } from 'lucide-react';
import { innovationService } from '../services/innovationService';
import { Button } from '../components/ui/Button';
import PageLayout from '../components/PageLayout';
import { showApiSuccess, showApiError } from '../lib/apiError';

export default function Innovation() {
  const [messages, setMessages] = useState([]);
  const [currentFlow, setCurrentFlow] = useState(null);
  const [currentStep, setCurrentStep] = useState(null);
  const [flowData, setFlowData] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [expectNumber, setExpectNumber] = useState(false);
  const [showFileInput, setShowFileInput] = useState(false);
  const messageIdRef = useRef(0);
  
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Initialize with welcome message
  useEffect(() => {
    const initChat = async () => {
      setIsProcessing(true);
      const welcome = await innovationService.getWelcome();
      setMessages([{
        id: ++messageIdRef.current,
        role: 'bot',
        content: welcome.message,
        quickReplies: welcome.quickReplies,
        timestamp: new Date(),
      }]);
      setIsProcessing(false);
    };
    initChat();
  }, []);

  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text && !expectNumber) return;
    
    const userMessage = {
      id: ++messageIdRef.current,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsProcessing(true);

    try {
      const response = await innovationService.processInput(
        text,
        currentFlow,
        currentStep,
        flowData
      );

      // Simulate typing delay for bot
      await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 400));

const botMessage = {
      id: ++messageIdRef.current,
      role: 'bot',
      content: response.message,
      quickReplies: response.quickReplies,
      timestamp: new Date(),
      isComplete: response.isComplete,
    };

      setMessages(prev => [...prev, botMessage]);
      setCurrentFlow(response.flow);
      setCurrentStep(response.step);
      setFlowData(response.flowData);
      setExpectNumber(response.expectNumber || false);
      
      if (response.isComplete) {
        showApiSuccess('Processo concluído com sucesso!');
      }
    } catch (error) {
      console.error('Chat error:', error);
const errorMessage = {
      id: ++messageIdRef.current,
      role: 'bot',
      content: '❌ Ocorreu um erro. Tente novamente ou digite "menu" para voltar ao início.',
      quickReplies: [
        { value: 'menu', label: '🏠 Voltar ao Menu' },
      ],
      timestamp: new Date(),
    };
      setMessages(prev => [...prev, errorMessage]);
      setCurrentFlow(null);
      setCurrentStep(null);
      setFlowData({});
      showApiError(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickReply = (value) => {
    setInputValue(value);
    handleSend();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setInputValue(file.name);
      setShowFileInput(false);
      handleSend();
    }
  };

  const renderQuickReplies = (quickReplies) => {
    if (!quickReplies || quickReplies.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-2 mt-2" role="list" aria-label="Respostas rápidas">
        {quickReplies.map((reply, i) => (
          <button
            key={`${reply.value}-${i}`}
            onClick={() => handleQuickReply(reply.value)}
            disabled={isProcessing}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 whitespace-nowrap flex items-center gap-1.5"
            style={{
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              boxShadow: 'var(--shadow-card)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-input)'; }}
            role="listitem"
          >
            {reply.label}
          </button>
        ))}
      </div>
    );
  };

  const renderMessage = (msg, index) => {
    const isUser = msg.role === 'user';
    const time = msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    return (
      <div key={msg.id || index} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end gap-2 max-w-[80%]`}>
          {!isUser && (
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{
              backgroundColor: '#1565c0',
              color: '#ffffff',
              boxShadow: '0 2px 6px rgba(21,101,192,0.3)',
            }}>
              <Bot className="w-4 h-4" />
            </div>
          )}
          <div className={`relative px-4 py-2.5 rounded-2xl ${isUser ? 'rounded-tr-md' : 'rounded-tl-md'}`} style={{
            backgroundColor: isUser ? '#1565c0' : 'var(--bg-card)',
            color: isUser ? '#ffffff' : 'var(--text-primary)',
            border: isUser ? 'none' : '1px solid var(--border-subtle)',
            boxShadow: isUser ? '0 2px 8px rgba(21,101,192,0.3)' : 'var(--shadow-card)',
          }}>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
            <div className="flex items-center justify-end gap-1.5 mt-1.5" style={{ opacity: 0.6 }}>
              <span className="text-xs">{time}</span>
              {isUser && <Send className="w-3 h-3" />}
            </div>
            {msg.quickReplies && !isUser && renderQuickReplies(msg.quickReplies)}
            {msg.isComplete && (
              <div className="mt-2 p-2 rounded-lg text-xs" style={{
                backgroundColor: 'rgba(30, 158, 94, 0.1)',
                border: '1px solid #1e9e5e',
                color: '#1e9e5e',
              }}>
                ✅ Processo finalizado. Os dados foram salvos.
              </div>
            )}
          </div>
          {isUser && (
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
            }}>
              <Sparkles className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
            </div>
          )}
        </div>
      </div>
    );
  };

  const getStepIcon = (flowKey) => {
    switch (flowKey) {
      case 'orcamento': return <FileText className="w-4 h-4" />;
      case 'movimentacao': return <Package className="w-4 h-4" />;
      case 'notaFiscal': return <Receipt className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto h-[calc(100vh-200px)] min-h-[500px] flex flex-col" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '16px', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
        
        {/* Chat Header Status */}
        <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-page)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#1565c0', color: '#ffffff' }}>
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <p style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>Assistente StockFlow</p>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {currentFlow ? (
                  <>
                    {getStepIcon(currentFlow)}
                    <span style={{ marginLeft: 6 }}>{FLOWS_LABELS[currentFlow]}</span>
                    {currentStep !== null && <span style={{ marginLeft: 8, opacity: 0.7 }}>Etapa {currentStep + 1}</span>}
                  </>
                ) : (
                  'Pronto para ajudar'
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
            {isProcessing && (
              <span className="flex items-center gap-1" style={{ color: '#1565c0' }}>
                <Loader2 className="w-3 h-3 animate-spin" />
                Processando...
              </span>
            )}
            <span className="px-2 py-0.5 rounded-full" style={{
              backgroundColor: currentFlow ? 'rgba(21,101,192,0.15)' : 'rgba(30,158,94,0.15)',
              color: currentFlow ? '#1565c0' : '#1e9e5e',
            }}>
              {currentFlow ? 'Em andamento' : 'Aguardando'}
            </span>
          </div>
        </div>

        {/* Messages Area */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-2" style={{ backgroundColor: 'var(--bg-page)' }}>
          {messages.map(renderMessage)}
          <div ref={messagesEndRef} />
          
          {isProcessing && (
            <div className="flex justify-start mb-2">
              <div className="flex items-end gap-2 max-w-[80%]">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{
                  backgroundColor: '#1565c0',
                  color: '#ffffff',
                }}>
                  <Bot className="w-4 h-4" />
                </div>
                <div className="px-4 py-2.5 rounded-2xl rounded-tl-md" style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: 'var(--shadow-card)',
                }}>
                  <div className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                    <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#1565c0' }} />
                    <span className="text-sm">Digitando...</span>
                    <span className="animate-bounce">.</span>
                    <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t p-4" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card)' }}>
          {showFileInput && (
            <div className="mb-2 p-2 rounded-lg flex items-center gap-2" style={{ backgroundColor: 'rgba(21,101,192,0.1)', border: '1px solid rgba(21,101,192,0.3)' }}>
              <input
                type="file"
                ref={inputRef}
                onChange={handleFileSelect}
                accept=".pdf,.xml"
                className="hidden"
                id="file-input"
              />
              <label htmlFor="file-input" className="cursor-pointer flex-1 text-sm" style={{ color: '#1565c0' }}>
                📎 Selecionar arquivo PDF/XML da Nota Fiscal
              </label>
              <Button variant="ghost" size="sm" onClick={() => setShowFileInput(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
          
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isProcessing}
              placeholder={expectNumber ? 'Digite a quantidade...' : currentFlow ? 'Digite sua resposta ou escolha uma opção...' : 'Digite "menu" para ver as opções...'}
              rows={1}
              className="flex-1 resize-none px-4 py-2.5 rounded-xl text-sm transition-all"
              style={{
                backgroundColor: 'var(--bg-input)',
                border: '1.5px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                minHeight: '44px',
                maxHeight: '120px',
                lineHeight: '1.5',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#1565c0'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(21,101,192,0.15)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.boxShadow = 'none'; }}
            />
            <Button
              onClick={handleSend}
              disabled={isProcessing || (!inputValue.trim() && !expectNumber)}
              className="flex-shrink-0"
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: '#1565c0',
                boxShadow: '0 2px 8px rgba(21,101,192,0.3)',
              }}
            >
              <Send className="w-5 h-5" style={{ color: '#ffffff' }} />
            </Button>
          </div>
          
          <p className="text-xs text-center mt-2" style={{ color: 'var(--text-tertiary)' }}>
            {currentFlow ? `Fluxo: ${FLOWS_LABELS[currentFlow]} • Etapa ${currentStep + 1} de ${FLOWS_STEPS[currentFlow]?.length || 0}` : 'Digite "menu" a qualquer momento para voltar ao início'}
          </p>
        </div>
      </div>
    </PageLayout>
  );
}

// Labels for display
const FLOWS_LABELS = {
  orcamento: 'Criar Orçamento',
  movimentacao: 'Registrar Movimentação',
  notaFiscal: 'Dar Baixa com NF',
};

const FLOWS_STEPS = {
  orcamento: ['cliente', 'produtos', 'quantidades', 'confirmar'],
  movimentacao: ['tipo', 'produto', 'quantidade', 'data', 'observacao', 'confirmar'],
  notaFiscal: ['movimentacao', 'arquivo', 'confirmar'],
};