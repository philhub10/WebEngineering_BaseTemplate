import { buildApp } from './app.js';
import { loadEnv } from './schemas/env.js';

const EXIT_FAILURE = 1;

const app = buildApp({ logger: true, trustProxy: loadEnv().TRUST_PROXY });

async function shutdown(signal: NodeJS.Signals): Promise<void> {
  app.log.info({ signal }, 'shutting down');
  try {
    await app.close();
  } catch (err) {
    app.log.error(err);
    process.exitCode = EXIT_FAILURE;
  }
}

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, (received) => {
    void shutdown(received);
  });
}

try {
  await app.ready();
  await app.listen({ host: app.config.HOST, port: app.config.PORT });
} catch (err) {
  app.log.error(err);
  process.exitCode = EXIT_FAILURE;
}
