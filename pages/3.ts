import { assert } from './../src/libs/assert'
import { isEqual } from 'lodash'
import { createStateTree } from '../src/libs/observableStateTree'
import { Counter } from '../src/libs/Counter'
import { createArrayPathProxy } from './arrayPathProxy'

const createTree = (initial: any) => {
  const { get, set, listen } = createStateTree(initial)
  const keys = new Set(['val', 'listen'])
  const onGet = (key: string, path: string[]) => {
    if (key === 'val') return get(path)
    if (key === 'listen') return (callback) => listen(path, callback)
  }
  return createArrayPathProxy(onGet, set, keys) as any
}

const test = () => {
  console.clear()
  const tree = createTree({ a: { b: { c: 1, d: 1 } } })
  // the tree behaves like a normal object e.g
  console.log('tree', tree.val)
  // prints the object 👉 { a: { b: { c : 1, d: 1 } } }

  // we can setup listeners
  const destroyRoot = tree.listen((root: any) => console.log('root', root))
  // on initial setup prints the full tree 👉 root { a: { b: { c: 1, d: 1 } } }
  const destroyA = tree.a.listen((a) => console.log('a', a))
  // 👉 a { b: { c: 1 } }
  const destroyB = tree.a.b.listen((b) => console.log('b', b))
  // 👉 b { c: 1 }
  const destroyC = tree.a.b.c.listen((c) => console.log('c', c))
  // 👉 c 1
  const destroyD = tree.a.b.c.listen((d) => console.log('d', d))
  // 👉 d 1

  // should also support sending the prev value

  destroyRoot()
  // 👆 calling destroy, removes the listener

  // 🙋‍♂️
  // 1. Modifying a subtree will notify all parent listeners.
  // 2. Modifying a sibling should not notify any siblings.
  tree.a.b.c = 2
  // 👉 a { b: { c: 2 } }
  // 👉 b { c: 2 }
  // 👉 c 2
  // a, b and c are fired but sibling d is not fired

  // 🙋‍♂️
  // 2. Modifying a parent notifies the relevant children listeners.
  tree.a = { ...tree.a.val }
  // 👉 a { b: { c: 2 } }
  // a is fired but b, c and d are not fired
  tree.a = { e: 1 }
  // 👉 a { e: 1 }
  // b, c and d have been deleted so we just notify with undefined
}

export default function Home() {
  return 'hey'
}

export function getServerSideProps() {
  test()
  return { props: {} }
}
