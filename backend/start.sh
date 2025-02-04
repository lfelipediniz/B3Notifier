set -e

# aguardadno o Redis ficar disponivel
echo "Aguardando o Redis em redis.com:6379..."
while ! nc -z redis.com 6379; do   
  sleep 1 
done
echo "Redis disponível!"

# inicia o deploy
gunicorn backend.wsgi &

# worker do Celery
celery -A backend worker -l INFO --broker=redis://<usuario>:<senha>@redis.com:6379/0 &

# Celery Beat
celery -A backend beat -l INFO --broker=redis://<usuario>:<senha>@redis.com:6379/0 &

wait
