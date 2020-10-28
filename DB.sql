CREATE TABLE issues(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    issue_title TEXT NOT NULL,
    issue_text TEXT NOT NULL,
    created_by TEXT NOT NULL,
    assigned_to TEXT,
    status_text TEXT,
    created_on TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_on TEXT DEFAULT CURRENT_TIMESTAMP,
    open BOOLEAN
);