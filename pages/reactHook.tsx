import { assert } from '../src/libs/assert'
import { createStateTree } from '../src/libs/observableStateTree'
import { Counter } from '../src/libs/Counter'
import { createArrayPathProxy } from './arrayPathProxy2'
import { stringify } from 'gray-matter'
import { useEffect, useState } from 'react'

const asPath = (key: string | string[]) => (typeof key === 'string' ? key.split('.').filter(Boolean) : key)

const createTree = (initial: any) => {
  const { get, set, listen } = createStateTree(initial)
  return {
    state: () => get(),
    set: (key: string | string[], value: any) => set(asPath(key), value),
    listen: (key: string | string[], callback: (x: any) => void) => listen(asPath(key), callback),
  }
}

const { listen, set } = createTree({ a: { b: 2 } })

export default function Home() {
  const [state, setState] = useState()

  useEffect(
    () =>
      listen('', (value) => {
        console.log('va', value)
        setState({ ...value })
      }),
    []
  )

  return (
    <div>
      <div>
        <button onClick={() => set('a.b', Date.now())}>Click</button>{' '}
      </div>
      <pre>{JSON.stringify(state, null, 2)}</pre>
    </div>
  )
}

export function getServerSideProps() {
  return { props: {} }
}
