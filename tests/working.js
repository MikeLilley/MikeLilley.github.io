function getPointsFromPath(splinePath, numPoints = 100) {
    const pathLength = splinePath.node().getTotalLength();
    let points = [];
    for (let i = 0; i < numPoints; i++) {
        const point = splinePath.node().getPointAtLength((pathLength * i) / numPoints);
        points.push({ x: point.x, y: point.y });
    }
    return points;
}
    
// Set up SVG canvas dimensions
const width = 600, height = 300;
const svg = d3.select('main').append('svg')
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



// Line generator for the splines
const lineGenerator = d3.line()
    .x(d => d.x)
    .y(d => d.y)
    .curve(d3.curveCatmullRom.alpha(0.5));

// Draw the static paths (splines)
const staticPath1 = svg.append('path')
    .datum(staticPoints1)
    .attr('fill', 'none')
    .attr('stroke', 'blue')
    .attr('stroke-width', 2)
    .attr('d', lineGenerator);

const staticPath2 = svg.append('path')
    .datum(staticPoints2)
    .attr('fill', 'none')
    .attr('stroke', 'blue')
    .attr('stroke-width', 2)
    .attr('d', lineGenerator);

const points1 = getPointsFromPath(staticPath1);
const points2 = getPointsFromPath(staticPath2);

const unique = new Set(points1.map(p => `${p.x},${p.y}`));
const union = [...points1, ...points2.filter(p => !unique.has(`${p.x},${p.y}`))];
var convex_hull = d3.polygonHull(union.map(p => [p.x, p.y]));


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

const quadtree = d3.quadtree()
    .x(d => d.x)
    .y(d => d.y)
    .addAll(union);

// Drag behavior for control points
const drag = d3.drag()
    .on('drag', function(event, d) {
        if (!d.fixed) {
            let point = { x: event.x, y: event.y };
            if(!d3.polygonContains(convex_hull, [point.x, point.y]))
            {
                point = quadtree.find(event.x, event.y, Infinity)
            } 

            d.x = point.x;
            d.y = point.y;

            d3.select(this).attr('cx', d.x).attr('cy', d.y);
            dynamicPath.attr('d', lineGenerator);
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
dynamicPath.attr('d', lineGenerator);