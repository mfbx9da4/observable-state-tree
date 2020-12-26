console.clear()
console.log('hi')

const createStateTree = (initial: any) => {
  const listenerTree = {}
  const stateTree = initial
  const listen = (selector: any, callback: (x: any) => void) => {}

  const createProxy = (val: any): any => {
    const node = {}
    return new Proxy(node, {
      get: (target, key, receiver) => {
        console.log('get', 'key', key)
        return stateTree[key]
      },
      set: (target, key, value, receiver) => {
        console.log('set', 'key', key, 'value', value)
        stateTree[key] = value
        return true
      },
    })
  }

  const tree = createProxy(initial)
  return { tree, listen }
}

// we want to return a proxy
// when we access a child we should get the value from the state but return the proxy
// when we set a child we should recursively set the state
//  - if we have a value
const { tree, listen } = createStateTree({})
tree.a = {}
tree.a.b = 1
console.log('tree.a_val', tree.a._val)
tree.a = 2
console.log('tree.a_val', tree.a._val)

// we could simplify and not use proxies

// build a recursive proxy which always returns a proxy
// use .val to access the val?

// const { tree, listen } = createStateTree({ a: { b: { c: 1, d: 1 } } });
// console.log(tree);
// console.log(tree.a);
// console.log(tree.a.b);
// tree.a = { f: 1 };
// tree.a.b = { f: 2 };
// console.log(tree);
// const destroy = listen(tree, (tree) => console.log("tree", tree));

export default function Home() {
  return 'hey'
}
