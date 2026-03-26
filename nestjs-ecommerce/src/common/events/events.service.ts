import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'events';

@Injectable()
export class EventsService {
  private readonly eventEmitter = new EventEmitter();

  emit<TPayload>(eventName: string, payload: TPayload) {
    this.eventEmitter.emit(eventName, payload);
  }

  on<TPayload>(
    eventName: string,
    listener: (payload: TPayload) => void | Promise<void>,
  ) {
    this.eventEmitter.on(eventName, listener);
  }

  off<TPayload>(
    eventName: string,
    listener: (payload: TPayload) => void | Promise<void>,
  ) {
    this.eventEmitter.off(eventName, listener);
  }
}

