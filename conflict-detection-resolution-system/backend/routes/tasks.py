#JWT authentication has been temporarily disabled for testing purposes.


# from flask import Blueprint, request, jsonify
# from models import db, Task
# from datetime import datetime
# import uuid
# from flask_jwt_extended import jwt_required, get_jwt_identity

# tasks_bp = Blueprint('tasks', __name__, url_prefix='/api/tasks')

# def parse_iso(dt_str):
#     return datetime.fromisoformat(dt_str)

# @tasks_bp.route('', methods=['GET'])
# @jwt_required(optional=True)
# def get_tasks():
#     tasks = Task.query.all()
#     return jsonify([{
#         'id': t.id,
#         'title': t.title,
#         'assigned_to': t.assigned_to,
#         'start_time': t.start_time.isoformat(),
#         'end_time': t.end_time.isoformat(),
#         'dependencies': t.dependencies or [],
#         'status': t.status,
#         'resource': t.resource
#     } for t in tasks]), 200

# @tasks_bp.route('', methods=['POST'])
# @jwt_required()
# def create_task():
#     data = request.json
#     t = Task(
#         id=str(uuid.uuid4()),
#         title=data['title'],
#         assigned_to=data['assigned_to'],
#         start_time=parse_iso(data['start_time']),
#         end_time=parse_iso(data['end_time']),
#         dependencies=data.get('dependencies', []),
#         status=data.get('status','pending'),
#         resource=data.get('resource')
#     )
#     db.session.add(t)
#     db.session.commit()
#     return jsonify({'id': t.id, 'message':'Task created successfully'}), 201

# @tasks_bp.route('/<id>', methods=['PUT'])
# @jwt_required()
# def update_task(id):
#     task = Task.query.get(id)
#     if not task:
#         return jsonify({'message':'Task not found'}), 404
#     data = request.json
#     task.title = data.get('title', task.title)
#     task.assigned_to = data.get('assigned_to', task.assigned_to)
#     if 'start_time' in data:
#         task.start_time = parse_iso(data['start_time'])
#     if 'end_time' in data:
#         task.end_time = parse_iso(data['end_time'])
#     task.dependencies = data.get('dependencies', task.dependencies)
#     task.status = data.get('status', task.status)
#     task.resource = data.get('resource', task.resource)
#     db.session.commit()
#     return jsonify({'message':'Task updated successfully'}), 200

# @tasks_bp.route('/<id>', methods=['DELETE'])
# @jwt_required()
# def delete_task(id):
#     task = Task.query.get(id)
#     if not task:
#         return jsonify({'message':'Task not found'}), 404
#     db.session.delete(task)
#     db.session.commit()
#     return jsonify({'message':'Task deleted successfully'}), 200



# from flask import Blueprint, request, jsonify
# from models import db, Task
# from datetime import datetime
# import uuid

# tasks_bp = Blueprint('tasks', __name__, url_prefix='/api/tasks')

# def parse_iso(dt_str):
#     try:
#         return datetime.fromisoformat(dt_str)
#     except ValueError:
#         return None

# # Get all tasks
# @tasks_bp.route('', methods=['GET'])
# def get_tasks():
#     tasks = Task.query.all()
#     return jsonify([
#         {
#             'id': t.id,
#             'title': t.title,
#             'assigned_to': t.assigned_to,
#             'start_time': t.start_time.isoformat() if t.start_time else None,
#             'end_time': t.end_time.isoformat() if t.end_time else None,
#             'dependencies': t.dependencies or [],
#             'status': t.status,
#             'resource': t.resource
#         }
#         for t in tasks
#     ]), 200


# # Create a new task
# @tasks_bp.route('', methods=['POST'])
# def create_task():
#     data = request.json

#     if not all(k in data for k in ('title', 'assigned_to', 'start_time', 'end_time')):
#         return jsonify({'message': 'Missing required fields'}), 400

#     start_time = parse_iso(data['start_time'])
#     end_time = parse_iso(data['end_time'])
#     if not start_time or not end_time:
#         return jsonify({'message': 'Invalid date format'}), 400

#     t = Task(
#         id=str(uuid.uuid4()),
#         title=data['title'],
#         assigned_to=data['assigned_to'],
#         start_time=start_time,
#         end_time=end_time,
#         dependencies=data.get('dependencies', []),
#         status=data.get('status', 'pending'),
#         resource=data.get('resource')
#     )
#     db.session.add(t)
#     db.session.commit()

#     return jsonify({'id': t.id, 'message': 'Task created successfully'}), 201


# # Update a task
# @tasks_bp.route('/<id>', methods=['PUT'])
# def update_task(id):
#     task = Task.query.get(id)
#     if not task:
#         return jsonify({'message': 'Task not found'}), 404

#     data = request.json
#     task.title = data.get('title', task.title)
#     task.assigned_to = data.get('assigned_to', task.assigned_to)

#     if 'start_time' in data:
#         parsed_start = parse_iso(data['start_time'])
#         if parsed_start:
#             task.start_time = parsed_start
#     if 'end_time' in data:
#         parsed_end = parse_iso(data['end_time'])
#         if parsed_end:
#             task.end_time = parsed_end

