'use strict'

const { test } = require('tap')
const { Cache } = require('.')

const kValues = require('./symbol')

test('create a Cache that dedupes', async (t) => {
  // plan verifies that fetchSomething is called only once
  t.plan(3)

  const cache = new Cache()

  const expected = [42, 24]

  cache.define('fetchSomething', async (query) => {
    t.equal(query, expected.shift())
    return { k: query }
  })

  const p1 = cache.fetchSomething(42)
  const p2 = cache.fetchSomething(24)
  const p3 = cache.fetchSomething(42)

  const res = await Promise.all([p1, p2, p3])

  t.same(res, [
    { k: 42 },
    { k: 24 },
    { k: 42 }
  ])
})

test('create a Cache that dedupes full signature', async (t) => {
  // plan verifies that fetchSomething is called only once
  t.plan(3)

  const cache = new Cache()

  const expected = [42, 24]

  cache.define('fetchSomething', undefined, async (query) => {
    t.equal(query, expected.shift())
    return { k: query }
  })

  const p1 = cache.fetchSomething(42)
  const p2 = cache.fetchSomething(24)
  const p3 = cache.fetchSomething(42)

  const res = await Promise.all([p1, p2, p3])

  t.same(res, [
    { k: 42 },
    { k: 24 },
    { k: 42 }
  ])
})

test('missing function', async (t) => {
  const cache = new Cache()
  t.throws(function () {
    cache.define('something', null)
  })
  t.throws(function () {
    cache.define('something', 42)
  })
  t.throws(function () {
    cache.define('something', 'a string')
  })
})

test('works with custom serialize', async (t) => {
  // plan verifies that fetchSomething is called only once
  t.plan(2)

  const cache = new Cache()

  cache.define(
    'fetchSomething',
    {
      serialize (args) { return args.k }
    },
    async (queries) => {
      return queries
    }
  )

  const p1 = cache.fetchSomething({ k: 42 })
  const p2 = cache.fetchSomething({ k: 24 })

  const res = await Promise.all([p1, p2])

  t.same(res, [
    { k: 42 },
    { k: 24 }
  ])

  t.same(Object.keys(cache[kValues].fetchSomething.ids.items), ['24', '42'])
})

test('missing serialize', async (t) => {
  const cache = new Cache()
  t.throws(function () {
    cache.define('something', {
      serialize: 42
    }, async () => {})
  })
})

test('safe stable serialize', async (t) => {
  // plan verifies that fetchSomething is called only once
  t.plan(3)

  const cache = new Cache()

  const expected = [
    { foo: 'bar', bar: 'foo' },
    { hello: 'world' }
  ]

  cache.define('fetchSomething', async (query) => {
    t.same(query, expected.shift())
    return { k: query }
  })

  const p1 = cache.fetchSomething({ foo: 'bar', bar: 'foo' })
  const p2 = cache.fetchSomething({ hello: 'world' })
  const p3 = cache.fetchSomething({ bar: 'foo', foo: 'bar' })

  const res = await Promise.all([p1, p2, p3])

  t.same(res, [
    { k: { foo: 'bar', bar: 'foo' } },
    { k: { hello: 'world' } },
    { k: { foo: 'bar', bar: 'foo' } }
  ])
})

test('strings', async (t) => {
  // plan verifies that fetchSomething is called only once
  t.plan(3)

  const cache = new Cache()

  const expected = ['42', '24']

  cache.define('fetchSomething', async (query) => {
    t.equal(query, expected.shift())
    return { k: query }
  })

  const p1 = cache.fetchSomething('42')
  const p2 = cache.fetchSomething('24')
  const p3 = cache.fetchSomething('42')

  const res = await Promise.all([p1, p2, p3])

  t.same(res, [
    { k: '42' },
    { k: '24' },
    { k: '42' }
  ])
})

test('cacheSize on define', async (t) => {
  // plan verifies that fetchSomething is called only once
  t.plan(4)

  const cache = new Cache()

  const expected = [42, 24, 42]

  cache.define('fetchSomething', { cacheSize: 1 }, async (query) => {
    t.equal(query, expected.shift())
    return { k: query }
  })

  const p1 = cache.fetchSomething(42)
  const p2 = cache.fetchSomething(24)
  const p3 = cache.fetchSomething(42)

  const res = await Promise.all([p1, p2, p3])

  t.same(res, [
    { k: 42 },
    { k: 24 },
    { k: 42 }
  ])
})

test('cacheSize on constructor', async (t) => {
  // plan verifies that fetchSomething is called only once
  t.plan(4)

  const cache = new Cache({ cacheSize: 1 })

  const expected = [42, 24, 42]

  cache.define('fetchSomething', async (query) => {
    t.equal(query, expected.shift())
    return { k: query }
  })

  const p1 = cache.fetchSomething(42)
  const p2 = cache.fetchSomething(24)
  const p3 = cache.fetchSomething(42)

  const res = await Promise.all([p1, p2, p3])

  t.same(res, [
    { k: 42 },
    { k: 24 },
    { k: 42 }
  ])
})