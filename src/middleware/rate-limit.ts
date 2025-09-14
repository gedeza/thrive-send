import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

// Create Redis instance only if environment variables are available
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN 
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

// Configure different rate limits based on environment
const getRateLimit = () => {
  // If no Redis, return null to disable rate limiting in development
  if (!redis) {
    console.warn('Rate limiting disabled: Redis not configured');
    return null;
  }
  
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
    // If no rate limiter configured, skip rate limiting
    if (!ratelimit) {
      return null; // Allow request to proceed
    }
    
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
  } catch (_error) {
    console.error("", _error);
    // Allow request to proceed if rate limiting fails
    return NextResponse.next();
  }
}