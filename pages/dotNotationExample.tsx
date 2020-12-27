import { useEffect } from 'react'
import { createStore } from '../observableStateTree/dotNotation'

const test = () => {
  console.clear()
  const { tree, listen, val } = createStore({ a: { b: { c: 1, d: 1 } } })
  // the tree behaves like a normal object e.g
  console.log('tree', val(tree))
  // prints the object 👉 { a: { b: { c : 1, d: 1 } } }

  // we can setup listeners
  const destroyRoot = listen(tree, (root: any) => console.log('root', root))
  // on initial setup prints the full tree 👉 root { a: { b: { c: 1, d: 1 } } }
  const destroyA = listen(tree.a, (a: any) => console.log('a', a))
  // 👉 a { b: { c: 1 } }
  const destroyB = listen(tree.a.b, (b: any) => console.log('b', b))
  // 👉 b { c: 1 }
  const destroyC = listen(tree.a.b.c, (c: any) => console.log('c', c))
  // 👉 c 1
  const destroyD = listen(tree.a.b.c, (d: any) => console.log('d', d))
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
  tree.a = { ...val(tree.a) }
  // 👉 a { b: { c: 2 } }
  // a is fired but b, c and d are not fired
  tree.a = { e: 1 }
  // 👉 a { e: 1 }
  // b, c and d have been deleted so we just notify with undefined

  // cleanup
  destroyA()
  destroyB()
  destroyC()
  destroyD()
}

export default function Home() {
  useEffect(test, [])
  return 'hey'
}

export function getServerSideProps() {
  test()
  return { props: {} }
}
