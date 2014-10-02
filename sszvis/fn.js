/**
 * A collection of functional helper functions
 *
 * @module sszvis/fn
 */
namespace('sszvis.fn', function(module) {

  var slice = function(list) {
    var slice = Array.prototype.slice;
    return slice.apply(list, slice.call(arguments, 1));
  }

  module.exports = {
    compose: function() {
      var fns = arguments,
          start = arguments.length - 1;
      return function() {
        var i = start;
        var result = fns[i].apply(this, arguments);
        while (i--) result = fns[i].call(this, result);
        return result;
      };
    },

    defined: function(val) {
      return typeof val !== 'undefined';
    },

    either: function(val, fallback) {
      return (typeof val === "undefined") ? fallback : val;
    },

    find: function(predicate, list) {
      var idx = -1;
      var len = list.length;
      while (++idx < len) {
        if (predicate(list[idx])) return list[idx];
      }
    },

    identity: function(value) {
      return value;
    },

    constant: function(value) {
      return function() {
        return value;
      };
    },

    last: function(arr) {
      return arr[arr.length - 1];
    },

    not: function (f) {
      return function(){ return !f.apply(this, arguments) };
    },

    partial: function(func, var_args) {
      var argsArr = slice(arguments, 1);
      return function(){
        return func.apply(this, argsArr.concat(slice(arguments)));
      };
    },

    prop: function(key) {
      return function(object) {
        return object[key];
      }
    },

    /**
     * fn.set
     *
     * takes an array of elements and returns the unique elements of that array
     * the returned array is ordered according to the elements' order of appearance
     * in the input array, e.g.:
     *
     * [2,1,1,6,8,6,5,3] -> [2,1,6,8,5,3]
     * ["b", a", "b", "b"] -> ["b", "a"]
     * [{obj1}, {obj2}, {obj1}, {obj3}] -> [{obj1}, {obj2}, {obj3}]
     *
     * @param {Array} arr - the Array of source elements
     * @return {Array} an Array of unique elements
     */
    set: function(arr) {
      return arr.reduce(function(m, value) {
        return m.indexOf(value) < 0 ? m.concat(value) : m;
      }, []);
    },

    /**
     * fn.hashableSet
     *
     * takes an array of elements and returns the unique elements of that array
     * the returned array is ordered according to the elements' order of appearance
     * in the input array. This function differs from fn.set in that the elements
     * in the input array MUST be "hashable" - convertible to unique keys of a JavaScript object.
     *
     * @param  {Array} arr the Array of source elements
     * @return {Array} an Array of unique elements
     */
    hashableSet: function(arr) {
      var seen = {}, value, result = [];
      for (var i = 0, l = arr.length; i < l; ++i) {
        value = arr[i];
        if (!seen[value]) {
          seen[value] = true;
          result.push(value);
        }
      }
      return result;
    },

    groupBy: function(arr, prop) {
      var result = {}, value, key;
      for (var i = 0, l = arr.length; i < l; ++i) {
        value = arr[i];
        key = value[prop];
        if (result.hasOwnProperty(key)) {
          result[key].push(value);
        } else {
          result[key] = [value];
        }
      }
      return result;
    },

    objectValues: function(obj) {
      var result = [], prop;
      for (prop in obj) {
        if (obj.hasOwnProperty(prop)) {
          result.push(obj[prop]);
        }
      }
      return result;
    }

  }

});
