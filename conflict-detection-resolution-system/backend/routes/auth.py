from flask import Blueprint, request, jsonify
from models import db, User
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
import datetime

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    if not data or not data.get('username') or not data.get('password') or not data.get('role'):
        return jsonify({'message':'Missing fields'}), 400
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'message':'Username already exists'}), 400
    user = User(username=data['username'], role=data['role'])
    user.set_password(data['password'])
    db.session.add(user)
    db.session.commit()
    return jsonify({'message':'User registered successfully','user_id': user.id}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'message':'Missing credentials'}), 400
    user = User.query.filter_by(username=data['username']).first()
    if not user or not user.check_password(data['password']):
        return jsonify({'message':'Invalid credentials'}), 401
    access_token = create_access_token(identity={'id': user.id, 'username': user.username, 'role': user.role}, expires_delta=datetime.timedelta(days=1))
    # Return token and user payload inside 'data' to match frontend expectations
    return jsonify({'data': {'id': user.id, 'username': user.username, 'role': user.role}, 'access_token': access_token}), 200
