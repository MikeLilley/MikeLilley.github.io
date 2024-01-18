---
author: "Michael Lilley"
title: "TEST PAGE"
date: "2024-01-07"
---

---

<svg id="homotopy"></svg>

<script type="module">
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

class Spline
{
    constructor(control_points = [], boundary = false)
    {
        this.control_points = control_points;
        this.boundary = boundary;
        this.pathObj = this.generate_curve();
        this.length = this.generate_svg().getTotalLength();
        this.sampled_points = this.sample_points_from_path();
    }

    generate_curve(alpha=0.5)
    {
        const temp = d3.path();
        var lineGenerator = d3.line().x(d => d.x).y(d => d.y).curve(d3.curveCatmullRom.alpha(alpha));
        lineGenerator.context(temp)(this.control_points);
        return temp;
    }

    generate_svg()
    {
        const svgPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        svgPath.setAttribute('d', this.pathObj.toString());
        return svgPath;
    }
    sample_points_from_path(samples=300)
    {
        var svgPath = this.generate_svg();
        var sampledPoints = [...Array(samples)].map((_, i) => {
        const point = svgPath.getPointAtLength((this.length * i) / samples);
        return { x: point.x, y: point.y };});
        sampledPoints.push(this.control_points[this.control_points.length - 1]);
        return sampledPoints;
    }
}

class SplineGroup
{
    constructor(splines = [])
    {
        splines.forEach((spline, index) => {
            spline.spline_id = index;  // Assigning spline_id to each spline

            // Now, iterate through each control point in the spline
            spline.control_points.forEach(controlPoint => {
                // Add the spline_id to each control point
                controlPoint.spline_id = spline.spline_id;
            });
        });

        this.splines = splines.reduce((acc, spline) => {
            const key = spline.boundary ? 'boundary' : 'interior';
            acc[key] = acc[key] || [];
            acc[key].push(spline);
            return acc;}, {});


        
        console.log(this.splines);

        this.endpoints = this.get_endpoints(splines);
        console.log(this.endpoints);
        this.boundary_points = this.merge_points(this.splines['boundary']);
        this.convex_hull = d3.polygonHull(this.boundary_points.map(p => [p.x, p.y]));
        console.log(this.convex_hull);
        this.quadtree = d3.quadtree().x(d => d.x).y(d => d.y).addAll(this.boundary_points);
    }

    merge_points(splines)
    {
        const uniquePointStrings = new Set(
        splines.flatMap(spline => spline.sampled_points)
               .map(point => JSON.stringify(point)));

        return Array.from(uniquePointStrings).map(str => JSON.parse(str));
    }

    get_endpoints(splines)
    {
        const uniqueEndpoints = new Set(
        splines.flatMap(spline => {
            return [0, -1].map(index => spline.control_points.at(index))})
        .map(point => JSON.stringify(point)));

        return Array.from(uniqueEndpoints).map(str => JSON.parse(str));
    }
}

class Graphic
{
    constructor(svg_id, svg_params = {})
    {
        this.svg = d3.select(svg_id);
        this.modify_attributes(svg_params);
        this.observer = this.dark_mode_observer();
        this.dark_mode = false;
    }

    modify_attributes(params)
    {
        Object.entries(params).forEach(([key, value]) => {this.svg.attr(key, value);});
    }

    dark_mode_observer() 
    {
        const observer = new MutationObserver(() => 
        {
            this.svg.classed("dark-mode", document.body.class == 'dark');
        });

        observer.observe(document.body, {attributes: true, attributeFilter: ['class']});
        return observer;
    }
}

class HomotopyGraphic extends Graphic
{
    constructor(svg_id, svg_params, spline_group) 
    {
        super(svg_id, svg_params);
        this.spline_group = spline_group;
        this.drag_object = this.create_drag_object();
        this.graphic = {'splines': this.append_splines(), 'circles': this.append_circles()};
        this.append_convex_hull();
        // this.append_sampled_points();
        console.log(this.spline_group);
    }

    append_sampled_points() {
        var allSplines = Object.values(this.spline_group.splines).flat();
        
        allSplines.forEach(spline => {
            spline.sampled_points.forEach(point => {
                this.svg.append('circle')
                    .attr('cx', point.x)
                    .attr('cy', point.y)
                    .attr('r', 3) // Radius of the point
                    .attr('fill', 'black') // Color of the point
                    
            });
        });
    }

