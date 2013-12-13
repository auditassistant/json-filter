var filterChecker = require('./')
  , test = require('tap').test
  

test("Basic Tests", function(t){
  
  t.equal(filterChecker(
    {name: "Cats"},
    {name: "Cats"}
  ), true)

  t.equal(filterChecker(
    {name: "Dogs"},
    {name: "Cats"}
  ), false)

  t.equal(filterChecker(
    {name: "Dogs"},
    {name: {$any: true}}
  ), true)

  t.equal(filterChecker(
    {name: "Dogs"},
    {name: {$only: ['Dogs', "Cats"]}}
  ), true)


  t.equal(filterChecker(
    {name: "Chickens"},
    {name: {$only: ['Dogs', "Cats"]}}
  ), false)

  t.end()
})

test('$present', function(t){
  t.equal(filterChecker(
    {name: "Chickens"},
    {name: {$present: true}}
  ), true)
  
  t.equal(filterChecker(
    {cat: "Meow"},
    {name: {$present: true}}
  ), false)

  t.equal(filterChecker(
    {name: "Chickens"},
    {name: {$present: false}}
  ), false)
  
  t.equal(filterChecker(
    {cat: "Meow"},
    {name: {$present: false}}
  ), true)

  t.equal(filterChecker(
    {object: {name: "Chickens"}},
    {object: {$present: true}}
  ), true)

  t.equal(filterChecker(
    {object: {name: "Chickens"}},
    {object: {$present: false}}
  ), false)


  t.end()
})

test("Testing extra undefined attributes", function(t){


  t.equal(filterChecker(
    {name: "Dogs"},
    {name: {$only: ['Dogs', "Cats"]}, value: {$only: [1,2,3,4]}}
  ), false)
  
  t.equal(filterChecker(
    {name: "Dogs"},
    {name: {$only: ['Dogs', "Cats"]}, value: {$only: [1,2,3,4]}},
    {match: 'any'}
  ), true)
  
  t.equal(filterChecker(
    {name: "Dogs", value: 3},
    {name: {$only: ['Dogs', "Cats"]}, value: {$only: [1,2,3,4]}}
  ), true)
  
  t.equal(filterChecker(
    {name: "Dogs"},
    {name: {$only: ['Dogs', "Cats"]}, value: {$any: true}}
  ), true)
  
  t.end()

})

test("Test match = 'source' option", function(t){

  t.equal(filterChecker(
    {name: "Dog", color: 'gray', type: 'animal'},
    {name: "Dog", color: {$any: true}, type: 'animal'},
    {match: 'source'}
  ), true)
  
  t.equal(filterChecker(
    {name: "Dog", color: 'gray', type: 'animal', extraAttribute: 'Stuff'},
    {name: "Dog", color: {$any: true}, type: 'animal'},
    {match: 'source'}
  ), false)
  
  t.equal(filterChecker(
    {name: "Dog", color: 'gray', type: 'animal', extraAttribute: 'Stuff'},
    {name: "Dog", color: {$any: true}, type: 'animal'}
  ), true)
  
  t.equal(filterChecker(
    {name: "Dog", color: 'gray', type: 'animal', extraAttribute: 'Stuff'},
    {name: "Dog", color: {$any: true}, type: 'animal', extraAttribute: {$only: ['Stuff', 'Things']}},
    {match: 'source'}
  ), true)
  t.end()

})

test("Test match = 'all' option", function(t){

  // should pass
  
  t.equal(filterChecker(
    {name: "Dog", color: 'gray', type: 'animal'},
    {name: "Dog", color: 'gray', type: 'animal'},
    {match: 'all'}
  ), true, 'Equal match')
  
  t.equal(filterChecker(
    {name: "Dog", color: 'gray', type: 'animal', object: {deep: true}},
    {name: "Dog", color: 'gray', type: 'animal', object: {deep: true}},
    {match: 'all'}
  ), true, 'Deep equal match')
  
  
  // should fail
  
  t.equal(filterChecker(
    {name: "Dog", type: 'animal'},
    {name: "Dog", color: 'gray', type: 'animal'},
    {match: 'all'}
  ), false, 'Mising on first')
  
  t.equal(filterChecker(
    {name: "Dog", color: 'gray', type: 'animal'},
    {name: "Dog", type: 'animal'},
    {match: 'all'}
  ), false, 'Mising on second')

  t.equal(filterChecker(
    {name: "Dog", color: 'gray', type: 'animal', object: {deep: true}},
    {name: "Dog", color: 'gray', type: 'animal', object: {deep: false}},
    {match: 'all'}
  ), false, 'Deep attribute different')
  
  t.equal(filterChecker(
    {name: "Dog", color: 'gray', type: 'animal'},
    {name: "Dog", color: 'gray', type: 'animal', object: {deep: true}},
    {match: 'all'}
  ), false, 'No deep on first')
  
  t.equal(filterChecker(
    {name: "Dog", color: 'gray', type: 'animal', object: {deep: true}},
    {name: "Dog", color: 'gray', type: 'animal'},
    {match: 'all'}
  ), false, 'No deep on second')
  
  t.equal(filterChecker(
    {name: "Dog", color: 'gray', type: 'animal', object: {deep: true}},
    {name: "Dog", color: 'gray', type: 'animal', object: {deep: true, another: 'attribute'}},
    {match: 'all'}
  ), false, 'Deep second has another attribute')
  
  t.equal(filterChecker(
    {name: "Dog", color: 'gray', type: 'animal', object: {deep: true, another: 'attribute'}},
    {name: "Dog", color: 'gray', type: 'animal', object: {deep: true}},
    {match: 'all'}
  ), false, 'Deep first has another attribute')
  
  t.equal(filterChecker(
    {name: "Dog", color: 'gray', type: 'animal'},
    {name: "Dog", color: 'blue', type: 'animal'},
    {match: 'all'}
  ), false, 'Different attribute')
  
  t.equal(filterChecker(
    {name: "Dog", color: 'gray', type: 'animal'},
    {name: "Dog", color: {$any: true}, type: 'animal'},
    {match: 'all'}
  ), false, '$conditional')
  
  t.end()

})

