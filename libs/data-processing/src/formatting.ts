import { format, formatDistance, parseISO, isValid } from 'date-fns';

const BYTES_IN_KB = 1024;
const BYTES_IN_MB = BYTES_IN_KB * 1024;
const BYTES_IN_GB = BYTES_IN_MB * 1024;
const SECONDS_IN_MINUTE = 60;
const SECONDS_IN_HOUR = SECONDS_IN_MINUTE * 60;

export function formatFileSize(bytes: number | null | undefined): string {
    if (bytes === null || bytes === undefined) return '-';
    if (bytes === 0) return '0 B';

    if (bytes >= BYTES_IN_GB) {
        return `${(bytes / BYTES_IN_GB).toFixed(2)} GB`;
    }
    if (bytes >= BYTES_IN_MB) {
        return `${(bytes / BYTES_IN_MB).toFixed(2)} MB`;
    }
    if (bytes >= BYTES_IN_KB) {
        return `${(bytes / BYTES_IN_KB).toFixed(2)} KB`;
    }
    return `${bytes} B`;
}

export function formatDuration(seconds: number | null | undefined): string {
    if (seconds === null || seconds === undefined) return '-';
    if (seconds === 0) return '0:00';

    const hours = Math.floor(seconds / SECONDS_IN_HOUR);
    const minutes = Math.floor((seconds % SECONDS_IN_HOUR) / SECONDS_IN_MINUTE);
    const secs = Math.floor(seconds % SECONDS_IN_MINUTE);

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function formatDate(dateString: string | null | undefined): string {
    if (!dateString) return '-';

    const date = parseISO(dateString);
    if (!isValid(date)) return '-';

    return format(date, 'dd MMM yyyy');
}

export function formatDateTime(dateString: string | null | undefined): string {
    if (!dateString) return '-';

    const date = parseISO(dateString);
    if (!isValid(date)) return '-';

    return format(date, 'dd MMM yyyy HH:mm');
}

export function formatRelativeTime(
    dateString: string | null | undefined
): string {
    if (!dateString) return '-';

    const date = parseISO(dateString);
    if (!isValid(date)) return '-';

    return formatDistance(date, new Date(), { addSuffix: true });
}

export function formatNumber(value: number | null | undefined): string {
    if (value === null || value === undefined) return '-';
    return new Intl.NumberFormat().format(value);
}

export function formatPercentage(
    value: number | null | undefined,
    decimals = 1
): string {
    if (value === null || value === undefined) return '-';
    return `${value.toFixed(decimals)}%`;
}

export function formatCompactNumber(value: number): string {
    if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
}

const COUNTRY_NAMES: Record<string, string> = {
    US: 'United States',
    GB: 'United Kingdom',
    DE: 'Germany',
    FR: 'France',
    ES: 'Spain',
    IT: 'Italy',
    CA: 'Canada',
    AU: 'Australia',
    NL: 'Netherlands',
    BE: 'Belgium',
    CH: 'Switzerland',
    AT: 'Austria',
    PL: 'Poland',
    SE: 'Sweden',
    NO: 'Norway',
    DK: 'Denmark',
    FI: 'Finland',
    IE: 'Ireland',
    PT: 'Portugal',
    CZ: 'Czech Republic',
    HU: 'Hungary',
    RO: 'Romania',
    GR: 'Greece',
    JP: 'Japan',
    CN: 'China',
    IN: 'India',
    BR: 'Brazil',
    MX: 'Mexico',
    AR: 'Argentina',
    CL: 'Chile',
    ZA: 'South Africa',
    RU: 'Russia',
    KR: 'South Korea',
    TW: 'Taiwan',
    SG: 'Singapore',
    HK: 'Hong Kong',
    NZ: 'New Zealand',
    IL: 'Israel',
    AE: 'United Arab Emirates',
    SA: 'Saudi Arabia',
    TH: 'Thailand',
    MY: 'Malaysia',
    PH: 'Philippines',
    ID: 'Indonesia',
    VN: 'Vietnam',
    TR: 'Turkey',
    EG: 'Egypt',
    UA: 'Ukraine',
    CO: 'Colombia',
    PE: 'Peru',
};

export function getCountryName(countryCode: string | null | undefined): string {
    if (!countryCode) return 'Unknown';
    return COUNTRY_NAMES[countryCode.toUpperCase()] || countryCode;
}
