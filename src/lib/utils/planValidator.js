 @param {string} cliente_id - ID do cliente
 * @param {string} action - Ação a ser validada ('conversation', 'document', 'whatsapp', etc.)
 * @returns {Promise<Object>} Resultado da validação
 */
export async function validatePlanLimits(cliente_id, action) {
  try {
    // Buscar plano ativo do cliente
    // Esta função deve ser integrada com sua lógica de planos
    const planoAtivo = await getPlanData(cliente_id);
    
    if (!planoAtivo) {
      return {
        allowed: false,
        reason: 'Nenhum plano ativo encontrado',
        code: 'NO_ACTIVE_PLAN'
      };
    }

    const validationResult = {
      allowed: true,
      reason: null,
      code: null,
      limits: {
        current: planoAtivo.conversas_usadas || 0,
        max: planoAtivo.limite_conversas_mensal || 0,
        remaining: (planoAtivo.limite_conversas_mensal || 0) - (planoAtivo.conversas_usadas || 0)
      }
    };

    // Validação baseada na ação solicitada
    switch (action) {
      case 'conversation':
        return validateConversationLimit(planoAtivo, validationResult);
      
      case 'document':
        return validateDocumentAccess(planoAtivo, validationResult);
      
      case 'whatsapp':
        return validateWhatsAppAccess(planoAtivo, validationResult);
      
      case 'api_call':
        return validateApiCallLimit(planoAtivo, validationResult);
      
      default:
        return {
          allowed: false,
          reason: 'Ação não reconhecida',
          code: 'INVALID_ACTION'
        };
    }

  } catch (error) {
    console.error('Erro ao validar limites do plano:', error);
    return {
      allowed: false,
      reason: 'Erro interno na validação',
      code: 'VALIDATION_ERROR',
      error: error.message
    };
  }
}

/**
 * Valida limite de conversas
 */
function validateConversationLimit(plano, result) {
  const { conversas_usadas = 0, limite_conversas_mensal = 0 } = plano;
  
  if (conversas_usadas >= limite_conversas_mensal) {
    return {
      ...result,
      allowed: false,
      reason: 'Limite mensal de conversas excedido',
      code: 'CONVERSATION_LIMIT_EXCEEDED'
    };
  }

  // Aviso quando próximo do limite (90%)
  const warningThreshold = limite_conversas_mensal * 0.9;
  if (conversas_usadas >= warningThreshold) {
    result.warning = {
      message: 'Próximo do limite mensal de conversas',
      percentage: Math.round((conversas_usadas / limite_conversas_mensal) * 100)
    };
  }

  return result;
}

/**
 * Valida acesso a documentos
 */
function validateDocumentAccess(plano, result) {
  if (!plano.uso_documentos) {
    return {
      ...result,
      allowed: false,
      reason: 'Plano não inclui uso de documentos',
      code: 'DOCUMENT_ACCESS_DENIED'
    };
  }

  // Verificar limite de documentos se existir
  if (plano.limite_documentos && plano.documentos_usados >= plano.limite_documentos) {
    return {
      ...result,
      allowed: false,
      reason: 'Limite de documentos excedido',
      code: 'DOCUMENT_LIMIT_EXCEEDED'
    };
  }

  return result;
}

/**
 * Valida acesso ao WhatsApp
 */
function validateWhatsAppAccess(plano, result) {
  if (!plano.integra_whatsapp) {
    return {
      ...result,
      allowed: false,
      reason: 'Plano não inclui integração com WhatsApp',
      code: 'WHATSAPP_ACCESS_DENIED'
    };
  }

  return result;
}

/**
 * Valida limite de chamadas API
 */
function validateApiCallLimit(plano, result) {
  if (plano.limite_api_calls && plano.api_calls_usadas >= plano.limite_api_calls) {
    return {
      ...result,
      allowed: false,
      reason: 'Limite de chamadas API excedido',
      code: 'API_CALL_LIMIT_EXCEEDED'
    };
  }

  return result;
}

/**
 * Busca dados do plano do cliente (mock - substituir pela sua implementação)
 */
async function getPlanData(cliente_id) {
  // Implementação mockada - substituir pela sua lógica de banco de dados
  const planoAtivo = {
    id: 'plan_123',
    cliente_id: cliente_id,
    nome_plano: 'Premium',
    limite_conversas_mensal: 500,
    conversas_usadas: 450,
    uso_documentos: true,
    integra_whatsapp: true,
    limite_documentos: 100,
    documentos_usados: 25,
    limite_api_calls: 1000,
    api_calls_usadas: 150,
    data_renovacao: new Date('2024-07-01'),
    ativo: true
  };

  return planoAtivo;
}

/**
 * Incrementa o uso de uma funcionalidade
 * @param {string} cliente_id - ID do cliente
 * @param {string} feature - Funcionalidade usada
 * @param {number} amount - Quantidade a incrementar (default: 1)
 */
export async function incrementUsage(cliente_id, feature, amount = 1) {
  try {
    // Implementar lógica para incrementar uso no banco de dados
    console.log(`Incrementando ${feature} para cliente ${cliente_id}: +${amount}`);
    
    // Exemplo de como seria a implementação:
    // await db.query(
    //   'UPDATE planos_clientes SET ? = ? + ? WHERE cliente_id = ?',
    //   [feature, feature, amount, cliente_id]
    // );
    
    return true;
  } catch (error) {
    console.error('Erro ao incrementar uso:', error);
    return false;
  }
}

/**
 * Obtém estatísticas de uso do cliente
 * @param {string} cliente_id - ID do cliente
 * @returns {Promise<Object>} Estatísticas de uso
 */
export async function getUsageStats(cliente_id) {
  try {
    const plano = await getPlanData(cliente_id);
    
    if (!plano) {
      throw new Error('Plano não encontrado');
    }

    return {
      conversas: {
        usado: plano.conversas_usadas,
        limite: plano.limite_conversas_mensal,
        percentual: Math.round((plano.conversas_usadas / plano.limite_conversas_mensal) * 100)
      },
      documentos: {
        usado: plano.documentos_usados || 0,
        limite: plano.limite_documentos || 0,
        percentual: plano.limite_documentos ? 
          Math.round((plano.documentos_usados / plano.limite_documentos) * 100) : 0
      },
      api_calls: {
        usado: plano.api_calls_usadas || 0,
        limite: plano.limite_api_calls || 0,
        percentual: plano.limite_api_calls ? 
          Math.round((plano.api_calls_usadas / plano.limite_api_calls) * 100) : 0
      },
      features: {
        documentos: plano.uso_documentos,
        whatsapp: plano.integra_whatsapp
      },
      renovacao: plano.data_renovacao
    };
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    throw error;
  }
}