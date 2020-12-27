# Observable state tree

### Problem statement

Create an observable state tree.

An observable state tree is a normal object except that listeners can
be bound to any subtree of the state tree.

Behaviour requirements:

1. Modifying a subtree will notify all parent listeners.
2. Modifying a sibling should not notify any siblings.
3. Modifying a parent notifies the relevant children listeners.

Examples of the above requirements are given below.

Performance requirements:

- Modifying the tree should happen in O(1) time

### Suggested API

```js
const tree = createTree({ a: { b: { c: 1, d: 1 } } })
// the tree behaves like a normal object e.g
console.log(tree)
// prints the object 👉 { a: { b: { c : 1, d: 1 } } }

// we can setup listeners
const destroyRoot = listen(root, (root) => console.log('root', root))
// on initial setup prints the full tree 👉 root { a: { b: { c: 1, d: 1 } } }
const destroyA = listen(tree.a, (a) => console.log('a', a))
// 👉 a { b: { c: 1 } }
const destroyB = listen(tree.a.b, (b) => console.log('b', b))
// 👉 b { c: 1 }
const destroyC = listen(tree.a.b.c, (c) => console.log('c', c))
// 👉 c 1
const destroyD = listen(tree.a.b.d, (d) => console.log('d', d))
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
tree.a = { ...tree.a }
// 👉 a { b: { c: 2 } }
// a is fired but b, c and d are not fired
tree.a = { e: 1 }
// 👉 a { e: 1 }
// b, c and d have been deleted so we just notify with undefined
```

### Implementation Sketch

Use proxies for dot notation.
Data structure consists of two trees:

- state tree
- listener tree

State tree is a standard object which is the actual state tree object.
Listener tree is the tree of listeners.

Each node in the listener tree has:

- children listeners
- parent listeners
- listenerCallbacks

Getting a particular path will just return that node of the state tree:

Setting a particular path with a value will:

- update state tree
- traverse parents => notify with new value
- traverse listener children => notify with new value

### Applications

Later in react.js, could be used like so

```js
const useStoreState = (selector) => {
  const [state, setState] = useState()
  useEffect(() => {
    const destroy = listen(selector, setState)
    return destroy
  })
  return state
}
```
