
/**
 * Zoho CRM Integration Service (UK Data Centre)
 * Handles OAuth 2.0 flow and Lead/Contact synchronization.
 */

const ZOHO_CLIENT_ID = '1000.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'; // Placeholder
const ZOHO_REDIRECT_URI = window.location.origin + '/zoho_callback';
const ZOHO_AUTH_URL = 'https://accounts.zoho.eu/oauth/v2/auth';
const ZOHO_API_BASE = 'https://www.zohoapis.eu/crm/v2';

/**
 * Initiates the Zoho OAuth redirect.
 * Scopes: Leads.CREATE, Contacts.CREATE, Notes.CREATE to allow syncing recovery progress.
 */
export const initiateZohoAuth = () => {
  const scope = 'ZohoCRM.leads.CREATE,ZohoCRM.contacts.CREATE,ZohoCRM.notes.CREATE';
  const url = `${ZOHO_AUTH_URL}?scope=${scope}&client_id=${ZOHO_CLIENT_ID}&response_type=code&access_type=offline&redirect_uri=${ZOHO_REDIRECT_URI}&prompt=consent`;
  window.location.href = url;
};

/**
 * Synchronizes user data to Zoho CRM as a Lead or Contact.
 * This is a high-level abstraction for the professional uplink feature.
 */
export const syncToZoho = async (userData: any, recoveryData: any, tokens: { accessToken: string }) => {
  try {
    // 1. Check/Create Lead
    const response = await fetch(`${ZOHO_API_BASE}/Leads`, {
      method: 'POST',
      headers: {
        'Authorization': `Zoho-oauthtoken ${tokens.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: [{
          'Last_Name': userData.name.split(' ').pop() || 'Traveller',
          'First_Name': userData.name.split(' ')[0],
          'Email': userData.email,
          'Description': `Recovery Stage: ${recoveryData.phase}. Total Footsteps: ${recoveryData.footsteps}. Days Sober: ${recoveryData.daysSober}.`
        }]
      })
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Zoho Sync Error:', error);
    throw error;
  }
};

/**
 * Adds a professional note to a Zoho CRM record representing a milestone.
 */
export const addZohoRecoveryNote = async (recordId: string, noteContent: string, tokens: { accessToken: string }) => {
  try {
    const response = await fetch(`${ZOHO_API_BASE}/Notes`, {
      method: 'POST',
      headers: {
        'Authorization': `Zoho-oauthtoken ${tokens.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: [{
          'Parent_Id': recordId,
          'Se_module': 'Leads',
          'Note_Title': 'Recovery Milestone (Footpath)',
          'Note_Content': noteContent
        }]
      })
    });
    return await response.json();
  } catch (error) {
    console.error('Zoho Note Error:', error);
    throw error;
  }
};
