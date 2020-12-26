import { stat } from 'fs'

console.clear()
console.log('===== 🐎 ===== ')

type Callback = (x: any) => void
type DestroyCallback = () => void

interface ListenerNode {
  parent: Symbol | ListenerNode
  children: Record<string, ListenerNode>
  listeners: Callback[]
}

const createStateTree = (initial: any = {}) => {
  const root = Symbol('root')
  const listenerTree: ListenerNode = { parent: root, children: {}, listeners: [] }
  let stateTree: any = initial
  const listen = (path: string[], callback: Callback): DestroyCallback => {
    let node = listenerTree
    for (let i = 0; i < path.length; i++) {
      const key = path[i]
      let next = node.children[key]
      if (!next) {
        next = { parent: node, children: {}, listeners: [] }
        node.children[key] = next
      }
      node = next
    }
    node.listeners.push(callback)
    callback(get(path))
    return () => {
      const i = node.listeners.findIndex((x) => x === callback)
      node.listeners.splice(i, 1)
    }
  }
  const notify = (path: string[]) => {
    let stateNode = stateTree
    let listenerNode = listenerTree
    const empty = {}

    // notify parents
    for (let i = 0; i < path.length; i++) {
      const key = path[i]
      stateNode = (stateNode || empty)[key]
      listenerNode = listenerNode.children[key]
      if (!listenerNode) break
      // add parent listeners
      listenerNode.listeners.map((x) => x(stateNode))
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
          child.listeners.map((x) => x(childValue))
          queue.push([child, childValue])
        }
      }
    }
  }

  const set = (path: string[], value: any) => {
    console.log('set', path, 'value', value)
    let node = stateTree

    if (!path.length) {
      stateTree = value
      return notify(path)
    }

    for (let i = 0; i < path.length; i++) {
      const key = path[i]
      if (i === path.length - 1) {
        node[key] = value
        return notify(path)
      }
      let next = node[key]
      if (!next) {
        next = {}
        node[key] = next
      }
      node = next
    }
  }
  const get = (path: string[]): any => {
    let node = stateTree
    for (let i = 0; i < path.length; i++) {
      const key = path[i]
      node = node[key]
    }
    return node
  }
  return { set, get, listen }
}

const { get, set, listen } = createStateTree({ a: { b: { c: 1, d: 1 } } })

const destroyRoot = listen([], (root) => console.log('root', root))
const destroyA = listen(['a'], (a) => console.log('a', a))
const destroyB = listen(['a', 'b'], (b) => console.log('b', b))
const destroyC = listen(['a', 'b', 'c'], (c) => console.log('c', c))
const destroyD = listen(['a', 'b', 'd'], (d) => console.log('d', d))
destroyRoot()

console.log('test1')
set(['a', 'b', 'c'], 2)
console.log('assert a, b and c are fired but sibling d is not fired. root should also not be fired')

set(['a'], { ...get(['a']) })

destroyA()
destroyB()
destroyC()
destroyD()

export default function Home() {
  return 'hey'
}
