# from flask import Blueprint, jsonify, request
# from models import db, Task, ConflictReport
# from utils.conflict_detection import detect_resource_conflicts, detect_dependency_conflicts, smart_suggestions
# import uuid
# from datetime import datetime
# from flask_jwt_extended import jwt_required

# conflicts_bp = Blueprint('conflicts', __name__, url_prefix='/api/conflicts')

# @conflicts_bp.route('/detect', methods=['GET'])
# @jwt_required(optional=True)
# def detect_conflicts():
#     tasks = Task.query.all()
#     res_conflicts = detect_resource_conflicts(tasks)
#     dep_conflicts = detect_dependency_conflicts(tasks)
#     conflicts = res_conflicts + dep_conflicts
#     results = []
#     for c in conflicts:
#         report = ConflictReport(
#             id=str(uuid.uuid4()),
#             task_id=c['task_id'],
#             conflict_type=c['conflict_type'],
#             description=c['description'],
#             resolution_suggestion=c.get('resolution_suggestion')
#         )
#         db.session.add(report)
#         results.append({
#             'id': report.id,
#             'task_id': report.task_id,
#             'conflict_type': report.conflict_type,
#             'description': report.description,
#             'resolution_suggestion': report.resolution_suggestion,
#             'suggested_actions': smart_suggestions(c)
#         })
#     db.session.commit()
#     return jsonify({'conflicts': results}), 200

# @conflicts_bp.route('/report', methods=['POST'])
# @jwt_required()
# def report_conflict():
#     data = request.json
#     report = ConflictReport(
#         id=str(uuid.uuid4()),
#         task_id=data['task_id'],
#         conflict_type=data['conflict_type'],
#         description=data['description'],
#         reported_by=data.get('reported_by')
#     )
#     db.session.add(report)
#     db.session.commit()
#     return jsonify({'id': report.id, 'message':'Conflict reported successfully'}), 201

# @conflicts_bp.route('/<id>/resolve', methods=['POST'])
# @jwt_required()
# def resolve_conflict(id):
#     conflict = ConflictReport.query.get(id)
#     if not conflict:
#         return jsonify({'message':'Conflict not found'}), 404
#     data = request.json
#     conflict.resolved = data.get('resolved', True)
#     db.session.commit()
#     return jsonify({'message':'Conflict resolved successfully'}), 200




# from flask import Blueprint, jsonify, request
# from models import db, Task, ConflictReport
# from utils.conflict_detection import (
#     detect_resource_conflicts,
#     detect_timing_conflicts,
#     detect_dependency_conflicts,
#     detect_scheduling_conflicts,
#     detect_communication_conflicts,
#     detect_task_overlap_conflicts,
#     smart_suggestions
# )
# import uuid

# conflicts_bp = Blueprint('conflicts', __name__, url_prefix='/api/conflicts')

# @conflicts_bp.route('/detect', methods=['GET'])
# def detect_conflicts():
#     tasks = Task.query.all()
#     if not tasks:
#         return jsonify({'message': 'No tasks found to analyze conflicts.'}), 404

#     # Run all conflict detection checks
#     res_conflicts = detect_resource_conflicts(tasks)
#     timing_conflicts = detect_timing_conflicts(tasks)
#     dep_conflicts = detect_dependency_conflicts(tasks)
#     sched_conflicts = detect_scheduling_conflicts(tasks)
#     comm_conflicts = detect_communication_conflicts(tasks)
#     overlap_conflicts = detect_task_overlap_conflicts(tasks)

#     all_conflicts = (
#         res_conflicts
#         + timing_conflicts
#         + dep_conflicts
#         + sched_conflicts
#         + comm_conflicts
#         + overlap_conflicts
#     )

#     results = []
#     for c in all_conflicts:
#         report = ConflictReport(
#             id=str(uuid.uuid4()),
#             task_id=c['task_id'],
#             conflict_type=c['conflict_type'],
#             description=c['description'],
#             resolution_suggestion=c.get('resolution_suggestion')
#         )
#         db.session.add(report)

#         results.append({
#             'id': report.id,
#             'task_id': report.task_id,
#             'conflict_type': report.conflict_type,
#             'description': report.description,
#             'resolution_suggestion': report.resolution_suggestion,
#             'suggested_actions': smart_suggestions(c)
#         })

#     db.session.commit()
#     return jsonify({'conflicts': results}), 200


# @conflicts_bp.route('/report', methods=['POST'])
# def report_conflict():
#     data = request.json
#     if not data or 'task_id' not in data or 'conflict_type' not in data or 'description' not in data:
#         return jsonify({'message': 'Missing required fields.'}), 400

#     report = ConflictReport(
#         id=str(uuid.uuid4()),
#         task_id=data['task_id'],
#         conflict_type=data['conflict_type'],
#         description=data['description'],
#         reported_by=data.get('reported_by')
#     )
#     db.session.add(report)
#     db.session.commit()

#     return jsonify({'id': report.id, 'message': 'Conflict reported successfully'}), 201


# @conflicts_bp.route('/<id>/resolve', methods=['POST'])
# def resolve_conflict(id):
#     conflict = ConflictReport.query.get(id)
#     if not conflict:
#         return jsonify({'message': 'Conflict not found'}), 404

#     data = request.json
#     conflict.resolved = data.get('resolved', True)
#     db.session.commit()

#     return jsonify({'message': 'Conflict resolved successfully'}), 200



