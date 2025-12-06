FROM python:3.10

WORKDIR /app

# Copy backend code
COPY backend/ ./backend/

# Install dependencies
RUN pip install -r backend/requirements.txt

# Hugging Face uses port 7860
# Railway injects PORT env variable
EXPOSE 7860

CMD ["python", "backend/app.py"]
