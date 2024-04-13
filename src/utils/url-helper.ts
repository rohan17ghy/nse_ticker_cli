//import open from 'open';
import {exec} from 'child_process';

export async function openInIncognito(url: string): Promise<void> {
    try {

        exec(`start chrome --incognito "${url}"`, (error) => {
            if (error) {
              console.error(`Error launching ${url} command: ${error}`);
              return;
            }
        });
        
        console.log(`Opened ${url} in incognito browser.`);
    } catch (error) {
        console.error(`Error opening ${url} in incognito browser:`, error);
    }
}
