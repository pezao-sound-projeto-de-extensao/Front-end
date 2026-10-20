// Mock conversation service for Innovation Chatbot
// Simulates backend processing with pre-defined flows and quick replies

const DELAY = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Simulated data for quick replies
const MOCK_CLIENTES = [
  { id: 1, nome: 'Empresa Alpha LTDA', documento: '12.345.678/0001-90' },
  { id: 2, nome: 'Comércio Beta ME', documento: '98.765.432/0001-10' },
  { id: 3, nome: 'Indústria Gama SA', documento: '11.222.333/0001-44' },
];

const MOCK_PRODUTOS = [
  { id: 1, nome: 'Notebook Dell Inspiron 15', sku: 'NB-DELL-15', preco: 3500.00, unidade: 'UN' },
  { id: 2, nome: 'Mouse Logitech MX Master 3', sku: 'MS-LOGI-MX3', preco: 450.00, unidade: 'UN' },
  { id: 3, nome: 'Teclado Mecânico Keychron K2', sku: 'TK-KEYC-K2', preco: 680.00, unidade: 'UN' },
  { id: 4, nome: 'Monitor LG 27" 4K', sku: 'MN-LG-27-4K', preco: 1890.00, unidade: 'UN' },
  { id: 5, nome: 'Cabo HDMI 2m', sku: 'CB-HDMI-2M', preco: 35.00, unidade: 'UN' },
];

const MOCK_MOVIMENTACOES = [
  { id: 1, tipo: 'entrada', itemNome: 'Notebook Dell Inspiron 15', quantidade: 10, data: '2024-01-15', status: 'pendente_nf' },
  { id: 2, tipo: 'saida', itemNome: 'Mouse Logitech MX Master 3', quantidade: 5, data: '2024-01-18', status: 'pendente_nf' },
  { id: 3, tipo: 'entrada', itemNome: 'Teclado Mecânico Keychron K2', quantidade: 8, data: '2024-01-20', status: 'pendente_nf' },
];

// Flow definitions
const FLOWS = {
  orcamento: {
    name: 'Criar Orçamento',
    icon: '📄',
    steps: [
      { key: 'cliente', label: 'Selecione o cliente', type: 'select', options: MOCK_CLIENTES, getLabel: (c) => `${c.nome} (${c.documento})` },
      { key: 'produtos', label: 'Adicione produtos ao orçamento', type: 'multiSelect', options: MOCK_PRODUTOS, getLabel: (p) => `${p.nome} - R$ ${p.preco.toFixed(2)}/${p.unidade}` },
      { key: 'quantidades', label: 'Defina as quantidades', type: 'quantityInput', dependsOn: 'produtos' },
      { key: 'confirmar', label: 'Confirmar orçamento', type: 'confirm' },
    ],
  },
  movimentacao: {
    name: 'Registrar Movimentação',
    icon: '📦',
    steps: [
      { key: 'tipo', label: 'Tipo de movimentação', type: 'select', options: [{ value: 'entrada', label: 'Entrada' }, { value: 'saida', label: 'Saída' }], getLabel: (o) => o.label },
      { key: 'produto', label: 'Selecione o produto', type: 'select', options: MOCK_PRODUTOS, getLabel: (p) => `${p.nome} (Estoque: ${Math.floor(Math.random() * 50)})` },
      { key: 'quantidade', label: 'Quantidade', type: 'number', min: 1 },
      { key: 'data', label: 'Data da movimentação', type: 'date', default: new Date().toISOString().split('T')[0] },
      { key: 'observacao', label: 'Observação (opcional)', type: 'text', optional: true },
      { key: 'confirmar', label: 'Confirmar registro', type: 'confirm' },
    ],
  },
  notaFiscal: {
    name: 'Dar Baixa com Nota Fiscal',
    icon: '🧾',
    steps: [
      { key: 'movimentacao', label: 'Selecione a movimentação pendente', type: 'select', options: MOCK_MOVIMENTACOES, getLabel: (m) => `#${m.id} - ${m.itemNome} (${m.tipo.toUpperCase()}) - ${m.quantidade} un - ${m.data}` },
      { key: 'arquivo', label: 'Anexe o arquivo da NF (PDF/XML)', type: 'file', accept: '.pdf,.xml' },
      { key: 'confirmar', label: 'Confirmar baixa', type: 'confirm' },
    ],
  },
};

// Helper to get quick reply chips from step options
function getQuickReplies(step, flowData = {}) {
  if (!step.options) return [];
  
  const options = step.options;
  if (step.key === 'quantidades' && flowData.produtos) {
    // For quantity input, show each selected product as a chip to fill
    return flowData.produtos.map((p) => ({
      value: `qty_${p.id}`,
      label: `${p.nome}: ${flowData.quantidades?.[p.id] || 0} un`,
      isInput: true,
      productId: p.id,
    }));
  }
  
  return options.map((opt) => ({
    value: opt.id || opt.value,
    label: step.getLabel ? step.getLabel(opt) : opt.label,
  }));
}

