/* global d3, sszvis, config */

// Configuration
// -----------------------------------------------

var PIE_DIAMETER = 260;
var LEGEND_TOP_PADDING = 40;
var LEGEND_LEFT_PADDING = 25;
var LEGEND_HEIGHT = 145;
var LEGEND_WIDTH = 102;
var queryProps = sszvis.responsiveProps().prop("layout", {
  palm: function (width) {
    var sidePadding = Math.max((width - PIE_DIAMETER) / 2, 10);
    var diameter = width - 2 * sidePadding;
    var legendHeight = LEGEND_TOP_PADDING + LEGEND_HEIGHT + 20;
    return {
      bounds: {
        top: 20,
        bottom: legendHeight,
        left: sidePadding,
        right: sidePadding,
        height: 20 + diameter + legendHeight,
      },
      pieRadius: diameter / 2,
      piePosition: {
        top: 0,
        left: sidePadding,
      },
      legendPosition: {
        top: diameter + LEGEND_TOP_PADDING,
        left: 0,
      },
    };
  },
  _: function (width) {
    return {
      bounds: {
        top: 20,
        bottom: 20,
        left: 20,
        right: LEGEND_WIDTH,
        height: 20 + 20 + PIE_DIAMETER,
      },
      pieRadius: PIE_DIAMETER / 2,
      piePosition: {
        top: 0,
        left: width / 2 - (PIE_DIAMETER + LEGEND_LEFT_PADDING + LEGEND_WIDTH) / 2,
      },
      legendPosition: {
        top: PIE_DIAMETER / 2 - LEGEND_HEIGHT / 2,
        left: PIE_DIAMETER + LEGEND_LEFT_PADDING,
      },
    };
  },
});

function parseRow(d) {
  return {
    // Data column to use for the categories
    category: d["Kategorie"],
    // Data column to use for the values
    value: sszvis.parseNumber(d["Schweiz Import"]),
  };
}

var vAcc = sszvis.prop("value");
var cAcc = sszvis.prop("category");

// Application state
// -----------------------------------------------
var state = {
  data: [],
  totalValue: 0,
  categories: [],
  selection: [],
};

// State transitions
// -----------------------------------------------
var actions = {
  prepareState: function (data) {
    state.data = data;
    state.totalValue = d3.sum(state.data, vAcc);
    state.categories = sszvis.set(state.data, cAcc);
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
d3.csv("data/P_7Categories.csv", parseRow).then(actions.prepareState).catch(sszvis.loadError);

// Render
// -----------------------------------------------
function render(state) {
  var props = queryProps(sszvis.measureDimensions(config.id));
  var bounds = sszvis.bounds(props.layout.bounds, config.id);

  // Scales

  var aScale = d3
    .scaleLinear()
    .domain([0, state.totalValue])
    .range([0, 2 * Math.PI]);

  var cScale = sszvis.scaleQual12().domain(state.categories);

  // Layers

  var chartLayer = sszvis.createSvgLayer(config.id, bounds).datum(state.data);

  var tooltipLayer = sszvis.createHtmlLayer(config.id, bounds).datum(state.selection);

  // Components

  var pieMaker = sszvis
    .pie()
    .radius(props.layout.pieRadius)
    .angle(sszvis.compose(aScale, vAcc))
    .fill(sszvis.compose(cScale, cAcc));

  var colorLegend = sszvis
    .legendColorOrdinal()
    .scale(cScale)
    .rows(state.categories.length)
    .orientation("vertical");

  var headerText = sszvis.modularTextHTML().bold(
    sszvis.compose(sszvis.formatFractionPercent, function (d) {
      return vAcc(d) / state.totalValue;
    })
  );

  var tooltip = sszvis.tooltip().renderInto(tooltipLayer).header(headerText).visible(isSelected);

  // Rendering

  chartLayer.attr(
    "transform",
    sszvis.translateString(props.layout.piePosition.left, props.layout.piePosition.top)
  );

  var pie = chartLayer.selectGroup("piechart").call(pieMaker);

  pie.selectAll("[data-tooltip-anchor]").call(tooltip);

  chartLayer
    .selectGroup("colorLegend")
    // the magic number y-offset here vertically centers the color legend.
    .attr("transform", function () {
      return sszvis.translateString(
        props.layout.legendPosition.left,
        props.layout.legendPosition.top
      );
    })
    .call(colorLegend);

  // Interaction

  var interactionLayer = sszvis
    .panning()
    .elementSelector(".sszvis-path")
    .on("start", actions.showTooltip)
    .on("pan", actions.showTooltip)
    .on("end", actions.hideTooltip);

  pie.call(interactionLayer);

  sszvis.viewport.on("resize", actions.resize);
}

// Helper functions
// -----------------------------------------------
function isSelected(d) {
  return sszvis.contains(state.selection, d);
}
