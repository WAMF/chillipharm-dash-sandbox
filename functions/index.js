import { onRequest } from 'firebase-functions/v2/https';
import pg from 'pg';
import cors from 'cors';
import 'dotenv/config';

const corsHandler = cors({ origin: true });

const COUNTRY_CODES = {
  'AF': 'Afghanistan', 'AL': 'Albania', 'DZ': 'Algeria', 'AD': 'Andorra', 'AO': 'Angola',
  'AR': 'Argentina', 'AM': 'Armenia', 'AU': 'Australia', 'AT': 'Austria', 'AZ': 'Azerbaijan',
  'BS': 'Bahamas', 'BH': 'Bahrain', 'BD': 'Bangladesh', 'BB': 'Barbados', 'BY': 'Belarus',
  'BE': 'Belgium', 'BZ': 'Belize', 'BJ': 'Benin', 'BT': 'Bhutan', 'BO': 'Bolivia',
  'BA': 'Bosnia and Herzegovina', 'BW': 'Botswana', 'BR': 'Brazil', 'BN': 'Brunei', 'BG': 'Bulgaria',
  'BF': 'Burkina Faso', 'BI': 'Burundi', 'KH': 'Cambodia', 'CM': 'Cameroon', 'CA': 'Canada',
  'CV': 'Cape Verde', 'CF': 'Central African Republic', 'TD': 'Chad', 'CL': 'Chile', 'CN': 'China',
  'CO': 'Colombia', 'KM': 'Comoros', 'CG': 'Congo', 'CR': 'Costa Rica', 'HR': 'Croatia',
  'CU': 'Cuba', 'CY': 'Cyprus', 'CZ': 'Czech Republic', 'DK': 'Denmark', 'DJ': 'Djibouti',
  'DM': 'Dominica', 'DO': 'Dominican Republic', 'EC': 'Ecuador', 'EG': 'Egypt', 'SV': 'El Salvador',
  'GQ': 'Equatorial Guinea', 'ER': 'Eritrea', 'EE': 'Estonia', 'ET': 'Ethiopia', 'FJ': 'Fiji',
  'FI': 'Finland', 'FR': 'France', 'GA': 'Gabon', 'GM': 'Gambia', 'GE': 'Georgia',
  'DE': 'Germany', 'GH': 'Ghana', 'GR': 'Greece', 'GD': 'Grenada', 'GT': 'Guatemala',
  'GN': 'Guinea', 'GW': 'Guinea-Bissau', 'GY': 'Guyana', 'HT': 'Haiti', 'HN': 'Honduras',
  'HK': 'Hong Kong', 'HU': 'Hungary', 'IS': 'Iceland', 'IN': 'India', 'ID': 'Indonesia',
  'IR': 'Iran', 'IQ': 'Iraq', 'IE': 'Ireland', 'IL': 'Israel', 'IT': 'Italy',
  'JM': 'Jamaica', 'JP': 'Japan', 'JO': 'Jordan', 'KZ': 'Kazakhstan', 'KE': 'Kenya',
  'KI': 'Kiribati', 'KP': 'North Korea', 'KR': 'South Korea', 'KW': 'Kuwait', 'KG': 'Kyrgyzstan',
  'LA': 'Laos', 'LV': 'Latvia', 'LB': 'Lebanon', 'LS': 'Lesotho', 'LR': 'Liberia',
  'LY': 'Libya', 'LI': 'Liechtenstein', 'LT': 'Lithuania', 'LU': 'Luxembourg', 'MO': 'Macau',
  'MK': 'North Macedonia', 'MG': 'Madagascar', 'MW': 'Malawi', 'MY': 'Malaysia', 'MV': 'Maldives',
  'ML': 'Mali', 'MT': 'Malta', 'MH': 'Marshall Islands', 'MR': 'Mauritania', 'MU': 'Mauritius',
  'MX': 'Mexico', 'FM': 'Micronesia', 'MD': 'Moldova', 'MC': 'Monaco', 'MN': 'Mongolia',
  'ME': 'Montenegro', 'MA': 'Morocco', 'MZ': 'Mozambique', 'MM': 'Myanmar', 'NA': 'Namibia',
  'NR': 'Nauru', 'NP': 'Nepal', 'NL': 'Netherlands', 'NZ': 'New Zealand', 'NI': 'Nicaragua',
  'NE': 'Niger', 'NG': 'Nigeria', 'NO': 'Norway', 'OM': 'Oman', 'PK': 'Pakistan',
  'PW': 'Palau', 'PS': 'Palestine', 'PA': 'Panama', 'PG': 'Papua New Guinea', 'PY': 'Paraguay',
  'PE': 'Peru', 'PH': 'Philippines', 'PL': 'Poland', 'PT': 'Portugal', 'QA': 'Qatar',
  'RO': 'Romania', 'RU': 'Russia', 'RW': 'Rwanda', 'KN': 'Saint Kitts and Nevis', 'LC': 'Saint Lucia',
  'VC': 'Saint Vincent and the Grenadines', 'WS': 'Samoa', 'SM': 'San Marino', 'ST': 'Sao Tome and Principe',
  'SA': 'Saudi Arabia', 'SN': 'Senegal', 'RS': 'Serbia', 'SC': 'Seychelles', 'SL': 'Sierra Leone',
  'SG': 'Singapore', 'SK': 'Slovakia', 'SI': 'Slovenia', 'SB': 'Solomon Islands', 'SO': 'Somalia',
  'ZA': 'South Africa', 'SS': 'South Sudan', 'ES': 'Spain', 'LK': 'Sri Lanka', 'SD': 'Sudan',
  'SR': 'Suriname', 'SZ': 'Eswatini', 'SE': 'Sweden', 'CH': 'Switzerland', 'SY': 'Syria',
  'TW': 'Taiwan', 'TJ': 'Tajikistan', 'TZ': 'Tanzania', 'TH': 'Thailand', 'TL': 'Timor-Leste',
  'TG': 'Togo', 'TO': 'Tonga', 'TT': 'Trinidad and Tobago', 'TN': 'Tunisia', 'TR': 'Turkey',
  'TM': 'Turkmenistan', 'TV': 'Tuvalu', 'UG': 'Uganda', 'UA': 'Ukraine', 'AE': 'United Arab Emirates',
  'GB': 'United Kingdom', 'US': 'United States', 'UY': 'Uruguay', 'UZ': 'Uzbekistan', 'VU': 'Vanuatu',
  'VA': 'Vatican City', 'VE': 'Venezuela', 'VN': 'Vietnam', 'YE': 'Yemen', 'ZM': 'Zambia',
  'ZW': 'Zimbabwe', 'GG': 'Guernsey', 'JE': 'Jersey', 'IM': 'Isle of Man', 'PR': 'Puerto Rico',
  'VI': 'US Virgin Islands', 'GU': 'Guam', 'AS': 'American Samoa'
};

