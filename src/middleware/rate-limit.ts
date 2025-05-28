import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

// Ensure required environment variables are set
if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error("Missing required Upstash Redis environment variables");
}

// Create Redis instance
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Configure different rate limits based on environment
const getRateLimit = () => {
  switch (process.env.NODE_ENV) {
    case "production":
      return new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(100, "60 s"), // 100 requests per minute
        analytics: true,
      });
    case "test":
      return new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(1000, "1 s"), // 1000 requests per second
        analytics: true,
      });
    default:
      return new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(200, "60 s"), // 200 requests per minute
        analytics: true,
      });
  }
};

// Create rate limiter instance
const ratelimit = getRateLimit();

// Rate limiting middleware
export async function rateLimitMiddleware(request: NextRequest) {
  try {
    const ip = request.ip ?? "127.0.0.1";
    const { success, limit, reset, remaining } = await ratelimit.limit(ip);

    // Set rate limit headers
    const headers = new Headers();
    headers.set("x-ratelimit-limit", limit.toString());
    headers.set("x-ratelimit-remaining", remaining.toString());
    headers.set("x-ratelimit-reset", reset.toString());

    if (!success) {
      return new NextResponse("Too Many Requests", {
        status: 429,
        statusText: "Too Many Requests",
        headers,
      });
    }

    const response = NextResponse.next();
    // Add rate limit headers to successful response
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  } catch (error) {
    console.error("Rate limiting error:", error);
    // Allow request to proceed if rate limiting fails
    return NextResponse.next();
  }
}