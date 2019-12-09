// Copyright 2019 Google LLC
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

// This configuration file is used for browser testing with Karma.
// See karma.conf.js for details.

const path = require('path');

module.exports = {
  resolve: {
    extensions: ['.ts', '.js', '.json'],
    alias: {
      '../../package.json': path.resolve(__dirname, 'package.json'),
    },
  },
  node: {
    child_process: 'empty',
    fs: 'empty',
    crypto: 'empty',
  },
  module: {
    rules: [
      {
        test: /src\/crypto\/node\/crypto/,
        use: 'null-loader',
      },
      {
        test: /node_modules\/gtoken\//,
        use: 'null-loader',
      },
      {
        test: /node_modules\/pkginfo\//,
        use: 'null-loader',
      },
      {
        test: /node_modules\/https-proxy-agent\//,
        use: 'null-loader',
      },
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  mode: 'production',
  plugins: [],
  performance: {hints: false},
};
