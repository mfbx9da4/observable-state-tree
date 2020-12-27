# Observable state tree

The below is a programming challenge I set myself on boxing day 2020. Give it a go! 🎄🎅

### Problem statement

Create an observable state tree.

An observable state tree is a normal object except that listeners can
be bound to any subtree of the state tree.

Behaviour requirements:

1. Modifying a subtree will notify all parent listeners.
2. Modifying a sibling should not notify any siblings.
3. Modifying a parent only notifies the children listeners, if the children have also changed.

Examples of the above requirements are given below.

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
// 3. Modifying a parent only notifies the children listeners, if the children have also changed.
tree.a = { ...tree.a }
// 👉 a { b: { c: 2 } }
// a is fired but b, c and d are not fired
tree.a = { e: 1 }
// 👉 a { e: 1 }
// 👉 b undefined
// 👉 c undefined
// 👉 d undefined
// b, c and d have been deleted so they should be notified with undefined
```

### Implementation Sketch

Data structure will consist of two trees:

- State tree
- Listener tree

State tree is a standard object which is the actual state tree object.
Listener tree is the tree of listeners.

Each node in the listener tree has:

- Children listeners
- Parent listeners
- Listener callbacks

Getting a particular path will just return that node of the state tree:

Setting a particular path with a value will:

- Update state tree
- Traverse parents and notify with new value
- Traverse listener children and notify with new value

Use proxies for dot notation.

### Real World Applications

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

## Implementation

Here is my implementation of the [observable state tree](https://github.com/mfbx9da4/observable-state-tree/blob/main/observableStateTree/observableStateTree.ts#L13). I couldn't quite get the above API but I came [pretty close by using proxies](https://github.com/mfbx9da4/observable-state-tree/blob/main/pages/dotNotationExample.tsx). See the [react example here](https://github.com/mfbx9da4/observable-state-tree/blob/main/pages/reactExample.tsx). See the [rudimentary unit tests here](https://github.com/mfbx9da4/observable-state-tree/blob/main/pages/unitTests.ts).
