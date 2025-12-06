# from datetime import datetime, timedelta

# def times_overlap(t1, t2):
#     return not (t1.end_time <= t2.start_time or t1.start_time >= t2.end_time)

# def detect_resource_conflicts(tasks):
#     conflicts = []
#     for i, t1 in enumerate(tasks):
#         for t2 in tasks[i+1:]:
#             if t1.resource and t1.resource == t2.resource and times_overlap(t1, t2):
#                 conflicts.append({
#                     'task_id': t1.id,
#                     'conflict_type': 'resource',
#                     'description': f'Resource {t1.resource} assigned to overlapping tasks ({t1.title} & {t2.title})',
#                     'other_task_id': t2.id,
#                     'other_task_title': t2.title,
#                     'resolution_suggestion': 'Reassign resource or adjust timeline'
#                 })
#     return conflicts

# def detect_dependency_conflicts(tasks):
#     conflicts = []
#     task_dict = {t.id: t for t in tasks}
#     for t in tasks:
#         for dep_id in t.dependencies or []:
#             dep_task = task_dict.get(dep_id)
#             if dep_task and t.start_time < dep_task.end_time:
#                 conflicts.append({
#                     'task_id': t.id,
#                     'conflict_type': 'dependency',
#                     'description': f'Task {t.title} starts before dependency {dep_task.title} ends',
#                     'resolution_suggestion': f'Reschedule to start after {dep_task.end_time.isoformat()}',
#                     'dependency_id': dep_id
#                 })
#     return conflicts

# # Simple rule-based suggestion generator for "AI-like" recommendations
# def smart_suggestions(conflict):
#     suggestions = []
#     ctype = conflict.get('conflict_type')
#     if ctype == 'resource':
#         other = conflict.get('other_task_title') or 'another task'
#         suggestions.append(f"Reassign resource from '{conflict.get('other_task_title')}' to an available resource.")
#         suggestions.append("Or delay one of the tasks by 2 hours to avoid overlap.")
#     elif ctype == 'dependency':
#         suggestions.append(conflict.get('resolution_suggestion') or 'Adjust schedule so dependency finishes first.')
#     else:
#         suggestions.append('Review task timings and resources.')
#     return suggestions


# from datetime import datetime, timedelta

# # ---------------------- Helper ----------------------
# def times_overlap(t1, t2):
#     """Check if two tasks overlap in time."""
#     return not (t1.end_time <= t2.start_time or t1.start_time >= t2.end_time)


# # ---------------------- Conflict Types ----------------------

# def detect_resource_conflicts(tasks):
#     """Detect conflicts when two tasks use the same resource simultaneously."""
#     conflicts = []
#     for i, t1 in enumerate(tasks):
#         for t2 in tasks[i + 1:]:
#             if t1.resource and t1.resource == t2.resource and times_overlap(t1, t2):
#                 conflicts.append({
#                     'task_id': t1.id,
#                     'conflict_type': 'resource',
#                     'description': f'Resource {t1.resource} assigned to overlapping tasks ({t1.title} & {t2.title})',
#                     'other_task_id': t2.id,
#                     'other_task_title': t2.title,
#                     'resolution_suggestion': 'Reassign resource or adjust timeline'
#                 })
#     return conflicts


# def detect_dependency_conflicts(tasks):
#     """Detect conflicts when a dependent task starts before its dependency ends."""
#     conflicts = []
#     task_dict = {t.id: t for t in tasks}
#     for t in tasks:
#         for dep_id in t.dependencies or []:
#             dep_task = task_dict.get(dep_id)
#             if dep_task and t.start_time < dep_task.end_time:
#                 conflicts.append({
#                     'task_id': t.id,
#                     'conflict_type': 'dependency',
#                     'description': f'Task {t.title} starts before dependency {dep_task.title} ends',
#                     'resolution_suggestion': f'Reschedule to start after {dep_task.end_time.isoformat()}',
#                     'dependency_id': dep_id
#                 })
#     return conflicts


# def detect_schedule_conflicts(tasks):
#     """Detect impossible scheduling (end before start or 0 duration)."""
#     conflicts = []
#     for t in tasks:
#         if t.end_time <= t.start_time:
#             conflicts.append({
#                 'task_id': t.id,
#                 'conflict_type': 'schedule',
#                 'description': f'Task {t.title} has invalid schedule (end time before start).',
#                 'resolution_suggestion': 'Adjust start and end time properly.'
#             })
#     return conflicts


