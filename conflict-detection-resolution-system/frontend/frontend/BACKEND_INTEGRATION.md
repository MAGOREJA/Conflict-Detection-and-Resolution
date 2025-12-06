# Backend Integration Guide

This document explains how to connect this React frontend to your SQL database backend (Flask, Django, Node.js, etc.).

## Quick Start

1. **Set your API URL:**
   - Create a `.env` file in the project root:
   ```bash
   VITE_API_BASE_URL=http://localhost:5000
   ```
   - Or modify `src/lib/api.ts` directly

2. **Backend Requirements:**
   - Your backend must implement the REST API endpoints listed below
   - Enable CORS for your frontend domain
   - Support session-based authentication with cookies

---

## API Endpoints to Implement

### Authentication

#### POST `/api/auth/register`
Register a new user.

**Request Body:**
```json
{
  "username": "string",
  "password": "string",
  "role": "Manager" | "TeamMember"
}
```

**Response (Success):**
```json
{
  "message": "User registered successfully",
  "user_id": "string"
}
```

---

#### POST `/api/auth/login`
Authenticate user and create session.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response (Success):**
```json
{
  "id": "string",
  "username": "string",
  "role": "Manager" | "TeamMember"
}
```

**Note:** Set session cookie in response headers

---

#### POST `/api/auth/logout`
Destroy user session.

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

---

### Tasks

#### GET `/api/tasks`
Get all tasks.

**Response:**
```json
[
  {
    "id": "string",
    "title": "string",
    "assigned_to": "string",
    "start_time": "ISO 8601 datetime",
    "end_time": "ISO 8601 datetime",
    "dependencies": ["task_id_1", "task_id_2"],
    "status": "pending" | "in_progress" | "completed",
    "resource": "string (optional)"
  }
]
```

---

#### POST `/api/tasks`
Create a new task.

**Request Body:**
```json
{
  "title": "string",
  "assigned_to": "string",
  "start_time": "ISO 8601 datetime",
  "end_time": "ISO 8601 datetime",
  "status": "pending" | "in_progress" | "completed",
  "resource": "string (optional)",
  "dependencies": []
}
```

**Response:**
```json
{
  "id": "string",
  "message": "Task created successfully"
}
```

---

#### PUT `/api/tasks/<id>`
Update an existing task.

**Request Body:** Same as POST `/api/tasks`

**Response:**
```json
{
  "message": "Task updated successfully"
}
```

---

#### DELETE `/api/tasks/<id>`
Delete a task.

**Response:**
```json
{
  "message": "Task deleted successfully"
}
```

---

### Conflicts

#### GET `/api/conflicts/detect`
Run conflict detection algorithm and return all conflicts.

**Response:**
```json
[
  {
    "id": "string",
    "task_id": "string",
    "conflict_type": "resource" | "dependency" | "schedule",
    "description": "string",
    "detected_on": "ISO 8601 datetime",
    "resolved": boolean,
    "resolution_suggestion": "string (optional)",
    "reported_by": "string (optional)"
  }
]
```

**Conflict Detection Logic:**
- **Resource conflicts:** Same resource assigned to overlapping tasks
- **Dependency conflicts:** Task starts before dependency ends
- **Schedule conflicts:** Overlapping time slots

---

#### POST `/api/conflicts/report`
Manually report a conflict.

**Request Body:**
```json
{
  "task_id": "string",
  "conflict_type": "resource" | "dependency" | "schedule",
  "description": "string",
  "reported_by": "string"
}
```

**Response:**
```json
{
  "id": "string",
  "message": "Conflict reported successfully"
}
```

---

#### POST `/api/conflicts/<id>/resolve`
Mark a conflict as resolved.

**Request Body:**
```json
{
  "resolved": true
}
```

**Response:**
```json
{
  "message": "Conflict resolved successfully"
}
```

---

### Reports

#### GET `/api/reports/export?format=csv|pdf`
Export conflict and task data.

**Query Parameters:**
- `format`: "csv" or "pdf"

**Response:**
- CSV file with headers: `task_id, title, assigned_to, status, conflict_type, description, resolved`
- PDF file with formatted report

**Headers:**
```
Content-Type: text/csv (for CSV)
Content-Type: application/pdf (for PDF)
Content-Disposition: attachment; filename="conflict_report.[csv|pdf]"
```

---

## Database Schema (SQLAlchemy Example)

### User Table
```python
class User(db.Model):
    id = db.Column(db.String, primary_key=True)
    username = db.Column(db.String, unique=True, nullable=False)
    password_hash = db.Column(db.String, nullable=False)
    role = db.Column(db.String, nullable=False)  # 'Manager' or 'TeamMember'
```

