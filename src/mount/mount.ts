import { Component } from '../component/component';
import { state } from '../state/state';

export function mount(component: Component<void>, el: Node) {
  state.mountedNode.unshift(el);
  component();
}
