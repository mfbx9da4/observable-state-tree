export const createArrayPathProxy = (
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
        return createArrayPathProxy(onGet, onSet, specialKeys, [...path, key])
      },
      set: (target: any, key: string, value: unknown) => {
        if (key === '_val') {
          throw new Error('sorry you may not use _val as a key')
        }
        onSet([...path, key], value)
        return true
      },
    }
  )
}
