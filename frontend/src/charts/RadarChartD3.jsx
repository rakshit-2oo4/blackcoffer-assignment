import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { palette, truncate } from "../utils/helpers.js";

export default function RadarChartD3({ data, axes, valueField, title }) {
    const ref = useRef();

    useEffect(() => {
        if (!data?.length || !axes?.length) return;
        const el = ref.current;
        el.innerHTML = "";

        const W = el.clientWidth || 300;
        const H = 280;
        const R = Math.min(W, H) / 2 - 50;

        const svg = d3.select(el).append("svg").attr("width", W).attr("height", H);
        const g = svg.append("g").attr("transform", `translate(${W / 2},${H / 2})`);

        const maxVal = d3.max(data, d => Number(d[valueField])) || 1;
        const rScale = d3.scaleLinear().domain([0, maxVal]).range([0, R]);
        const angleScale = d3.scalePoint().domain(axes).range([0, 2 * Math.PI]);

        // Grid rings
        [0.25, 0.5, 0.75, 1].forEach(factor => {
            g.append("circle")
                .attr("r", R * factor)
                .attr("fill", "none")
                .attr("stroke", "var(--panel-border)")
                .attr("stroke-dasharray", "3,3");
        });

        // Axes lines & labels
        axes.forEach(axis => {
            const angle = angleScale(axis) - Math.PI / 2;
            const x2 = R * Math.cos(angle);
            const y2 = R * Math.sin(angle);

            g.append("line")
                .attr("x1", 0)
                .attr("y1", 0)
                .attr("x2", x2)
                .attr("y2", y2)
                .attr("stroke", "var(--panel-border)");

            const labelX = (R + 22) * Math.cos(angle);
            const labelY = (R + 22) * Math.sin(angle);

            g.append("text")
                .attr("x", labelX)
                .attr("y", labelY)
                .attr("text-anchor", "middle")
                .attr("dy", ".35em")
                .attr("font-size", "10px")
                .attr("font-weight", "600")
                .attr("fill", "var(--axis-color)")
                .text(truncate(axis, 10));
        });

        // Points
        const pts = axes.map(axis => {
            const item = data.find(d => d.key === axis || d._id === axis) || { [valueField]: 0 };
            const angle = angleScale(axis) - Math.PI / 2;
            const r = rScale(Number(item[valueField]) || 0);
            return {
                axis,
                val: Number(item[valueField]) || 0,
                x: r * Math.cos(angle),
                y: r * Math.sin(angle)
            };
        });

        const lineGen = d3.line()
            .x(d => d.x)
            .y(d => d.y)
            .curve(d3.curveCardinalClosed);

        const color = palette[0];

        // Polygon area
        g.append("path")
            .datum(pts)
            .attr("d", lineGen)
            .attr("fill", color)
            .attr("fill-opacity", 0.22)
            .attr("stroke", color)
            .attr("stroke-width", 2.5);

        // Vertex dots
        const tt = d3.select(el).append("div").attr("class", "tooltip");

        g.selectAll("circle.dot")
            .data(pts)
            .join("circle")
            .attr("class", "dot")
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
            .attr("r", 4)
            .attr("fill", color)
            .attr("stroke", "var(--panel)")
            .attr("stroke-width", 2)
            .style("cursor", "pointer")
            .on("mousemove", (e, d) => {
                tt.classed("show", true)
                    .style("left", `${e.offsetX + 12}px`)
                    .style("top", `${e.offsetY - 12}px`)
                    .html(`<strong>${d.axis}</strong><br/>${valueField}: ${d.val.toFixed(1)}`);
            })
            .on("mouseleave", () => tt.classed("show", false));

    }, [data, JSON.stringify(axes), valueField]);

    return (
        <div className="card chart-card">
            <h3>{title}</h3>
            <div className="chart-body" ref={ref} />
        </div>
    );
}