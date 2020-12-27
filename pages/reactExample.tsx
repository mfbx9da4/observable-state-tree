import { useEffect, useState } from 'react'
import { createStore } from '../observableStateTree/stringNotation'

const { listen, set } = createStore({ a: { b: 2 } })

const useStoreState = (selector: string = '') => {
  const [state, setState] = useState()
  useEffect(() => listen(selector, (value) => setState({ ...value })), [])
  return state
}

export default function Home() {
  const state = useStoreState('a')

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
