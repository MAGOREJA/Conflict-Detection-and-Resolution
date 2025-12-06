# routes/reports.py
from flask import Blueprint, Response, send_file, make_response
from models import Task, ConflictReport
import csv, io
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend to avoid GUI warnings
import matplotlib.pyplot as plt
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.enums import TA_CENTER
from datetime import datetime

reports_bp = Blueprint('reports', __name__, url_prefix='/api/reports')


# -----------------------------
# CSV EXPORT
# -----------------------------
@reports_bp.route('/export/csv', methods=['GET'])
def export_csv():
    """
    Export all tasks and conflicts as CSV.
    """
    si = io.StringIO()
    cw = csv.writer(si)

    # CSV header
    cw.writerow([
        'Task ID', 'Title', 'Assigned To', 'Start Time', 'End Time', 'Status', 'Resource',
        'Conflict Type', 'Conflict Description', 'Detected On', 'Resolved', 'Resolution Suggestion', 'Reported By'
    ])

    tasks = Task.query.all()

    for t in tasks:
        conflicts = ConflictReport.query.filter_by(task_id=t.id).all()
        if conflicts:
            for c in conflicts:
                cw.writerow([
                    t.id,
                    t.title,
                    t.assigned_to,
                    t.start_time.strftime("%Y-%m-%d %H:%M") if t.start_time else '',
                    t.end_time.strftime("%Y-%m-%d %H:%M") if t.end_time else '',
                    t.status,
                    t.resource or '',
                    c.conflict_type,
                    c.description,
                    c.detected_on.strftime("%Y-%m-%d %H:%M") if c.detected_on else '',
                    str(c.resolved),
                    c.resolution_suggestion or '',
                    c.reported_by or ''
                ])
        else:
            # No conflicts → empty conflict columns
            cw.writerow([
                t.id,
                t.title,
                t.assigned_to,
                t.start_time.strftime("%Y-%m-%d %H:%M") if t.start_time else '',
                t.end_time.strftime("%Y-%m-%d %H:%M") if t.end_time else '',
                t.status,
                t.resource or '',
                '', '', '', '', '', ''
            ])

    # Add BOM for Excel compatibility
    output = '\ufeff' + si.getvalue()
    
    # Convert to bytes with UTF-8 encoding
    output_bytes = output.encode('utf-8-sig')

    return Response(
        output_bytes,
        mimetype='text/csv; charset=utf-8',
        headers={
            'Content-Disposition': 'attachment; filename=task_conflict_report.csv',
            'Content-Type': 'text/csv; charset=utf-8'
        }
    )


# -----------------------------
# PIE CHART EXPORT
# -----------------------------
@reports_bp.route('/export/pie', methods=['GET'])
def export_pie():
    """
    Export pie chart showing conflict types.
    """
    tasks = Task.query.all()
    conflict_types_count = {}

    for t in tasks:
        conflicts = ConflictReport.query.filter_by(task_id=t.id).all()
        for c in conflicts:
            conflict_types_count[c.conflict_type] = conflict_types_count.get(c.conflict_type, 0) + 1

    if not conflict_types_count:
        return {"error": "No conflicts to generate pie chart"}, 404

    # Generate pie chart in memory
    buf = io.BytesIO()
    plt.figure(figsize=(6,6))
    plt.pie(conflict_types_count.values(), labels=conflict_types_count.keys(), autopct='%1.1f%%', startangle=90)
    plt.title('Conflict Types Distribution')
    plt.tight_layout()
    plt.savefig(buf, format='png', bbox_inches='tight')
    plt.close()
    buf.seek(0)

    response = make_response(send_file(
        buf,
        mimetype='image/png',
        as_attachment=True,
        download_name='conflict_types_pie.png'
    ))
    response.headers['Content-Type'] = 'image/png'
    return response


