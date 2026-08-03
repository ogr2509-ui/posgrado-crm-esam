FROM python:3.10-slim

WORKDIR /app

# Install dependencies
RUN pip install --no-cache-dir openpyxl pillow

# Copy source code
COPY . /app

# Create uploads directory
RUN mkdir -p /app/uploads

# Expose port
EXPOSE 3000

ENV PORT=3000

# Run server
CMD ["python", "server.py"]
