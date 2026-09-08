import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { palette, truncate } from "../utils/helpers.js";

export default function BubbleChartD3({ data, keyField, sizeField, title }) {
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

        const pack = d3.pack()
            .size([W - 20, H - 20])
            .padding(8);

        const root = d3.hierarchy({ children: data })
            .sum(d => Number(d[sizeField]) || 1);

        pack(root);

        const g = svg.append("g").attr("transform", `translate(10,10)`);
        const tt = d3.select(el).append("div").attr("class", "tooltip");

        const node = g.selectAll("g")
            .data(root.leaves())
            .join("g")
            .attr("transform", d => `translate(${d.x},${d.y})`);

        node.append("circle")
            .attr("r", 0)
            .attr("fill", (d, i) => palette[i % palette.length])
            .attr("opacity", 0.88)
            .style("cursor", "pointer")
            .on("mousemove", function (e, d) {
                d3.select(this).attr("opacity", 1).attr("stroke", "var(--panel)").attr("stroke-width", 2);
                tt.classed("show", true)
                    .style("left", `${e.offsetX + 12}px`)
                    .style("top", `${e.offsetY - 12}px`)
                    .html(`<strong>${d.data[keyField]}</strong><br/>${sizeField}: ${d.data[sizeField]}`);
            })
            .on("mouseleave", function () {
                d3.select(this).attr("opacity", 0.88).attr("stroke", "none");
                tt.classed("show", false);
            })
            .transition()
            .duration(850)
            .ease(d3.easeBackOut)
            .attr("r", d => d.r);

        // Render label text strictly if bubble radius is large enough to prevent overlap
        node.append("text")
            .attr("dy", ".35em")
            .attr("text-anchor", "middle")
            .attr("font-size", d => `${Math.min(Math.max(d.r / 3.2, 9), 12)}px`)
            .attr("font-weight", "700")
            .attr("fill", "#ffffff")
            .attr("pointer-events", "none")
            .text(d => d.r > 20 ? truncate(d.data[keyField], Math.floor(d.r / 3.2)) : "");

    }, [data, keyField, sizeField]);

    return (
        <div className="card chart-card">
            <h3>{title}</h3>
            <div className="chart-body" ref={ref} />
        </div>
    );
}