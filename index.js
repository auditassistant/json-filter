var checkFilter = module.exports = function checkFilter(source, filter, options){
  // options: queryHandler, match (source, filter, any, all)
  // if filter, every filter permission must be satisfied (i.e. required fields)
  // if source, every source key must be specified in filter
  // if any, the keys don't matter, but if there is a match, they must pass
  // if all, all keys must be exactly the same, otherwise fails - for finding changed items - no $conditionals work in this mode
  
  var checkConditionals = !options || options.match !== 'all'
  
  options = options || {}
  options.match = options.match || 'filter'
  
  if (checkConditionals){
    if (filter && filter.$present){
      return !!source
    } else if (filter && filter.$present === false){
      return !source
    } else if (filter === null){
      return true
    } else if (filter == null/*undefined test*/){
      return 'undefined'
    } else if (filter.$any){
      return true
    } else if (filter.$query && options.queryHandler){
      var queryValue = options.queryHandler(filter.$query, options.context || source)
      return source == queryValue
    }
  } else {
    if (source === filter){
      return true
    } else if (filter == null){
      return false
    }
  }
  
  if (source instanceof Object){
          
      if (filter instanceof Object){
        
        if (filter.$any && checkConditionals){
          return true
        } else if (Array.isArray(source)) {
          
          // source is an array
          
          if (Array.isArray(filter.$contains) && checkConditionals){
            
            return filter.$contains.every(function(value){
              return (~source.indexOf(value))
            })
            
          } else if (Array.isArray(filter.$excludes) && checkConditionals){
            
            return filter.$excludes.every(function(value){
              return (!~source.indexOf(value))
            })
            
          } else if (Array.isArray(filter)) {
            
            // both source and filter are arrays, so ensure they match key by key
            return matchKeys(source, filter, options) && (filter.length == source.length)
            
          } else {
            
            // source is array but filter is a hash, so ensure that keys that do exist match filter
            return matchKeys(source, filter, options)
            
          }
          
        } else {          
          // both source and filter are standard hashes so match key by key
          return matchKeys(source, filter, options)
        }
      }

    
  } else {
    if (Array.isArray(filter.$only) && checkConditionals) {
      return !!~filter.$only.indexOf(source)  
    } else if (Array.isArray(filter.$not) && checkConditionals){
      return !~filter.$not.indexOf(source)
    } else {
      return source === filter
    }
  }
  
}


function matchSpecifiedKeysWithOptional(keys, source, filter, options){

  var result = true

  for (var i=0,l=keys.length;i<l;i++){
    var key = keys[i]
    if (isNotMeta(key)){

      var res = checkFilter(source[key], filter[key], options)
      if ((filter.$optional && ~filter.$optional.indexOf(key)) || res !== 'undefined'){
        result = res
      } else {
        result = false
      }

      if (!result){
        break
      }
    }
  }

  return result

}

function matchSpecifiedKeys(keys, source, filter, options){
  var result = true

  for (var i=0,l=keys.length;i<l;i++){
    var key = keys[i]
    if (isNotMeta(key) && !checkFilter(source[key], filter[key], options)){
      return false
    }
  }

  return result
}

function matchKeys(source, filter, options){
  var result = false
  
  if (options.match === 'all'){
    var keys = keyUnion(source, filter)
    result = matchSpecifiedKeys(keys, source, filter, options)
  } else if (filter.$matchAny){
    result = filter.$matchAny.some(function(innerFilter){
      var combinedFilter = mergeClone(filter, innerFilter)
      delete combinedFilter.$matchAny
      return matchKeys(source, combinedFilter, options)
    })
  } else {
    if (options.match === 'filter'){
      var keys = Object.keys(filter)
      result = matchSpecifiedKeys(keys, source, filter, options)
    } else if (options.match === 'source'){
      var keys = Object.keys(source)
      options = Object.create(options)
      options.match = 'filter'
      result = matchSpecifiedKeysWithOptional(keys, source, filter, options)
    } else  {
      var keys = Object.keys(source)
      options = Object.create(options)
      options.match = 'filter'
      result = matchSpecifiedKeys(keys, source, filter, options)
    }
  }

  return result
}

function keyUnion(a, b){
  var result = {}

  for (var k in a){
    if (k in a){
      result[k] = true
    }
  }

  for (var k in b){
    if (k in b){
      result[k] = true
    }
  }

  return Object.keys(result)
}

function isNotMeta(key){
  return (key.charAt(0) !== '$')
}

function mergeClone(){
  var result = {}
  for (var i=0;i<arguments.length;i++){
    var obj = arguments[i]
    if (obj){
      Object.keys(obj).forEach(function(key){
        result[key] = obj[key]
      })
    }
  }
  return result
}