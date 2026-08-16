import pytest
import asyncio
from app.database import async_engine, Base
from main import seed_initial_data

async def _reset_test_db():
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    await seed_initial_data()

@pytest.fixture(autouse=True, scope="session")
def setup_test_db():
    asyncio.run(_reset_test_db())
    yield
