import json
import os
from datetime import datetime

TRACKER_FILE = os.path.join(os.path.dirname(__file__), 'task_doc_reconciliation.json')

def load_tracker():
    with open(TRACKER_FILE, 'r') as f:
        return json.load(f)

def print_summary(tracker):
    print(f"=== Project: {tracker['project']} ===")
    print(f"Last Reviewed: {tracker.get('last_reviewed', 'N/A')}")
    print(f"Next Review Due: {tracker.get('next_review_due', 'N/A')}")
    overdue = False
    if tracker.get('next_review_due'):
        due = datetime.strptime(tracker['next_review_due'], "%Y-%m-%d")
        if due < datetime.now():
            overdue = True
    if overdue:
        print("** WARNING: Review is overdue! **")
    print("\n---- Task Summary ----")
    for task in tracker['tasks']:
        print(f"[{task['status'].upper()}] {task['id']} - {task['title']}")
        doc_refs = ', '.join(task['doc_refs'])
        implemented_in = ', '.join(task.get('implemented_in', []))
        print(f"    Docs: {doc_refs}")
        print(f"    Files: {implemented_in if implemented_in else 'N/A'}")
        if task.get('discrepancies'):
            print(f"    !! Discrepancies: {', '.join(task['discrepancies'])}")
        print(f"    Notes: {task.get('notes', '')}")
    print("\n---- Discrepancy Summary ----")
    for msg in tracker.get('discrepancy_summary', []):
        print(f" * {msg}")
    print("\n---- Review Checklist ----")
    incomplete = [t for t in tracker['tasks'] if t['status'] != 'complete']
    if incomplete:
        print(f"Tasks in progress or pending: {len(incomplete)}")
        for task in incomplete:
            print(f"- {task['id']}: {task['title']} (Status: {task['status']})")
    else:
        print("All tasks complete!")

def main():
    if not os.path.exists(TRACKER_FILE):
        print(f"Task tracker not found at {TRACKER_FILE}")
        exit(1)
    tracker = load_tracker()
    print_summary(tracker)

if __name__ == "__main__":
    main()