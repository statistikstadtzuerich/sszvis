/**
 * Creates a bounds object to help with the construction of d3 charts
 * that follow the d3 margin convention.
 *
 * @module sszvis/bounds
 * @see http://bl.ocks.org/mbostock/3019563
 *
 * @param  {Object} bounds
 * @return {Object}
 */
namespace('sszvis.bounds', function(module) {
  'use strict';

  module.exports = function(bounds) {
    bounds || (bounds = {});
    var padding = {
      top:    sszvis.fn.either(bounds.top, 0),
      right:  sszvis.fn.either(bounds.right, 1),
      bottom: sszvis.fn.either(bounds.bottom, 0),
      left:   sszvis.fn.either(bounds.left, 1)
    };
    var height  = sszvis.fn.either(bounds.height, 365 + padding.top + padding.bottom);
    var width   = sszvis.fn.either(bounds.width, 516);

    return {
      innerHeight: height - padding.top  - padding.bottom,
      innerWidth:  width  - padding.left - padding.right,
      padding:     padding,
      height:      height,
      width:       width,
    };
  };

});
