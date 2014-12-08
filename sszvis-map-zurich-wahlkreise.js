/**
 * Modular map component for a map of the Zurich Wahlkreise.
 *
 * The rawTopo reference has raw map data. The compiledTopoJson object contains
 * the geoJson objects compiled from the TopoJSON format. If it's necessary, the getter functions
 * compile the raw topoJson map data into geoJson. This way, the data can be transmitted
 * as much more compact topoJson, and expanded in-memory into the geoJson necessary for rendering
 * map entities. Note that this compilation step requires the topojson client-side library as a
 * dependency (https://github.com/mbostock/topojson/blob/master/topojson.js)
 *
 * To use this component, pass data in the usual manner. Each data object is expected to have a value which
 * will be used to match that object with a particular map entity. The possible id values depend on the map type.
 * They are covered in more detail in the file sszvis/map/map-ids.txt. Which data key is used to fetch this value is configurable.
 * The default key which map.js expects is 'geoId', but by changing the keyName property of the map, you can pass data which
 * use any key. The map component assumes that datum[keyName] is a valid map ID which is matched with the available map entities.
 *
 * @property {Number} width                           The width of the map. Used to create the map projection function
 * @property {Number} height                          The height of the map. Used to create the map projection function
 * @property {String} keyName                         The data object key which will return a map entity id. Default 'geoId'.
 * @property {Array} highlight                        An array of data elements to highlight. The corresponding map entities are highlighted.
 * @property {String, Function} highlightStroke       A function for the stroke of the highlighted entities
 * @property {Boolean, Function} defined              A predicate function used to determine whether a datum has a defined value.
 *                                                    Map entities with data values that fail this predicate test will display the missing value texture.
 * @property {String, Function} fill                  A string or function for the fill of the map entities
 * @property {String} borderColor                     A string for the border color of the map entities
 * @function on(String, function)                     This component has an event handler interface for binding events to the map entities.
 *                                                    The available events are 'over', 'out', and 'click'. These are triggered on map
 *                                                    elements when the user mouses over or taps, mouses out, or taps or clicks, respectively.
 *
 * @return {d3.component}
 */
