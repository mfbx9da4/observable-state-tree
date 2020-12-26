import { assert } from './../src/libs/assert'
import { isEqual } from 'lodash'
import { createStateTree } from '../src/libs/observableStateTree'
import { Counter } from '../src/libs/Counter'
import { createArrayPathProxy } from './arrayPathProxy'

const test = () => {
  const onGet = (path: string[]) => {
    assert(isEqual(path, ['a', 'b']))
  }
  const onSet = (path: string[], value: any) => {
    assert(isEqual(path, ['a', 'b']))
    assert(value === 1)
  }
  const tree = createArrayPathProxy(onGet, onSet)
  tree.a.b._val
  tree.a.b = 1
}

export default function Home() {
  return 'hey'
}

export function getServerSideProps() {
  test()
  return { props: {} }
}
