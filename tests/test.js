import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import * as fl from "https://cdn.jsdelivr.net/npm/flatten-js@0.6.9/dist/flatten.umd.min.js"
const {Point, Vector, Circle, Line, Ray, Segment, Arc, Box, Polygon, Matrix, PlanarSet} = Flatten;
    
class Point
{
    constructor(x, y, fixed=true, visible=true)
    {
        this.x = x;
        this.y = y;
        this.fixed = fixed;
        this.visible = visible;
    }
}

class Polyline
{
    constructor(pointset = [], boundary=true)
    {
        this.pointset = pointset;
        this.boundary = boundary;
    }
}

class PolylineGroup
{
    constructor(polylines = [])
    {
        this.polylines = polylines;
        this.boundary_lines = this.boundary_lines(polylines)
    }

    boundary_lines(lineset)
    {
        return lineset.filter((line => line.boundary == true))
    }

    is_closed_curve()
    {
        let boundary_points = this.boundary_lines.map(sublist => [0, -1]
            .map(i => [sublist.at(i).x, sublist.at(i).y]));

        const counts = {};
        boundary_points.forEach(function (x) { counts[x] = (counts[x] || 0) + 1; });

        if(Object.values(counts).every(element == 2)){return true;}

        return false;
    }

    has_intersections()
    {
        pairs_to_check = []
        
    }

}

// Set up SVG canvas dimensions
const width = 600, height = 300;
const svg = d3.select('body').append('svg')
    .attr('width', width)
    .attr('height', height);

// Define control points for three splines
let staticPoints1 = [
    {x: 50, y: 150, fixed: true},
    {x: 150, y: 100},
    {x: 250, y: 125},
    {x: 350, y: 100, fixed: true}
];

let dynamicPoints = [
    {x: 50, y: 150, fixed: true},
    {x: 150, y: 175},
    {x: 350, y: 100, fixed: true}
];

let staticPoints2 = [
    {x: 50, y: 150, fixed: true},
    {x: 150, y: 225},
    {x: 250, y: 175},
    {x: 350, y: 100, fixed: true}
];

let dynamicPoints = [
    {x: 0, y: 10, fixed: true, end:true},
    {x: 10, y: 20, fixed: true, end:true},
    {x: 20, y: 30, fixed: true}
];

let staticPoints2 = [
    {x: 0, y: 10, fixed: true},
    {x: 5, y: 25},
    {x: 10, y: 15},
    {x: 20, y: 30},
];



function findYForX(x, pathNode) {
    let pathLength = pathNode.getTotalLength();
    let start = 0, end = pathLength, target;
    let point;
    
    // Binary search for precision
    while (true) {
        target = (start + end) / 2;
        point = pathNode.getPointAtLength(target);
        if ((end - start) < 0.01) break; // Tolerance, can be adjusted

        if (point.x > x) end = target;
        else if (point.x < x) start = target;
        else break; // Found exact x
    }

    return point.y;
}


// Line generator for the splines
const lineGenerator = d3.line()
    .x(d => d.x)
    .y(d => d.y)
    .curve(d3.curveCatmullRom.alpha(0.5));

// Draw the static paths (splines)
[staticPoints1, staticPoints2].forEach(pointsSet => {
    svg.append('path')
        .datum(pointsSet)
        .attr('fill', 'none')
        .attr('stroke', 'blue')
        .attr('stroke-width', 2)
        .attr('d', lineGenerator);
});

const clipPathId = "clip-path-for-dynamic-spline";
svg.append("clipPath")
   .attr("id", clipPathId)
   .append("path")
   .attr("d", lineGenerator(staticPoints1) + "L" + 
            staticPoints2.slice().reverse().map(d => `${d.x},${d.y}`).join("L") + "Z");

// Draw the dynamic path (spline)
const dynamicPath = svg.append('path')
    .datum(dynamicPoints)
    .attr('fill', 'none')
    .attr('stroke', 'blue')
    .attr('stroke-dasharray', ('5, 5')) // Dashed line for the dynamic spline
    .attr('stroke-width', 2)
    .attr('d', lineGenerator)
    .attr('clip-path', `url(#${clipPathId})`);

// Function to update the dynamic spline
function updateSpline() {
    dynamicPath.attr('d', lineGenerator);
}

function nearestPointOnSpline(point, splinePoints) {
    let nearestPoint = null;
    let minDistance = Infinity;

    const path = svg.append("path")
        .datum(splinePoints)
        .attr("d", lineGenerator)
        .remove();
    const pathLength = path.node().getTotalLength();

    for (let i = 0; i <= pathLength; i++) {
        let p = path.node().getPointAtLength(i);
        let distance = Math.sqrt((p.x - point.x) ** 2 + (p.y - point.y) ** 2);
        if (distance < minDistance) {
            minDistance = distance;
            nearestPoint = p;
        }
    }
    return nearestPoint;
}

const snapThreshold = 10;

function isOutsideBounds(point, staticPoints1, staticPoints2) {
    // Define the bounds
    let minX = Math.min(...staticPoints1.map(p => p.x), ...staticPoints2.map(p => p.x));
    let maxX = Math.max(...staticPoints1.map(p => p.x), ...staticPoints2.map(p => p.x));
    let minY = Math.min(...staticPoints1.map(p => p.y), ...staticPoints2.map(p => p.y));
    let maxY = Math.max(...staticPoints1.map(p => p.y), ...staticPoints2.map(p => p.y));

    // Check if the point is outside these bounds
    return point.x < minX || point.x > maxX || point.y < minY || point.y > maxY;
}

// Drag behavior for control points
const drag = d3.drag()
    .on('drag', function(event, d) {
        if (!d.fixed) {
            let nearest1 = nearestPointOnSpline(event, staticPoints1);
            let nearest2 = nearestPointOnSpline(event, staticPoints2);

            let distanceToSpline1 = Math.hypot(nearest1.x - event.x, nearest1.y - event.y);
            let distanceToSpline2 = Math.hypot(nearest2.x - event.x, nearest2.y - event.y);

            if (distanceToSpline1 <= snapThreshold || distanceToSpline2 <= snapThreshold || 
                isOutsideBounds(event, staticPoints1, staticPoints2)) {
                // Snap to the nearest spline
                let nearest = distanceToSpline1 < distanceToSpline2 ? nearest1 : nearest2;
                d.x = nearest.x;
                d.y = nearest.y;
            } else {
                // Otherwise, allow normal dragging
                d.x = event.x;
                d.y = event.y;
            }

            d3.select(this).attr('cx', d.x).attr('cy', d.y);
            updateSpline();
        }
    });

// Draw the control points for the dynamic spline
svg.selectAll('circle')
    .data(dynamicPoints)
    .enter()
    .append('circle')
    .attr('r', 5)
    .attr('cx', d => d.x)
    .attr('cy', d => d.y)
    .attr('fill', 'red')
    .attr('class', 'draggable') // Assign a class for hover styling
    .call(drag); // Apply the drag behavior to only the dynamic points

// Change color on hover by adding CSS styles
// Note: This requires you to have a <style> tag or a linked CSS stylesheet in your HTML
d3.selectAll('.draggable')
    .on('mouseover', function() { d3.select(this).attr('fill', 'orange'); })
    .on('mouseout', function() { d3.select(this).attr('fill', 'red'); });

// Call update to draw the initial dynamic spline
updateSpline();