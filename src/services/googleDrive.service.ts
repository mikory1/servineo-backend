import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

const auth = new google.auth.GoogleAuth({
  credentials: {
    type: 'service_account',
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_CLIENT_ID,
  },
  scopes: SCOPES,
});

const drive = google.drive({ version: 'v3', auth });

export interface UploadResult {
  fileId: string;
  webViewLink: string;
  directLink: string;
}

export async function uploadFileToDrive(
  buffer: Buffer,
  fileName: string,
  mimeType: string,
  folderId?: string
): Promise<UploadResult> {
  try {
    const fileMetadata: any = {
      name: fileName,
      parents: folderId ? [folderId] : undefined,
    };

    const media = {
      mimeType,
      body: require('stream').Readable.from(buffer),
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink',
    });

    const fileId = response.data.id!;

    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    const directLink = `https://drive.google.com/uc?export=view&id=${fileId}`;

    return {
      fileId,
      webViewLink: response.data.webViewLink || '',
      directLink,
    };
  } catch (error) {
    console.error('❌ Error uploading to Google Drive:', error);
    throw new Error('Failed to upload file to Google Drive');
  }
}

export async function deleteFileFromDrive(fileId: string): Promise<void> {
  try {
    await drive.files.delete({ fileId });
  } catch (error) {
    console.error('❌ Error deleting from Google Drive:', error);
    throw new Error('Failed to delete file from Google Drive');
  }
}

export function getDirectImageUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}
