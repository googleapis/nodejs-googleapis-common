# Changelog

[npm history][1]

[1]: https://www.npmjs.com/package/nodejs-googleapis-common?activeTab=versions

## v0.5.0

12-26-2018 13:14 PST

### Fixes
- fix: Prevent premature closure of rStream. ([#65](https://github.com/googleapis/nodejs-googleapis-common/pull/65))

### Dependencies
- chore(deps): update dependency gts to ^0.9.0 ([#43](https://github.com/googleapis/nodejs-googleapis-common/pull/43))
- chore(deps): update dependency typescript to ~3.2.0 ([#47](https://github.com/googleapis/nodejs-googleapis-common/pull/47))

### Documentation
- chore: update license file ([#52](https://github.com/googleapis/nodejs-googleapis-common/pull/52))

### Internal / Testing Changes
- fix(build): fix Kokoro release script ([#60](https://github.com/googleapis/nodejs-googleapis-common/pull/60))
- fix(build): fix system key decryption ([#48](https://github.com/googleapis/nodejs-googleapis-common/pull/48))
- chore: fix publish.sh permission +x ([#61](https://github.com/googleapis/nodejs-googleapis-common/pull/61))
- chore: update eslintignore config ([#42](https://github.com/googleapis/nodejs-googleapis-common/pull/42))
- chore: use latest npm on Windows ([#41](https://github.com/googleapis/nodejs-googleapis-common/pull/41))
- chore: update nyc and eslint configs ([#63](https://github.com/googleapis/nodejs-googleapis-common/pull/63))
- chore: nyc ignore build/test by default ([#55](https://github.com/googleapis/nodejs-googleapis-common/pull/55))
- chore: always nyc report before calling codecov ([#56](https://github.com/googleapis/nodejs-googleapis-common/pull/56))
- chore: add synth.metadata
- chore(build): update the prettier and renovate configs ([#53](https://github.com/googleapis/nodejs-googleapis-common/pull/53))
- chore(build): inject yoshi automation key ([#64](https://github.com/googleapis/nodejs-googleapis-common/pull/64))
- build: add Kokoro configs for autorelease ([#59](https://github.com/googleapis/nodejs-googleapis-common/pull/59))

## v0.4.0

11-02-2018 10:31 PDT


### Implementation Changes

### New Features
- add additionalProperties to SchemaItem ([#34](https://github.com/googleapis/nodejs-googleapis-common/pull/34))

### Dependencies
- fix(deps): update dependency pify to v4 ([#23](https://github.com/googleapis/nodejs-googleapis-common/pull/23))
- chore(deps): update dependency typescript to ~3.1.0 ([#20](https://github.com/googleapis/nodejs-googleapis-common/pull/20))

### Documentation
- chore: update issue templates ([#29](https://github.com/googleapis/nodejs-googleapis-common/pull/29))
- chore: remove old issue template ([#27](https://github.com/googleapis/nodejs-googleapis-common/pull/27))
- chore: update issue templates

### Internal / Testing Changes
- chore: update CircleCI config ([#37](https://github.com/googleapis/nodejs-googleapis-common/pull/37))
- chore: include build in eslintignore ([#33](https://github.com/googleapis/nodejs-googleapis-common/pull/33))
- build: run tests on node11 ([#25](https://github.com/googleapis/nodejs-googleapis-common/pull/25))
- chore(deps): update dependency nock to v10 ([#21](https://github.com/googleapis/nodejs-googleapis-common/pull/21))
- chores(build): run codecov on continuous builds ([#19](https://github.com/googleapis/nodejs-googleapis-common/pull/19))
- chores(build): do not collect sponge.xml from windows builds ([#22](https://github.com/googleapis/nodejs-googleapis-common/pull/22))
- build: fix codecov uploading on Kokoro ([#15](https://github.com/googleapis/nodejs-googleapis-common/pull/15))
- build: bring in Kokoro cfgs ([#13](https://github.com/googleapis/nodejs-googleapis-common/pull/13))
- Don't publish sourcemaps ([#12](https://github.com/googleapis/nodejs-googleapis-common/pull/12))
- Enable prefer-const in the eslint config ([#11](https://github.com/googleapis/nodejs-googleapis-common/pull/11))
- Enable no-var in eslint ([#10](https://github.com/googleapis/nodejs-googleapis-common/pull/10))
- Retry npm install in CI ([#9](https://github.com/googleapis/nodejs-googleapis-common/pull/9))

## v0.3.0

This release uses the 2.0 release of `google-auth-library`.  A summary of these changes (including breaking changes) can be found in the [release notes](https://github.com/google/google-auth-library-nodejs/releases/tag/v2.0.0).

### Dependencies
- Upgrade to google-auth-library 2.0 (#6)

## v0.2.1

### Fixes
- fix: use the latest google-auth-library (#4)

