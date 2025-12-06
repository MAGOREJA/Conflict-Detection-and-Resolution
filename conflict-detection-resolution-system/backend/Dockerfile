# Use official Python image 
FROM python:3.11-slim 
# Environment variables 
ENV PYTHONUNBUFFERED=1 
ENV FLASK_APP=app.py 
ENV FLASK_RUN_HOST=0.0.0.0 
ENV FLASK_RUN_PORT=5000 
# Set working directory 
WORKDIR /app 
# Install dependencies 
COPY requirements.txt . 
RUN pip install --upgrade pip 
RUN pip install -r requirements.txt 
# Copy backend source code 
COPY . . 
# Ensure chart directory exists 
RUN mkdir -p /tmp/charts 
# Expose port 
EXPOSE 5000 
# Run Flask app 
CMD ["flask", "run"] 