# Use an official Python slim runtime as a parent image
FROM python:3.8-slim AS builder

# Set the working directory in the container
WORKDIR /app

# Copy only requirements.txt to the container
COPY requirements.txt .

# Install system dependencies required for building Python packages
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc libpq-dev && \
    rm -rf /var/lib/apt/lists/*

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Now use a smaller base image for the final image
FROM python:3.8-slim

# Set the working directory in the container
WORKDIR /app

# Copy only the dependencies installed from the builder stage
COPY --from=builder /usr/local/lib/python3.8/site-packages/ /usr/local/lib/python3.8/site-packages/
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy the rest of your application code into the container
COPY . .

# Expose port 5000 to the outside world
EXPOSE 5000

# Define environment variable
ENV FLASK_APP=app.py

# Run the Flask application
CMD ["flask", "run", "--host", "0.0.0.0"]