function getCountryName(code) {
  if (!code) return 'Unknown';
  return COUNTRY_CODES[code.toUpperCase()] || code;
}

function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return '';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatFileSize(bytes) {
  if (!bytes || isNaN(bytes)) return '';
  const mb = bytes / (1024 * 1024);
  if (mb >= 1000) {
    return `${(mb / 1024).toFixed(2)} GB`;
  }
  return `${mb.toFixed(2)} MB`;
}

const ASSET_QUERY = `
  SELECT
    a.id as asset_id,
    a.filename as asset_title,
    a.filesize,
    a.created_at as upload_date,
    a.processed,
    a.media_info,
    a.s3_url as asset_link,
    a.account_id as trial_id,
    acc.trial_name,
    acc.company_name,
    tc.id as site_id,
    tc.name as site_name,
    tc.country_code,
    uploader.email as uploader_email,
    uploader.first_name as uploader_first_name,
    uploader.last_name as uploader_last_name,
    sp.id as study_procedure_id,
    sp.date as study_procedure_date,
    spd.display_name as study_procedure,
    se.display_name as study_event,
    sa.display_name as study_arm,
    ss.number as subject_number,
    evaluator.first_name as evaluator_first_name,
    evaluator.last_name as evaluator_last_name,
    ar.reviewed,
    ar.review_date as reviewed_date,
    reviewer.first_name as reviewer_first_name,
    reviewer.last_name as reviewer_last_name,
    (
      SELECT string_agg(c.comment, ' | ')
      FROM comments c
      WHERE c.asset_id = a.id AND c.deleted_at IS NULL
    ) as comments
  FROM assets a
  LEFT JOIN accounts acc ON a.account_id = acc.id
  LEFT JOIN trial_containers tc ON a.trial_container_id = tc.id AND tc.type = 'Site'
  LEFT JOIN users uploader ON a.uploader_id = uploader.id
  LEFT JOIN study_procedures sp ON a.study_procedure_id = sp.id
  LEFT JOIN study_procedure_definitions spd ON sp.study_procedure_definition_id = spd.id
  LEFT JOIN study_events se ON sp.study_event_id = se.id
  LEFT JOIN study_subjects ss ON se.study_subject_id = ss.id
  LEFT JOIN study_arms sa ON ss.study_arm_id = sa.id
  LEFT JOIN users evaluator ON sp.evaluator_id = evaluator.id
  LEFT JOIN asset_reviews ar ON ar.asset_id = a.id AND ar.deleted_at IS NULL
  LEFT JOIN users reviewer ON ar.user_id = reviewer.id
  WHERE a.soft_deleted_at IS NULL
  ORDER BY a.created_at DESC
`;

