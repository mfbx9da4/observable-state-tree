import { assert } from './../src/libs/assert'
import { isEqual } from 'lodash'
import { createStateTree } from '../src/libs/observableStateTree'
import { Counter } from '../src/libs/Counter'
const test = () => {
  console.clear()
  console.log('===== 🐎 ===== ')
  const counter = new Counter()

  const { get, set, listen } = createStateTree({ a: { b: { c: 1, d: 1 } } })

  const destroyRoot = listen([], counter.update('root'))
  const destroyA = listen(['a'], counter.update('a'))
  const destroyB = listen(['a', 'b'], counter.update('a.b'))
  const destroyC = listen(['a', 'b', 'c'], counter.update('a.b.c'))
  const destroyD = listen(['a', 'b', 'd'], counter.update('a.b.c.d'))
  destroyRoot()

  {
    const expected = { root: 1, a: 1, 'a.b': 1, 'a.b.c': 1, 'a.b.c.d': 1 }
    assert(isEqual(counter.counter, expected), 'initial setup', counter.counter)
    console.log('✅ initial setup')
    counter.reset()
  }

  {
    set(['a', 'b', 'c'], 2)
    const expected = { a: 1, 'a.b': 1, 'a.b.c': 1 }
    assert(isEqual(counter.counter, expected), 'a.b.c update')
    console.log('✅ assert a, b and c are fired but sibling d is not fired. root should also not be fired')
    counter.reset()
  }

  {
    set(['a'], { ...get(['a']) })
    const expected = { a: 1 }
    assert(isEqual(counter.counter, expected), 'update a failed', counter.counter)
    console.log('✅ update just a')
    counter.reset()
  }

  {
    set(['a'], { ...get(['a']), e: 1 })
    const expected = { a: 1 }
    assert(isEqual(counter.counter, expected), 'add attr to a failed', counter.counter)
    console.log('✅ add attr to a')
    counter.reset()
  }

  {
    counter.reset()
    console.log('counter.counter', counter.counter)
    set(['a'], { f: 1 })
    const expected = { a: 1, 'a.b': 1, 'a.b.c': 1, 'a.b.c.d': 1 }
    assert(isEqual(counter.counter, expected), 'overwrite a failed', counter.counter)
    console.log('✅ overwrite a passed')
    counter.reset()
  }

  destroyA()
  destroyB()
  destroyC()
  destroyD()
}

export default function Home() {
  return 'hey'
}

export function getServerSideProps() {
  test()
  return { props: {} }
}
