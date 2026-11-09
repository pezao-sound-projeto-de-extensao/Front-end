import { initializeFaro, getWebInstrumentations } from '@grafana/faro-web-sdk';
import { TracingInstrumentation } from '@grafana/faro-web-tracing';

if (import.meta.env.PROD) {
  initializeFaro({
    url: '/collect',
    app: { name: 'frontend', version: '1.0.0', environment: 'production' },
    instrumentations: [...getWebInstrumentations(), new TracingInstrumentation()],
  });
}
