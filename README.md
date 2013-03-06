JSON Filter
===

Match JSON objects against filters - used internally by [JSON Context](https://github.com/mmckegg/json-context), [Realtime Templates](https://github.com/mmckegg/realtime-templates) and [ContextDB](https://github.com/mmckegg/contextdb).

## Installation

```shell
$ npm install json-filter
```

## Filters

Filters are just object that have the keys and values you want your final object to have. e.g. if you wanted to require that the field `type` was always `person` your filter would be `{type: 'person'}`. 

If things aren't so black and white, the following conditionals are available:

#### $present

Specify that the value must not be null or false (i.e. 'truthy'). 

```js
{
  name: {$present: true}
}
```

#### $any

Specify that the value can be anything. Useful when matching all keys.

```js
{
  description: {$any: true}
}
```

#### $contains

For matching against an array. The array must contain all of the values specified.

```js
{
  tags: {$contains: ['cat', 'animal']}
}
```

#### $excludes

For matching against an array. The array cannot contain any of the values specified.

```js
{
  permissions: {$excludes: ['admin', 'mod']}
}
```

#### $only

The value can only be one of the ones specified.

```js
{
  gender: {$only: ['male', 'female', 'unknown']}
}
```

#### $not

The value can be anything except one of the ones specified.

```js
{
  browser: {$not: ['IE', 'Fifefox']}
}
```

#### $matchAny

Allows a filter to branch into multiple filters when at least one must match.

```js
{
  $matchAny: [
    { type: "Post"
      state: {$only: ['draft', 'published']}
    },
    { type: "Comment"
      state: {$only: ['pending', 'approved', 'spam']}
    }
  ]
}
```

#### $query

Specify a query to get the value to match. Uses `options.queryHandler`.

```js
{
  type: 'item',
  user_id: {$query: 'user.id'}
}
```

#### $optional

A shortcut for specifying a lot of $any filters at the same time.

```js
{
  $optional: ['description', 'color', 'age']
}
```

Is equivelent to:

```js
{
  description: {$any: true},
  color: {$any: true},
  age: {$any: true}
}
```

## API

```js
var checkFilter = require('json-filter')
```

### checkFilter(source, filter, options)

#### options:

- **match**: specify: 'filter', 'source', 'any', 'all'
  - filter: every filter permission must be satisfied (i.e. required fields)
  - source: every source key must be specified in filter
  - any: the keys don't matter, but if there is a match, they must pass
  - all: all keys must be exactly the same, otherwise fails - for finding changed items - no $conditionals work in this mode
- **queryHandler**: Accepts a function(query, localContext) that returns resulting value
- **context**: Object to pass to the query handler