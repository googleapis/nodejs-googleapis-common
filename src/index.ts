// Copyright 2020 Google LLC
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

export {
  OAuth2Client,
  JWT,
  Compute,
  UserRefreshClient,
  DefaultTransporter,
  GoogleAuth,
  ExternalAccountClient,
  BaseExternalAccountClient,
  IdentityPoolClient,
  AwsClient,
} from 'google-auth-library';
export {
  GaxiosPromise,
  Gaxios,
  GaxiosError,
  GaxiosOptions,
  GaxiosResponse,
  Headers,
  RetryConfig,
} from 'gaxios';
export {
  APIEndpoint,
  APIRequestContext,
  APIRequestParams,
  BodyResponseCallback,
  GlobalOptions,
  GoogleConfigurable,
  MethodOptions,
  StreamMethodOptions,
  ServiceOptions,
} from './api';
export {getAPI} from './apiIndex';
export {createAPIRequest} from './apirequest';
export {AuthPlus} from './authplus';
export {Discovery, DiscoveryOptions, EndpointCreator} from './discovery';
export {Endpoint, Target} from './endpoint';
export {
  FragmentResponse,
  HttpMethod,
  ParameterFormat,
  Schema,
  SchemaItem,
  SchemaItems,
  SchemaMethod,
  SchemaMethods,
  SchemaParameter,
  SchemaParameters,
  SchemaResource,
  SchemaResources,
  Schemas,
  SchemaType,
} from './schema';
