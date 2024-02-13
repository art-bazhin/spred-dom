# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [0.10.0](https://github.com/art-bazhin/spred-dom/compare/v0.9.0...v0.10.0) (2024-02-13)


### ⚠ BREAKING CHANGES

* bump version

### Features

* add basic two way binding ([1b77cc7](https://github.com/art-bazhin/spred-dom/commit/1b77cc77431a10e2792dcb1644b3844896ed162b))
* add bind function ([9ba8bdf](https://github.com/art-bazhin/spred-dom/commit/9ba8bdfbe713728f1679d9a96a58db8b5ce00e8a))


### Code Refactoring

* minor refactoring ([8d33732](https://github.com/art-bazhin/spred-dom/commit/8d337322fdafc0d784a4d2538c9c5aaf7b75263d))
* refactor dom node insertion ([8d6d2af](https://github.com/art-bazhin/spred-dom/commit/8d6d2afad4b959c20d395bda43fecf27883fe538))
* use new low level api ([ef79123](https://github.com/art-bazhin/spred-dom/commit/ef791231e5c48ef340846d4a21e1afdd5ab4d26d))

## [0.9.0](https://github.com/art-bazhin/spred-dom/compare/v0.8.4...v0.9.0) (2024-02-10)


### ⚠ BREAKING CHANGES

* fn values don't become signals automatically

### Features

* use fn values to set props during component render ([96afda6](https://github.com/art-bazhin/spred-dom/commit/96afda6451ae309ac5de492bb72a7debbfe28a76))


### Code Refactoring

* reduce call stack size during traversal ([72e6ccc](https://github.com/art-bazhin/spred-dom/commit/72e6ccc1a25646225577784382c116761770d5ea))
* use comment nodes as markers ([b3e6c4f](https://github.com/art-bazhin/spred-dom/commit/b3e6c4f0334b30d1e7633e3093190dcc5f4fed10))

### [0.8.4](https://github.com/art-bazhin/spred-dom/compare/v0.8.3...v0.8.4) (2024-02-06)


### Bug Fixes

* fix event listener type ([e1ee90c](https://github.com/art-bazhin/spred-dom/commit/e1ee90cd3c0ff45bc7169ef80f2a8827e4a58606))


### Code Refactoring

* remove redundant checks ([7e732a7](https://github.com/art-bazhin/spred-dom/commit/7e732a71d42090d8a9e9d9b0d8187e137b1be942))

### [0.8.3](https://github.com/art-bazhin/spred-dom/compare/v0.8.2...v0.8.3) (2024-02-05)


### Bug Fixes

* fix text prop type ([4e10f11](https://github.com/art-bazhin/spred-dom/commit/4e10f11ba4f57cbf395df6cf0be07f227c97e4c7))

### [0.8.2](https://github.com/art-bazhin/spred-dom/compare/v0.8.1...v0.8.2) (2024-02-02)


### Bug Fixes

* fix empty class attribute bug ([8df1d23](https://github.com/art-bazhin/spred-dom/commit/8df1d2312cd4a7c2ad0a1eb1ca459a00486ff1d5))

### [0.8.1](https://github.com/art-bazhin/spred-dom/compare/v0.8.0...v0.8.1) (2024-02-01)


### Build System

* update @spred/core version ([9d09dc5](https://github.com/art-bazhin/spred-dom/commit/9d09dc504b189b6ec3f95840b52173e1e778fea5))

## [0.8.0](https://github.com/art-bazhin/spred-dom/compare/v0.7.4...v0.8.0) (2024-01-31)


### ⚠ BREAKING CHANGES

* bump version

### Features

* add two way binding for text inputs ([14e20df](https://github.com/art-bazhin/spred-dom/commit/14e20dfdf2af36b04d14c08099821078e17db4d5))


### Build System

* update dev dependencies ([76c3002](https://github.com/art-bazhin/spred-dom/commit/76c300280ea02f0d73049ed270546d3aa2a54b09))


### Code Refactoring

* rename templateFn to template ([4a3cb9e](https://github.com/art-bazhin/spred-dom/commit/4a3cb9e83d390c9525cfadce2001f92b770c502a))
* update using actual spred version ([d5b9647](https://github.com/art-bazhin/spred-dom/commit/d5b9647b4e15505c81d8aaaf61a347b8e617389d))

### [0.7.4](https://github.com/art-bazhin/spred-dom/compare/v0.7.3...v0.7.4) (2024-01-31)


### Docs

* add package replacement note ([c144235](https://github.com/art-bazhin/spred-dom/commit/c1442350a6a009a729a62851ad706bacfd9f8e58))

### [0.7.3](https://github.com/art-bazhin/spred-dom/compare/v0.7.2...v0.7.3) (2022-10-27)


### Bug Fixes

* **list:** fix mutated list rendering bug ([e0c080a](https://github.com/art-bazhin/spred-dom/commit/e0c080a7a3a7b6c3123dd2bfd93ab76d313d88a1))

### [0.7.2](https://github.com/art-bazhin/spred-dom/compare/v0.7.1...v0.7.2) (2022-10-19)


### Features

* update spred version ([9318bcb](https://github.com/art-bazhin/spred-dom/commit/9318bcb67d165ed73c326da940a1c4bb9c063ebe))

### [0.7.1](https://github.com/art-bazhin/spred-dom/compare/v0.7.0...v0.7.1) (2022-09-18)


### Features

* **classes:** add classes function ([56e702a](https://github.com/art-bazhin/spred-dom/commit/56e702a3c390494b20ef886194bfaeefbaa37243))
* **h:** use an object or an array as class prop value ([83d4908](https://github.com/art-bazhin/spred-dom/commit/83d4908cafd290ece972cf4b55d5d5c39baacd59))


### Build System

* **tsconfig:** change target to ESNEXT ([e0f1344](https://github.com/art-bazhin/spred-dom/commit/e0f134407618874932ba3e4b6683328878f0f5d9))


### Code Refactoring

* use one common type for falsy dom values ([dcf62a5](https://github.com/art-bazhin/spred-dom/commit/dcf62a5a11f46857f5d7c30f97ec855be31ca4f9))

## [0.7.0](https://github.com/art-bazhin/spred-dom/compare/v0.6.0...v0.7.0) (2022-09-15)


### ⚠ BREAKING CHANGES

* **component:** component fn should return h call result

### Features

* automatically turn fn props into signals ([7e984ff](https://github.com/art-bazhin/spred-dom/commit/7e984ff548971c98eda7812e7c71c24f3bd334d9))
* **component:** add component fn return types ([0b08b3b](https://github.com/art-bazhin/spred-dom/commit/0b08b3b90a4ff78588c04916c8232c7a39e3fb09))

## [0.6.0](https://github.com/art-bazhin/spred-dom/compare/v0.5.13...v0.6.0) (2022-08-27)


### ⚠ BREAKING CHANGES

* fn props and attrs are not turned into a signal automatically

### Features

* do not turn fn props and attrs into signal ([eeb35c3](https://github.com/art-bazhin/spred-dom/commit/eeb35c312c5c74732d952ec77b86d69dd5cb60cf))

### [0.5.13](https://github.com/art-bazhin/spred-dom/compare/v0.5.12...v0.5.13) (2022-08-06)


### Bug Fixes

* fix traversal order bug ([f8aabc7](https://github.com/art-bazhin/spred-dom/commit/f8aabc79ef46e69200470b4e8d688976c9bd29a7))


### Tests

* add missed prop binding case ([9ea3e55](https://github.com/art-bazhin/spred-dom/commit/9ea3e5561dae741ba45035145edddb4460d98243))

### [0.5.12](https://github.com/art-bazhin/spred-dom/compare/v0.5.11...v0.5.12) (2022-08-05)


### Bug Fixes

* fix prop binding bug ([ab983a5](https://github.com/art-bazhin/spred-dom/commit/ab983a5dbd25b7f6ff47d9254f7e062040a61d46))


### Code Refactoring

* refactor traversal state ([abf3107](https://github.com/art-bazhin/spred-dom/commit/abf31075efb89c26c6e46ad866abaabf809df99f))

### [0.5.11](https://github.com/art-bazhin/spred-dom/compare/v0.5.10...v0.5.11) (2022-08-05)


### Features

* add ref prop ([989f364](https://github.com/art-bazhin/spred-dom/commit/989f3640626320bd3d42de0a67e2d2472de1e5f6))

### [0.5.10](https://github.com/art-bazhin/spred-dom/compare/v0.5.9...v0.5.10) (2022-08-04)


### Features

* add attrs support ([bbcfccf](https://github.com/art-bazhin/spred-dom/commit/bbcfccf9f371fe690247fa70f3a51f3814251f71))
* add text and class aliases ([5ee1e6a](https://github.com/art-bazhin/spred-dom/commit/5ee1e6adf4ff3d0d1b9066071f571e66f164ee0d))


### Tests

* add component fn tests ([5a27995](https://github.com/art-bazhin/spred-dom/commit/5a27995920e7f2a4b8b6c809d0a45ca9838e6b65))
* add fragment rendering test ([1249df1](https://github.com/art-bazhin/spred-dom/commit/1249df1425713877cb57cfaafc4b017def3c5063))
* add h function tests ([ec5f383](https://github.com/art-bazhin/spred-dom/commit/ec5f3834c703bcf7cab215e3f4af9914e39df3ac))
* add list function tests ([5220740](https://github.com/art-bazhin/spred-dom/commit/52207401e9e1febc2335ef9c69db93bcf416bb54))
* add node fn tests ([f7d8bff](https://github.com/art-bazhin/spred-dom/commit/f7d8bff4a8d4582cff69a7860eab61034fe0cfa7))
* add text fn tests ([dc355c8](https://github.com/art-bazhin/spred-dom/commit/dc355c83c802adb0a30acd0b0fe2f219a15bc54c))
* cover missed branches ([bc43c8a](https://github.com/art-bazhin/spred-dom/commit/bc43c8a80cfba7197d847be97415ed9d72193fc2))


### Code Refactoring

* remove redundant checks ([7bd49eb](https://github.com/art-bazhin/spred-dom/commit/7bd49eb65a873059ffad1604054dfc721bb98ad8))

### [0.5.9](https://github.com/art-bazhin/spred-dom/compare/v0.5.8...v0.5.9) (2022-08-03)


### Code Refactoring

* use native listeners instead of event delegation ([5f4362b](https://github.com/art-bazhin/spred-dom/commit/5f4362bfa466eee9677cf154ea0f3a37dddc3c86))

### [0.5.8](https://github.com/art-bazhin/spred-dom/compare/v0.5.7...v0.5.8) (2022-08-03)


### Bug Fixes

* update lists during recalculation instead of notification ([d69ec63](https://github.com/art-bazhin/spred-dom/commit/d69ec636ee6dd95e40e99d818ce9e2e653d3dc52))

### [0.5.7](https://github.com/art-bazhin/spred-dom/compare/v0.5.6...v0.5.7) (2022-08-03)


### Bug Fixes

* fix writable keys type ([13718fc](https://github.com/art-bazhin/spred-dom/commit/13718fc9a92a8f3a85df564a272c555ebb8bb7a9))

### [0.5.6](https://github.com/art-bazhin/spred-dom/compare/v0.5.5...v0.5.6) (2022-08-03)


### Bug Fixes

* fix list cleanup ([6563539](https://github.com/art-bazhin/spred-dom/commit/656353991d0732576dd995869a05ded0ec07ec2d))

### [0.5.5](https://github.com/art-bazhin/spred-dom/compare/v0.5.4...v0.5.5) (2022-08-03)


### Bug Fixes

* fix list rendering cleanup ([6678e60](https://github.com/art-bazhin/spred-dom/commit/6678e60606e64e861303fe501dc8a6d03f618aa9))

### [0.5.4](https://github.com/art-bazhin/spred-dom/compare/v0.5.3...v0.5.4) (2022-08-03)


### Bug Fixes

* fix reconciliation memory leak ([38ca0de](https://github.com/art-bazhin/spred-dom/commit/38ca0de22493f71cbb7c63afc538e9c8837a9195))

### [0.5.3](https://github.com/art-bazhin/spred-dom/compare/v0.5.2...v0.5.3) (2022-08-02)


### Bug Fixes

* fix full list replacement bug ([4178e7d](https://github.com/art-bazhin/spred-dom/commit/4178e7d2bffe0b9e6f6a9b4ba285f6a0b07ecfff))

### [0.5.2](https://github.com/art-bazhin/spred-dom/compare/v0.5.1...v0.5.2) (2022-08-02)


### Bug Fixes

* fix fragments reconciliation bug ([630f3fd](https://github.com/art-bazhin/spred-dom/commit/630f3fdfdcfc1f78836c4abebad133b869c5ac81))

### [0.5.1](https://github.com/art-bazhin/spred-dom/compare/v0.5.0...v0.5.1) (2022-08-02)


### Features

* reconcile lists ([882c572](https://github.com/art-bazhin/spred-dom/commit/882c572ce09579976fc80d8d9ad527257afee07a))

## [0.5.0](https://github.com/art-bazhin/spred-dom/compare/v0.4.0...v0.5.0) (2022-08-01)


### ⚠ BREAKING CHANGES

* createComponent -> component, createComponentFn -> templateFn

### Features

* rename api methods ([1cc8574](https://github.com/art-bazhin/spred-dom/commit/1cc8574a7e8f8d0e335f978f5192fe55f385517d))
* transform value functions to signals automatically ([951a278](https://github.com/art-bazhin/spred-dom/commit/951a27829f70805a50c35abb4098c08736227fac))


### Build System

* update spred version ([2f6888a](https://github.com/art-bazhin/spred-dom/commit/2f6888a237420d0920bfa6fff021110b53e05f80))

## [0.4.0](https://github.com/art-bazhin/spred-dom/compare/v0.3.6...v0.4.0) (2022-07-31)


### ⚠ BREAKING CHANGES

* remove cleanup function

### Bug Fixes

* fix subs cleanup ([185a6e3](https://github.com/art-bazhin/spred-dom/commit/185a6e39d6717734775b20886e4091df10a829bd))

### [0.3.6](https://github.com/art-bazhin/spred-dom/compare/v0.3.5...v0.3.6) (2022-07-29)


### Code Refactoring

* pass component args to isolate fn ([65bda68](https://github.com/art-bazhin/spred-dom/commit/65bda6877f6a39ef28c934ce327b849bb34c9add))

### [0.3.5](https://github.com/art-bazhin/spred-dom/compare/v0.3.4...v0.3.5) (2022-07-29)


### Features

* isolate component fn from parent computed ([7194310](https://github.com/art-bazhin/spred-dom/commit/7194310d0d96516fc90b3d5301e771b5ad864f7f))

### [0.3.4](https://github.com/art-bazhin/spred-dom/compare/v0.3.3...v0.3.4) (2022-07-29)


### Features

* support multiple arguments in cleanup ([edd7611](https://github.com/art-bazhin/spred-dom/commit/edd7611fa630c07ae0a28d14dc21a6414b4ec49e))


### Bug Fixes

* remove bind function ([a8a5650](https://github.com/art-bazhin/spred-dom/commit/a8a5650d7f137702384bd66f0de206cee9194693))

### [0.3.3](https://github.com/art-bazhin/spred-dom/compare/v0.3.2...v0.3.3) (2022-07-29)


### Features

* add bind function ([d582fc0](https://github.com/art-bazhin/spred-dom/commit/d582fc041a0214eaaffd52a4aa6b451b9a41355a))
* add cleanup function ([6a8a7e5](https://github.com/art-bazhin/spred-dom/commit/6a8a7e5c854a8bcc9c000026d08ac6ffa3eee9d9))
* create memos using node fn ([7e4a948](https://github.com/art-bazhin/spred-dom/commit/7e4a9487fbd7be101d5330ff4a99c4b34d8fc043))


### Code Refactoring

* refactor dom cleanup ([e0ab155](https://github.com/art-bazhin/spred-dom/commit/e0ab15506fe5078109a3909aef19b561f13282b8))
* refactor node function ([fad5e37](https://github.com/art-bazhin/spred-dom/commit/fad5e37a31c5d7fb22a2d077ba0fd2ac11b5e377))

### [0.3.2](https://github.com/art-bazhin/spred-dom/compare/v0.3.1...v0.3.2) (2022-07-28)


### Bug Fixes

* fix props setup ([4c31360](https://github.com/art-bazhin/spred-dom/commit/4c313600d9e9aa9440eb6a33556c2cf396bad542))

### [0.3.1](https://github.com/art-bazhin/spred-dom/compare/v0.3.0...v0.3.1) (2022-07-28)


### Tests

* add dummy test to pass CI ([1e521e0](https://github.com/art-bazhin/spred-dom/commit/1e521e02ebfd06fcfe09ac362110b6bd4bbd0f52))

## [0.3.0](https://github.com/art-bazhin/spred-dom/compare/v0.2.4...v0.3.0) (2022-07-28)


### ⚠ BREAKING CHANGES

* tag -> h
* remove attr, prop, listener, html methods

### Features

* pass dom node props as second argument ([8f596bc](https://github.com/art-bazhin/spred-dom/commit/8f596bc62213bbcf937d720a020c43f0fee97824))
* remove redundant API methods ([e50e2a0](https://github.com/art-bazhin/spred-dom/commit/e50e2a02797c4a1cf94b6fc732abdbabce4f6162))
* rename tag to h ([349f2ee](https://github.com/art-bazhin/spred-dom/commit/349f2ee2d8dc2fcc3bc4d1f3ad5566e906faa5e6))


### Bug Fixes

* bind only functions in spec ([5f1b100](https://github.com/art-bazhin/spred-dom/commit/5f1b1009de400628ee08fb06b7a8f4e40a67a1eb))


### Code Refactoring

* refactor text fn ([4f00ac3](https://github.com/art-bazhin/spred-dom/commit/4f00ac30dccb590dfd1f8242b11369222c77212e))


### Build System

* update terser config ([1b988fd](https://github.com/art-bazhin/spred-dom/commit/1b988fd974c5526d1cb3b6f6057471eb1b0a7a00))

### [0.2.4](https://github.com/art-bazhin/spred-dom/compare/v0.2.3...v0.2.4) (2022-07-27)


### Features

* pass spec fn inside tag callback ([995a3d0](https://github.com/art-bazhin/spred-dom/commit/995a3d0ff441f99d7c8f332e2521b60a99ccbdf3))

### [0.2.3](https://github.com/art-bazhin/spred-dom/compare/v0.2.2...v0.2.3) (2022-07-27)


### Bug Fixes

* fix component props typing ([5f84919](https://github.com/art-bazhin/spred-dom/commit/5f84919330cacbea0ba3c9fa0717cfe899554cee))
* render null as nothing ([9bfd56e](https://github.com/art-bazhin/spred-dom/commit/9bfd56e2923b6d45d75044bf40df7b1be206aed4))

### [0.2.2](https://github.com/art-bazhin/spred-dom/compare/v0.2.1...v0.2.2) (2022-07-26)


### Features

* add basic list support ([a2573c2](https://github.com/art-bazhin/spred-dom/commit/a2573c2caa28047cc026549f232dc5f179b18f3f))


### Code Refactoring

* remove deferred cleanup ([d191ddb](https://github.com/art-bazhin/spred-dom/commit/d191ddb6164f89b54cb7d4d277020de4f80c2f07))


### Build System

* update package.json ([d5b8bff](https://github.com/art-bazhin/spred-dom/commit/d5b8bff2ed90cf59893fe2a4f28a5a3d39e094f0))

### [0.2.1](https://github.com/art-bazhin/spred-dom/compare/v0.2.0...v0.2.1) (2022-07-20)


### Features

* deferred cleanup ([445d1fd](https://github.com/art-bazhin/spred-dom/commit/445d1fda8f7ea13b84b7b34aa76e81679e70424d))

## [0.2.0](https://github.com/art-bazhin/spred-dom/compare/v0.1.1...v0.2.0) (2022-07-20)


### ⚠ BREAKING CHANGES

* text -> textNode, text sets node textContent

### Features

* add func to store subs ([b4bb985](https://github.com/art-bazhin/spred-dom/commit/b4bb9858e506ecc74779674388b454fb16398814))
* add prop function ([a547c97](https://github.com/art-bazhin/spred-dom/commit/a547c97ea043a7d8cb8e5f60faac6b5a2a93a545))
* add shorthand functions ([93b21ee](https://github.com/art-bazhin/spred-dom/commit/93b21eef94538d10a0a32cd8c62a61a22a59c6a5))
* cleanup subs on node removal ([751d4dc](https://github.com/art-bazhin/spred-dom/commit/751d4dce655d207b929e410116bb962bfb6cead0))
* store node subs ([836df3b](https://github.com/art-bazhin/spred-dom/commit/836df3b986a54ffc2119f37b6d95c52fa8677ca9))


### Bug Fixes

* remove props constraint ([d1d0e12](https://github.com/art-bazhin/spred-dom/commit/d1d0e12e69e8a06059aedd92f6887efdb49b012b))


### Code Refactoring

* refactor attr function ([eb80485](https://github.com/art-bazhin/spred-dom/commit/eb80485c966fca8abe4e5d5c8a86273874b6f8c1))

### [0.1.1](https://github.com/art-bazhin/spred-dom/compare/v0.1.0...v0.1.1) (2022-07-19)


### Tests

* setup dummy test ([24fbce6](https://github.com/art-bazhin/spred-dom/commit/24fbce6be56ac7e3c8dcdccb85e95fd07f29376c))

## [0.1.0](https://github.com/art-bazhin/spred-dom/compare/v0.0.4...v0.1.0) (2022-07-19)


### ⚠ BREAKING CHANGES

* rewrite all

### Features

* total rewrite ([5fef314](https://github.com/art-bazhin/spred-dom/commit/5fef3141bb194a02dfc8d60db824838c30912029))

### [0.0.4](https://github.com/art-bazhin/spred-dom/compare/v0.0.3...v0.0.4) (2022-04-04)


### Tests

* update tests ([f6355bb](https://github.com/art-bazhin/spred-dom/commit/f6355bb97f3c40be2abc27e73e4a9f48cfb29bdd))

### [0.0.3](https://github.com/art-bazhin/spred-dom/compare/v0.0.2...v0.0.3) (2022-04-04)


### Features

* add html and svg templates ([74c78c6](https://github.com/art-bazhin/spred-dom/commit/74c78c6c239e50d036310c31e5f91d57e964e376))
* add html function ([dcddc0f](https://github.com/art-bazhin/spred-dom/commit/dcddc0f69c69e8787708518624a2404560576ef9))
* add html method ([3a21677](https://github.com/art-bazhin/spred-dom/commit/3a216774c242d320eb2b2c9fe80e6eef025c83ec))
* add template node creation function ([6c6feb2](https://github.com/art-bazhin/spred-dom/commit/6c6feb211ec54c21617c805f70d4a784f76c15fc))


### Others

* html WIP ([6ac3a45](https://github.com/art-bazhin/spred-dom/commit/6ac3a455cf662de1d3d12141f7c37fb1ed4b17b0))


### Build System

* update dependencies ([a731901](https://github.com/art-bazhin/spred-dom/commit/a731901d60667b9ca65770c374592848c45a79b9))

### 0.0.2 (2021-12-27)


### Features

* add clearElement function ([28d14f2](https://github.com/art-bazhin/spred-dom/commit/28d14f22d9ba7ceb6245baa657be4ffc8991e17c))
* add fragments support ([67aa0c3](https://github.com/art-bazhin/spred-dom/commit/67aa0c394c5c1c2e5436023f45bbcaabdbbc76ab))
* export types ([ba1dca1](https://github.com/art-bazhin/spred-dom/commit/ba1dca1a3107e058e5dd38d9e12a837390793092))
* **list:** add list ([6c83097](https://github.com/art-bazhin/spred-dom/commit/6c83097b1b40185ad0169ce89c0486ed3e536308))


### CI

* change coveralls to codecov ([0c2652d](https://github.com/art-bazhin/spred-dom/commit/0c2652d1ea0cd2a49dfa352f469cac7457435671))


### Others

* change package name to spred-dom ([6c011c8](https://github.com/art-bazhin/spred-dom/commit/6c011c89c3d603a58d9779e7c6458c0d764e576a))
* fix package json ([87e6c2c](https://github.com/art-bazhin/spred-dom/commit/87e6c2cada85412f32e34dbfa9e595d6dd7161cd))
