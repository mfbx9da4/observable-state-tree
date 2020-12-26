import React from 'react'
import { createStore, action, StoreProvider, useStoreState, useStoreActions } from 'easy-peasy'

const store = createStore({
  a: {
    b: {
      c: 1,
    },
  },
  updateParent: action((state, payload) => {
    state.a = { ...state.a }
  }),
  updateLeaf: action((state, payload) => {
    state.a.b.c = Date.now()
  }),
  updateB: action((state, payload) => {
    state.a.b = { ...state.a.b, d: 2 }
  }),
})

export default function Home() {
  return (
    <StoreProvider store={store}>
      <App />
      <Parent />
      <Leaf />
    </StoreProvider>
  )
}

const App = () => {
  const updateLeaf = useStoreActions((actions) => actions.updateLeaf)
  const updateB = useStoreActions((actions) => actions.updateB)
  const updateParent = useStoreActions((actions) => actions.updateParent)
  console.log('App')
  return (
    <div>
      <button onClick={updateB}>updateB</button>
      <button onClick={updateParent}>Update parent</button>
      <button onClick={updateLeaf}>updateLeaf</button>
    </div>
  )
}
const Parent = () => {
  const state = useStoreState((state) => state)
  console.log('Parent')
  return <pre>{JSON.stringify(state, null, 2)}</pre>
}
const Leaf = () => {
  const state = useStoreState((state) => state.a?.b?.c)
  console.log('Leaf')
  return <pre>{JSON.stringify(state, null, 2)}</pre>
}
