/* global d3, sszvis, config */

// Configuration
// -----------------------------------------------

// These are the internal edges of the bins used for the color scale.
// IMPORTANT: because of the way d3.scale.threshold works, do not specify
// fixed upper and lower bounds. Anything less than or equal to the first element
// in BIN_EDGES will be grouped in the first bin, and anything greater than or
// equal to the last element will be grouped in the last bin.
var BIN_EDGES = [5, 40, 200, 600];
var MAX_LEGEND_WIDTH = 260;
var queryProps = sszvis.responsiveProps().prop("legendWidth", {
  _: function (width) {
    return Math.min(width * 0.9, MAX_LEGEND_WIDTH);
  },
});

function parseRow(d) {
  return {
    manAge: d["Altersgruppe Männer"],
    womAge: d["Altersgruppe Frauen"],
    value: sszvis.parseNumber(d["Anzahl"]),
  };
}

var xAcc = sszvis.prop("manAge");
var yAcc = sszvis.prop("womAge");
var cAcc = sszvis.prop("value");

// Application state
// -----------------------------------------------
var state = {
  data: [],
  manAgeList: [],
  womAgeList: [],
  valueDomain: [0, 0],
  selection: [],
};

// State transitions
// -----------------------------------------------
var actions = {
  prepareState: function (data) {
    state.data = data;
    state.manAgeList = sszvis.set(state.data, xAcc);
    state.womAgeList = sszvis.set(state.data, yAcc);
    state.valueDomain = d3.extent(state.data, cAcc);

    render(state);
  },

  showTooltip: function (datum) {
    state.selection = [datum];
    render(state);
  },

  hideTooltip: function () {
    state.selection = [];
    render(state);
  },

  resize: function () {
    render(state);
  },
};

// Data initialization
// -----------------------------------------------
d3.csv(config.data, parseRow).then(actions.prepareState).catch(sszvis.loadError);

