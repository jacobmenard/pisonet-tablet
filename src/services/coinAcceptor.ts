import type { Coin } from '../domain/rates';

export type CoinListener = (coin: Coin) => void;
export type ConnectionStatus = 'connected' | 'disconnected';
export type StatusListener = (status: ConnectionStatus) => void;

/**
 * Boundary between the UI and the coin hardware (ESP32/Arduino + coin slot).
 * Real implementations: USB OTG serial, Bluetooth LE, or Wi-Fi from a central
 * coin box. The UI only ever depends on this interface.
 */
export interface CoinAcceptor {
  subscribe(listener: CoinListener): () => void;
  onStatus(listener: StatusListener): () => void;
  getStatus(): ConnectionStatus;
}

/** In-memory acceptor for the preview and tests; coins come from the dev panel. */
export class MockCoinAcceptor implements CoinAcceptor {
  private coinListeners = new Set<CoinListener>();
  private statusListeners = new Set<StatusListener>();
  private status: ConnectionStatus = 'connected';

  subscribe(listener: CoinListener) {
    this.coinListeners.add(listener);
    return () => {
      this.coinListeners.delete(listener);
    };
  }

  onStatus(listener: StatusListener) {
    this.statusListeners.add(listener);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  getStatus() {
    return this.status;
  }

  simulateInsert(coin: Coin) {
    if (this.status !== 'connected') return;
    this.coinListeners.forEach((l) => l(coin));
  }

  simulateStatus(status: ConnectionStatus) {
    this.status = status;
    this.statusListeners.forEach((l) => l(status));
  }
}

export const coinAcceptor = new MockCoinAcceptor();
