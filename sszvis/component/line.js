/**
 * Line component
 *
 * The line component is a general-purpose component used to render lines.
 *
 * The input data should be an array of arrays, where each inner array
 * contains the data points necessary to render a line. The line is then
 * composed of x- and y- values extracted from these data objects
 * using the x and y accessor functions.
 *
 * Each data object in a line's array is passed to the x- and y- accessors, along with
 * that data object's index in the array. For more information, see the documentation for
 * d3.svg.line.
 *
 * In addition, the user can specify stroke and strokeWidth accessor functions. Because these
 * functions apply properties to the entire line, when called, they are give the entire array of line data
 * as an argument, plus the index of that array of line data within the outer array of lines. Note that this
 * differs slightly from the usual case in that dimension-related accessor functions are given different
 * data than style-related accessor functions.
 *
 * @module sszvis/component/line
 *
 * @property {function} x                An accessor function for getting the x-value of the line
 * @property {function} y                An accessor function for getting the y-value of the line
 * @property {function} [key]            The key function to be used for the data join
 * @property {function} [valuesAccessor] An accessor function for getting the data points array of the line
 * @property {string, function} [stroke] Either a string specifying the stroke color of the line or lines,
 *                                       or a function which, when passed the entire array representing the line,
 *                                       returns a value for the stroke. If left undefined, the stroke is black.
 * @property {string, function} [stroke] Either a number specifying the stroke-width of the lines,
 *                                       or a function which, when passed the entire array representing the line,
 *                                       returns a value for the stroke-width. The default value is 1.
 *
 * @return {d3.component}
 */
sszvis_namespace('sszvis.component.line', function(module) {
  'use strict';

  module.exports = function() {

    return d3.component()
      .prop('x')
      .prop('y')
      .prop('stroke')
      .prop('strokeWidth')
      .prop('key').key(function(d, i){ return i; })
      .prop('valuesAccessor').valuesAccessor(sszvis.fn.identity)
      .render(function(data) {
        var selection = d3.select(this);
        var props = selection.props();


        // Layouts

        var line = d3.svg.line()
          .defined(sszvis.fn.compose(sszvis.fn.not(isNaN), props.y))
          .x(props.x)
          .y(props.y);


        // Rendering

        var path = selection.selectAll('.sszvis-line')
          .data(data, props.key);

        path.enter()
          .append('path')
          .classed('sszvis-line', true)
          .attr('stroke', props.stroke);

        path.exit().remove();

        path
          .order()
          .transition()
          .call(sszvis.transition)
          .attr('d', sszvis.fn.compose(line, props.valuesAccessor))
          .attr('stroke', props.stroke)
          .attr('stroke-width', props.strokeWidth);
      });
  };

});