// Render
// -----------------------------------------------
function render(state) {
  var containerWidth = sszvis.measureDimensions(config.id).width;
  var squarePadding = 2;
  var tablePadding = {
    top: 60,
    left: 70,
    bottom: 60,
    right: 0,
  };
  // heatTableDimensions calculates a set of useful properties for configuring the heat table.
  // give it the targeted width (final width will not necessarily match this), the padding between squares, and the number of squares
  // in each dimension (x, then y)
  var tableDimensions = sszvis.dimensionsHeatTable(
    containerWidth,
    squarePadding,
    state.manAgeList.length,
    state.womAgeList.length,
    tablePadding
  );

  // construct the bounds as usual, but add the left and right padding to the width, and the top and bottom padding to the height
  // This is because, when bounds are being constructed, the padding is subtracted from width and height to provide innerWidth and innerHeight, but we want these values to represent the table's dimensions
  var bounds = sszvis.bounds(
    {
      height: tablePadding.top + tableDimensions.height + tablePadding.bottom,
      left: tablePadding.left,
      right: tablePadding.right,
      top: tablePadding.top,
      bottom: tablePadding.bottom,
    },
    config.id
  );
  var props = queryProps(bounds);

  // Scales

  var xScale = d3
    .scaleBand()
    .padding(tableDimensions.padRatio)
    .paddingOuter(0)
    .rangeRound([0, tableDimensions.width])
    .domain(state.manAgeList);

  var yScale = d3
    .scaleBand()
    .padding(tableDimensions.padRatio)
    .paddingOuter(0)
    .rangeRound([0, tableDimensions.height])
    .domain(state.womAgeList);

  // create a linear color interpolator for generating the output range of bin colors
  var interpolateColor = sszvis.scaleSeqBlu().domain(state.valueDomain);

  // the range is composed of colors sampled at equal distances along the color spectrum
  // such that binColors.length === BIN_EDGES.length + 1
  var binColors = BIN_EDGES.concat(state.valueDomain[1]).map(interpolateColor);

  // for the threshold scale, the number of values in the range must be one greater than the
  // number of values in the domain.
  var colorScale = d3.scaleThreshold().domain(BIN_EDGES).range(binColors);

  var xValue = sszvis.compose(xScale, xAcc);
  var yValue = sszvis.compose(yScale, yAcc);

  function cValue(d) {
    var v = cAcc(d);
    return v === 0 ? sszvis.scaleLightGry()(v) : colorScale(v);
  }

  // Layers

  var chartLayer = sszvis.createSvgLayer(config.id, bounds).datum(state.data);

  var tooltipLayer = sszvis.createHtmlLayer(config.id, bounds).datum(state.selection);

  // Components

  var barGen = sszvis
    .bar()
    .x(xValue)
    .y(yValue)
    .width(tableDimensions.side)
    .height(tableDimensions.side)
    .fill(cValue)
    .stroke(function (d) {
      return sszvis.contains(state.selection, d) ? sszvis.slightlyDarker(cValue(d)) : "none";
    });

  var xAxis = sszvis.axisX
    .ordinal()
    .scale(xScale)
    .orient("top")
    .tickSize(0, 0)
    .tickPadding(0)
    .title("Altersgruppe Männer")
    .titleAnchor("middle")
    .titleCenter(true)
    .slant("vertical")
    .dyTitle(-36)
    .hideLabelThreshold(0)
    .highlightTick(function (tickValue) {
      return state.selection.some(function (d) {
        return xAcc(d) === tickValue;
      });
    });

  var yAxis = sszvis.axisY
    .ordinal()
    .scale(yScale)
    .orient("left")
    .title("Altersgruppe Frauen")
    .titleVertical(true)
    .titleAnchor("middle")
    .titleCenter(true)
    .dxTitle(-45)
    .highlightTick(function (tickValue) {
      return state.selection.some(function (d) {
        return yAcc(d) === tickValue;
      });
    });

  var legend = sszvis
    .legendColorBinned()
    .scale(colorScale)
    .displayValues(BIN_EDGES)
    .endpoints(state.valueDomain)
    .width(props.legendWidth)
    .labelFormat(sszvis.formatNumber);

  var tooltipHeaderText = sszvis.modularTextHTML().bold("Paare");

  var tooltip = sszvis
    .tooltip()
    .renderInto(tooltipLayer)
    .header(tooltipHeaderText)
    .body(function (d) {
      return [
        ["Alter des Mannes:", xAcc(d)],
        ["Alter der Frau:", yAcc(d)],
        ["Anzahl: ", cAcc(d)],
      ];
    })
    .orientation(sszvis.fitTooltip("bottom", bounds))
    .visible(isSelected);

  // Rendering

  var bars = chartLayer
    .selectGroup("bars")
    .attr("transform", sszvis.translateString(tableDimensions.centeredOffset, 0))
    .call(barGen);

  bars.selectAll("[data-tooltip-anchor]").call(tooltip);

  chartLayer
    .selectGroup("xAxis")
    .attr("transform", sszvis.translateString(tableDimensions.centeredOffset, -10))
    .call(xAxis);

  chartLayer
    .selectGroup("yAxis")
    .attr("transform", sszvis.translateString(tableDimensions.centeredOffset - 10, 0))
    .call(yAxis);

  // At very small screen sizes, we position the legend centered on the screen,
  // at larger sizes centered on the table
  var legendX =
    tableDimensions.width < MAX_LEGEND_WIDTH
      ? (bounds.width - props.legendWidth) / 2 - bounds.padding.left
      : tableDimensions.centeredOffset + (tableDimensions.width - props.legendWidth) / 2;

  chartLayer
    .selectGroup("legend")
    .attr("transform", sszvis.translateString(legendX, bounds.innerHeight + 16))
    .call(legend);

  // Interaction

  var interactionLayer = sszvis
    .panning()
    .elementSelector(".sszvis-bar")
    .on("start", actions.showTooltip)
    .on("pan", actions.showTooltip)
    .on("end", actions.hideTooltip);

  bars.call(interactionLayer);

  sszvis.viewport.on("resize", actions.resize);
}

// Helper functions
// -----------------------------------------------
function isSelected(d) {
  return sszvis.contains(state.selection, d);
}
