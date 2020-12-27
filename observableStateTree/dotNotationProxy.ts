export const createDotNotationProxy = (
  onGet: (key: string, path: string[]) => unknown,
  onSet: (path: string[], value: unknown) => void,
  specialKeys: Set<string>,
  path: string[] = []
): typeof Proxy => {
  return new Proxy(
    {},
    {
      get: (target, key: string) => {
        if (specialKeys.has(key)) return onGet(key, path)
        return createDotNotationProxy(onGet, onSet, specialKeys, [...path, key])
      },
      set: (target: any, key: string, value: unknown) => {
        if (specialKeys.has(key)) {
          throw new Error(`sorry you may not use "${key}" as a key`)
        }
        onSet([...path, key], value)
        return true
      },
    }
  )
}
