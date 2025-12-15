import { HeadObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { fetchAuthSession } from 'aws-amplify/auth';
import log from 'electron-log';
import { UpdateClient } from 'main/sentient-sims/clients/UpdateClient';
import { appApiUrl } from 'main/sentient-sims/constants';
import { ModUpdate } from 'main/sentient-sims/services/UpdateService';

const updateClient = new UpdateClient(appApiUrl);

export async function isNewVersionAvailable(currentVersionId: string, type = 'main'): Promise<boolean> {
  log.debug(`current version: ${currentVersionId}`);
  try {
    const authSession = await fetchAuthSession();
    const client = new S3Client({
      region: 'us-east-1',
      credentials: authSession.credentials,
    });

    // Get the latest version ID of the object
    const headObjectCommand = new HeadObjectCommand({
      Bucket: 'sentient-sims-artifacts',
      Key: `sentient-sims-${type}.zip`,
    });

    const response = await client.send(headObjectCommand);

    // Compare the latest version ID with the version you have
    const latestVersionId = response?.Metadata?.version;
    log.debug(`latestVersionId: ${latestVersionId}`);
    const yourVersionId = currentVersionId;

    if (latestVersionId !== yourVersionId) {
      // A new version is available
      log.info(`New version available. Current: ${yourVersionId} Latest: ${latestVersionId}`);

      if (authSession.credentials) {
        const modUpdate: ModUpdate = {
          type,
          credentials: authSession.credentials,
        };
        try {
          await updateClient.updateMod(modUpdate);
          return false;
        } catch (err) {
          log.error(`Error installing update: ${JSON.stringify(err, null, 2)}`);
          alert(`Error installing update, make sure The Sims 4 is closed: ${JSON.stringify(err, null, 2)}`);
        }
      }

      return true;
    }

    // No new version is available
    return false;
  } catch (error) {
    // Handle error if the object doesn't exist or other issues occur
    log.error('Error checking for new version:', error);
    throw error;
  }
}
