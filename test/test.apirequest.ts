// Copyright 2018 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import * as assert from 'assert';
import {describe, it, afterEach} from 'mocha';
import * as crypto from 'crypto';
import * as nock from 'nock';
import * as stream from 'stream';
import resolve = require('url');

import {GlobalOptions, MethodOptions} from '../src/api';
import {createAPIRequest} from '../src/apirequest';

interface MyWritableOptions {
  highWaterMark?: number;
}

class FakeReadable extends stream.Readable {
  _max = 100000;
  bytesSent = 0;
  _read() {
    if (this.bytesSent < this._max) {
      const str = crypto.randomBytes(500).toString('hex');
      this.bytesSent += str.length;
      this.emit('progress', this.bytesSent);
      this.push(str);
    } else {
      this.push(null);
    }
  }
}

class FakeWritable extends stream.Writable {
  boundary: string;
  startBoundaryFlag = 2;
  startParsed = false;

  constructor(boundary: string, options: MyWritableOptions) {
    super(options);
    this.boundary = boundary;
  }

  _write(
    chunk: Buffer | string,
    encoding: string,
    callback: (error?: Error | null) => void
  ) {
    let chunkString = chunk.toString();
    if (!this.startParsed) {
      const startIndex = chunkString.lastIndexOf('\r\n\r\n');
      if (startIndex > -1) {
        this.startBoundaryFlag--;
      }
      if (this.startBoundaryFlag === 0) {
        this.startParsed = true;
        chunkString = chunkString.substring(startIndex + 4);
      } else {
        chunkString = '';
      }
    }
    if (chunkString === '\r\n' || chunkString === this.boundary) {
      chunkString = '';
    }
    this.emit('progress', chunkString.length);
    callback();
  }
}

nock.disableNetConnect();

const fakeContext = {
  _options: {},
};

const url = 'https://example.com';
const fakeResponse = '👻';