#     task.dependencies = data.get('dependencies', task.dependencies)
#     task.status = data.get('status', task.status)
#     task.resource = data.get('resource', task.resource)
#     db.session.commit()

#     return jsonify({'message': 'Task updated successfully'}), 200


# # Delete a task
# @tasks_bp.route('/<id>', methods=['DELETE'])
# def delete_task(id):
#     task = Task.query.get(id)
#     if not task:
#         return jsonify({'message': 'Task not found'}), 404

#     db.session.delete(task)
#     db.session.commit()

#     return jsonify({'message': 'Task deleted successfully'}), 200


# # Get a single task by ID
# @tasks_bp.route('/<id>', methods=['GET'])
# def get_task(id):
#     task = Task.query.get(id)
#     if not task:
#         return jsonify({'message': 'Task not found'}), 404

#     return jsonify({
#         'id': task.id,
#         'title': task.title,
#         'assigned_to': task.assigned_to,
#         'start_time': task.start_time.isoformat() if task.start_time else None,
#         'end_time': task.end_time.isoformat() if task.end_time else None,
#         'dependencies': task.dependencies or [],
#         'status': task.status,
#         'resource': task.resource
#     }), 200




from flask import Blueprint, request, jsonify
from models import db, Task
from datetime import datetime
import uuid

tasks_bp = Blueprint('tasks', __name__, url_prefix='/api/tasks')


# Helper function: Parse ISO datetime
def parse_iso(dt_str):
    try:
        return datetime.fromisoformat(dt_str)
    except (ValueError, TypeError):
        return None


# Helper function: Convert Task to dict
def task_to_dict(t: Task):
    return {
        'id': t.id,
        'title': t.title,
        'assigned_to': t.assigned_to,
        'start_time': t.start_time.isoformat() if t.start_time else None,
        'end_time': t.end_time.isoformat() if t.end_time else None,
        'dependencies': t.dependencies or [],
        'status': t.status,
        'resource': t.resource
    }


# Get all tasks
@tasks_bp.route('/', methods=['GET'], strict_slashes=False)
def get_tasks():
    tasks = Task.query.all()
    return jsonify([task_to_dict(t) for t in tasks]), 200


# Get a single task by ID
@tasks_bp.route('/<id>', methods=['GET'], strict_slashes=False)
def get_task(id):
    task = Task.query.get(id)
    if not task:
        return jsonify({'message': 'Task not found'}), 404
    return jsonify(task_to_dict(task)), 200


# Create a new task
@tasks_bp.route('/', methods=['POST'], strict_slashes=False)
def create_task():
    data = request.json

    # Required fields check
    if not all(k in data for k in ('title', 'assigned_to', 'start_time', 'end_time')):
        return jsonify({'message': 'Missing required fields'}), 400

    start_time = parse_iso(data['start_time'])
    end_time = parse_iso(data['end_time'])
    if not start_time or not end_time:
        return jsonify({'message': 'Invalid date format'}), 400

    # Optional: Validate dependencies exist
    dependencies = data.get('dependencies', [])
    for dep_id in dependencies:
        if not Task.query.get(dep_id):
            return jsonify({'message': f'Dependency task {dep_id} not found'}), 400

    task = Task(
        id=str(uuid.uuid4()),
        title=data['title'],
        assigned_to=data['assigned_to'],
        start_time=start_time,
        end_time=end_time,
        dependencies=dependencies,
        status=data.get('status', 'pending'),
        resource=data.get('resource')
    )

    db.session.add(task)
    db.session.commit()

    return jsonify({'id': task.id, 'message': 'Task created successfully'}), 201


# Update a task
@tasks_bp.route('/<id>', methods=['PUT'], strict_slashes=False)
def update_task(id):
    task = Task.query.get(id)
    if not task:
        return jsonify({'message': 'Task not found'}), 404

    data = request.json
    task.title = data.get('title', task.title)
    task.assigned_to = data.get('assigned_to', task.assigned_to)

    if 'start_time' in data:
        parsed_start = parse_iso(data['start_time'])
        if parsed_start:
            task.start_time = parsed_start
    if 'end_time' in data:
        parsed_end = parse_iso(data['end_time'])
        if parsed_end:
            task.end_time = parsed_end

    # Validate dependencies
    dependencies = data.get('dependencies', task.dependencies)
    for dep_id in dependencies:
        if not Task.query.get(dep_id):
            return jsonify({'message': f'Dependency task {dep_id} not found'}), 400
    task.dependencies = dependencies

    task.status = data.get('status', task.status)
    task.resource = data.get('resource', task.resource)

    db.session.commit()

    return jsonify({'message': 'Task updated successfully'}), 200


# Delete a task
@tasks_bp.route('/<id>', methods=['DELETE'], strict_slashes=False)
def delete_task(id):
    task = Task.query.get(id)
    if not task:
        return jsonify({'message': 'Task not found'}), 404

    db.session.delete(task)
    db.session.commit()

    return jsonify({'message': 'Task deleted successfully'}), 200
