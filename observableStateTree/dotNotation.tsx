import { Callback, createStateTree } from './observableStateTree'
import { createDotNotationProxy } from './dotNotationProxy'

export const createStore = (initial: any) => {
  const { get, set, listen } = createStateTree(initial)
  const specialKeys = new Set(['val', 'listen'])
  const onGet = (key: string, path: string[]) => {
    if (key === 'val') return get(path)
    if (key === 'listen') return (callback: Callback) => listen(path, callback)
  }
  return createDotNotationProxy(onGet, set, specialKeys) as any
}
