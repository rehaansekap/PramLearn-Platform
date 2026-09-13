FROM python:3.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy backend project code
COPY . .

# Run collectstatic
RUN python manage.py collectstatic --noinput || true

# Expose port (Railway will set PORT env var automatically)
EXPOSE 8000

# Start with Daphne (ASGI + WebSockets support)
CMD ["sh", "-c", "daphne -b 0.0.0.0 -p ${PORT:-8000} pramlearn_api.asgi:application"]
