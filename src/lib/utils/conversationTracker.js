let conversationCounter = new Map();

export function incrementConversation(cliente_id) {
  const current = conversationCounter.get(cliente_id) || 0;
  conversationCounter.set(cliente_id, current + 1);
  return current + 1;
}

export function getConversationCount(cliente_id) {
  return conversationCounter.get(cliente_id) || 0;
}

export function resetConversationCount(cliente_id) {
  conversationCounter.set(cliente_id, 0);
}