namespace('sszvis.map.zurichWahlKreise', function(module) {
  'use strict';

  var rawTopo = {"type":"Topology","objects":{"wahlkreis":{"name":"Wahlkreis","type":"GeometryCollection","geometries":[{"type":"Polygon","properties":{"Bezeichnung":"7 + 8"},"id":"7 + 8","arcs":[[0,1,2,3,4]]},{"type":"Polygon","properties":{"Bezeichnung":"9"},"id":"9","arcs":[[5,6,7,8]]},{"type":"Polygon","properties":{"Bezeichnung":"6"},"id":"6","arcs":[[9,10,11,12,13,-3]]},{"type":"Polygon","properties":{"Bezeichnung":"4 + 5"},"id":"4 + 5","arcs":[[14,-11,15,16,-7]]},{"type":"Polygon","properties":{"Bezeichnung":"3"},"id":"3","arcs":[[-8,-17,17,18]]},{"type":"Polygon","properties":{"Bezeichnung":"1 + 2"},"id":"1 + 2","arcs":[[-18,-16,-10,-2,-1,19]]},{"type":"Polygon","properties":{"Bezeichnung":"12"},"id":"12","arcs":[[-4,-14,20,21]]},{"type":"Polygon","properties":{"Bezeichnung":"11"},"id":"11","arcs":[[-21,-13,22,23]]},{"type":"Polygon","properties":{"Bezeichnung":"10"},"id":"10","arcs":[[-15,-6,24,-23,-12]]}]},"lakezurich":{"type":"GeometryCollection","geometries":[{"type":"Polygon","arcs":[[25]]}]},"wahlkreis_lakebounds":{"type":"GeometryCollection","geometries":[{"type":"MultiLineString","arcs":[[26],[0,27],[28]]}]}},"arcs":[[[5965,1803],[-666,1032],[4,921]],[[5303,3756],[295,119],[175,227],[22,113],[-108,133],[99,168],[-115,453]],[[5671,4969],[93,40],[157,186],[-142,172],[285,298],[55,145],[108,27],[136,157],[115,-117],[63,108],[275,260]],[[6816,6245],[348,-129],[175,60],[20,69],[257,-297]],[[7616,5948],[68,3],[51,179],[94,-20],[39,-104],[-36,-91],[303,-157],[65,-80],[-44,-92],[-108,52],[-71,-89],[147,-56],[-38,-58],[322,-345],[22,-165],[-31,-61],[60,-125],[159,-118],[64,-129],[67,-30],[155,-223],[122,-101],[216,-65],[93,102],[103,-27],[54,61],[67,-138],[-45,-128],[-106,-69],[39,-161],[-53,-106],[298,-46],[144,-101],[-72,-196],[124,-169],[111,-87],[-193,-115],[-204,80],[-328,10],[-122,-87],[-303,19],[-112,-123],[-4,-125],[-66,-4],[-201,82],[-146,23],[-98,-27],[-161,139],[-27,-38],[-242,11],[-130,-177],[-86,-20],[-223,-165],[-90,-13],[-372,-163],[-35,77],[-130,-77],[-129,-24],[-632,-488]],[[1698,7308],[144,-34],[121,-91],[203,-280],[116,-47],[388,34],[208,-65],[236,-243],[121,-54]],[[3235,6528],[-42,-97],[-136,-17],[36,-85],[-52,-51],[-203,-3],[132,-58],[-100,-87],[-75,-179],[421,-206],[-119,-132],[161,-115],[-149,-188]],[[3109,5310],[-261,-317],[193,-248],[39,-81],[-138,-231],[-226,-173],[-111,-118],[54,-7],[-74,-222],[13,-79],[-362,-172],[-242,-360]],[[1994,3302],[-96,151],[-164,91],[-102,-44],[-237,44],[-125,75],[-62,232],[-172,125],[-121,135],[-4,97],[59,72],[233,188],[60,108],[-12,118],[-146,-33],[-432,344],[-266,51],[-229,7],[-178,182],[210,31],[96,-30],[183,58],[2,131],[100,2],[-53,109],[101,128],[86,163],[9,87],[156,219],[75,68],[119,-60],[9,189],[-130,151],[14,35],[180,-28],[92,-51],[160,91],[27,81],[-470,202],[29,81],[108,-43],[26,72],[-108,43],[88,257],[113,-3],[269,63],[207,17]],[[5671,4969],[-111,-4],[-94,192],[-91,-33],[-24,92],[-73,-25],[-159,291]],[[5119,5482],[-337,300]],[[4782,5782],[93,41],[96,138],[-1,260],[-141,196],[-82,181],[22,150],[-50,155],[11,135],[-69,144],[-6,102],[-211,304]],[[4444,7588],[-49,119],[120,111],[427,-237],[136,-50],[163,-185],[-48,-31],[260,-259],[-37,-89],[135,34],[81,-105],[259,240],[112,-125],[61,71]],[[6064,7082],[-118,-175],[60,-72],[271,14],[206,-250],[135,-101],[198,-253]],[[3235,6528],[375,-30],[110,-31],[167,-101],[407,-152],[232,-172],[256,-260]],[[5119,5482],[2,-257],[-78,-199],[-158,-186],[-102,-156],[-139,-326],[-127,-109]],[[4517,4249],[-124,68],[-120,159],[-230,245],[-27,55],[-158,48],[-688,472],[-61,14]],[[4517,4249],[-161,-165],[-100,-139],[-41,-263],[82,-434],[30,-312],[-114,-141],[-273,-118],[-68,-61],[-21,-177],[112,-323],[-95,-82],[-422,36],[-264,-227],[-126,-297],[-14,-136]],[[3042,1410],[-21,79],[-164,219],[-36,168],[-60,75],[66,155],[-102,189],[-199,156],[-109,209],[-51,-10],[-106,127],[-74,17],[27,78],[-128,139],[-21,176],[-70,115]],[[5965,1803],[-664,-511],[-190,-263],[-141,-159],[-245,-57],[-48,-144],[-74,-89],[-116,-61],[-191,-7],[-30,-168],[-272,-20],[-68,-65],[-171,-43],[-95,17],[-76,-59],[-211,-16],[-175,-73],[-90,-85],[-94,93],[-51,130],[22,277],[50,148],[-66,188],[21,244],[64,91],[-33,73],[21,166]],[[6064,7082],[96,134],[-7,78],[-76,-13],[71,128],[79,30],[16,105],[-20,537],[22,149],[246,111]],[[6491,8341],[246,81],[105,230],[158,-28],[81,96],[-13,-245],[23,-349],[-70,-100],[36,-63],[834,-297],[50,-35],[431,-93],[-157,-375],[136,-58],[-79,-206],[137,-60],[-57,-179],[-95,58],[-66,-85],[-106,75],[-180,-106],[86,-100],[-131,-146],[-170,-84],[-80,-260],[6,-64]],[[4444,7588],[-91,-21],[-148,203],[-291,156],[-239,16],[-129,54],[-228,4],[-213,165],[-79,-80],[-46,219],[-57,64],[-196,118],[-129,153],[12,46],[-165,51],[0,40],[-197,85],[3,31]],[[2251,8892],[31,61],[91,-35],[50,139],[-54,40],[6,125],[-277,129],[-44,222],[75,108],[554,155],[261,140],[101,22],[446,-222],[81,-77],[113,-27],[144,70],[48,-34],[106,48],[334,-55],[49,166],[271,-95],[24,51],[375,-109],[153,-27],[13,66],[186,-37],[-44,127],[293,-118],[412,-77],[84,-385],[55,-61],[-33,-126],[-171,-289],[373,-230],[26,10],[108,-226]],[[1698,7308],[2,105],[-63,98],[12,257],[-103,50],[101,195],[-141,42],[-66,-31],[-50,-129],[-95,31],[-35,135],[-91,-21],[-42,95],[117,196],[-53,80],[26,89],[112,10],[316,185],[36,206],[196,-67],[22,145],[67,-67],[179,-59],[106,39]],[[5349,1333],[-139,151],[-103,291],[-103,162],[15,172],[-121,378],[72,28],[-33,74],[13,463],[49,188],[-45,114],[2,237],[79,152],[-1,91],[138,141],[237,106],[185,-450],[-5,-337],[30,-2],[160,-304],[-2,-139],[256,-28],[211,-76],[101,-136],[95,-270],[162,-151],[85,-226],[27,-265],[54,-128],[-1071,-1081],[-98,372],[-88,106],[-18,106],[-87,83],[-57,178]],[[5965,1803],[-613,-473]],[[5303,3756],[200,84]],[[6553,2257],[-588,-454]]],"transform":{"scale":[0.000017745235432434138,0.000011445807155725375],"translate":[8.44801822331817,47.3202184380549]}};

  var compiledTopoJson = {
    // feature data - a collection of distinct entities
    featureData: function() { return this._featureData || (this._featureData = topojson.feature(rawTopo, rawTopo.objects.wahlkreis)); },
    // mesh data - a single line that represents all Swiss borders
    meshData: function() { return this._meshData || (this._meshData = topojson.mesh(rawTopo, rawTopo.objects.wahlkreis)); },
    // the lake zurich feature - shared by all three zurich map types
    lakeFeature: function() { return this._lakeFeature || (this._lakeFeature = topojson.feature(rawTopo, rawTopo.objects.lakezurich)); },
    // seebounds: the section of the map bounds which lies over the Zürichsee
    lakeBounds: function() { return this._lakeBounds || (this._lakeBounds = topojson.mesh(rawTopo, rawTopo.objects.wahlkreis_lakebounds)); }
  };

  module.exports = function() {
    var event = d3.dispatch('over', 'out', 'click');

    var base = sszvis.map.renderer.base()
      .geoJson(compiledTopoJson.featureData());

    var mesh = sszvis.map.renderer.mesh()
      .geoJson(compiledTopoJson.meshData());

    var lake = sszvis.map.renderer.patternedlakeoverlay()
      .lakeFeature(compiledTopoJson.lakeFeature())
      .lakeBounds(compiledTopoJson.lakeBounds());

    var highlight = sszvis.map.renderer.highlight()
      .geoJson(compiledTopoJson.featureData());

    var component = d3.component()
      .prop('width')
      .prop('height')
      .prop('keyName').keyName('geoId')
      .delegate('defined', base)
      .delegate('fill', base)
      .delegate('borderColor', mesh)
      .delegate('highlight', highlight)
      .delegate('highlightStroke', highlight)
      .render(function() {
        var selection = d3.select(this);
        var props = selection.props();


        // Components

        // create a map path generator function
        var mapPath = sszvis.map.utils.swissMapPath(props.width, props.height, compiledTopoJson.featureData());

        // Base shape
        base
          .keyName(props.keyName)
          .mapPath(mapPath);

        // Border mesh
        mesh.mapPath(mapPath);

        // Lake Zurich shape
        lake.mapPath(mapPath);

        // Highlight mesh
        highlight
          .keyName(props.keyName)
          .mapPath(mapPath);


        // Rendering

        selection.call(base)
                 .call(mesh)
                 .call(lake)
                 .call(highlight);


        // Event Binding

        selection.selectAll('[data-event-target]')
          .on('mouseover', function(d) {
            event.over(d.datum);
          })
          .on('mouseout', function(d) {
            event.out(d.datum);
          })
          .on('click', function(d) {
            event.click(d.datum);
          });
      });

    d3.rebind(component, event, 'on');

    return component;
  };

});
