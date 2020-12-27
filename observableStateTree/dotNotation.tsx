import { Callback, createStateTree } from './observableStateTree'
import { createDotNotationProxy } from './dotNotationProxy'

export const createStore = (initial: any) => {
  const { get, set, listen } = createStateTree(initial)
  const listenKey = Symbol()
  const valKey = Symbol()
  const specialKeys = new Set([valKey, listenKey])
  const onGet = (key: symbol, path: string[]) => {
    if (key === valKey) return get(path)
    if (key === listenKey) return (callback: Callback) => listen(path, callback)
  }
  return {
    tree: createDotNotationProxy(onGet, set, specialKeys) as any,
    listen: (node: any, callback: Callback) => node[listenKey](callback),
    val: (node: any) => node[valKey],
  }
}
