/* global d3, sszvis, config */

// Configuration
// -----------------------------------------------

var MAX_WIDTH = 800;
var queryProps = sszvis
  .responsiveProps()
  .prop("barPadding", {
    palm: 0.4,
    _: 0.2,
  })
  .prop("bottomPadding", {
    palm: 140,
    _: 60,
  })
  .prop("leftPadding", {
    _: null,
  })
  .prop("slant", {
    palm: "vertical",
    _: "horizontal",
  })
  .prop("yLabelFormat", {
    _: function () {
      return sszvis.formatNumber;
    },
  });

function parseRow(d) {
  return {
    category: d["Sektor"],
    yValue: sszvis.parseNumber(d["Anzahl"]),
  };
}
var xAcc = sszvis.prop("category");
var yAcc = sszvis.prop("yValue");

// Application state
// -----------------------------------------------
var state = {
  data: [],
  categories: [],
  selection: [],
};

// State transitions
// -----------------------------------------------
var actions = {
  prepareState: function (data) {
    state.data = data;
    state.categories = state.data.map(xAcc);
    render(state);
  },

  showTooltip: function (category) {
    state.selection = state.data.filter(function (d) {
      return xAcc(d) === category;
    });
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
  var yMax = d3.max(state.data, yAcc);

  var props = queryProps(sszvis.measureDimensions(config.id));
  var bounds = sszvis.bounds(
    {
      top: 3,
      bottom: props.bottomPadding,
      left:
        props.leftPadding != null
          ? props.leftPadding
          : sszvis.measureAxisLabel(props.yLabelFormat(yMax)),
    },
    config.id
  );
  var chartDimensions = sszvis.dimensionsVerticalBarChart(
    Math.min(MAX_WIDTH, bounds.innerWidth),
    state.categories.length
  );

  // Scales

  var xScale = d3
    .scaleBand()
    .domain(state.categories)
    .padding(chartDimensions.padRatio)
    .paddingOuter(props.barPadding)
    .range([0, chartDimensions.totalWidth]);

  var heightScale = d3.scaleLinear().domain([0, yMax]).range([0, bounds.innerHeight]);

  var yPosScale = heightScale.copy().range(heightScale.range().slice().reverse());

  var cScale = sszvis.scaleQual12();
  var cScaleDark = cScale.darker();

  // Layers

  var chartLayer = sszvis.createSvgLayer(config.id, bounds).datum(state.data);

  var tooltipLayer = sszvis.createHtmlLayer(config.id, bounds).datum(state.selection);

  // Components

  var barGen = sszvis
    .bar()
    .x(sszvis.compose(xScale, xAcc))
    .y(sszvis.compose(nanFallback(yPosScale.range()[0]), yPosScale, yAcc))
    // Because we use sszvis.move in this example, we need to make
    // sure that bars have the exact same size as the scale's rangeBand. This
    // will result in slightly narrower bars than the default.
    .width(xScale.bandwidth())
    .height(sszvis.compose(heightScale, yAcc))
    .centerTooltip(true)
    .fill(function (d) {
      return isSelected(d) ? cScaleDark(d) : cScale(d);
    });

  var xAxis = sszvis.axisX.ordinal().scale(xScale).orient("bottom").slant(props.slant);

  if (props.slant === "horizontal") {
    xAxis.textWrap(xScale.step());
  }

  var yAxis = sszvis.axisY().scale(yPosScale).orient("right");

  var tooltipHeader = sszvis
    .modularTextHTML()
    .bold(function (d) {
      var yValue = yAcc(d);
      return isNaN(yValue) ? "keine" : sszvis.formatNumber(yValue);
    })
    .plain("Beschäftigte");

  var tooltip = sszvis
    .tooltip()
    .renderInto(tooltipLayer)
    .orientation(sszvis.fitTooltip("bottom", bounds))
    .header(tooltipHeader)
    .visible(isSelected);

  // Rendering

  chartLayer.attr(
    "transform",
    sszvis.translateString(
      bounds.innerWidth / 2 - chartDimensions.totalWidth / 2,
      bounds.padding.top
    )
  );

  var bars = chartLayer
    .selectGroup("bars")
    .attr("transform", sszvis.translateString(bounds.padding.left, 0))
    .call(barGen);

  bars.selectAll("[data-tooltip-anchor]").call(tooltip);

  bars
    .selectGroup("xAxis")
    .attr("transform", sszvis.translateString(0, bounds.innerHeight))
    .call(xAxis);

  chartLayer.selectGroup("yAxis").call(yAxis);

  // Interaction

  // Use the move behavior to provide tooltips in the absence of a bar, i.e.
  // when we have missing data.
  var interactionLayer = sszvis
    .move()
    .xScale(xScale)
    .yScale(yPosScale)
    .on("move", actions.showTooltip)
    .on("end", actions.hideTooltip);

  bars.selectGroup("interaction").call(interactionLayer);

  sszvis.viewport.on("resize", actions.resize);
}

// Helper functions
// -----------------------------------------------
function isSelected(d) {
  return sszvis.contains(state.selection, d);
}

function labelWrapWidth(range) {
  return (d3.max(range) - d3.min(range)) / range.length;
}

function nanFallback(fallbackyValue) {
  return function (d) {
    return isNaN(d) ? fallbackyValue : d;
  };
}
