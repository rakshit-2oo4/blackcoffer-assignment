import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { metricColors } from "../utils/helpers.js";

export default function LineChartD3({ data, xKey, metrics, title }) {
    const ref = useRef();

    useEffect(() => {
        if (!data?.length) return;
        const el = ref.current;
        el.innerHTML = "";

        const margin = { top: 25, right: 30, bottom: 65, left: 45 };
        const W = el.clientWidth || 400;
        const H = 280;
        const w = W - margin.left - margin.right;
        const h = H - margin.top - margin.bottom;

        const svg = d3.select(el).append("svg").attr("width", W).attr("height", H);
        const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

        const xDomain = data.map(d => String(d[xKey]));
        const x = d3.scalePoint().domain(xDomain).range([0, w]).padding(0.3);

        const yMax = d3.max(data, d => Math.max(...metrics.map(m => Number(d[m]) || 0))) || 1;
        const y = d3.scaleLinear().domain([0, yMax]).nice().range([h, 0]);

        // Grid lines
        g.append("g")
            .call(d3.axisLeft(y).ticks(5).tickSize(-w).tickFormat(""))
            .selectAll(".tick line")
            .attr("stroke", "var(--grid-line)")
            .attr("stroke-dasharray", "3,3");
        g.selectAll(".domain").remove();

        // X Axis with clean rotated year labels
        const xAxis = g.append("g")
            .attr("transform", `translate(0,${h})`)
            .call(d3.axisBottom(x));

        xAxis.selectAll("text")
            .attr("transform", "rotate(-45)")
            .attr("text-anchor", "end")
            .attr("dx", "-.7em")
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

        metrics.forEach((m) => {
            const col = metricColors[m] || "#4f46e5";
            const line = d3.line()
                .x(d => x(String(d[xKey])))
                .y(d => y(Number(d[m]) || 0))
                .curve(d3.curveMonotoneX);

            // Path line
            const path = g.append("path")
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", col)
                .attr("stroke-width", 2.5)
                .attr("d", line);

            const totalLength = path.node().getTotalLength();
            path.attr("stroke-dasharray", `${totalLength} ${totalLength}`)
                .attr("stroke-dashoffset", totalLength)
                .transition()
                .duration(900)
                .ease(d3.easeCubicOut)
                .attr("stroke-dashoffset", 0);

            // Vertex Dots
            g.selectAll(`.dot-${m}`)
                .data(data)
                .join("circle")
                .attr("class", `dot-${m}`)
                .attr("cx", d => x(String(d[xKey])))
                .attr("cy", d => y(Number(d[m]) || 0))
                .attr("r", 4)
                .attr("fill", col)
                .attr("stroke", "var(--panel)")
                .attr("stroke-width", 2)
                .style("cursor", "pointer")
                .on("mousemove", (e, d) => {
                    tt.classed("show", true)
                        .style("left", `${e.offsetX + 12}px`)
                        .style("top", `${e.offsetY - 12}px`)
                        .html(`<strong>Year ${d[xKey]}</strong><br/><span style="color:${col}; font-weight:700;">● ${m}</span>: ${(Number(d[m]) || 0).toFixed(1)}`);
                })
                .on("mouseleave", () => tt.classed("show", false));
        });

    }, [data, xKey, JSON.stringify(metrics)]);

    return (
        <div className="card chart-card">
            <div className="card-header-row">
                <h3>{title}</h3>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    {metrics.map(m => (
                        <div key={m} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", fontWeight: "600", color: "var(--text-muted)" }}>
                            <span style={{ width: 8, height: 8, borderRadius: "50%", background: metricColors[m] || "#4f46e5" }} />
                            <span style={{ textTransform: "capitalize" }}>{m}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="chart-body" ref={ref} />
        </div>
    );
}