interface FakeParams {
  foo: string;
  bar: string;
}
describe('createAPIRequest', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  describe('instantiation', () => {
    /**
     * As of today, most of the tests that cover this module live in
     * google-api-nodejs-client.  We need to slowly cover each scenario,
     * and bring this up to 100%.  This is just a simple starter.
     */

    it('should create a valid API request', async () => {
      const scope = nock(url).get('/').reply(200, fakeResponse);
      const result = await createAPIRequest<FakeParams>({
        options: {url},
        params: {},
        requiredParams: [],
        pathParams: [],
        context: fakeContext,
      });
      scope.done();
      assert.strictEqual(result.data, fakeResponse as {});
      assert(result);
    });

    it('should not populate resource parameter in URL, if not required parameter', async () => {
      const scope = nock(url).post('/').reply(200, fakeResponse);
      const result = await createAPIRequest<FakeParams>({
        options: {
          url,
          method: 'POST',
        },
        params: {
          resource: {
            foo: 'bar',
          },
        },
        requiredParams: [],
        pathParams: [],
        context: fakeContext,
      });
      scope.done();
      assert.strictEqual(result.data, fakeResponse as {});
      assert(result);
    });

    it('should not populate resource parameter in URL, if it is an object', async () => {
      assert.rejects(async () => {
        await createAPIRequest<FakeParams>({
          options: {
            url,
            method: 'POST',
          },
          params: {
            resource: {
              foo: 'bar',
            },
          },
          requiredParams: ['resource'],
          pathParams: [],
          context: fakeContext,
        });
      }, /Missing required parameters: resource/);
    });

    it('should not populate resource parameter in URL, if it is an object', async () => {
      assert.rejects(async () => {
        await createAPIRequest<FakeParams>({
          options: {
            url,
            method: 'POST',
          },
          params: {
            resource: {
              foo: 'bar',
            },
          },
          requiredParams: ['resource'],
          pathParams: [],
          context: fakeContext,
        });
      }, /Missing required parameters: resource/);
    });

    it('should populate resource parameter in URL, if it is required', async () => {
      const scope = nock(`${url}`)
        .get('/?resource=blerg')
        .reply(200, fakeResponse);
      const result = await createAPIRequest<FakeParams>({
        options: {url},
        params: {
          resource: 'blerg',
        },
        requiredParams: ['resource'],
        pathParams: [],
        context: fakeContext,
      });
      scope.done();
      assert.strictEqual(result.data, fakeResponse as {});
      assert(result);
    });

    it('should include directives in the user agent with local config', async () => {
      const scope = nock(url).get('/').reply(200);
      const res = await createAPIRequest<FakeParams>({
        options: {
          url,
          userAgentDirectives: [
            {product: 'frog', version: '1.0', comment: 'jumps'},
          ],
        },
        params: {},
        requiredParams: [],
        pathParams: [],
        context: fakeContext,
      });
      scope.done();
      // frog/1.0 (jumps) google-api-nodejs-client/0.6.0 (gzip)
      const userAgent = res.config.headers!['User-Agent'];
      assert.ok(/frog\/1.0 \(jumps\)/.test(userAgent));
      assert.ok(/google-api-nodejs-client\/.* \(gzip\)/.test(userAgent));
    });

    it('should include directives in the user agent with per-service config', async () => {
      const scope = nock(url).get('/').reply(200);
      const res = await createAPIRequest<FakeParams>({
        options: {url},
        params: {},
        requiredParams: [],
        pathParams: [],
        context: {
          _options: {
            userAgentDirectives: [
              {product: 'frog', version: '1.0', comment: 'jumps'},
            ],
          },
        },
      });
      scope.done();
      // frog/1.0 (jumps) google-api-nodejs-client/0.6.0 (gzip)
      const userAgent = res.config.headers!['User-Agent'];
      assert.ok(/frog\/1.0 \(jumps\)/.test(userAgent));
      assert.ok(/google-api-nodejs-client\/.* \(gzip\)/.test(userAgent));
    });

    it('should include directives in the user agent with global config', async () => {
      const scope = nock(url).get('/').reply(200);
      const res = await createAPIRequest<FakeParams>({
        options: {url},
        params: {},
        requiredParams: [],
        pathParams: [],
        context: {
          _options: {},
          google: {
            _options: {
              userAgentDirectives: [
                {product: 'frog', version: '1.0', comment: 'jumps'},
              ],
            },
          },
        },
      });
      scope.done();
      // frog/1.0 (jumps) google-api-nodejs-client/0.6.0 (gzip)
      const userAgent = res.config.headers!['User-Agent'];
      assert.ok(/frog\/1.0 \(jumps\)/.test(userAgent));
      assert.ok(/google-api-nodejs-client\/.* \(gzip\)/.test(userAgent));
    });

    it('should populate x-goog-api-client', async () => {
      const scope = nock(url)
        .get('/')
        .reply(function () {
          assert.ok(
            /gdcl\/[\w.-]+ gl-node\/[0-9]+\.[\w.-]+ auth\/[\w.-]+$/.test(
              this.req.headers['x-goog-api-client'][0]
            )
          );
          return [200, ''];
        });
      await createAPIRequest<FakeParams>({
        options: {url},
        params: {},
        requiredParams: [],
        pathParams: [],
        context: fakeContext,
      });
      scope.done();
    });

    it('should rewrite url to match default rootUrl', async () => {
      const rootUrl = 'http://www.googleapis.com/';
      const path = '/api/service';
      const scope = nock(rootUrl).get(path).reply(200);
      const res = await createAPIRequest<FakeParams>({
        options: {
          url: resolve.resolve('https://www.googleapis.com/', path),
        },
        params: {},
        requiredParams: [],
        pathParams: [],
        context: {
          _options: {
            rootUrl,
          },
        },
      });
      scope.done();
      const expectedUrl = 'http://www.googleapis.com/api/service';
      assert.strictEqual(res.config.url, expectedUrl);
    });
  });

  describe('mock stream', () => {
    let totalBytesSent: number;
    let totalBytesReceived = 0;
    const fStream = new FakeReadable();
    fStream.on('progress', (currentBytesSent: number) => {
      totalBytesSent = currentBytesSent;
    });

    const requestBody = {};
    const media = {
      mimeType: 'application/octet-stream',
      body: fStream,
    };
    const auth = {
      request: (opts: GlobalOptions & MethodOptions) => {
        const contentType = opts.headers!['Content-Type'];
        const boundary = `--${contentType.substring(
          contentType.indexOf('boundary=') + 9
        )}--`;
        const rStream = new FakeWritable(boundary, {highWaterMark: 400});
        rStream.on('progress', (currentBytesReceived: number) => {
          totalBytesReceived += currentBytesReceived;
        });
        opts.data.pipe(rStream);
      },
    };

    it('should pass all chunks', async () => {
      await createAPIRequest<FakeParams>({
        options: {url},
        params: {
          requestBody,
          media,
          auth,
        },
        requiredParams: [],
        pathParams: [],
        context: fakeContext,
        mediaUrl: 'https://example.com',
      });
      assert.strictEqual(totalBytesSent, totalBytesReceived);
    });
  });

  describe('options', () => {
    it('should retry GET requests by default', async () => {
      const scope = nock(url).get('/').reply(500).get('/').reply(200);
      await createAPIRequest<FakeParams>({
        options: {url},
        params: {},
        requiredParams: [],
        pathParams: [],
        context: fakeContext,
      });
      scope.done();
    });

    it('should merge headers from global and local config', async () => {
      const scope = nock(url).get('/').reply(200);
      const res = await createAPIRequest<FakeParams>({
        options: {
          url,
          headers: {
            'Local-Header': 'local',
          },
        },
        params: {},
        requiredParams: [],
        pathParams: [],
        context: {
          _options: {},
          google: {
            _options: {
              headers: {
                'Global-Header': 'global',
              },
            },
          },
        },
      });
      scope.done();
      assert.strictEqual(res.config.headers!['Global-Header'], 'global');
      assert.strictEqual(res.config.headers!['Local-Header'], 'local');
    });

    it('should remove path params from the querystring when set in API level options', async () => {
      const optUrl = `${url}/projects/{projectId}`;
      const projectId = 'not-a-project';
      const path = `/projects/${projectId}`;
      const scope = nock(url).get(path).reply(200);
      const res = await createAPIRequest<FakeParams>({
        options: {url: optUrl},
        params: {},
        requiredParams: [],
        pathParams: ['projectId'],
        context: {
          _options: {
            params: {
              projectId,
            },
          },
        },
      });
      scope.done();
      const expectedUrl = `${url}/projects/${projectId}`;
      assert.strictEqual(res.config.url, expectedUrl);
    });
  });
});
