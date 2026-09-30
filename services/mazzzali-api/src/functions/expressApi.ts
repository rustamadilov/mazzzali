import { app, type HttpResponseInit } from '@azure/functions';
import { createServer, type Server } from 'node:http';
import { expressApp } from '../app.js';

let expressServer: Promise<Server> | undefined;

function startExpressServer(): Promise<Server> {
  if (!expressServer) {
    expressServer = new Promise((resolve, reject) => {
      const server = createServer(expressApp);
      server.once('error', reject);
      server.listen(0, '127.0.0.1', () => resolve(server));
    });
  }
  return expressServer;
}

app.http('mazzzaliApi', {
  methods: ['GET', 'POST', 'PUT', 'OPTIONS'],
  authLevel: 'anonymous',
  route: '{*segments}',
  handler: async (request): Promise<HttpResponseInit> => {
    const server = await startExpressServer();
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Express bridge did not bind to a TCP port.');
    const incomingUrl = new URL(request.url);
    const headers = new Headers();
    for (const [name, value] of request.headers.entries()) headers.set(name, value);
    const body = ['GET', 'HEAD'].includes(request.method) ? undefined : new Uint8Array(await request.arrayBuffer());
    const forwarded = await fetch(`http://127.0.0.1:${address.port}${incomingUrl.pathname}${incomingUrl.search}`, {
      method: request.method,
      headers,
      body,
      redirect: 'manual',
    });
    const responseHeaders = Object.fromEntries(forwarded.headers.entries());
    const setCookies = forwarded.headers.getSetCookie();
    if (setCookies.length) responseHeaders['set-cookie'] = setCookies.join(', ');
    return {
      status: forwarded.status,
      headers: responseHeaders,
      body: new Uint8Array(await forwarded.arrayBuffer()),
    };
  },
});