import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { palette } from "../utils/helpers.js";

export default function DonutChartD3({ data, keyField, valueField, title }) {
    const ref = useRef();

    useEffect(() => {
        if (!data?.length) return;
        const el = ref.current;
        el.innerHTML = "";

        const W = el.clientWidth || 300;
        const H = 280;
        const R = Math.min(W, H) / 2 - 20;
        const r = R * 0.62;

        const svg = d3.select(el).append("svg")
            .attr("width", W)
            .attr("height", H);

        const g = svg.append("g").attr("transform", `translate(${W / 2},${H / 2})`);

        const tt = d3.select(el).append("div").attr("class", "tooltip");
        const pie = d3.pie().value(d => d[valueField] || 0).sort(null);
        const arc = d3.arc().innerRadius(r).outerRadius(R).padAngle(0.03).cornerRadius(4);
        const arcHover = d3.arc().innerRadius(r).outerRadius(R + 6).padAngle(0.03).cornerRadius(4);

        const arcs = pie(data);

        const paths = g.selectAll("path")
            .data(arcs)
            .join("path")
            .attr("fill", (d, i) => palette[i % palette.length])
            .attr("d", arc)
            .style("stroke", "var(--panel)")
            .style("stroke-width", "2px")
            .style("cursor", "pointer");

        paths.on("mousemove", function (e, d) {
            d3.select(this).transition().duration(150).attr("d", arcHover);
            tt.classed("show", true)
                .style("left", `${e.offsetX + 12}px`)
                .style("top", `${e.offsetY - 12}px`)
                .html(`<strong>${d.data[keyField]}</strong><br/>${valueField}: ${d.data[valueField]}`);
        })
            .on("mouseleave", function () {
                d3.select(this).transition().duration(150).attr("d", arc);
                tt.classed("show", false);
            });

        paths.transition().duration(800)
            .attrTween("d", function (d) {
                const i = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
                return t => arc(i(t));
            });

        // Center Total
        const total = d3.sum(data, d => d[valueField] || 0);
        g.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", "-0.2em")
            .attr("fill", "var(--text-main)")
            .attr("font-size", "22px")
            .attr("font-weight", "800")
            .text(total.toLocaleString());

        g.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", "1.2em")
            .attr("fill", "var(--text-muted)")
            .attr("font-size", "11px")
            .attr("font-weight", "600")
            .text("TOTAL COUNT");

    }, [data, keyField, valueField]);

    return (
        <div className="card chart-card">
            <h3>{title}</h3>
            <div className="chart-body" ref={ref} />
        </div>
    );
}