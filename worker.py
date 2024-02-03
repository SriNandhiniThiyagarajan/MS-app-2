from celery import Celery, Task
import redis
import os
import celery_config as celery_config
from dotenv import load_dotenv
load_dotenv()

CACHE_REDIS_HOST = os.getenv("CACHE_REDIS_HOST")
CACHE_REDIS_PORT= os.getenv("CACHE_REDIS_PORT")
CACHE_REDIS_PASSWORD= os.getenv("CACHE_REDIS_PASSWORD")

r = redis.Redis(
  host=CACHE_REDIS_HOST,
  port=CACHE_REDIS_PORT,
  password=CACHE_REDIS_PASSWORD)


def celery_init_app(app) -> Celery:
    class FlaskTask(Task):
        def __call__(self, *args: object, **kwargs: object) -> object:
            with app.app_context():
                return self.run(*args, **kwargs)

    celery_app = Celery(app.name, task_cls=FlaskTask)
    celery_app.config_from_object(celery_config)
    return celery_app

