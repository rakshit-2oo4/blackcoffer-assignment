import mongoose from "mongoose";

const DataRecordSchema = new mongoose.Schema(
    {
        end_year: { type: String, default: "" },
        intensity: { type: Number, default: 0 },
        sector: { type: String, default: "" },
        topic: { type: String, default: "" },
        insight: { type: String, default: "" },
        url: { type: String, default: "" },
        region: { type: String, default: "" },
        start_year: { type: String, default: "" },
        impact: { type: String, default: "" },
        added: { type: String, default: "" },
        published: { type: String, default: "" },
        country: { type: String, default: "" },
        relevance: { type: Number, default: 0 },
        pestle: { type: String, default: "" },
        source: { type: String, default: "" },
        title: { type: String, default: "" },
        likelihood: { type: Number, default: 0 },
        swot: { type: String, default: "" }
    },
    { timestamps: false }
);

DataRecordSchema.index({ sector: 1, topic: 1, region: 1, country: 1, pestle: 1, source: 1 });

export default mongoose.model("DataRecord", DataRecordSchema, "records");