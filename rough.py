import redis

r = redis.Redis(
  host='redis-10166.c325.us-east-1-4.ec2.cloud.redislabs.com',
  port=10166,
  password='MuXGzh0nQYFkmHwnEvlZZfqP0vBpgdHW')

# to set a key value pair

r.set('name', 'rahul')

# to get a key value pair

print(r.get('name'))

# to delete a key value pair

r.delete('name')