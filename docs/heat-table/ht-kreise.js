/* global d3, sszvis, config */

// Configuration
// -----------------------------------------------

function parseRow(d) {
  return {
    xPosition: d["KName"],
    yPosition: d["Altersgruppe"],
    value: sszvis.parseNumber(d["Anzahl"]),
  };
}

var queryProps = sszvis
  .responsiveProps()
  .prop("xAxisSlant", {
    palm: "vertical",
    _: "diagonal",
  })
  .prop("xAxisLabel", {
    _: "Kreis",
  })
  .prop("yAxisLabel", {
    _: "Altersgruppe",
  })
  .prop("valueLabel", {
    _: "Einwohner",
  })
  .prop("tSourceAxis", {
    _: "x",
  })
  .prop("tTitleAdd", {
    _: "",
  });

var xAcc = sszvis.prop("xPosition");
var yAcc = sszvis.prop("yPosition");
var vAcc = sszvis.prop("value");

// Application state
// -----------------------------------------------
var state = {
  data: [],
  yList: [],
  xList: [],
  valueDomain: [0, 0],
  selection: [],
};

// State transitions
// -----------------------------------------------
var actions = {
  prepareState: function (data) {
    state.data = data;
    state.yList = sszvis.set(state.data, yAcc).sort(sortInt);
    state.xList = sszvis.set(state.data, xAcc).sort(sortKreisInt);
    state.valueDomain = d3.extent(state.data, vAcc);

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
    right: 0,
    bottom: 40,
    left: 66,
  };
  // heatTableDimensions calculates a set of useful properties for configuring the heat table.
  // give it the targeted width (final width will not necessarily match this), the padding between squares, and the number of squares
  // in each dimension (x, then y)
  var tableDimensions = sszvis.dimensionsHeatTable(
    containerWidth,
    squarePadding,
    state.xList.length,
    state.yList.length,
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

  var props = queryProps(sszvis.measureDimensions(config.id));

  // Scales

  var xScale = d3
    .scaleBand()
    .padding(tableDimensions.padRatio)
    .paddingOuter(0)
    .rangeRound([0, tableDimensions.width])
    .domain(state.xList);

  var yScale = d3
    .scaleBand()
    .padding(tableDimensions.padRatio)
    .paddingOuter(0)
    .rangeRound([0, tableDimensions.height])
    .domain(state.yList);

  var colorScale = sszvis.scaleSeqBlu().domain(state.valueDomain);

  var xValue = sszvis.compose(xScale, xAcc);
  var yValue = sszvis.compose(yScale, yAcc);
  var cValue = sszvis.compose(function (v) {
    return isNaN(v)
      ? "url(#ht-missing-value)"
      : v === 0
      ? sszvis.scaleLightGry()(v)
      : colorScale(v);
  }, vAcc);

  // Layers

  var chartLayer = sszvis.createSvgLayer(config.id, bounds).datum(state.data);

  var tooltipLayer = sszvis.createHtmlLayer(config.id, bounds).datum(state.selection);

  // Make sure that the missing value pattern is available
  sszvis
    .ensureDefsElement(chartLayer, "pattern", "ht-missing-value")
    .call(sszvis.heatTableMissingValuePattern);

  // Components

  var barGen = sszvis
    .bar()
    .x(xValue)
    .y(yValue)
    .width(tableDimensions.side)
    .height(tableDimensions.side)
    .fill(cValue)
    .stroke(function (d) {
      return !isNaN(vAcc(d)) && sszvis.contains(state.selection, d)
        ? sszvis.slightlyDarker(cValue(d))
        : "none";
    });

  var xAxis = sszvis.axisX
    .ordinal()
    .scale(xScale)
    .orient("top")
    .slant(props.xAxisSlant)
    .tickSize(0, 0)
    .tickPadding(0)
    .title(props.xAxisLabel)
    .titleAnchor("middle")
    .titleCenter(true)
    .dyTitle(-40)
    .highlightTick(function (tickValue) {
      return state.selection.some(function (d) {
        return xAcc(d) === tickValue;
      });
    });

  var yAxis = sszvis.axisY
    .ordinal()
    .scale(yScale)
    .orient("left")
    .title(props.yAxisLabel)
    .titleVertical(true)
    .titleAnchor("middle")
    .titleCenter(true)
    .dxTitle(-40)
    .highlightTick(function (tickValue) {
      return state.selection.some(function (d) {
        return yAcc(d) === tickValue;
      });
    });

  var legendWidth = Math.min(bounds.innerWidth / 2, 260);

  var legend = sszvis
    .legendColorLinear()
    .scale(colorScale)
    .width(legendWidth)
    .labelFormat(sszvis.formatNumber);

  var tooltipHeaderText = sszvis.modularTextHTML().bold("Paare");

  var tooltip = sszvis
    .tooltip()
    .renderInto(tooltipLayer)
    .header(function (d) {
      if (props.tSourceAxis === "y") {
        return yAcc(d) + " " + props.tTitleAdd;
      } else {
        return xAcc(d) + " " + props.tTitleAdd;
      }
    })
    .body(function (d) {
      var v = vAcc(d);
      var y = yAcc(d);
      if (props.tSourceAxis === "y") {
        return [
          [props.xAxisLabel, xAcc(d)],
          [props.valueLabel, isNaN(v) ? "–" : sszvis.formatNumber(v)],
        ];
      } else {
        return [
          [props.yAxisLabel, yAcc(d)],
          [props.valueLabel, isNaN(v) ? "–" : sszvis.formatNumber(v)],
        ];
      }
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

  chartLayer
    .selectGroup("legend")
    .attr(
      "transform",
      sszvis.translateString(
        tableDimensions.centeredOffset + (tableDimensions.width - legendWidth) / 2,
        bounds.innerHeight + 16
      )
    )
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

function parseKreisInt(k) {
  return parseInt(k.replace("Kreis ", ""), 10);
}

function sortInt(a, b) {
  return d3.ascending(parseInt(a, 10), parseInt(b, 10));
}

function sortKreisInt(a, b) {
  return d3.ascending(parseKreisInt(a), parseKreisInt(b));
}
