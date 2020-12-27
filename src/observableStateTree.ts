import { assert } from '../utils/assert'

type Callback = (value: any, prevValue: any) => void

type DestroyCallback = () => void
interface ListenerNode {
  parent: Symbol | ListenerNode
  children: Record<string, ListenerNode>
  prevValue: any
  listeners: Callback[]
}

export const createStateTree = (initial: any = {}) => {
  let stateTree: any = initial
  const root = Symbol()
  const listenerTree: ListenerNode = { parent: root, children: {}, listeners: [], prevValue: initial }
  const listen = (path: string[], callback: Callback): DestroyCallback => {
    let node = listenerTree
    const value = get(path)
    for (let i = 0; i < path.length; i++) {
      const key = path[i]
      let next = node.children[key]
      if (!next) {
        next = { parent: node, children: {}, listeners: [], prevValue: value }
        node.children[key] = next
      }
      node = next
    }
    node.listeners.push(callback)
    callback(value, value)
    return () => {
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

    // notify parents
    for (let i = 0; i < path.length; i++) {
      const key = path[i]
      stateNode = (stateNode || empty)[key]
      listenerNode = listenerNode.children[key]
      if (!listenerNode) break
      // add parent listeners
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
            // update prevValue and notify children
            child.prevValue = childValue
            child.listeners.map((x) => x(childValue, prevValue))
            queue.push([child, childValue])
          }
        }
      }
    }
  }

  const set = (path: string[] = [], value: any) => {
    assert(Array.isArray(path), 'path must be array', { path })

    // update the root
    if (!path.length) {
      stateTree = value
    }

    // update a deep key
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

    return notify(path)
  }
  const get = (path: string[] = []): any => {
    let node = stateTree
    for (const key of path) {
      node = node[key]
    }
    return node
  }
  return { set, get, listen }
}
