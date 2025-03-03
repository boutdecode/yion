export type Container = {
  set: (items: Record<string, any>, options?: ContainerOptions) => void
  add: (name: string, value: any) => void
  get: (name: string, def?: any) => any
  search: (name: string, tree?: Record<string, any>) => any
  items: Record<string, any>
  _clear: () => void
  _init: boolean
  _items: Record<string, any>
  _immutable: boolean
}

export type ContainerOptions = {
  immutable?: boolean
}

const container: Container = {
  _init: false,
  _items: {},
  _immutable: true,

  /**
   * Set container content
   */
  set (items: Record<string, any>, { immutable = true }: ContainerOptions = {}): void {
    if (this._init) {
      return
    }

    if (typeof items !== 'object' || Array.isArray(items) || items === null) {
      throw new Error('Items has to be an object.')
    }

    this._items = items
    this._init = true
    this._immutable = immutable
  },

  /**
   * Add item into box
   */
  add (name: string, value: any): void {
    if (this._immutable && !!this._items[name]) {
      throw new Error('Can\'t add item because it already exists and container is immutable.')
    }

    this._items[name] = value
  },

  /**
   * Get item from container
   */
  get (name: string, def = null): any {
    const levels = name.split('.')

    let last = this._items
    for (let i = 0; i < levels.length; i++) {
      if (last === null) {
        break
      }

      last = last[levels[i]] !== undefined ? last[levels[i]] : def
    }

    return last
  },

  /**
   * Search something into tree
   */
  search (name: string, tree: Record<string, any> | null = null): any {
    tree = tree !== null ? tree : this._items

    const nodes = []
    for (const prop in tree) {
      if (prop === name) {
        return tree[prop]
      }

      if (
        typeof tree[prop] === 'object' &&
        !Array.isArray(tree[prop]) &&
        tree[prop] !== null
      ) {
        nodes.push(tree[prop])
      }
    }

    let search = null
    for (let i = 0; i < nodes.length; i++) {
      search = this.search(name, nodes[i])

      if (search) {
        return search
      }
    }

    return null
  },

  /**
   * Get items
   */
  get items (): Record<string, any> {
    return this._items
  },

  _clear (): void {
    this._items = {}
    this._immutable = false
  }
}

export default (state: Record<string, any> = {}, { immutable = true }: ContainerOptions = {}) => (context: any, next: Function) => {
  if (!container._init) {
    container.set(state, { immutable })
  }

  context.set('container', container)

  next()
}
