/* global d3, topojson, sszvis, config */

// Configuration
// -----------------------------------------------
var queryProps = sszvis
  .responsiveProps()
  .prop("bounds", {
    _: function (width) {
      var innerHeight = sszvis.aspectRatioSquare(width);
      return {
        top: 30,
        bottom: 90,
        height: 30 + innerHeight + 90,
      };
    },
  })
  .prop("legendWidth", {
    _: function (width) {
      return Math.min(width / 2, 320);
    },
  })
  .prop("labelFormat", {
    _: function () {
      return sszvis.formatNumber;
    },
  })
  .prop("tooltipUnit", {
    _: "Einwohner",
  });

function parseRow(d) {
  return {
    geoId: sszvis.parseNumber(d["KNr"]),
    name: d["Kname"],
    value: sszvis.parseNumber(d["Bevölkerung"]),
  };
}
var vAcc = sszvis.prop("value");
var nameAcc = sszvis.prop("name");
var mDatumAcc = sszvis.prop("datum");

// Application state
// -----------------------------------------------
var state = {
  data: null,
  mapData: null,
  selection: [],
  valueDomain: [0, 0],
};

// State transitions
// -----------------------------------------------
var actions = {
  prepareState: function (data) {
    state.data = data;
    state.valueDomain = [0, d3.max(state.data, vAcc)];

    render(state);
  },

  prepareMapData: function (topo) {
    state.mapData = {
      features: topojson.feature(topo, topo.objects.stadtkreise),
      borders: topojson.mesh(topo, topo.objects.stadtkreise),
      lakeFeatures: topojson.mesh(topo, topo.objects.lakezurich),
      lakeBorders: topojson.mesh(topo, topo.objects.stadtkreis_lakebounds),
    };
    render(state);
  },

  // manage which datum is selected. These data are highlighted by the map.
  selectHovered: function (d) {
    if (state.selection[0] === d.datum) {
      return;
    }
    state.selection = [d.datum];
    render(state);
  },

  deselectHovered: function () {
    if (state.selection.length === 0) {
      return;
    }
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

d3.json("../topo/stadt-zurich.json").then(actions.prepareMapData).catch(sszvis.loadError);

// Render
// -----------------------------------------------
function render(state) {
  if (state.data === null || state.mapData === null) {
    // loading ...
    return true;
  }

  var props = queryProps(sszvis.measureDimensions(config.id));
  var bounds = sszvis.bounds(props.bounds, config.id);

  // Scales

  var colorScale = sszvis.scaleSeqBlu().domain(state.valueDomain);

  // Layers

  var chartLayer = sszvis.createSvgLayer(config.id, bounds).datum(state.data);

  var tooltipLayer = sszvis.createHtmlLayer(config.id, bounds).datum(state.selection);

  // Components

  var choroplethMap = sszvis
    .choropleth()
    .features(state.mapData.features)
    .borders(state.mapData.borders)
    .lakeFeatures(state.mapData.lakeFeatures)
    .lakeBorders(state.mapData.lakeBorders)
    .highlight(state.selection)
    // gets the fill color and darken it
    .highlightStroke(sszvis.compose(sszvis.muchDarker, colorScale, vAcc))
    .width(bounds.innerWidth)
    .height(bounds.innerHeight)
    .fill(sszvis.compose(colorScale, vAcc));

  var tooltipHeader = sszvis.modularTextHTML().bold(sszvis.compose(nameAcc, mDatumAcc));

  var tooltipBody = sszvis
    .modularTextHTML()
    .plain(sszvis.compose(sszvis.formatNumber, vAcc, mDatumAcc))
    .plain(props.tooltipUnit);

  // When using the map component, the data element bound to the tooltip anchor is the internal representation
  // which includes both the geoJson and the datum as properties. This is necessary so that the correct position
  // can be calculated from the geoJson. But that also means that when accessing the datum for other purposes,
  // such as creating tooltip text, the user must be aware that the 'd' argument is not just the data value.
  // The data value, if present, is available as d.datum.
  var tooltip = sszvis
    .tooltip()
    .renderInto(tooltipLayer)
    .header(tooltipHeader)
    .body(tooltipBody)
    .orientation(sszvis.fitTooltip("bottom", bounds))
    .visible(isSelected);

  var legend = sszvis
    .legendColorLinear()
    .scale(colorScale)
    .width(props.legendWidth)
    .labelFormat(props.labelFormat);

  // Rendering

  chartLayer
    .attr("transform", sszvis.translateString(bounds.padding.left, bounds.padding.top))
    .call(choroplethMap);

  chartLayer.selectAll("[data-tooltip-anchor]").call(tooltip);

  chartLayer
    .selectGroup("legend")
    .attr(
      "transform",
      sszvis.translateString(bounds.width / 2 - props.legendWidth / 2, bounds.innerHeight + 60)
    )
    .call(legend);

  // Interaction

  var interactionLayer = sszvis
    .panning()
    .elementSelector(".sszvis-map__area")
    .on("start", actions.selectHovered)
    .on("pan", actions.selectHovered)
    .on("end", actions.deselectHovered);

  chartLayer.call(interactionLayer);

  sszvis.viewport.on("resize", actions.resize);
}

function isSelected(d) {
  return state.selection.indexOf(d.datum) >= 0;
}