    append_circles()
    {
        var splines = ['boundary', 'interior'].flatMap(key => this.spline_group.splines[key]);

        for (const spline of splines) 
        {
            spline.control_points.forEach((point, index) =>
            {
                if(point.fixed == false)
                {
                    const svgSpline = this.svg.append('circle')
                    .data([point])
                    .attr('r', 5)
                    .attr('cx', point.x)
                    .attr('cy', point.y)
                    .attr('fill', 'red')
                    .attr('spline_id', spline.spline_id)
                    .attr('point_id', index)
                    .attr('class', 'draggable') // Assign a class for hover styling
                    .call(this.drag_object); // Apply the drag behavior to only the dynamic points
                }
            })
        }

        // for(const point of spline.)

    }

    append_splines(alpha=0.5)
    {
        var splines = ['boundary', 'interior'].flatMap(key => this.spline_group.splines[key]);
        var svg_splines = [];

        console.log(splines);

        for (const spline of splines) 
        {
            svg_splines.push(this.svg.append('path')
            .datum(spline.control_points)
            .attr('fill', 'none')
            .attr('stroke', 'blue')
            .attr('stroke-dasharray', ('5, 5')) // Dashed line for the dynamic spline
            .attr('stroke-width', 5)
            .attr('spline_id', spline.spline_id)
            .attr('d', d3.line().x(d => d.x).y(d => d.y).curve(d3.curveCatmullRom.alpha(alpha)))
            .attr('class', spline.boundary ? 'boundary-spline' : 'variable-spline'));
        }

        return svg_splines;
    }

    append_convex_hull() {
        const hullPoints = this.spline_group.convex_hull.map(d => d.join(",")).join(" ");
        this.svg.append("clipPath")
        .attr("id", "clip-path-for-splines")
        .append("polygon")
        .attr("points", hullPoints);}
    
    create_drag_object() {
        const that = this; // Capture 'this' to access the class instance
        const clipPathId = "clip-path-for-splines";
        const drag = d3.drag().on('drag', function(event, d) {
            if (!d.fixed) {
                let point = { x: event.x, y: event.y };

                // Check if the point is inside the convex hull
                if (!d3.polygonContains(that.spline_group.convex_hull, [point.x, point.y])) {
                    point = that.spline_group.quadtree.find(event.x, event.y, Infinity);
                }

                // Update the point position
                d.x = point.x;
                d.y = point.y;
                d3.select(this).attr('cx', d.x).attr('cy', d.y);

                // Access and update the corresponding spline and point directly using their IDs
                let splineToUpdate = that.spline_group.splines['interior'].find(spline => spline.spline_id === d.spline_id);
                console.log();
                if (splineToUpdate) {
                // [existing code to update spline]

                // Update the path
                let pathSelector = `path[spline_id='${splineToUpdate.spline_id}']`;
                that.svg.select(pathSelector)
                    .attr('d', d3.line().x(d => d.x).y(d => d.y).curve(d3.curveCatmullRom.alpha(0.5))(splineToUpdate.control_points))
                    .attr('clip-path', `url(#${clipPathId})`);
            }
            }
        });

        return drag;
    }

}

const pointsData = [
    {points: [
        {x: 50, y: 150, fixed: true},
        {x: 150, y: 100, fixed: true},
        {x: 250, y: 75, fixed: true},
        {x: 350, y: 100, fixed: true}
        ], boundary: true },

    {points: [
        {x: 50, y: 150, fixed: true},
        {x: 150, y: 175, fixed: false},
        {x: 350, y: 100, fixed: true}
        ], boundary: false },

    {points: [
        {x: 50, y: 150, fixed: true},
        {x: 150, y: 225, fixed: true},
        {x: 250, y: 175, fixed: true},
        {x: 350, y: 100, fixed: true}
        ], boundary: true }];

var splineGroup = new SplineGroup(pointsData.map(
    data => new Spline(data.points, data.boundary)));

console.log(splineGroup);

var homotopy_graphic = new HomotopyGraphic('#homotopy', {'width': 600, 'height': 300}, splineGroup);

</script>