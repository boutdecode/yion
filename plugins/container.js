const container = {
  _init: false,
  _items: null,
  _immutable: true,

  /**
   * Set box content
   * @param {Object.<string, *>} items
   * @param {Object} [options={}]
   * @param {boolean} [options.immutable=true] Set content immutable
   */
  set (items, { immutable = true } = {}) {
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
   * @param {string} name
   * @param {*} value
   */
  add (name, value) {
    if (this._immutable && !!this._items[name]) {
      throw new Error('Can\'t add item because it already exists and box is immutable.')
    }

    this._items[name] = value
  },

  /**
   * Get item from box
   * @param {string} name
   * @param {*} [def=null] default value
   *
   * @return {*|null}
   */
  get (name, def = null) {
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
   * @param {string} name
   * @param {Object.<string, *> | null} [tree=null]
   *
   * @return {*}
   */
  search (name, tree = null) {
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
   * @return {Object.<string, *>}
   */
  get items () {
    return this._items
  },

  _clear () {
    this._items = null
    this.immutable = false
  }
}

/**
 * Container plugin
 * @param {Object.<string, *>} state
 * @param {Object} [options={}]
 * @param {boolean} [options.immutable=true] Set content immutable
 *
 * @returns {(function(*, Function): void)}
 */
module.exports = (state = {}, { immutable = true } = {}) => (context, next) => {
  if (!container._init) {
    container.set(state, { immutable })
  }

  context.set('container', container)

  next()
}
