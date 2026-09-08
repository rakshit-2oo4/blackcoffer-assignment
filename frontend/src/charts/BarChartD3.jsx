import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { palette, truncate } from "../utils/helpers.js";

export default function BarChartD3({ data, xKey, yKey, title }) {
    const ref = useRef();

    useEffect(() => {
        if (!data?.length) return;
        const el = ref.current;
        el.innerHTML = "";

        const margin = { top: 25, right: 20, bottom: 75, left: 50 };
        const W = el.clientWidth || 400;
        const H = 280;
        const w = W - margin.left - margin.right;
        const h = H - margin.top - margin.bottom;

        const svg = d3.select(el)
            .append("svg")
            .attr("width", W)
            .attr("height", H);

        const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

        const x = d3.scaleBand()
            .domain(data.map(d => String(d[xKey])))
            .range([0, w])
            .padding(0.32);

        const yMax = d3.max(data, d => Number(d[yKey])) || 1;
        const y = d3.scaleLinear()
            .domain([0, yMax])
            .nice()
            .range([h, 0]);

        // Grid lines
        g.append("g")
            .call(d3.axisLeft(y).ticks(5).tickSize(-w).tickFormat(""))
            .selectAll(".tick line")
            .attr("stroke", "var(--grid-line)")
            .attr("stroke-dasharray", "3,3");
        g.selectAll(".domain").remove();

        // X Axis with truncated & rotated tick labels to prevent overlap
        const xAxis = g.append("g")
            .attr("transform", `translate(0,${h})`)
            .call(d3.axisBottom(x).tickFormat(d => truncate(d, 12)));

        xAxis.selectAll("text")
            .attr("transform", "rotate(-40)")
            .attr("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("fill", "var(--axis-color)")
            .attr("font-size", "11px")
            .attr("font-weight", "600");

        xAxis.selectAll("line, path").attr("stroke", "var(--panel-border)");

        // Y Axis
        const yAxis = g.append("g").call(d3.axisLeft(y).ticks(5));
        yAxis.selectAll("text").attr("fill", "var(--axis-color)").attr("font-size", "11px");
        yAxis.selectAll("line, path").attr("stroke", "var(--panel-border)");

        const tt = d3.select(el).append("div").attr("class", "tooltip");

        // Bars
        g.selectAll("rect.bar")
            .data(data)
            .join("rect")
            .attr("class", "bar")
            .attr("x", d => x(String(d[xKey])))
            .attr("y", h)
            .attr("width", x.bandwidth())
            .attr("height", 0)
            .attr("rx", 5)
            .attr("fill", (d, i) => palette[i % palette.length])
            .style("cursor", "pointer")
            .on("mousemove", (e, d) => {
                const valStr = typeof d[yKey] === "number" ? d[yKey].toFixed(1) : d[yKey];
                tt.classed("show", true)
                    .style("left", `${e.offsetX + 12}px`)
                    .style("top", `${e.offsetY - 12}px`)
                    .html(`<strong>${d[xKey]}</strong><br/>${yKey}: ${valStr}`);
            })
            .on("mouseleave", () => tt.classed("show", false))
            .transition()
            .duration(850)
            .ease(d3.easeCubicOut)
            .attr("y", d => y(Number(d[yKey])))
            .attr("height", d => h - y(Number(d[yKey])));

    }, [data, xKey, yKey]);

    return (
        <div className="card chart-card">
            <h3>{title}</h3>
            <div className="chart-body" ref={ref} />
        </div>
    );
}