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
    sample_points_from_path(samples=100)
    {
        var svgPath = this.generate_svg()
        return [...Array(samples)].map((_, i) => {
        const point = svgPath.getPointAtLength((this.length * i) / samples);
        return { x: point.x, y: point.y };});
    }
}

class SplineGroup
{
    constructor(splines = [])
    {
        this.splines = splines.reduce((acc, spline) => {
            const key = spline.boundary ? 'boundary' : 'interior';
            acc[key] = acc[key] || [];
            acc[key].push(spline);
            return acc;}, {});

        this.endpoints = this.get_endpoints(splines);
        console.log(this.endpoints);
        this.boundary_points = this.merge_points(this.splines['boundary']);
        this.convex_hull = d3.polygonHull(this.boundary_points.map(p => [p.x, p.y]));
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
        console.log(this.spline_group);
    }

    append_circles()
    {
        var splines = ['boundary', 'interior'].flatMap(key => this.spline_group.splines[key]);

        for (const spline of splines) 
        {
            for(const point of spline.control_points)
            {
                if(point.fixed == false)
                {
                    const svgSpline = this.svg.append('circle')
                    .data([point])
                    .attr('r', 5)
                    .attr('cx', point.x)
                    .attr('cy', point.y)
                    .attr('fill', 'red')
                    .attr('class', 'draggable') // Assign a class for hover styling
                    .call(this.drag_object); // Apply the drag behavior to only the dynamic points
                }
            }
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
            .attr('d', d3.line().x(d => d.x).y(d => d.y).curve(d3.curveCatmullRom.alpha(alpha)))
            .attr('class', spline.boundary ? 'boundary-spline' : 'variable-spline'));
        }

        return svg_splines;
    }
    
    create_drag_object() 
    {
        const that = this; // Capture 'this' to access the class instance
        const drag = d3.drag().on('drag', function(event, d) 
        {
            if (!d.fixed) 
            {
                let point = { x: event.x, y: event.y };

                if(!d3.polygonContains(that.spline_group.convex_hull, [point.x, point.y])) 
                {
                    point = that.spline_group.quadtree.find(event.x, event.y, Infinity);
                } 

                d.x = point.x;
                d.y = point.y;

                d3.select(this).attr('cx', d.x).attr('cy', d.y); // 'this' refers to the DOM element
            }
        });

        return drag;
    }

}

const pointsData = [
    {points: [
        {x: 50, y: 150, fixed: true},
        {x: 150, y: 100, fixed: true},
        {x: 250, y: 125, fixed: true},
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