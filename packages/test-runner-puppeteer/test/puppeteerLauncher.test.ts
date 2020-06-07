import path from 'path';
import { expect } from 'chai';
import { TestRunnerConfig, TestRunner } from '@web/test-runner-core';
import { createDevServer } from '@web/test-runner-dev-server';
import { puppeteerLauncher } from '../src/puppeteerLauncher';

it('runs tests with puppeteer', function(done) {
  this.timeout(50000);

  const config: TestRunnerConfig = {
    files: [],
    watch: false,
    testFrameworkImport: '@web/test-runner-mocha',
    address: 'http://localhost',
    port: 9542,
    concurrency: 10,
    browserStartTimeout: 30000,
    sessionStartTimeout: 10000,
    sessionFinishTimeout: 20000,
    browsers: puppeteerLauncher(),
    server: createDevServer({ rootDir: path.join(process.cwd(), '..', '..') }),
  };

  const runner = new TestRunner(config, [
    'packages/test-runner-puppeteer/test/fixtures/test-a.test.js',
    'packages/test-runner-puppeteer/test/fixtures/test-b.test.js',
  ]);

  runner.on('quit', () => {
    const sessions = Array.from(runner.sessions.all());
    expect(sessions.length).to.equal(2, 'there should be two test sessions');
    expect(sessions[0].testFile).to.equal(
      'packages/test-runner-puppeteer/test/fixtures/test-a.test.js',
      'test a should be run',
    );
    expect(sessions[1].testFile).to.equal(
      'packages/test-runner-puppeteer/test/fixtures/test-b.test.js',
      'test b should be run',
    );
    expect(sessions[0].result?.passed).to.equal(true, 'test a should pass');
    expect(sessions[1].result?.passed).to.equal(true, 'test b should pass');
    done();
  });

  runner.start();
});