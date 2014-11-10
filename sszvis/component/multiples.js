/**
 * Small Multiples component
 *
 * Used to generate group elements which contain small multiples charts.
 *
 * This component lays out rectangular groups in a grid according to the number of rows
 * and the number of columns provided. It is possible to specify paddingX and paddingY
 * values, pixel amounts which will be left as empty space between the columns and the
 * rows, respectively.
 *
 * Data should be passed to this component in a special way: it should be an array of
 * data values, where each data value represents a single group. IMPORTANT: each data
 * value must also have a property called 'values' which represents the values corresponding
 * to that group.
 *
 * In the multiple pie charts example, an array of "groups" data is bound to the chart before
 * the multiples component is called. Each element in the "groups" data has a values property
 * which contains the data for a single pie chart.
 *
 * The multiples component creates the groups and lays them out, attaching the following new properties
 * to each group object:
 *
 * gx - the x-position of the group
 * gy - the y-position of the group
 * gw - the width of the group (without padding)
 * gh - the height of the group (without padding)
 *
 * Generally, you should not use source data objects as group objects, but should instead
 * create new objects which are used to store group information. This creates a data hierarchy
 * which matches the representation hierarchy, which is very much a d3 pattern.
 *
 * Once the groups have been created, the user must still do something with them. The pattern
 * for creating charts within each group should look something like:
 *
 * chart.selectAll('.sszvis-multiple')
 *   .each(function(d) {
 *     var groupSelection = d3.select(this);
 *
 *     ... do something which creates a chart using groupSelection ...
 *   });
 *
 * @property {number} width           the total width of the collection of multiples
 * @property {number} height          the total height of the collection of multiples
 * @property {number} paddingX        x-padding to put between columns
 * @property {number} paddingY        y-padding to put between rows
 * @property {number} rows            the number of rows to generate
 * @property {number} cols            the number of columns to generate
 *
 * @return {d3.component}
 */
namespace('sszvis.component.multiples', function(module) {

  module.exports = function() {
    return d3.component()
      .prop('width')
      .prop('height')
      .prop('paddingX')
      .prop('paddingY')
      .prop('rows')
      .prop('cols')
      .render(function(data) {
        var selection = d3.select(this);
        var props = selection.props();

        var unitWidth = (props.width - props.paddingX * (props.cols - 1)) / props.cols;
        var unitHeight = (props.height - props.paddingY * (props.rows - 1)) / props.rows;

        var multiples = selection.selectAll('g.sszvis-multiple')
          .data(data);

        multiples.enter()
          .append('g')
          .classed('sszvis-g sszvis-multiple', true);

        multiples.exit().remove();

        var subGroups = multiples.selectAll('g.sszvis-multiple-chart')
          .data(function(d) {
            return [d.values];
          });

        subGroups.enter()
          .append('g')
          .classed('sszvis-multiple-chart', true);

        subGroups.exit().remove();

        multiples
          .datum(function(d, i) {
            d.gx = (i % props.cols) * (unitWidth + props.paddingX);
            d.gw = unitWidth;
            d.gy = Math.floor(i / props.cols) * (unitHeight + props.paddingY);
            d.gh = unitHeight;
            return d;
          })
          .attr('transform', function(d, i) {
            return 'translate(' + (d.gx) + ',' + (d.gy) + ')';
          });

      });
  };

});
