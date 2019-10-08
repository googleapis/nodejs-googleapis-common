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

import {createAPIRequest} from '../src';
import {auth, OAuth2Client} from 'google-auth-library';

describe('should work with http/2', () => {
  let authClient: OAuth2Client;

  before(async () => {
    authClient = await auth.getClient();
  });

  it('should work with http/2', async () => {
    const projectId = await auth.getProjectId();
    const f = await createAPIRequest({
      options: {
        url: `https://pubsub.googleapis.com/v1/projects/${projectId}/topics`,
        http2: true,
      },
      params: {
        auth: authClient,
      },
      requiredParams: [],
      pathParams: [],
      context: {
        _options: {},
      },
    });
    console.log(f.data);
  });
});
