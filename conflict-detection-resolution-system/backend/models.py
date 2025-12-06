from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

def generate_uuid():
    return str(uuid.uuid4())

class User(db.Model):
    id = db.Column(db.String, primary_key=True, default=generate_uuid)
    username = db.Column(db.String, unique=True, nullable=False)
    password_hash = db.Column(db.String, nullable=False)
    role = db.Column(db.String, nullable=False)  # 'Manager' or 'TeamMember'

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Task(db.Model):
    id = db.Column(db.String, primary_key=True, default=generate_uuid)
    title = db.Column(db.String, nullable=False)
    assigned_to = db.Column(db.String, nullable=False)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)
    dependencies = db.Column(db.JSON, nullable=True)
    status = db.Column(db.String, nullable=False)
    resource = db.Column(db.String, nullable=True)
    user_id = db.Column(db.String, db.ForeignKey('user.id'), nullable=True)

class ConflictReport(db.Model):
    id = db.Column(db.String, primary_key=True, default=generate_uuid)
    task_id = db.Column(db.String, db.ForeignKey('task.id'), nullable=False)
    conflict_type = db.Column(db.String, nullable=False)
    description = db.Column(db.String, nullable=False)
    detected_on = db.Column(db.DateTime, default=datetime.utcnow)
    resolved = db.Column(db.Boolean, default=False)
    resolution_suggestion = db.Column(db.String, nullable=True)
    reported_by = db.Column(db.String, nullable=True)

    # A lightweight helper to form the natural key
    def natural_key(self):
        return (self.task_id, self.conflict_type, self.description)

def init_db(app):
    # Create DB + seed demo data if needed
    db.create_all()
    # Ensure unique index to prevent duplicate conflict rows
    try:
        from sqlalchemy import text
        with db.engine.connect() as conn:
            conn.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS idx_conflict_unique ON conflict_report (task_id, conflict_type, description)"))
    except Exception as e:
        # Non-fatal: log to console
        print("[WARN] Could not create unique index idx_conflict_unique:", e)
    from flask import current_app
    # Only seed if no users exist
    if User.query.first() is None:
        manager = User(username='manager', role='Manager')
        manager.set_password('1234')
        alice = User(username='alice', role='TeamMember')
        alice.set_password('1234')
        bob = User(username='bob', role='TeamMember')
        bob.set_password('1234')
        db.session.add_all([manager, alice, bob])
        db.session.commit()

        # Add sample tasks to create conflicts
        from datetime import datetime, timedelta
        t1 = Task(
            title='Database Migration',
            assigned_to='alice',
            start_time=datetime(2025,1,15,9,0),
            end_time=datetime(2025,1,15,17,0),
            dependencies=[],
            status='in_progress',
            resource='Server A'
        )
        t2 = Task(
            title='API Deployment',
            assigned_to='alice',
            start_time=datetime(2025,1,15,14,0),
            end_time=datetime(2025,1,15,18,0),
            dependencies=[],
            status='pending',
            resource='Server A'
        )
        t3 = Task(
            title='Frontend Polishing',
            assigned_to='bob',
            start_time=datetime(2025,1,15,10,0),
            end_time=datetime(2025,1,15,12,0),
            dependencies=[],
            status='pending',
            resource='Workstation 1'
        )
        db.session.add_all([t1,t2,t3])
        db.session.commit()
