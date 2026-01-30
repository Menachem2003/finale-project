import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class HealthService {
  constructor(@InjectConnection() private connection: Connection) {}

  async checkDatabase(): Promise<{ status: string; message: string }> {
    try {
      const state = this.connection.readyState;
      const states: Record<number, string> = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting',
      };

      const stateMessage = states[state] || 'unknown';

      if (state === 1) {
        return {
          status: 'healthy',
          message: `Database is ${stateMessage}`,
        };
      } else {
        return {
          status: 'unhealthy',
          message: `Database is ${stateMessage}`,
        };
      }
    } catch (error) {
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