# def detect_workload_conflicts(tasks):
#     """Detect if a single user is assigned overlapping tasks."""
#     conflicts = []
#     for i, t1 in enumerate(tasks):
#         for t2 in tasks[i + 1:]:
#             if t1.assigned_to == t2.assigned_to and times_overlap(t1, t2):
#                 conflicts.append({
#                     'task_id': t1.id,
#                     'conflict_type': 'workload',
#                     'description': f'User {t1.assigned_to} is double-booked ({t1.title} & {t2.title}).',
#                     'other_task_title': t2.title,
#                     'resolution_suggestion': 'Reassign one task or change timing.'
#                 })
#     return conflicts


# def detect_status_conflicts(tasks):
#     """Detect logical inconsistencies in task status."""
#     conflicts = []
#     for t in tasks:
#         if t.status == 'completed' and t.end_time > datetime.utcnow():
#             conflicts.append({
#                 'task_id': t.id,
#                 'conflict_type': 'status',
#                 'description': f'Task {t.title} marked completed but end time is in the future.',
#                 'resolution_suggestion': 'Update status or correct timeline.'
#             })
#         elif t.status == 'pending' and t.start_time < datetime.utcnow():
#             conflicts.append({
#                 'task_id': t.id,
#                 'conflict_type': 'status',
#                 'description': f'Task {t.title} still pending but should have started.',
#                 'resolution_suggestion': 'Update task status to in_progress or adjust start date.'
#             })
#     return conflicts


# def detect_priority_conflicts(tasks):
#     """Detect when lower-priority tasks block or delay high-priority ones."""
#     conflicts = []
#     for i, t1 in enumerate(tasks):
#         for t2 in tasks[i + 1:]:
#             if hasattr(t1, 'priority') and hasattr(t2, 'priority'):
#                 if t1.priority and t2.priority:
#                     # Low-priority task ends after high-priority starts
#                     if t1.priority > t2.priority and times_overlap(t1, t2):
#                         conflicts.append({
#                             'task_id': t1.id,
#                             'conflict_type': 'priority',
#                             'description': f'Lower-priority task {t1.title} overlaps high-priority {t2.title}.',
#                             'resolution_suggestion': 'Reorder schedule to prioritize high-priority tasks first.'
#                         })
#     return conflicts


# def detect_budget_conflicts(tasks):
#     """Detect tasks exceeding their individual or overall resource budget."""
#     conflicts = []
#     for t in tasks:
#         if hasattr(t, 'estimated_cost') and hasattr(t, 'budget'):
#             if t.estimated_cost and t.budget and t.estimated_cost > t.budget:
#                 conflicts.append({
#                     'task_id': t.id,
#                     'conflict_type': 'budget',
#                     'description': f'Task {t.title} exceeds its allocated budget.',
#                     'resolution_suggestion': 'Reduce resource usage or request additional funds.'
#                 })
#     return conflicts


# # ---------------------- Suggestion Generator ----------------------

# def smart_suggestions(conflict):
#     """Provide AI-like contextual suggestions for resolving conflicts."""
#     ctype = conflict.get('conflict_type')
#     suggestions = []

#     if ctype == 'resource':
#         suggestions.append("Reassign the resource to another available team member.")
#         suggestions.append("Delay one of the overlapping tasks to prevent conflict.")
#     elif ctype == 'dependency':
#         suggestions.append("Ensure dependent tasks start after prerequisite completion.")
#         suggestions.append(conflict.get('resolution_suggestion', 'Adjust dependency timings.'))
#     elif ctype == 'schedule':
#         suggestions.append("Correct invalid start or end times.")
#         suggestions.append("Use automated schedule validation before saving tasks.")
#     elif ctype == 'workload':
#         suggestions.append("Distribute workload evenly among available members.")
#         suggestions.append("Use capacity planning tools for resource allocation.")
#     elif ctype == 'status':
#         suggestions.append("Sync status updates with task timelines.")
#         suggestions.append("Regularly review progress reports for accuracy.")
#     elif ctype == 'priority':
#         suggestions.append("Adjust lower-priority task timing to avoid blocking critical ones.")
#         suggestions.append("Use a task prioritization matrix for better planning.")
#     elif ctype == 'budget':
#         suggestions.append("Optimize resources or request budget revision.")
#         suggestions.append("Review cost allocation strategy across tasks.")
#     else:
#         suggestions.append("Review task setup, resources, and schedule consistency.")
#         suggestions.append("Perform automated project consistency check.")

#     return suggestions






# from datetime import datetime

# def detect_resource_conflicts(tasks):
#     conflicts = []
#     resource_map = {}
#     for task in tasks:
#         if not task.assigned_to:
#             continue
#         if task.assigned_to not in resource_map:
#             resource_map[task.assigned_to] = []
#         else:
#             # Multiple tasks assigned to the same resource simultaneously
#             for other_task in resource_map[task.assigned_to]:
#                 if overlaps(task, other_task):
#                     conflicts.append({
#                         'task_id': task.id,
#                         'conflict_type': 'Resource Conflict',
#                         'description': f"Resource '{task.assigned_to}' assigned to multiple overlapping tasks.",
#                         'resolution_suggestion': 'Reassign resource or reschedule one of the tasks.'
#                     })
#             resource_map[task.assigned_to].append(task)
#     return conflicts


