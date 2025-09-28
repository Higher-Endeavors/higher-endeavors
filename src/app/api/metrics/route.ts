import { NextRequest, NextResponse } from "next/server";
import client from "prom-client";

const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Example custom metrics
const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status"],
});

register.registerMetric(httpRequestDuration);

export async function GET(req: NextRequest) {
  return new NextResponse(await register.metrics(), {
    headers: { "Content-Type": register.contentType },
  });
}
