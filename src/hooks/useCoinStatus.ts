import { useEffect, useState } from 'react';

import { coinAcceptor, type ConnectionStatus } from '../services/coinAcceptor';

export function useCoinStatus(): ConnectionStatus {
  const [status, setStatus] = useState<ConnectionStatus>(coinAcceptor.getStatus());
  useEffect(() => coinAcceptor.onStatus(setStatus), []);
  return status;
}
