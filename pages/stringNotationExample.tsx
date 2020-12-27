import { useEffect } from 'react'
import { createStore } from '../observableStateTree/stringNotation'

const test = () => {
  console.clear()
  const { state, set, listen } = createStore({ a: { b: { c: 1, d: 1 } } })
  // the tree behaves like a normal object e.g
  console.log('tree', state())
  // prints the object 👉 { a: { b: { c : 1, d: 1 } } }

  // we can setup listeners
  const destroyRoot = listen('', (root: any) => console.log('root', root))
  // on initial setup prints the full tree 👉 root { a: { b: { c: 1, d: 1 } } }
  const destroyA = listen('a', (a) => console.log('a', a))
  // 👉 a { b: { c: 1 } }
  const destroyB = listen('a.b', (b) => console.log('b', b))
  // 👉 b { c: 1 }
  const destroyC = listen('a.b.c', (c) => console.log('c', c))
  // 👉 c 1
  const destroyD = listen('a.b.c.d', (d) => console.log('d', d))
  // 👉 d 1

  // should also support sending the prev value

  destroyRoot()
  // 👆 calling destroy, removes the listener

  // 🙋‍♂️
  // 1. Modifying a subtree will notify all parent listeners.
  // 2. Modifying a sibling should not notify any siblings.
  set('a.b.c', 2)
  // 👉 a { b: { c: 2 } }
  // 👉 b { c: 2 }
  // 👉 c 2
  // a, b and c are fired but sibling d is not fired

  // 🙋‍♂️
  // 2. Modifying a parent notifies the relevant children listeners.
  set('a', { ...state().a })
  // 👉 a { b: { c: 2 } }
  // a is fired but b, c and d are not fired
  set('a', { e: 1 })
  // 👉 a { e: 1 }
  // b, c and d have been deleted so we just notify with undefined

  // cleanup
  destroyA()
  destroyB()
  destroyC()
  destroyD()
}

export default function Home() {
  useEffect(() => test())
  return 'hey'
}

export function getServerSideProps() {
  test()
  return { props: {} }
}
