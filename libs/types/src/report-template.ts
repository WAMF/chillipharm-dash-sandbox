export type ReportRowEntity =
    | 'studyProcedure'
    | 'form'
    | 'actionRequired'
    | 'asset'
    | 'subject';

export interface ReportTemplate {
    id: string;
    name: string;
    description: string;
    rowEntity: ReportRowEntity;
    defaultColumns: string[];
    requiredFilters: string[];
    optionalFilters: string[];
}

export const REPORT_TEMPLATES: ReportTemplate[] = [
    {
        id: 'study-procedure-status',
        name: 'Study Procedure Status Report',
        description: 'One row per Study Procedure with task status and asset links',
        rowEntity: 'studyProcedure',
        defaultColumns: [
            'trialName',
            'siteName',
            'siteNumber',
            'siteCountry',
            'subjectNumber',
            'studyEventName',
            'studyEventArm',
            'studyEventStatus',
            'studyEventDate',
            'studyProcedureName',
            'studyProcedureDate',
            'studyProcedureStatus',
            'clinicalEvaluator',
        ],
        requiredFilters: ['trial'],
        optionalFilters: ['trialConfig', 'site', 'procedureStatus', 'taskStatus'],
    },
    {
        id: 'form-acknowledgement',
        name: 'Form Acknowledgement Report',
        description: 'One row per Form with acknowledgement status',
        rowEntity: 'form',
        defaultColumns: [
            'trialName',
            'siteName',
            'siteNumber',
            'siteCountry',
            'subjectNumber',
            'studyEventName',
            'studyEventArm',
            'studyEventStatus',
            'studyEventDate',
            'studyProcedureName',
            'studyProcedureDate',
            'studyProcedureStatus',
            'clinicalEvaluator',
            'formName',
            'formStatus',
        ],
        requiredFilters: ['trial', 'formTemplate'],
        optionalFilters: ['site', 'formStatus'],
    },
    {
        id: 'action-required',
        name: 'Action Required Report',
        description: 'One row per Action Required flag with resolution status',
        rowEntity: 'actionRequired',
        defaultColumns: [
            'trialName',
            'siteName',
            'siteNumber',
            'siteCountry',
            'subjectNumber',
            'studyEventName',
            'studyEventArm',
            'studyEventStatus',
            'studyEventDate',
            'studyProcedureName',
            'studyProcedureDate',
            'studyProcedureStatus',
            'clinicalEvaluator',
            'actionRequiredReason',
            'actionRequiredCreationDate',
            'actionRequiredCreator',
        ],
        requiredFilters: ['trial'],
        optionalFilters: ['trialConfig', 'studyProcedure', 'actionRequiredResolved'],
    },
    {
        id: 'asset-redaction',
        name: 'Asset Redaction Report',
        description: 'One row per Asset for redaction tracking',
        rowEntity: 'asset',
        defaultColumns: [
            'trialName',
            'siteName',
            'siteNumber',
            'siteCountry',
            'subjectNumber',
            'studyEventName',
            'studyEventArm',
            'studyEventStatus',
            'studyEventDate',
            'studyProcedureName',
            'studyProcedureDate',
            'studyProcedureStatus',
            'assetId',
            'assetUrl',
        ],
        requiredFilters: ['trial'],
        optionalFilters: ['taskStatus'],
    },
    {
        id: 'subject-enrolment',
        name: 'Subject Enrolment Report',
        description: 'One row per Subject with enrolment status',
        rowEntity: 'subject',
        defaultColumns: [
            'trialName',
            'siteName',
            'siteNumber',
            'siteCountry',
            'subjectNumber',
            'subjectStatus',
            'subjectStatusReason',
        ],
        requiredFilters: ['trial'],
        optionalFilters: ['timePeriod', 'site'],
    },
    {
        id: 'pii-status',
        name: 'PII Status Report',
        description: 'One row per Asset with PII detection status',
        rowEntity: 'asset',
        defaultColumns: [
            'trialName',
            'siteName',
            'siteNumber',
            'siteCountry',
            'assetId',
            'containsPii',
            'processed',
        ],
        requiredFilters: ['trial'],
        optionalFilters: ['timePeriod', 'site', 'piiStatus', 'processedStatus'],
    },
];

export const CUSTOM_REPORT_TEMPLATE: ReportTemplate = {
    id: 'custom',
    name: 'Custom Report',
    description: 'Build a custom report with flexible column and filter selection',
    rowEntity: 'asset',
    defaultColumns: [
        'siteName',
        'subjectNumber',
        'studyEvent',
        'studyProcedure',
        'assetTitle',
        'uploadDate',
        'processed',
    ],
    requiredFilters: [],
    optionalFilters: ['trial', 'site', 'country', 'dateRange', 'processedStatus'],
};
