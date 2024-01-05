import { W3CBaggagePropagator } from '@opentelemetry/core';

export const message = 'hello from cjs';
console.log(message);

const propagator = new W3CBaggagePropagator();
console.log(propagator);
