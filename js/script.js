var canvas = document.getElementById('myCanvas');

var voronoi =  new Voronoi();
var spotColor = new Color('red');
var inc = true
var points = generatePoints(view.size/200, true)

var margin = 20;
bbox = {
  xl: margin,
  xr: view.bounds.width - margin,
  yt: margin,
  yb: view.bounds.height - margin
};
renderDiagram();

function generatePoints(size){
  var points = []
  var col = view.size / size
  for(var i= -1; i<size.width + 1; i++){
    for(var j= -1;j<size.height + 1; j++){
      var point = new Point(i, j) / new Point(size) * view.size + col / 2;
      if(j % 2){point += new Point(col.width / 2, 0);}
      point += (col / 4) * Point.random() - col / 4;
      points.push(point);
      }
    }
  return points
}

function onMouseMove(event){
  mousePos = event.point;
  if (event.count == 0)
    points.push(event.point);
  points[points.length - 1] = event.point;
  renderDiagram();
}

function renderDiagram() {
  project.activeLayer.children = [];
  var diagram = voronoi.compute(points, bbox  );
  if (diagram) {
    for (var i = 0, l = points.length; i < l; i++) {
      var cell = diagram.cells[points[i].voronoiId];
      if (cell) {
        var halfedges = cell.halfedges,
          length = halfedges.length;
        if (length > 2) {
          var pts = [];
          for (var j = 0; j < length; j++) {
            v = halfedges[j].getEndpoint();
            pts.push(new Point(v));
          }
          createPath(pts, points[i]);
        }
      }
    }
  }
}


function createPath(pts, center) {
  var path = new Path();
  path.fillColor = spotColor;
  if(spotColor.blue >= 0.7){inc = false}
  if(spotColor.blue <= 0.1){inc = true}
  if(inc == true){
    spotColor = spotColor + new Color(0,0,0.0001)
    }
  else {
    spotColor = spotColor - new Color(0,0,0.0001)
  }
  path.closed = true;

  for (var i = 0, l = pts.length; i < l; i++) {
    var point = pts[i];
    var next = pts[(i + 1) == pts.length ? 0 : i + 1];
    var vector = (next - point) / 2;
    path.add({
      point: point + vector,
      handleIn: -vector,
      handleOut: vector
    });
  }
  path.scale(0.95);
  removeSmallBits(path);
  return path;
}

function removeSmallBits(path) {
  var averageLength = path.length / path.segments.length;
  var min = path.length / 50;
  for(var i = path.segments.length - 1; i >= 0; i--) {
    var segment = path.segments[i];
    var cur = segment.point;
    var nextSegment = segment.next;
    var next = nextSegment.point + nextSegment.handleIn;
    if (cur.getDistance(next) < min) {
      segment.remove();
    }
  }
}

