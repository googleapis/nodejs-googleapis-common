// Copyright 2019, Google, LLC.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import * as http2 from 'http2';
import * as zlib from 'zlib';
import {URL} from 'url';
import * as qs from 'qs';
import * as extend from 'extend';
import {Stream, Readable} from 'stream';
import * as util from 'util';
import * as process from 'process';
import {GaxiosResponse, GaxiosOptions} from 'gaxios';
import {GaxiosXMLHttpRequest, GaxiosError} from 'gaxios/build/src/common';

const {
  HTTP2_HEADER_CONTENT_ENCODING,
  HTTP2_HEADER_CONTENT_TYPE,
  HTTP2_HEADER_METHOD,
  HTTP2_HEADER_PATH,
  HTTP2_HEADER_STATUS,
} = http2.constants;

const DEBUG = !!process.env.HTTP2_DEBUG;

/**
 * Reference to the ClientHttp2Session and a timeout handler.
 * @private
 */
export interface SessionData {
  client: http2.ClientHttp2Session;
  timeoutHandle?: NodeJS.Timer;
}

/**
 * List of sessions current in use.
 * @private
 */
export const sessions: {[index: string]: SessionData} = {};
let warned = false;

/**
 * Public method to make an http2 request.
 * @param config - Request options.
 */
export async function request<T>(
  config: GaxiosOptions
): Promise<GaxiosResponse<T>> {
  // Make sure users know this API is unstable
  if (!warned) {
    const message = `
      The HTTP/2 API in googleapis is unstable! This is an early implementation
      that should not be used in production.  It may change in unpredictable
      ways. Please only use this for experimentation.
    `;
    process.emitWarning(message, 'GOOG_HTTP2');
    warned = true;
  }

  const opts = extend(true, {}, config);
  opts.validateStatus = opts.validateStatus || validateStatus;
  opts.responseType = opts.responseType || 'json';

  const url = new URL(opts.url!);

  // Check for an existing session to this host, or go create a new one.
  const session = _getClient(url.host);

  // Since we're using this session, clear the timeout handle to ensure
  // it stays in memory and connected for a while further.
  if (session.timeoutHandle !== undefined) {
    clearTimeout(session.timeoutHandle);
  }

  // Assemble the querystring based on config.params.  We're using the
  // `qs` module to make life a little easier.
  let pathWithQs = url.pathname;
  if (config.params) {
    const q = qs.stringify(opts.params);
    pathWithQs += `?${q}`;
  }

  // Assemble the headers based on basic HTTP2 primitives (path, method) and
  // custom headers sent from the consumer.  Note: I am using `Object.assign`
  // here making the assumption these objects are not deep.  If it turns out
  // they are, we may need to use the `extend` npm module for deep cloning.
  const headers = Object.assign({}, opts.headers, {
    [HTTP2_HEADER_PATH]: pathWithQs,
    [HTTP2_HEADER_METHOD]: config.method || 'GET',
    [HTTP2_HEADER_CONTENT_TYPE]: 'application/json',
  });

  const req = session.client.request(headers);
  const chunks: Buffer[] = [];
  const res: GaxiosResponse<T> = {
    config,
    request: (req as {}) as GaxiosXMLHttpRequest,
    headers: [],
    status: 0,
    data: {} as T,
    statusText: '',
  };

  return new Promise((resolve, reject) => {
    req
      .on('data', d => chunks.push(d))
      .on('response', headers => {
        res.headers = headers;
        res.status = Number(headers[HTTP2_HEADER_STATUS]);
        let stream: Readable = req;
        if (headers[HTTP2_HEADER_CONTENT_ENCODING] === 'gzip') {
          stream = req.pipe(zlib.createGunzip());
        }
        if (opts.responseType === 'stream') {
          res.data = (stream as {}) as T;
          resolve(res);
          return;
        }
      })
      .on('error', e => {
        reject(e);
        return;
      })
      .on('end', () => {
        const allChunks = Buffer.concat(chunks);
        // TODO: Currently, this code is double buffering responses by storing
        // the entire buffer contents in memory, and then piping that through
        // gunzipSync. This should be changed to pipe the data towards a stream,
        // and to not use the `Sync` method.
        let data = '';
        if (res.headers[HTTP2_HEADER_CONTENT_ENCODING] === 'gzip') {
          data = zlib.gunzipSync(allChunks).toString('utf8');
        } else {
          data = allChunks.toString('utf8');
        }
        res.data = JSON.parse(data);

        if (!opts.validateStatus!(res.status)) {
          let message = `Request failed with status code ${res.status}. `;
          if (res.data && typeof res.data === 'object') {
            message =
              message +
              '\n' +
              util.inspect(res.data, {
                depth: 5,
              });
          }
          reject(new GaxiosError<T>(message, opts, res));
        }
        resolve(res);
        return;
      });

    // If data was provided, write it to the request in the form of
    // a stream, string data, or a basic object.
    if (config.data) {
      if (config.data instanceof Stream) {
        config.data.pipe(req);
      } else if (typeof config.data === 'string') {
        const data = Buffer.from(config.data);
        req.end(data);
      } else if (typeof config.data === 'object') {
        const data = JSON.stringify(config.data);
        req.end(data);
      }
    }

    // Create a timeout so the Http2Session will be cleaned up after
    // a period of non-use. 500 milliseconds was chosen because it's
    // a nice round number, and I don't know what would be a better
    // choice. Keeping this channel open will hold a file descriptor
    // which will prevent the process from exiting.
    session.timeoutHandle = setTimeout(() => {
      session.client.close(() => {
        if (DEBUG) {
          console.error(`Closing ${url.host}`);
        }
        delete sessions[url.host];
      });
    }, 500);
  });
}

/**
 * By default, throw for any non-2xx status code
 * @param status - status code from the HTTP response
 */
function validateStatus(status: number) {
  return status >= 200 && status < 300;
}

/**
 * Obtain an existing h2 session or go create a new one.
 * @param host - The hostname to which the session belongs.
 */
function _getClient(host: string): SessionData {
  if (!sessions[host]) {
    if (DEBUG) {
      console.log(`Creating client for ${host}`);
    }
    const client = http2.connect(`https://${host}`);
    client
      .on('error', e => {
        console.error(`*ERROR*: ${e}`);
        delete sessions[host];
      })
      .on('goaway', (errorCode, lastStreamId) => {
        console.error(`*GOAWAY*: ${errorCode} : ${lastStreamId}`);
        delete sessions[host];
      });
    sessions[host] = {client};
  } else {
    if (DEBUG) {
      console.log(`Used cached client for ${host}`);
    }
  }
  return sessions[host];
}
