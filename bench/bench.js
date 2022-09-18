const { h, node, component, renderToString, env } = spredDOM;

const box = { value: 'none' };
const innerBox = { value: 'none' };

const TestComponent = component(() => {
  // env.await(() => Promise.resolve('foo').then((v) => (box.value = v)));

  return h('div', () => {
    h('span', { text: () => box.value });
    node(InnerComponent());
    h('span', { text: () => box.value });
    node(InnerComponent());
    h('span', { text: () => box.value });
    node(InnerComponent());
  });
});

const InnerComponent = component(() => {
  // env.await(() => Promise.resolve('bar').then((v) => (innerBox.value = v)));

  return h('div', () => {
    h('span', { text: () => innerBox.value });
  });
});

async function bench(count = 1000) {
  const ts = performance.now();
  const promises = [];

  for (let i = 0; i < count; i++) {
    promises.push(renderToString(TestComponent));
  }

  await Promise.all(promises);

  return performance.now() - ts;
}

window.bench = bench;
