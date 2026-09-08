import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { truncate } from "../utils/helpers.js";

export default function HeatmapD3({ rows, cols, matrix, title }) {
    const ref = useRef();

    useEffect(() => {
        if (!matrix?.length || !rows?.length || !cols?.length) return;
        const el = ref.current;
        el.innerHTML = "";

        const margin = { top: 30, right: 25, bottom: 75, left: 125 };
        const W = el.clientWidth || 400;
        const H = 280;
        const w = W - margin.left - margin.right;
        const h = H - margin.top - margin.bottom;

        const svg = d3.select(el).append("svg").attr("width", W).attr("height", H);
        const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

        const x = d3.scaleBand().domain(cols).range([0, w]).padding(0.08);
        const y = d3.scaleBand().domain(rows).range([0, h]).padding(0.08);

        const flat = matrix.flatMap((row, i) =>
            row.map((v, j) => ({ row: rows[i], col: cols[j], value: v }))
        );

        const maxVal = d3.max(flat, d => d.value) || 1;
        const color = d3.scaleSequential(d3.interpolateBlues).domain([0, maxVal]);

        const tt = d3.select(el).append("div").attr("class", "tooltip");

        g.selectAll("rect")
            .data(flat)
            .join("rect")
            .attr("x", d => x(d.col))
            .attr("y", d => y(d.row))
            .attr("width", x.bandwidth())
            .attr("height", y.bandwidth())
            .attr("rx", 4)
            .attr("fill", d => d.value > 0 ? color(d.value) : "var(--panel-sub)")
            .style("cursor", "pointer")
            .on("mousemove", (e, d) => {
                tt.classed("show", true)
                    .style("left", `${e.offsetX + 12}px`)
                    .style("top", `${e.offsetY - 12}px`)
                    .html(`<strong>${d.row} × ${d.col}</strong><br/>Avg Intensity: ${d.value.toFixed(1)}`);
            })
            .on("mouseleave", () => tt.classed("show", false));

        // X Axis with rotated & truncated labels
        const xAxis = g.append("g").attr("transform", `translate(0,${h})`).call(d3.axisBottom(x).tickFormat(d => truncate(d, 12)));
        xAxis.selectAll("text")
            .attr("transform", "rotate(-35)")
            .attr("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("fill", "var(--axis-color)")
            .attr("font-size", "10px")
            .attr("font-weight", "600");
        xAxis.selectAll("line, path").attr("stroke", "var(--panel-border)");

        // Y Axis with truncated labels
        const yAxis = g.append("g").call(d3.axisLeft(y).tickFormat(d => truncate(d, 14)));
        yAxis.selectAll("text")
            .attr("fill", "var(--axis-color)")
            .attr("font-size", "10px")
            .attr("font-weight", "600");
        yAxis.selectAll("line, path").attr("stroke", "var(--panel-border)");

    }, [JSON.stringify(rows), JSON.stringify(cols), JSON.stringify(matrix)]);

    return (
        <div className="card chart-card">
            <h3>{title}</h3>
            <div className="chart-body" ref={ref} />
        </div>
    );
}