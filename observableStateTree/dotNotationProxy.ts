export const createDotNotationProxy = (
  onGet: (key: symbol, path: string[]) => unknown,
  onSet: (path: string[], value: unknown) => void,
  specialKeys: Set<symbol>,
  path: string[] = []
): typeof Proxy => {
  return new Proxy(
    {},
    {
      get: (target, key: string | symbol) => {
        if (typeof key === 'string') {
          return createDotNotationProxy(onGet, onSet, specialKeys, [...path, key])
        }
        if (specialKeys.has(key)) return onGet(key, path)
        throw new Error('symbol keys are not supported')
      },
      set: (target: any, key: string | symbol, value: unknown) => {
        if (typeof key === 'string') {
          onSet([...path, key], value)
          return true
        }
        throw new Error('symbol keys are not supported')
      },
    }
  )
}
