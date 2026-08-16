import time
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("api.access")

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        # Don't log sensitive headers or passwords
        path = request.url.path
        method = request.method

        response = await call_next(request)
        
        process_time = (time.time() - start_time) * 1000
        logger.info(f"{method} {path} - {response.status_code} ({process_time:.2f}ms)")
        
        return response
