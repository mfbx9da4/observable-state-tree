import { assert } from '../utils/assert'

export type Callback = (value: any, prevValue: any) => void

type DestroyCallback = () => void

interface ListenerNode {
  parent: Symbol | ListenerNode
  children: Record<string, ListenerNode>
  prevValue: any
  listeners: Callback[]
}

// used when listener is first bound, we emit the value but there is no previous value
export const initialValue = Symbol('initialValue')

export interface StateTree {
  get: (path?: string[]) => any
  set: (path: string[], value: any) => void
  listen: (path: string[], callback: Callback) => DestroyCallback
}

export const createStateTree = (initialState: any = {}): StateTree => {
  const root = Symbol('root')
  let stateTree: any = initialState
  const listenerTree: ListenerNode = { parent: root, children: {}, listeners: [], prevValue: initialValue }

  const get = (path: string[] = []): any => {
    // returns the value directly from the state tree
    let node = stateTree
    for (const key of path) {
      node = node[key]
    }
    return node
  }

  const set = (path: string[] = [], value: any) => {
    assert(Array.isArray(path), 'path must be array', { path })

    if (!path.length) {
      // update the root
      stateTree = value
    }

    // update a deeply nested key
    let node = stateTree
    for (let i = 0; i < path.length; i++) {
      const key = path[i]
      if (i === path.length - 1) {
        node[key] = value
        break
      }
      let next = node[key]
      if (!next) {
        next = {}
        node[key] = next
      }
      node = next
    }

    // now notify listeners of the update
    return notify(path)
  }

  const listen = (path: string[], callback: Callback): DestroyCallback => {
    let node = listenerTree
    for (let i = 0; i < path.length; i++) {
      const key = path[i]
      let next = node.children[key]
      if (!next) {
        // auto create the listener tree
        next = { parent: node, children: {}, listeners: [], prevValue: undefined }
        node.children[key] = next
      }
      node = next
    }

    const value = get(path)
    node.prevValue = value
    node.listeners.push(callback)

    // notify this new listener inline for the first time
    callback(value, initialValue)

    return () => {
      // tear down
      const i = node.listeners.findIndex((x) => x === callback)
      node.listeners.splice(i, 1)
    }
  }

  const notify = (path: string[]) => {
    let stateNode = stateTree
    let listenerNode = listenerTree
    const empty = {}

    // notify root listeners
    listenerNode.listeners.map((x) => x(stateNode, listenerNode.prevValue))

    for (let i = 0; i < path.length; i++) {
      // notify parents
      const key = path[i]
      stateNode = (stateNode || empty)[key]
      listenerNode = listenerNode.children[key]
      if (!listenerNode) break
      listenerNode.listeners.map((x) => x(stateNode, listenerNode.prevValue))
    }

    let queue: [ListenerNode, any][] = []
    if (listenerNode) {
      // notify children
      queue.push([listenerNode, stateNode])
      while (queue.length) {
        ;[listenerNode, stateNode] = queue.shift() as [ListenerNode, any]
        for (const key in listenerNode.children) {
          const child = listenerNode.children[key]
          const childValue = (stateNode || empty)[key]
          const { prevValue } = child
          if (childValue !== prevValue) {
            // skip notifying children which have not changed
            // for those that have, update prevValue and notify children
            child.prevValue = childValue
            child.listeners.map((x) => x(childValue, prevValue))
            queue.push([child, childValue])
          }
        }
      }
    }
  }

  return { set, get, listen }
}
