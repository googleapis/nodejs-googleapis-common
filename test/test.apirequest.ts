// Copyright 2018, Google, LLC.
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

import * as assert from 'assert';
import * as nock from 'nock';
import {createAPIRequest} from '../src/apirequest';

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

afterEach(() => {
  nock.cleanAll();
});

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
    context: fakeContext
  });
  scope.done();
  assert.strictEqual(result.data, fakeResponse);
  assert(result);
});
