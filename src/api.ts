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

import {GaxiosOptions, GaxiosResponse} from 'gaxios';
import {OAuth2Client} from 'google-auth-library';

import {Endpoint} from './endpoint';

// tslint:disable-next-line no-any
export interface APIRequestParams<T = any> {
  options: GaxiosOptions;
  params: T;
  requiredParams: string[];
  pathParams: string[];
  context: APIRequestContext;
  mediaUrl?: string|null;
}

export interface GoogleConfigurable {
  _options: GlobalOptions;
}

export interface APIRequestContext {
  google?: GoogleConfigurable;
  _options: GlobalOptions;
}

/**
 * This interface is a mix of the AxiosRequestConfig options
 * and our `auth: OAuth2Client|string` options.
 */
export interface GlobalOptions extends GaxiosOptions {
  auth?: OAuth2Client|string;
}

export interface MethodOptions extends GaxiosOptions {
  rootUrl?: string;
}
export interface ServiceOptions extends GlobalOptions {
  version?: string;
}

export type BodyResponseCallback<T> =
    (err: Error|null, res?: GaxiosResponse<T>|null) => void;

// tslint:disable-next-line: no-any
export type APIEndpoint = Readonly<Endpoint&any>;
