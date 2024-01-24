import { Store } from 'vuex'

declare module '@vue/runtime-core' {
  interface State {
    user: obj
  }

  interface ComponentCustomProperties {
    $store: Store<State>
  }
}