test("Test Deep Matching", function(t){

  t.equal(filterChecker(
    {name: "Chicken", data: {age: 1, gender: 'male'}},
    {name: "Chicken", data: {age: {$only: [1,2,3,4]}, gender: 'male'}}
  ), true)
  
  t.equal(filterChecker(
    {name: "Chicken", data: {age: 1, gender: 'female'}},
    {name: "Chicken", data: {age: {$only: [1,2,3,4]}, gender: 'male'}}
  ), false)
  
  t.equal(filterChecker(
    {name: "Chicken", data: {age: 6, gender: 'male'}},
    {name: "Chicken", data: {age: {$only: [1,2,3,4]}, gender: 'male'}}
  ), false)
  
  t.equal(filterChecker(
    {name: "Chicken", data: {age: 1, gender: 'female'}},
    {name: "Chicken", data: {age: {$only: [1,2,3,4]}, gender: {$only: ['male', 'female']}}}
  ), true)
  t.end()
  
})

test("Test Array matching", function(t){

  t.equal(filterChecker(
    {name: "Chicken", array: [1,2,3,4,5]},
    {name: "Chicken", array: [1,2,3,4,5]}
  ), true)
  
  t.equal(filterChecker(
    {name: "Chicken", array: [1,2,3,4,5,6]},
    {name: "Chicken", array: [1,2,3,4,5]}
  ), false)
  
  t.equal(filterChecker(
    {name: "Chicken", array: [1,2,3,4]},
    {name: "Chicken", array: [1,2,3,4,5]}
  ), false)
  
  //// TODO: this test should probably pass:
  //t.equal(filterChecker(
  //  {name: "Chicken", array: [1,2,3,4]},
  //  {name: "Chicken", array: [1,2,3,4, {$any: true}]}
  //), true)
  
  t.equal(filterChecker(
    {name: "Chicken", array: [1,2,3,4]},
    {name: "Chicken", array: [1,{$only: [2,3]},3,4]}
  ), true)
  
  t.equal(filterChecker(
    {name: "Chicken", array: [1,1,3,4]},
    {name: "Chicken", array: [1,{$only: [2,3]},3,4]}
  ), false)
  
  t.equal(filterChecker(
    {name: "Chicken", array: [1,2,3,4]},
    {name: "Chicken", array: {$contains: [4, 2] }}
  ), true)
  
  t.equal(filterChecker(
    {name: "Chicken", array: [1,2,3,4]},
    {name: "Chicken", array: {$contains: [4, 2, 5] }}
  ), false)
  
  t.equal(filterChecker(
    {name: "Chicken", array: [1,2,3,4]},
    {name: "Chicken", array: {$excludes: [4, 2, 5] }}
  ), false)
  
  t.equal(filterChecker(
    {name: "Chicken", array: [1,3]},
    {name: "Chicken", array: {$excludes: [4, 2, 5] }}
  ), true)
  
  t.end()
  

})
test("Test Combinations", function(t){

  t.equal(filterChecker(
    {name: "Chicken", array: [1,{cat: 1},3,4]},
    {name: "Chicken", array: [1,{cat: 1},3,4]}
  ), true)
  
  t.equal(filterChecker(
    {name: "Chicken", array: [1,{cat: 2},3,4]},
    {name: "Chicken", array: [1,{cat: 1},3,4]}
  ), false)
  
  t.equal(filterChecker(
    {name: "Chicken", array: [1,{cat: 2},3,4]},
    {name: "Chicken", array: [1,{cat: {$only: [1,2]}},3,4]}
  ), true)
  
  t.equal(filterChecker(
    {name: "Chicken", array: [1,{cat: 3},3,4]},
    {name: "Chicken", array: [1,{cat: {$only: [1,2]}},3,4]}
  ), false)

  t.end()

})

test("Filter Queries", function(t){

  function queryHandler(query, object){
    if (query === 'user_id'){
      return 124
    }
  }

  t.equal(filterChecker(
    {id: 1, type: 'comment', user_id: 124},
    {type: 'comment', user_id: {$query: 'user_id'}},
    {queryHandler: queryHandler}
  ), true)

  t.equal(filterChecker(
    {id: 1, type: 'comment', user_id: 124123},
    {type: 'comment', user_id: {$query: 'user_id'}},
    {queryHandler: queryHandler}
  ), false)

  t.end()
})