# def detect_timing_conflicts(tasks):
#     conflicts = []
#     for task in tasks:
#         if task.start_time and task.end_time and task.start_time > task.end_time:
#             conflicts.append({
#                 'task_id': task.id,
#                 'conflict_type': 'Timing Conflict',
#                 'description': 'Task start date is after its end date.',
#                 'resolution_suggestion': 'Adjust start or end date properly.'
#             })
#     return conflicts


# def detect_dependency_conflicts(tasks):
#     conflicts = []
#     for task in tasks:
#         if hasattr(task, 'depends_on') and task.depends_on:
#             dependency = next((t for t in tasks if t.id == task.depends_on), None)
#             if dependency and dependency.end_time and task.start_time and task.start_time < dependency.end_time:
#                 conflicts.append({
#                     'task_id': task.id,
#                     'conflict_type': 'Dependency Conflict',
#                     'description': f"Task '{task.title}' starts before its dependency '{dependency.name}' ends.",
#                     'resolution_suggestion': 'Adjust task scheduling to follow dependency order.'
#                 })
#     return conflicts


# def detect_scheduling_conflicts(tasks):
#     conflicts = []
#     for task in tasks:
#         if not task.start_time or not task.end_time:
#             conflicts.append({
#                 'task_id': task.id,
#                 'conflict_type': 'Scheduling Conflict',
#                 'description': 'Task missing start or end date.',
#                 'resolution_suggestion': 'Add missing schedule information.'
#             })
#     return conflicts


# def detect_communication_conflicts(tasks):
#     conflicts = []
#     for task in tasks:
#         if hasattr(task, 'team') and (not task.team or len(task.team.split(',')) == 0):
#             conflicts.append({
#                 'task_id': task.id,
#                 'conflict_type': 'Communication Conflict',
#                 'description': 'No team members assigned for communication.',
#                 'resolution_suggestion': 'Assign team members or communication leads.'
#             })
#     return conflicts


# def detect_task_overlap_conflicts(tasks):
#     conflicts = []
#     for i in range(len(tasks)):
#         for j in range(i + 1, len(tasks)):
#             t1, t2 = tasks[i], tasks[j]
#             if overlaps(t1, t2) and t1.assigned_to == t2.assigned_to:
#                 conflicts.append({
#                     'task_id': t1.id,
#                     'conflict_type': 'Task Overlap Conflict',
#                     'description': f"Tasks '{t1.title}' and '{t2.title}' overlap in schedule for the same person.",
#                     'resolution_suggestion': 'Stagger the overlapping tasks.'
#                 })
#     return conflicts


# def overlaps(t1, t2):
#     """Check if two tasks overlap based on start and end date."""
#     if not t1.start_time or not t1.end_time or not t2.start_time or not t2.end_time:
#         return False
#     return not (t1.end_time <= t2.start_time or t2.end_time <= t1.start_time)


# def smart_suggestions(conflict):
#     """Generate intelligent resolution suggestions."""
#     conflict_type = conflict.get('conflict_type', '')
#     suggestions = {
#         'Resource Conflict': [
#             'Assign a different resource.',
#             'Adjust one of the task timelines.',
#             'Balance workload among team members.'
#         ],
#         'Timing Conflict': [
#             'Ensure the start date precedes the end date.',
#             'Review project milestones for logical flow.'
#         ],
#         'Dependency Conflict': [
#             'Reorder dependent tasks.',
#             'Delay dependent task until predecessor completes.'
#         ],
#         'Scheduling Conflict': [
#             'Add or verify schedule details.',
#             'Use a project scheduling tool to visualize timelines.'
#         ],
#         'Communication Conflict': [
#             'Define team members and communication leads.',
#             'Schedule regular status meetings.'
#         ],
#         'Task Overlap Conflict': [
#             'Reschedule one task.',
#             'Assign overlapping tasks to different resources.'
#         ]
#     }
#     return suggestions.get(conflict_type, ['Review project plan for manual resolution.'])


from datetime import datetime