// Main conversation processor
export const innovationService = {
  // Get initial greeting and main menu options
  async getWelcome() {
    await DELAY(300);
    return {
      message: `Olá! Sou o assistente de inovação do StockFlow. 🤖\n\nComo posso ajudar você hoje?`,
      quickReplies: [
        { value: 'orcamento', label: '📄 Criar Orçamento' },
        { value: 'movimentacao', label: '📦 Registrar Movimentação' },
        { value: 'notaFiscal', label: '🧾 Dar Baixa com NF' },
      ],
      flow: null,
      step: null,
      isComplete: false,
    };
  },

  // Process user input and return next bot response
  async processInput(input, currentFlow, currentStep, flowData) {
    await DELAY(500 + Math.random() * 500); // Simulate processing

    // Handle flow selection from main menu
    if (!currentFlow && FLOWS[input]) {
      const flow = FLOWS[input];
      const firstStep = flow.steps[0];
      return {
        message: `Ótimo! Vamos ${flow.name.toLowerCase()}.\n\n${firstStep.label}:`,
        quickReplies: getQuickReplies(firstStep, flowData),
        flow: input,
        step: 0,
        flowData: {},
        isComplete: false,
      };
    }

    // Handle free text "menu" or "voltar"
    if (!currentFlow && ['menu', 'voltar', 'início', 'inicio', 'ajuda'].includes(input.toLowerCase())) {
      return this.getWelcome();
    }

    // If no active flow, treat as free text and suggest options
    if (!currentFlow) {
      return {
        message: `Não entendi. Escolha uma opção ou digite "menu" para ver as opções principais.`,
        quickReplies: [
          { value: 'orcamento', label: '📄 Criar Orçamento' },
          { value: 'movimentacao', label: '📦 Registrar Movimentação' },
          { value: 'notaFiscal', label: '🧾 Dar Baixa com NF' },
        ],
        flow: null,
        step: null,
        flowData: {},
        isComplete: false,
      };
    }

    const flow = FLOWS[currentFlow];
    const step = flow.steps[currentStep];
    const newFlowData = { ...flowData };

    // Handle special input types
    if (step.type === 'multiSelect') {
      // Toggle product selection
      const productId = parseInt(input.replace('prod_', ''));
      const selected = newFlowData.produtos || [];
      const product = MOCK_PRODUTOS.find(p => p.id === productId);
      
      if (product) {
        if (selected.some(p => p.id === productId)) {
          newFlowData.produtos = selected.filter(p => p.id !== productId);
        } else {
          newFlowData.produtos = [...selected, product];
        }
      }
      
      const nextStep = flow.steps[currentStep];
      return {
        message: `Produtos selecionados: ${newFlowData.produtos?.length || 0}\n\n${nextStep.label}:`,
        quickReplies: getQuickReplies(nextStep, newFlowData),
        flow: currentFlow,
        step: currentStep,
        flowData: newFlowData,
        isComplete: false,
      };
    }

    if (step.key === 'quantidades' && input.startsWith('qty_')) {
      // User clicked a quantity chip - they need to type the number
      const productId = parseInt(input.replace('qty_', ''));
      return {
        message: `Digite a quantidade para o produto selecionado:`,
        quickReplies: [],
        flow: currentFlow,
        step: currentStep,
        flowData: { ...newFlowData, _editingQty: productId },
        isComplete: false,
        expectNumber: true,
        editingProductId: productId,
      };
    }

    // Handle number input for quantities
    if (step.type === 'quantityInput' && newFlowData._editingQty && !isNaN(parseInt(input))) {
      const qty = parseInt(input);
      const productId = newFlowData._editingQty;
      const quantidades = newFlowData.quantidades || {};
      quantidades[productId] = qty;
      
      return {
        message: `Quantidade definida: ${qty} un\n\n${step.label}:`,
        quickReplies: getQuickReplies(step, { ...newFlowData, quantidades }),
        flow: currentFlow,
        step: currentStep,
        flowData: { ...newFlowData, quantidades, _editingQty: null },
        isComplete: false,
      };
    }

    // Store step data
    if (step.key !== 'confirmar') {
      newFlowData[step.key] = input;
    }

    // Move to next step
    const nextStepIndex = currentStep + 1;
    
    if (nextStepIndex >= flow.steps.length) {
      // Flow complete - simulate API call
      return this.completeFlow(currentFlow, newFlowData);
    }

    const nextStep = flow.steps[nextStepIndex];
    let message = `${nextStep.label}:`;
    
    // Add summary for confirmation step
    if (nextStep.type === 'confirm') {
      message = this.buildConfirmationMessage(currentFlow, newFlowData);
    }

    return {
      message,
      quickReplies: getQuickReplies(nextStep, newFlowData),
      flow: currentFlow,
      step: nextStepIndex,
      flowData: newFlowData,
      isComplete: false,
    };
  },

  // Build confirmation summary
  buildConfirmationMessage(flowKey, data) {
    const flow = FLOWS[flowKey];
    let msg = `Confira os dados do ${flow.name.toLowerCase()}:\n\n`;
    
    if (flowKey === 'orcamento') {
      msg += `👤 Cliente: ${data.cliente?.nome || data.cliente}\n`;
      msg += `📦 Produtos:\n`;
      data.produtos?.forEach((p, i) => {
        const qty = data.quantidades?.[p.id] || 0;
        msg += `  ${i + 1}. ${p.nome} - ${qty} ${p.unidade} x R$ ${p.preco.toFixed(2)} = R$ ${(qty * p.preco).toFixed(2)}\n`;
      });
      const total = data.produtos?.reduce((sum, p) => sum + (data.quantidades?.[p.id] || 0) * p.preco, 0) || 0;
      msg += `\n💰 Total: R$ ${total.toFixed(2)}`;
    } else if (flowKey === 'movimentacao') {
      msg += `📦 Tipo: ${data.tipo === 'entrada' ? 'Entrada' : 'Saída'}\n`;
      msg += `📦 Produto: ${data.produto?.nome || data.produto}\n`;
      msg += `🔢 Quantidade: ${data.quantidade}\n`;
      msg += `📅 Data: ${data.data}\n`;
      if (data.observacao) msg += `📝 Obs: ${data.observacao}`;
    } else if (flowKey === 'notaFiscal') {
      msg += `📦 Movimentação: #${data.movimentacao?.id || data.movimentacao}\n`;
      msg += `📄 Arquivo: ${data.arquivo?.name || 'Anexado'}`;
    }
    
    msg += '\n\nConfirmar?';
    return msg;
  },

  // Complete flow and simulate API call
  async completeFlow(flowKey, data) {
    await DELAY(800);
    
    let successMessage = '';
    let mockResult = {};
    
    if (flowKey === 'orcamento') {
      const total = data.produtos?.reduce((sum, p) => sum + (data.quantidades?.[p.id] || 0) * p.preco, 0) || 0;
      successMessage = `✅ Orçamento criado com sucesso!\n\n📄 **Orçamento #${Math.floor(Math.random() * 10000)}**\n👤 Cliente: ${data.cliente?.nome || data.cliente}\n💰 Total: R$ ${total.toFixed(2)}\n📅 Data: ${new Date().toLocaleDateString('pt-BR')}\n\nO orçamento foi enviado para aprovação.`;
      mockResult = { id: Math.floor(Math.random() * 10000), total, status: 'pendente' };
    } else if (flowKey === 'movimentacao') {
      successMessage = `✅ Movimentação registrada com sucesso!\n\n📦 **Movimentação #${Math.floor(Math.random() * 10000)}**\n📦 Tipo: ${data.tipo === 'entrada' ? 'Entrada' : 'Saída'}\n📦 Produto: ${data.produto?.nome || data.produto}\n🔢 Quantidade: ${data.quantidade}\n📅 Data: ${data.data}\n${data.observacao ? `📝 Obs: ${data.observacao}\n` : ''}\nEstoque atualizado automaticamente.`;
      mockResult = { id: Math.floor(Math.random() * 10000), status: 'registrada' };
    } else if (flowKey === 'notaFiscal') {
      successMessage = `✅ Baixa realizada com sucesso!\n\n🧾 **Nota Fiscal processada**\n📦 Movimentação: #${data.movimentacao?.id || data.movimentacao}\n📄 Arquivo: ${data.arquivo?.name || 'NF.pdf'}\n📅 Data: ${new Date().toLocaleDateString('pt-BR')}\n\nA movimentação foi finalizada e o estoque confirmado.`;
      mockResult = { id: Math.floor(Math.random() * 10000), status: 'finalizada' };
    }

    return {
      message: successMessage,
      quickReplies: [
        { value: 'orcamento', label: '📄 Novo Orçamento' },
        { value: 'movimentacao', label: '📦 Nova Movimentação' },
        { value: 'notaFiscal', label: '🧾 Nova Baixa com NF' },
        { value: 'menu', label: '🏠 Voltar ao Menu' },
      ],
      flow: null,
      step: null,
      flowData: {},
      isComplete: true,
      result: mockResult,
    };
  },

  // Get available options for a step (used for rendering chips)
  getStepOptions(flowKey, stepIndex, flowData) {
    const flow = FLOWS[flowKey];
    if (!flow || stepIndex >= flow.steps.length) return [];
    return getQuickReplies(flow.steps[stepIndex], flowData);
  },
};

export default innovationService;