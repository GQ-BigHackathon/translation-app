import { NextApiRequest, NextApiResponse } from 'next';
import { encodePayload, getBCAuth, setSession } from '../../lib/auth';

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Authenticate the app on install
    const session = await getBCAuth(req.query);
    const encodedContext = encodePayload(session); // Signed JWT to validate/ prevent tampering

    console.log('session', session);

    //deposit script in script manager

    await fetch(`https://api.bigcommerce.com/stores/${session.context.replace('stores/', '')}/v3/content/scripts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': session.access_token,
      },
      body: JSON.stringify({
        name: 'TranslateApp Script',
        src: 'https://translation-cloud-functions.vercel.app/store/translateApp.js',
        auto_uninstall: true,
        load_method: 'async',
        location: 'footer',
        visibility: 'all_pages',
        kind: 'src',
        consent_category: 'essential',
        enabled: true,
        channel_id: 1,
      }),
    });

    await setSession(session);
    res.redirect(302, `/?context=${encodedContext}`);
  } catch (error) {
    const { message, response } = error;
    res.status(response?.status || 500).json({ message });
  }
}
