import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { palette, truncate } from "../utils/helpers.js";

export default function TreemapD3({ data, keyField, valueField, title }) {
    const ref = useRef();

    useEffect(() => {
        if (!data?.length) return;
        const el = ref.current;
        el.innerHTML = "";

        const W = el.clientWidth || 300;
        const H = 280;

        const svg = d3.select(el).append("svg")
            .attr("width", W)
            .attr("height", H);

        const tt = d3.select(el).append("div").attr("class", "tooltip");

        const root = d3.hierarchy({ children: data })
            .sum(d => Number(d[valueField]) || 1)
            .sort((a, b) => b.value - a.value);

        d3.treemap().size([W, H]).padding(4).round(true)(root);

        const cell = svg.selectAll("g")
            .data(root.leaves())
            .join("g");

        cell.append("rect")
            .attr("x", d => d.x0)
            .attr("y", d => d.y0)
            .attr("width", d => d.x1 - d.x0)
            .attr("height", d => d.y1 - d.y0)
            .attr("rx", 6)
            .attr("fill", (d, i) => palette[i % palette.length])
            .attr("opacity", 0.9)
            .style("cursor", "pointer")
            .on("mousemove", (e, d) => {
                tt.classed("show", true)
                    .style("left", `${e.offsetX + 12}px`)
                    .style("top", `${e.offsetY - 12}px`)
                    .html(`<strong>${d.data[keyField]}</strong><br/>${valueField}: ${d.data[valueField]}`);
            })
            .on("mouseleave", () => tt.classed("show", false));

        // Prevent text overlap by checking cell bounding box
        cell.append("text")
            .attr("x", d => d.x0 + 8)
            .attr("y", d => d.y0 + 18)
            .attr("font-size", "11px")
            .attr("font-weight", "700")
            .attr("fill", "#ffffff")
            .attr("pointer-events", "none")
            .text(d => {
                const w = d.x1 - d.x0;
                const h = d.y1 - d.y0;
                if (w > 48 && h > 24) {
                    const maxChars = Math.floor((w - 12) / 7);
                    return truncate(d.data[keyField], Math.max(maxChars, 3));
                }
                return "";
            });

    }, [data, keyField, valueField]);

    return (
        <div className="card chart-card">
            <h3>{title}</h3>
            <div className="chart-body" ref={ref} />
        </div>
    );
}