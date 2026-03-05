CREATE TABLE IF NOT EXISTS report_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    base_template_id TEXT,
    row_entity TEXT NOT NULL,
    columns JSONB NOT NULL DEFAULT '[]',
    filters JSONB NOT NULL DEFAULT '{}',
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS email_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    emails JSONB NOT NULL DEFAULT '[]',
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS report_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    saved_template_id UUID NOT NULL REFERENCES report_templates(id) ON DELETE CASCADE,
    email_list_id UUID NOT NULL REFERENCES email_lists(id) ON DELETE CASCADE,
    cadence TEXT NOT NULL CHECK (cadence IN ('hourly', 'daily', 'weekly', 'monthly')),
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    last_run_at TIMESTAMPTZ,
    next_run_at TIMESTAMPTZ,
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_report_schedules_template ON report_schedules(saved_template_id);
CREATE INDEX IF NOT EXISTS idx_report_schedules_email_list ON report_schedules(email_list_id);
CREATE INDEX IF NOT EXISTS idx_report_schedules_enabled ON report_schedules(enabled) WHERE enabled = TRUE;
