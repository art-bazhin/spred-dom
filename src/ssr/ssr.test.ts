import { component } from '../component/component';
import { h } from '../h/h';
import { node } from '../node/node';
import { env, renderToString } from './ssr';

describe('ssr', () => {
  it('works in some way', async () => {
    const box = { value: 'none' };
    const innerBox = { value: 'none' };

    const TestComponent = component(() => {
      env.await(() => Promise.resolve('foo').then((v) => (box.value = v)));

      return h('div', () => {
        h('span', { text: () => box.value });
        node(InnerComponent());
      });
    });

    const InnerComponent = component(() => {
      env.await(() => Promise.resolve('bar').then((v) => (innerBox.value = v)));

      return h('div', () => {
        h('span', { text: () => innerBox.value });
      });
    });

    const str = await renderToString(TestComponent);

    expect(str).toBe('TODO');
  });
});
