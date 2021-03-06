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
  // Formatting function to use for the legend label. In this example, it defaults
  // to "sszvis.formatPercent" to render values from 0–100 as 0–100%, for other
  // values "sszvis.formatNumber" is maybe more appropriate
  .prop("labelFormat", {
    _: function () {
      return sszvis.formatFractionPercent;
    },
  })
  .prop("tooltipUnit", {
    _: "Ausländeranteil",
  });

function parseRow(d) {
  return {
    quarternum: sszvis.parseNumber(d["Qcode"]),
    quartername: d["Qname"],
    value: sszvis.parseNumber(d["Ausländeranteil"]),
  };
}
var vAcc = sszvis.prop("value");
var qnameAcc = sszvis.prop("quartername");
var mDatumAcc = sszvis.prop("datum");

// Application state
// -----------------------------------------------
var state = {
  data: null,
  mapData: null,
  valueDomain: [0, 0],
  selection: [],
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
      features: topojson.feature(topo, topo.objects.statistische_quartiere),
      borders: topojson.mesh(topo, topo.objects.statistische_quartiere),
      lakeFeatures: topojson.feature(topo, topo.objects.lakezurich),
      lakeBorders: topojson.mesh(topo, topo.objects.statistische_quartiere_lakebounds),
    };
    render(state);
  },

  selectHovered: function (d) {
    state.selection = [d.datum];
    render(state);
  },

  deselectHovered: function () {
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

  var htmlLayer = sszvis.createHtmlLayer(config.id, bounds);

  var tooltipLayer = sszvis.createHtmlLayer(config.id, bounds).datum(state.selection);

  // Components

  var choroplethMap = sszvis
    .choropleth()
    .features(state.mapData.features)
    .borders(state.mapData.borders)
    .lakeFeatures(state.mapData.lakeFeatures)
    .lakeBorders(state.mapData.lakeBorders)
    .keyName("quarternum")
    .highlight(state.selection)
    .highlightStroke(function (d) {
      // checks for undefined values and makes those white
      var v = vAcc(d);
      return isNaN(v) ? "white" : sszvis.muchDarker(colorScale(vAcc(d)));
    })
    .width(bounds.innerWidth)
    .height(bounds.innerHeight)
    .defined(function (d) {
      // some of the values are empty in the .csv file. When parsed as a number,
      // undefined or empty string values become NaN
      return !isNaN(vAcc(d));
    })
    .fill(sszvis.compose(colorScale, vAcc));

  // see the comment by the tooltip in docs/map-standard/kreis.html for more information
  // about accesing data properties of map entities.
  var tooltipHeader = sszvis.modularTextHTML().bold(sszvis.compose(qnameAcc, mDatumAcc));

  var tooltipBody = sszvis
    .modularTextHTML()
    .plain(
      sszvis.compose(
        function (v) {
          return isNaN(v) ? "keine Daten" : sszvis.formatFractionPercent(v);
        },
        vAcc,
        mDatumAcc
      )
    )
    .plain(
      sszvis.compose(
        function (v) {
          return isNaN(v) ? null : props.tooltipUnit;
        },
        vAcc,
        mDatumAcc
      )
    );

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
