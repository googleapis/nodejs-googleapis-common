// Copyright 2018, Google, LLC.
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {assert} from 'chai';
import * as crypto from 'crypto';
import * as nock from 'nock';
import * as stream from 'stream';

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
      chunk: Buffer|string, encoding: string,
      callback: (error?: Error|null) => void) {
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
  _options: {}
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

    it('should include directives in the user agent', async () => {
      const scope = nock(url).get('/').reply(200);
      const res = await createAPIRequest<FakeParams>({
        options: {
          url,
          userAgentDirectives:
              [{product: 'frog', version: '1.0', comment: 'jumps'}]
        },
        params: {},
        requiredParams: [],
        pathParams: [],
        context: fakeContext
      });
      scope.done();
      // frog/1.0 (jumps) google-api-nodejs-client/0.6.0 (gzip)
      const userAgent = res.config.headers!['User-Agent'];
      assert.match(userAgent, /frog\/1.0 \(jumps\)/);
      assert.match(userAgent, /google-api-nodejs-client\/.* \(gzip\)/);
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
      request: (opts: GlobalOptions&MethodOptions) => {
        const contentType = opts.headers!['Content-Type'];
        const boundary = `--${
            contentType.substring(contentType.indexOf('boundary=') + 9)}--`;
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
        context: fakeContext
      });
      scope.done();
    });
  });
});