export const getAssets = onRequest(
  {
    cors: true,
    region: 'europe-west2',
    timeoutSeconds: 60,
    memory: '256MiB'
  },
  async (req, res) => {
    corsHandler(req, res, async () => {
      if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
      }

      const client = new pg.Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
      });

      try {
        await client.connect();

        const result = await client.query(ASSET_QUERY);

        const records = result.rows.map(row => {
          let duration = '';
          if (row.media_info && typeof row.media_info === 'object') {
            const durationSeconds = row.media_info.duration || row.media_info.Duration;
            if (durationSeconds) {
              duration = formatDuration(parseFloat(durationSeconds));
            }
          }

          return {
            trialName: row.trial_name || row.company_name || '',
            trialId: row.trial_id || 0,
            siteName: row.site_name || '',
            siteId: row.site_id || 0,
            siteCountry: getCountryName(row.country_code),
            subjectNumber: row.subject_number || '',
            studyArm: row.study_arm || '',
            studyEvent: row.study_event || '',
            studyProcedure: row.study_procedure || '',
            studyProcedureDate: row.study_procedure_date ? new Date(row.study_procedure_date).toISOString().split('T')[0] : '',
            evaluator: [row.evaluator_first_name, row.evaluator_last_name].filter(Boolean).join(' ') || '',
            assetId: row.asset_id || 0,
            assetTitle: row.asset_title || '',
            uploadDate: row.upload_date ? new Date(row.upload_date).toISOString() : '',
            uploadedBy: [row.uploader_first_name, row.uploader_last_name].filter(Boolean).join(' ') || row.uploader_email || '',
            containsPII: '',
            processed: row.processed ? 'Yes' : 'No',
            assetDuration: duration,
            reviewed: row.reviewed || false,
            comments: row.comments || '',
            reviewedBy: [row.reviewer_first_name, row.reviewer_last_name].filter(Boolean).join(' ') || '',
            reviewedDate: row.reviewed_date ? new Date(row.reviewed_date).toISOString().split('T')[0] : '',
            fileSize: formatFileSize(parseInt(row.filesize) || 0),
            assetLink: row.asset_link || ''
          };
        });

        res.status(200).json({
          success: true,
          count: records.length,
          data: records
        });

      } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to fetch data',
          message: error.message
        });
      } finally {
        await client.end();
      }
    });
  }
);

export const healthCheck = onRequest(
  { cors: true, region: 'europe-west2' },
  async (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  }
);
