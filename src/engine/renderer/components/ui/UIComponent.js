import Component from '@taoro/component';

export class UIComponent extends Component {
  constructor(id) {
    super(id)
    Component.register(this, UIComponent, id)
  }
}