from flask import Blueprint, jsonify, request
from models import db, Task, ConflictReport
from utils.conflict_detection import (
    detect_resource_conflicts,
    detect_timing_conflicts,
    detect_dependency_conflicts,
    detect_scheduling_conflicts,
    detect_communication_conflicts,
    detect_task_overlap_conflicts,
    detect_overdue_conflicts,  # <-- import the new function
    smart_suggestions
)
import uuid
from flask import Blueprint



# your routes here


conflicts_bp = Blueprint('conflicts', __name__, url_prefix='/api/conflicts')

@conflicts_bp.route('/detect', methods=['GET'])
def detect_conflicts():
    tasks = Task.query.all()
    if not tasks:
        return jsonify({'message': 'No tasks found to analyze conflicts.'}), 404

    # Run all conflict detection checks
    res_conflicts = detect_resource_conflicts(tasks)
    timing_conflicts = detect_timing_conflicts(tasks)
    dep_conflicts = detect_dependency_conflicts(tasks)
    sched_conflicts = detect_scheduling_conflicts(tasks)
    comm_conflicts = detect_communication_conflicts(tasks)
    overlap_conflicts = detect_task_overlap_conflicts(tasks)
    overdue_conflicts = detect_overdue_conflicts(tasks)  # <-- add overdue check

    all_conflicts = (
        res_conflicts
        + timing_conflicts
        + dep_conflicts
        + sched_conflicts
        + comm_conflicts
        + overlap_conflicts
        + overdue_conflicts  # <-- include in all conflicts
    )

    results = []
    for c in all_conflicts:
        # Dedup: check if identical conflict already exists (unresolved)
        existing = ConflictReport.query.filter_by(
            task_id=c['task_id'],
            conflict_type=c['conflict_type'],
            description=c['description']
        ).first()
        if existing:
            # Reuse existing record; don't create duplicate
            report = existing
        else:
            report = ConflictReport(
                id=str(uuid.uuid4()),
                task_id=c['task_id'],
                conflict_type=c['conflict_type'],
                description=c['description'],
                resolution_suggestion=c.get('resolution_suggestion')
            )
            db.session.add(report)

        results.append({
            'id': report.id,
            'task_id': report.task_id,
            'conflict_type': report.conflict_type,
            'description': report.description,
            'resolution_suggestion': report.resolution_suggestion,
            'suggested_actions': smart_suggestions(c),
            'duplicate': bool(existing)  # flag to indicate reused row
        })

    db.session.commit()
    return jsonify({'conflicts': results, 'deduplicated': True}), 200

# =============================
# Manual Conflict Reporting & Management
# =============================

@conflicts_bp.route('/', methods=['GET'], strict_slashes=False)
def list_conflicts():
    """Return all stored conflict reports (automatic + manually reported)."""
    conflicts = ConflictReport.query.order_by(ConflictReport.detected_on.desc()).all()
    return jsonify([
        {
            'id': c.id,
            'task_id': c.task_id,
            'conflict_type': c.conflict_type,
            'description': c.description,
            'resolution_suggestion': c.resolution_suggestion,
            'resolved': c.resolved,
            'reported_by': c.reported_by,
            'detected_on': c.detected_on.isoformat() if c.detected_on else None
        }
        for c in conflicts
    ]), 200

@conflicts_bp.route('/report', methods=['POST'])
def report_conflict():
    """Manually log a conflict by a team member or manager."""
    data = request.json or {}
    required = ['task_id', 'conflict_type', 'description']
    if any(k not in data or not data.get(k) for k in required):
        return jsonify({'message': 'Missing required fields', 'required': required}), 400

    # Validate task exists
    task = Task.query.get(data['task_id'])
    if not task:
        return jsonify({'message': f"Task {data['task_id']} not found"}), 404

    report = ConflictReport(
        id=str(uuid.uuid4()),
        task_id=data['task_id'],
        conflict_type=data['conflict_type'],
        description=data['description'],
        reported_by=data.get('reported_by')
    )
    db.session.add(report)
    db.session.commit()
    return jsonify({'id': report.id, 'message': 'Conflict reported successfully'}), 201

@conflicts_bp.route('/<id>/resolve', methods=['POST'])
def resolve_conflict(id):
    """Mark a conflict as resolved (idempotent)."""
    conflict = ConflictReport.query.get(id)
    if not conflict:
        return jsonify({'message': 'Conflict not found'}), 404
    data = request.json or {}
    conflict.resolved = data.get('resolved', True)
    db.session.commit()
    return jsonify({'message': 'Conflict resolved successfully'}), 200


@conflicts_bp.route('/deduplicate', methods=['POST'])
def deduplicate_conflicts():
    """Remove duplicate conflict rows (same task_id + conflict_type + description). Keeps earliest detected_on."""
    from sqlalchemy import and_
    conflicts = ConflictReport.query.all()
    seen = {}
    to_delete = []
    for c in conflicts:
        key = (c.task_id, c.conflict_type, c.description)
        if key not in seen:
            seen[key] = c
        else:
            # Keep the one with earliest detected_on
            keep = seen[key]
            if c.detected_on and keep.detected_on and c.detected_on < keep.detected_on:
                # swap: delete old keep, keep new c
                to_delete.append(keep)
                seen[key] = c
            else:
                to_delete.append(c)

    removed = 0
    for d in to_delete:
        db.session.delete(d)
        removed += 1
    if removed:
        db.session.commit()
    return jsonify({'removed': removed, 'total': len(conflicts), 'remaining': len(conflicts) - removed}), 200
