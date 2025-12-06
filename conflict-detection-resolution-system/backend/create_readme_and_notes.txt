Notes:
- This backend uses Flask-JWT-Extended. The login endpoint returns JSON with 'data' containing the user object and 'access_token' containing the JWT.
- Frontend AuthContext expects api.login(...) to return an object where .data is the user. This backend returns that shape.
- CORS is configured for http://localhost:5173
- To run:
    python -m venv venv
    source venv/bin/activate   # or venv\Scripts\activate on Windows
    pip install -r requirements.txt
    python app.py
