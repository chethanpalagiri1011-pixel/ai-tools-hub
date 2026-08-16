import time
from collections import defaultdict
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request, HTTPException, status, Response

class SimpleRateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, requests_per_minute: int = 120):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.client_requests = defaultdict(list)

    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host if request.client else "127.0.0.1"
        now = time.time()

        # Clean old timestamps
        timestamps = [t for t in self.client_requests[client_ip] if now - t < 60]
        self.client_requests[client_ip] = timestamps

        if len(timestamps) >= self.requests_per_minute:
            return Response(
                content='{"detail": "Rate limit exceeded. Too many requests."}',
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                media_type="application/json"
            )

        self.client_requests[client_ip].append(now)
        return await call_next(request)