def detect_resource_conflicts(tasks):
    conflicts = []
    resource_map = {}
    for task in tasks:
        if not task.assigned_to:
            continue
        if task.assigned_to not in resource_map:
            resource_map[task.assigned_to] = []
        else:
            # Multiple tasks assigned to the same resource simultaneously
            for other_task in resource_map[task.assigned_to]:
                if overlaps(task, other_task):
                    conflicts.append({
                        'task_id': task.id,
                        'conflict_type': 'Resource Conflict',
                        'description': f"Resource '{task.assigned_to}' assigned to multiple overlapping tasks.",
                        'resolution_suggestion': 'Reassign resource or reschedule one of the tasks.'
                    })
            resource_map[task.assigned_to].append(task)
    return conflicts


def detect_timing_conflicts(tasks):
    conflicts = []
    for task in tasks:
        if task.start_time and task.end_time and task.start_time > task.end_time:
            conflicts.append({
                'task_id': task.id,
                'conflict_type': 'Timing Conflict',
                'description': 'Task start date is after its end date.',
                'resolution_suggestion': 'Adjust start or end date properly.'
            })
    return conflicts


def detect_dependency_conflicts(tasks):
    conflicts = []
    for task in tasks:
        if hasattr(task, 'depends_on') and task.depends_on:
            dependency = next((t for t in tasks if t.id == task.depends_on), None)
            if dependency and dependency.end_time and task.start_time and task.start_time < dependency.end_time:
                conflicts.append({
                    'task_id': task.id,
                    'conflict_type': 'Dependency Conflict',
                    'description': f"Task '{task.title}' starts before its dependency '{dependency.title}' ends.",
                    'resolution_suggestion': 'Adjust task scheduling to follow dependency order.'
                })
    return conflicts


def detect_scheduling_conflicts(tasks):
    conflicts = []
    for task in tasks:
        if not task.start_time or not task.end_time:
            conflicts.append({
                'task_id': task.id,
                'conflict_type': 'Scheduling Conflict',
                'description': 'Task missing start or end date.',
                'resolution_suggestion': 'Add missing schedule information.'
            })
    return conflicts


def detect_communication_conflicts(tasks):
    conflicts = []
    for task in tasks:
        if hasattr(task, 'team') and (not task.team or len(task.team.split(',')) == 0):
            conflicts.append({
                'task_id': task.id,
                'conflict_type': 'Communication Conflict',
                'description': 'No team members assigned for communication.',
                'resolution_suggestion': 'Assign team members or communication leads.'
            })
    return conflicts


def detect_task_overlap_conflicts(tasks):
    conflicts = []
    for i in range(len(tasks)):
        for j in range(i + 1, len(tasks)):
            t1, t2 = tasks[i], tasks[j]
            if overlaps(t1, t2) and t1.assigned_to == t2.assigned_to:
                conflicts.append({
                    'task_id': t1.id,
                    'conflict_type': 'Task Overlap Conflict',
                    'description': f"Tasks '{t1.title}' and '{t2.title}' overlap in schedule for the same person.",
                    'resolution_suggestion': 'Stagger the overlapping tasks.'
                })
    return conflicts


def detect_overdue_conflicts(tasks):
    """Detect tasks that are pending but past their end date."""
    conflicts = []
    now = datetime.now()
    for task in tasks:
        if task.status.lower() == 'pending' and task.end_time and task.end_time < now:
            conflicts.append({
                'task_id': task.id,
                'conflict_type': 'Overdue Task',
                'description': f"Task '{task.title}' is pending but its end date ({task.end_time.date()}) has already passed.",
                'resolution_suggestion': 'Update the task status or reschedule the task.'
            })
    return conflicts


def overlaps(t1, t2):
    """Check if two tasks overlap based on start and end date."""
    if not t1.start_time or not t1.end_time or not t2.start_time or not t2.end_time:
        return False
    return not (t1.end_time <= t2.start_time or t2.end_time <= t1.start_time)


def smart_suggestions(conflict):
    """Generate intelligent resolution suggestions."""
    conflict_type = conflict.get('conflict_type', '')
    suggestions = {
        'Resource Conflict': [
            'Assign a different resource.',
            'Adjust one of the task timelines.',
            'Balance workload among team members.'
        ],
        'Timing Conflict': [
            'Ensure the start date precedes the end date.',
            'Review project milestones for logical flow.'
        ],
        'Dependency Conflict': [
            'Reorder dependent tasks.',
            'Delay dependent task until predecessor completes.'
        ],
        'Scheduling Conflict': [
            'Add or verify schedule details.',
            'Use a project scheduling tool to visualize timelines.'
        ],
        'Communication Conflict': [
            'Define team members and communication leads.',
            'Schedule regular status meetings.'
        ],
        'Task Overlap Conflict': [
            'Reschedule one task.',
            'Assign overlapping tasks to different resources.'
        ],
        'Overdue Task': [
            'Reschedule the task to a future date.',
            'Update the task status if already completed.'
        ]
    }
    return suggestions.get(conflict_type, ['Review project plan for manual resolution.'])