### Task Table
```python
class Task(db.Model):
    id = db.Column(db.String, primary_key=True)
    title = db.Column(db.String, nullable=False)
    assigned_to = db.Column(db.String, nullable=False)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)
    dependencies = db.Column(db.JSON)  # Array of task IDs
    status = db.Column(db.String, nullable=False)
    resource = db.Column(db.String, nullable=True)
    user_id = db.Column(db.String, db.ForeignKey('user.id'))
```

### ConflictReport Table
```python
class ConflictReport(db.Model):
    id = db.Column(db.String, primary_key=True)
    task_id = db.Column(db.String, db.ForeignKey('task.id'), nullable=False)
    conflict_type = db.Column(db.String, nullable=False)
    description = db.Column(db.String, nullable=False)
    detected_on = db.Column(db.DateTime, default=datetime.utcnow)
    resolved = db.Column(db.Boolean, default=False)
    resolution_suggestion = db.Column(db.String, nullable=True)
    reported_by = db.Column(db.String, nullable=True)
```

---

## Flask Backend Example

### CORS Configuration
```python
from flask_cors import CORS

app = Flask(__name__)
CORS(app, supports_credentials=True, origins=['http://localhost:8080'])
```

### Session Configuration
```python
app.config['SECRET_KEY'] = 'your-secret-key'
app.config['SESSION_COOKIE_SAMESITE'] = 'None'
app.config['SESSION_COOKIE_SECURE'] = True  # Only in production with HTTPS
```

### Sample Login Endpoint
```python
from flask_login import login_user, current_user

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(username=data['username']).first()
    
    if user and check_password_hash(user.password_hash, data['password']):
        login_user(user)
        return jsonify({
            'id': user.id,
            'username': user.username,
            'role': user.role
        }), 200
    
    return jsonify({'message': 'Invalid credentials'}), 401
```

---

## Conflict Detection Algorithm

### Resource Conflict Detection
```python
def detect_resource_conflicts(tasks):
    conflicts = []
    for i, task1 in enumerate(tasks):
        for task2 in tasks[i+1:]:
            if (task1.resource == task2.resource and 
                times_overlap(task1, task2)):
                conflicts.append({
                    'task_id': task1.id,
                    'conflict_type': 'resource',
                    'description': f'Resource {task1.resource} assigned to overlapping tasks',
                    'resolution_suggestion': 'Reassign resource or adjust timeline'
                })
    return conflicts
```

### Dependency Conflict Detection
```python
def detect_dependency_conflicts(tasks):
    conflicts = []
    task_dict = {t.id: t for t in tasks}
    
    for task in tasks:
        for dep_id in task.dependencies:
            dep_task = task_dict.get(dep_id)
            if dep_task and task.start_time < dep_task.end_time:
                conflicts.append({
                    'task_id': task.id,
                    'conflict_type': 'dependency',
                    'description': f'Task starts before dependency {dep_id} ends',
                    'resolution_suggestion': f'Reschedule to start after {dep_task.end_time}'
                })
    return conflicts
```

---

## Testing

### Sample Test Data (Seed Script)
```python
def seed_data():
    # Create users
    manager = User(username='manager1', role='Manager')
    manager.password_hash = generate_password_hash('password123')
    
    member = User(username='member1', role='TeamMember')
    member.password_hash = generate_password_hash('password123')
    
    db.session.add_all([manager, member])
    db.session.commit()
    
    # Create tasks with conflicts
    task1 = Task(
        title='Database Migration',
        assigned_to='member1',
        start_time=datetime(2025, 1, 15, 9, 0),
        end_time=datetime(2025, 1, 15, 17, 0),
        resource='Server A',
        status='in_progress'
    )
    
    task2 = Task(
        title='API Deployment',
        assigned_to='member1',
        start_time=datetime(2025, 1, 15, 14, 0),  # Overlaps with task1
        end_time=datetime(2025, 1, 15, 18, 0),
        resource='Server A',  # Same resource!
        status='pending'
    )
    
    db.session.add_all([task1, task2])
    db.session.commit()
```

---

## Environment Variables

Create `.env` file:
```bash
# Frontend (React)
VITE_API_BASE_URL=http://localhost:5000

# Backend (Flask example)
FLASK_APP=app.py
FLASK_ENV=development
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///conflicts.db
```

---

## Error Handling

All endpoints should return proper HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Server Error

Error response format:
```json
{
  "message": "Error description"
}
```

---

## Next Steps

1. Implement the backend API endpoints listed above
2. Set up your database with the provided schema
3. Configure CORS and session management
4. Test each endpoint using Postman or curl
5. Update `VITE_API_BASE_URL` in your `.env` file
6. Run the React app and test the integration

For questions or issues, refer to the Flask/Django/Express documentation for your chosen backend framework.
