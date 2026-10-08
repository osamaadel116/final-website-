import { RsvpData, GuestWish } from '../types';

export interface DriveSpreadsheetItem {
  id: string;
  name: string;
  modifiedTime: string;
  webViewLink?: string;
}

export interface SheetMetadata {
  spreadsheetId: string;
  title: string;
  sheets: {
    sheetId: number;
    title: string;
  }[];
}

export interface SheetRsvpRecord {
  rowNumber: number;
  timestamp: string;
  guestName: string;
  attendance: 'attending' | 'declined';
  numberOfGuests: number;
  events: string;
  dietaryNotes: string;
  message: string;
}

export interface SheetRsvpStats {
  totalResponses: number;
  totalAttendingResponses: number;
  totalGuestsAttending: number;
  totalDeclined: number;
  records: SheetRsvpRecord[];
}

/**
 * List the user's spreadsheets from Google Drive.
 */
export async function listUserSpreadsheets(accessToken: string): Promise<DriveSpreadsheetItem[]> {
  const query = encodeURIComponent("mimeType='application/vnd.google-apps.spreadsheet' and trashed=false");
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,modifiedTime,webViewLink)&orderBy=modifiedTime desc&pageSize=30`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to list spreadsheets: ${errorText}`);
  }

  const data = await res.json();
  return data.files || [];
}

/**
 * Fetch spreadsheet metadata to get actual tab titles.
 * Avoid hardcoding sheet names like "Sheet1" per best practices!
 */
export async function getSpreadsheetMetadata(
  accessToken: string,
  spreadsheetId: string
): Promise<SheetMetadata> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=spreadsheetId,properties.title,sheets.properties(sheetId,title)`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to fetch spreadsheet details: ${errorText}`);
  }

  const data = await res.json();
  return {
    spreadsheetId: data.spreadsheetId,
    title: data.properties?.title || 'Wedding Spreadsheet',
    sheets: (data.sheets || []).map((s: any) => ({
      sheetId: s.properties?.sheetId,
      title: s.properties?.title,
    })),
  };
}

/**
 * Create a new Wedding Google Spreadsheet with "RSVPs" and "Wishes" tabs and headers.
 */
export async function createWeddingSpreadsheet(
  accessToken: string,
  title: string = 'Wedding RSVPs & Wishes'
): Promise<{ id: string; title: string; url: string }> {
  const createUrl = 'https://sheets.googleapis.com/v4/spreadsheets';

  const body = {
    properties: {
      title,
    },
    sheets: [
      {
        properties: {
          title: 'RSVPs',
          gridProperties: {
            frozenRowCount: 1,
          },
        },
      },
      {
        properties: {
          title: 'Wishes',
          gridProperties: {
            frozenRowCount: 1,
          },
        },
      },
    ],
  };

  const createRes = await fetch(createUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!createRes.ok) {
    const errorText = await createRes.text();
    throw new Error(`Failed to create spreadsheet: ${errorText}`);
  }

  const spreadsheet = await createRes.json();
  const spreadsheetId = spreadsheet.spreadsheetId;

  // Insert header columns into RSVPs tab (strictly the 3 requested columns)
  const rsvpHeaderUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/RSVPs!A1:C1?valueInputOption=USER_ENTERED`;
  await fetch(rsvpHeaderUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values: [
        [
          'Full Name',
          'Attendance Confirmation',
          'Number of Persons Attending',
        ],
      ],
    }),
  });

  // Insert header columns into Wishes tab
  const wishesHeaderUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Wishes!A1:F1?valueInputOption=USER_ENTERED`;
  await fetch(wishesHeaderUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values: [
        ['Timestamp', 'Sender Name', 'Relationship', 'Attendance', 'Message', 'Likes'],
      ],
    }),
  });

  return {
    id: spreadsheetId,
    title: spreadsheet.properties?.title || title,
    url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
  };
}

/**
 * Extract spreadsheet ID from a full Google Sheets URL or raw ID string.
 */
export function extractSpreadsheetId(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return trimmed;
}

/**
 * Initialize / ensure headers on row 1 of the permanent destination sheet:
 * [Full Name, Attendance Confirmation, Number of Persons Attending]
 */