# -----------------------------
# BAR CHART EXPORT
# -----------------------------
@reports_bp.route('/export/bar', methods=['GET'])
def export_bar():
    """
    Export bar chart showing number of conflicts per task.
    """
    tasks = Task.query.all()
    conflicts_per_task = {}

    for t in tasks:
        conflicts = ConflictReport.query.filter_by(task_id=t.id).all()
        if conflicts:
            conflicts_per_task[t.title] = len(conflicts)

    if not conflicts_per_task:
        return {"error": "No conflicts to generate bar chart"}, 404

    # Generate bar chart in memory
    buf = io.BytesIO()
    plt.figure(figsize=(10,6))
    plt.bar(conflicts_per_task.keys(), conflicts_per_task.values(), color='skyblue')
    plt.xticks(rotation=45, ha='right')
    plt.ylabel('Number of Conflicts')
    plt.title('Conflicts per Task')
    plt.tight_layout()
    plt.savefig(buf, format='png', bbox_inches='tight')
    plt.close()
    buf.seek(0)

    response = make_response(send_file(
        buf,
        mimetype='image/png',
        as_attachment=True,
        download_name='conflicts_per_task_bar.png'
    ))
    response.headers['Content-Type'] = 'image/png'
    return response


# -----------------------------
# PDF EXPORT - FULL REPORT
# -----------------------------
@reports_bp.route('/export/pdf', methods=['GET'])
def export_pdf():
    """
    Export comprehensive PDF report with tasks, conflicts, and charts.
    """
    # Create PDF in memory
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.5*inch)
    story = []
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#1e40af'),
        spaceAfter=30,
        alignment=TA_CENTER
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=colors.HexColor('#1e40af'),
        spaceAfter=12,
        spaceBefore=20
    )
    
    # Title
    story.append(Paragraph("Conflict Detection & Resolution Report", title_style))
    story.append(Paragraph(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", styles['Normal']))
    story.append(Spacer(1, 0.3*inch))
    
    # Get all tasks and conflicts
    tasks = Task.query.all()
    all_conflicts = ConflictReport.query.all()
    
    # Summary Statistics
    story.append(Paragraph("Summary Statistics", heading_style))
    summary_data = [
        ['Metric', 'Value'],
        ['Total Tasks', str(len(tasks))],
        ['Total Conflicts', str(len(all_conflicts))],
        ['Resolved Conflicts', str(sum(1 for c in all_conflicts if c.resolved))],
        ['Unresolved Conflicts', str(sum(1 for c in all_conflicts if not c.resolved))]
    ]
    
    summary_table = Table(summary_data, colWidths=[3*inch, 2*inch])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3b82f6')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    story.append(summary_table)
    story.append(Spacer(1, 0.3*inch))
    
    # Conflict Types Distribution
    conflict_types_count = {}
    for c in all_conflicts:
        conflict_types_count[c.conflict_type] = conflict_types_count.get(c.conflict_type, 0) + 1
    
    if conflict_types_count:
        story.append(Paragraph("Conflict Types Distribution", heading_style))
        conflict_data = [['Conflict Type', 'Count']]
        for conflict_type, count in conflict_types_count.items():
            conflict_data.append([conflict_type, str(count)])
        
        conflict_table = Table(conflict_data, colWidths=[3*inch, 2*inch])
        conflict_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#10b981')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.lightgrey),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        story.append(conflict_table)
        story.append(Spacer(1, 0.3*inch))
    
    # Detailed Task and Conflict Information
    story.append(Paragraph("Task & Conflict Details", heading_style))
    
    # Build detailed table
    detail_data = [['Task ID', 'Task Title', 'Status', 'Conflict Type', 'Resolved', 'Detected On']]
    
    for t in tasks:
        conflicts = ConflictReport.query.filter_by(task_id=t.id).all()
        if conflicts:
            for c in conflicts:
                detail_data.append([
                    str(t.id),
                    t.title[:30] + '...' if len(t.title) > 30 else t.title,
                    t.status,
                    c.conflict_type,
                    'Yes' if c.resolved else 'No',
                    c.detected_on.strftime('%Y-%m-%d') if c.detected_on else 'N/A'
                ])
        else:
            detail_data.append([
                str(t.id),
                t.title[:30] + '...' if len(t.title) > 30 else t.title,
                t.status,
                'No Conflicts',
                'N/A',
                'N/A'
            ])
    
    # Create table with appropriate column widths
    detail_table = Table(detail_data, colWidths=[0.8*inch, 2*inch, 0.8*inch, 1.2*inch, 0.8*inch, 1*inch])
    detail_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#8b5cf6')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('FONTSIZE', (0, 1), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey])
    ]))
    story.append(detail_table)
    
    # Build PDF
    doc.build(story)
    buf.seek(0)
    
    response = make_response(send_file(
        buf,
        mimetype='application/pdf',
        as_attachment=True,
        download_name='conflict_detection_full_report.pdf'
    ))
    response.headers['Content-Type'] = 'application/pdf'
    return response
