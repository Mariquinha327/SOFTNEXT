const rateLimitStore = new Map();

export function rateLimit(options = {}) {
  const { windowMs = 15 * 60 * 1000, max = 100 } = options;

  return (handler) => {
    return async (req, res) => {
      const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      const now = Date.now();
      const windowStart = now - windowMs;

      // Limpar registros antigos
      for (const [key, data] of rateLimitStore.entries()) {
        if (data.resetTime < now) {
          rateLimitStore.delete(key);
        }
      }

      // Verificar limite para o IP
      const current = rateLimitStore.get(ip) || { count: 0, resetTime: now + windowMs };
      
      if (current.count >= max && current.resetTime > now) {
        return res.status(429).json({
          error: 'Muitas requisições',
          retry_after: Math.ceil((current.resetTime - now) / 1000)
        });
      }

      // Incrementar contador
      current.count += 1;
      rateLimitStore.set(ip, current);

      return handler(req, res);
    };
  };
}