export async function initializePermanentSheetHeaders(
  accessToken: string,
  spreadsheetId: string,
  sheetTitle: string = 'RSVPs'
): Promise<void> {
  const range = `${encodeURIComponent(sheetTitle)}!A1:C1`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values: [
        [
          'Full Name',
          'Attendance Confirmation',
          'Number of Persons Attending',
        ],
      ],
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to initialize headers: ${errorText}`);
  }
}

/**
 * Append an RSVP submission row to the selected sheet with strictly the 3 requested columns:
 * Column A: Full Name
 * Column B: Attendance Confirmation
 * Column C: Number of Persons Attending
 */
export async function appendRsvpRow(
  accessToken: string,
  spreadsheetId: string,
  sheetTitle: string,
  rsvp: {
    guestName: string;
    attendance: string;
    numberOfGuests: number;
  } | RsvpData
): Promise<void> {
  const range = `${encodeURIComponent(sheetTitle)}!A:C`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`;

  const isAttending = rsvp.attendance === 'attending' || rsvp.attendance === 'yes';
  const attendanceText = isAttending ? 'Joyfully Attending' : 'Regretfully Decline';
  const guestCount = isAttending ? Math.max(Number(rsvp.numberOfGuests) || 1, 1) : 0;

  const values = [
    [
      rsvp.guestName.trim(),
      attendanceText,
      guestCount,
    ],
  ];

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ values }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to append RSVP to Google Sheets: ${errorText}`);
  }
}

/**
 * Batch synchronize multiple RSVP records to the destination sheet.
 */
export async function syncAllRsvpsToSheet(
  accessToken: string,
  spreadsheetId: string,
  sheetTitle: string,
  records: {
    fullName: string;
    attendance: string;
    numberOfGuests: number;
  }[]
): Promise<number> {
  if (records.length === 0) return 0;
  const range = `${encodeURIComponent(sheetTitle)}!A:C`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`;

  const values = records.map((r) => {
    const isAttending = r.attendance === 'attending' || r.attendance === 'yes';
    return [
      r.fullName.trim(),
      isAttending ? 'Joyfully Attending' : 'Regretfully Decline',
      isAttending ? Math.max(Number(r.numberOfGuests) || 1, 1) : 0,
    ];
  });

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ values }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to sync records to Google Sheets: ${errorText}`);
  }

  return records.length;
}

/**
 * Append a guestbook wish to the Wishes sheet.
 */
export async function appendWishRow(
  accessToken: string,
  spreadsheetId: string,
  sheetTitle: string,
  wish: {
    senderName: string;
    relationship?: string;
    attendance?: string;
    message: string;
    likesCount?: number;
  }
): Promise<void> {
  const range = `${encodeURIComponent(sheetTitle)}!A:F`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`;

  const values = [
    [
      new Date().toLocaleString(),
      wish.senderName,
      wish.relationship || 'Guest',
      wish.attendance || 'attending',
      wish.message,
      wish.likesCount || 1,
    ],
  ];

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ values }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to append wish to Google Sheets: ${errorText}`);
  }
}

/**
 * Read RSVP rows from the sheet for live dashboard reporting.
 */
export async function readRsvpStats(
  accessToken: string,
  spreadsheetId: string,
  sheetTitle: string
): Promise<SheetRsvpStats> {
  const range = `${encodeURIComponent(sheetTitle)}!A:G`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to read RSVPs from sheet: ${errorText}`);
  }

  const data = await res.json();
  const rows: any[][] = data.values || [];

  if (rows.length <= 1) {
    return {
      totalResponses: 0,
      totalAttendingResponses: 0,
      totalGuestsAttending: 0,
      totalDeclined: 0,
      records: [],
    };
  }

  // Row 0 is header
  const dataRows = rows.slice(1);
  const records: SheetRsvpRecord[] = dataRows.map((row, idx) => {
    // Check if 3-column format: [Full Name, Attendance Confirmation, Number of Persons Attending]
    const colB = String(row[1] || '').toLowerCase();
    const isThreeCol =
      colB.includes('attend') ||
      colB.includes('decline') ||
      colB.includes('yes') ||
      colB.includes('no');

    const guestName = isThreeCol ? row[0] || 'Guest' : row[1] || 'Guest';
    const attendanceStr = String(isThreeCol ? row[1] || '' : row[2] || '').toLowerCase();
    const isAttending = attendanceStr.includes('attend') || attendanceStr.includes('yes');
    const guestNum = parseInt(isThreeCol ? row[2] || '1' : row[3] || '1', 10) || 1;
    const timestamp = isThreeCol ? 'Synced' : row[0] || '';

    return {
      rowNumber: idx + 2,
      timestamp,
      guestName,
      attendance: isAttending ? 'attending' : 'declined',
      numberOfGuests: isAttending ? guestNum : 0,
      events: '',
      dietaryNotes: '',
      message: '',
    };
  });

  const totalResponses = records.length;
  const totalAttendingResponses = records.filter((r) => r.attendance === 'attending').length;
  const totalGuestsAttending = records
    .filter((r) => r.attendance === 'attending')
    .reduce((sum, r) => sum + r.numberOfGuests, 0);
  const totalDeclined = records.filter((r) => r.attendance === 'declined').length;

  return {
    totalResponses,
    totalAttendingResponses,
    totalGuestsAttending,
    totalDeclined,
    records: records.reverse(), // Newest on top
  };
}

/**
 * Read wishes from the Wishes tab.
 */
export async function readWishesFromSheet(
  accessToken: string,
  spreadsheetId: string,
  sheetTitle: string
): Promise<GuestWish[]> {
  const range = `${encodeURIComponent(sheetTitle)}!A:F`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    return [];
  }

  const data = await res.json();
  const rows: any[][] = data.values || [];

  if (rows.length <= 1) return [];

  return rows.slice(1).map((row, idx) => ({
    id: `sheet-wish-${idx}`,
    timestamp: row[0] || 'Recently',
    senderName: row[1] || 'Guest',
    relationship: row[2] || 'Friend',
    attendance: (row[3] === 'attending' || row[3] === 'declined') ? row[3] : 'attending',
    message: row[4] || '',
    likesCount: parseInt(row[5] || '1', 10) || 1,
  }));
}

/**
 * Clear data rows in a sheet (keeping headers).
 * MANDATORY: Call this only after explicit user confirmation in UI!
 */
export async function clearSheetDataRows(
  accessToken: string,
  spreadsheetId: string,
  sheetTitle: string
): Promise<void> {
  const range = `${encodeURIComponent(sheetTitle)}!A2:Z1000`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:clear`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to clear sheet data: ${errorText}`);
  }
}
