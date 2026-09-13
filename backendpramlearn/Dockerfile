FROM python:3.12-slim

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

# Ensure start.sh is executable
RUN chmod +x start.sh

# Run collectstatic
RUN python manage.py collectstatic --noinput || true

# Expose port (Railway will map PORT env var automatically)
EXPOSE 8000

CMD ["./start.sh"]
