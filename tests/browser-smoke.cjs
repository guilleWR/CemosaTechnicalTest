// Run from the repository root:
// node tests/browser-smoke.cjs <path-to-playwright-module>
// Uses temporary data and separate ports; does not modify app/todos.json.
const { chromium } = require(process.argv[2] || 'playwright');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'todo-smoke-'));
const originalPath = path.join(root, 'backend/app/todos.json');
const original = fs.readFileSync(originalPath);
const dataPath = path.join(temporary, 'todos.json');
const api = 'http://127.0.0.1:18000';
const frontend = 'http://127.0.0.1:15173';
const children = [];
let browser;
let logs = '';
let failures = 0;

fs.copyFileSync(originalPath, dataPath);

function start(command, args, options) {
  const child = spawn(command, args, { windowsHide: true, ...options });
  children.push(child);
  child.stdout.on('data', chunk => { logs += chunk; });
  child.stderr.on('data', chunk => { logs += chunk; });
  child.on('error', error => { logs += error.stack; });
  return child;
}

async function ready(url) {
  for (let attempt = 0; attempt < 100; attempt++) {
    try { if ((await fetch(url)).ok) return; } catch {}
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  throw new Error(`Server did not start: ${url}\n${logs}`);
}

async function test(name, action) {
  try { await action(); console.log(`PASS ${name}`); }
  catch (error) { failures++; console.log(`FAIL ${name}: ${error.message}`); }
}

async function request(method, route, body) {
  return fetch(api + route, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

async function main() {
  // The dependency factory reads this module variable when each request arrives.
  start(path.join(root, 'backend/.venv/Scripts/python.exe'), ['-c',
    'import os; from pathlib import Path; from app import deps; deps.DATA_FILE = Path(os.environ["TEST_TODOS_PATH"]); import uvicorn; uvicorn.run("app.main:app", host="127.0.0.1", port=18000)'],
    { cwd: path.join(root, 'backend'), env: { ...process.env, TEST_TODOS_PATH: dataPath } });
  start(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '15173', '--strictPort'],
    { cwd: path.join(root, 'frontend') });
  await Promise.all([ready(api + '/todos'), ready(frontend)]);

  browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  const runtimeErrors = [];
  page.on('pageerror', error => runtimeErrors.push(error.message));
  // Exercise the actual frontend request URLs against the isolated backend.
  await page.route('http://localhost:8000/**', route => route.continue({
    url: route.request().url().replace('http://localhost:8000', api),
  }));
  const title = `Smoke test ${Date.now()}`;
  const description = 'Description saved by browser smoke test';
  const row = () => page.locator('li').filter({ hasText: title });
  const reload = async () => {
    const response = page.waitForResponse(r => r.url() === api + '/todos' || r.url() === 'http://localhost:8000/todos');
    await page.reload();
    await response;
  };
  const clickAndRefresh = async locator => {
    const response = page.waitForResponse(r => (r.url() === api + '/todos' || r.url() === 'http://localhost:8000/todos') && r.request().method() === 'GET');
    await locator.click();
    await response;
  };

  await test('Automatic load on opening and refreshing the page', async () => {
    await page.goto(frontend);
    const seed = JSON.parse(original);
    if (seed.length) await page.getByText(seed[0].title, { exact: true }).waitFor();
    await reload();
    if (seed.length) await page.getByText(seed[0].title, { exact: true }).waitFor();
  });
  await test('Create task and automatically update list', async () => {
    await page.getByPlaceholder('Add a new task...').fill(title);
    await clickAndRefresh(page.getByRole('button', { name: 'Add', exact: true }));
    await row().waitFor();
  });
  await test('Complete task and persist after page refresh', async () => {
    await clickAndRefresh(row().getByRole('checkbox'));
    await reload();
    await row().waitFor();
    assert.equal(await row().getByRole('checkbox').isChecked(), true);
  });
  await test('Mark favourite, persist and display in separate view', async () => {
    await clickAndRefresh(row().getByRole('button', { name: 'Mark as Fav', exact: true }));
    await reload();
    await row().getByRole('button', { name: 'Unmark Fav', exact: true }).waitFor();
    await page.getByRole('button', { name: 'See Favourites' }).click();
    await page.locator('.fixed li').filter({ hasText: title }).waitFor();
    const favouriteTitles = (await (await request('GET', '/todos')).json()).filter(todo => todo.favourite).map(todo => todo.title);
    const shown = (await page.locator('.fixed li').allTextContents()).map(text => text.trim());
    assert.deepEqual(shown, favouriteTitles);
    await page.getByRole('button', { name: 'Back', exact: true }).click();
  });
  await test('Save description, close, refresh and reopen', async () => {
    await row().getByRole('button', { name: 'Desc', exact: true }).click();
    await page.locator('textarea').fill(description);
    await clickAndRefresh(page.getByRole('button', { name: 'Save', exact: true }));
    await page.getByRole('button', { name: 'Back', exact: true }).click();
    await reload();
    await row().getByRole('button', { name: 'Desc', exact: true }).click();
    assert.equal(await page.locator('textarea').inputValue(), description);
    await page.getByRole('button', { name: 'Back', exact: true }).click();
  });
  await test('Unmark favourite and remove from favourites view', async () => {
    await clickAndRefresh(row().getByRole('button', { name: 'Unmark Fav', exact: true }));
    await reload();
    await row().getByRole('button', { name: 'Mark as Fav', exact: true }).waitFor();
    await page.getByRole('button', { name: 'See Favourites' }).click();
    assert.equal(await page.locator('.fixed li').filter({ hasText: title }).count(), 0);
    await page.getByRole('button', { name: 'Back', exact: true }).click();
  });
  await test('Mark task incomplete and persist after refresh', async () => {
    await clickAndRefresh(row().getByRole('checkbox'));
    await reload();
    await row().waitFor();
    assert.equal(await row().getByRole('checkbox').isChecked(), false);
  });
  await test('Delete task, automatically update list and persist', async () => {
    await clickAndRefresh(row().getByRole('button').last());
    await row().waitFor({ state: 'detached' });
    await reload();
    assert.equal(await row().count(), 0);
    const stored = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    assert.equal(stored.some(todo => todo.title === title), false);
  });
  await test('No browser runtime errors during normal flow', async () => assert.deepEqual(runtimeErrors, []));

  await test('Create first task in an empty list', async () => {
    fs.writeFileSync(dataPath, '[]');
    const response = await request('POST', '/todos', { id: 0, title: 'First task', completed: false, favourite: false });
    assert.equal(response.ok, true, `HTTP ${response.status}: ${await response.text()}`);
  });
  await test('Completing an unknown task returns 404', async () => {
    const response = await request('PATCH', '/todos/99999999/false');
    assert.equal(response.status, 404, `Received HTTP ${response.status}`);
  });
  await test('Updating an unknown favourite returns 404', async () => {
    const response = await request('PATCH', '/todos/99999999');
    assert.equal(response.status, 404, `Received HTTP ${response.status}`);
  });
}

main().catch(error => { failures++; console.error(error); }).finally(async () => {
  if (browser) await browser.close();
  for (const child of children) child.kill();
  assert.deepEqual(fs.readFileSync(originalPath), original, 'Original task file changed');
  assert.equal(path.dirname(path.resolve(temporary)), path.resolve(os.tmpdir()));
  assert.ok(path.basename(temporary).startsWith('todo-smoke-'));
  fs.rmSync(temporary, { recursive: true, force: true });
  console.log(`Finished with ${failures} failed checks. Original todos.json unchanged.`);
  process.exitCode = failures ? 1 : 0;
});
