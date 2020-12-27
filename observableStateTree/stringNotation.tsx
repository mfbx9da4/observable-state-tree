import { createStateTree } from './observableStateTree'

const asPath = (key: string | string[]) => (typeof key === 'string' ? key.split('.').filter(Boolean) : key)
export const createStore = (initial: any) => {
  const { get, set, listen } = createStateTree(initial)
  return {
    state: () => get(),
    set: (key: string | string[], value: any) => set(asPath(key), value),
    listen: (key: string | string[], callback: (x: any) => void) => listen(asPath(key), callback),
  }
}
