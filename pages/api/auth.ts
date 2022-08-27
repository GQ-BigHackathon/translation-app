import { NextApiRequest, NextApiResponse } from 'next';
import { encodePayload, getBCAuth, setSession } from '../../lib/auth';
import { bigcommerceClient } from '../../lib/auth';

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Authenticate the app on install
    const session = await getBCAuth(req.query);
    const encodedContext = encodePayload(session); // Signed JWT to validate/ prevent tampering

    const storehash = session.context.split('/')[1] as string;

    //deposit script in script manager
    await fetch(`https://api.bigcommerce.com/stores/${storehash}/v3/content/scripts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': session.access_token,
      },
      body: JSON.stringify({
        name: 'TranslateApp Helper',
        description: '',
        html: '<script>document.translationApp = { "storehash": "{{settings.store_hash}}" };</script>',
        auto_uninstall: true,
        location: 'head',
        load_method: 'default',
        visibility: 'all_pages',
        kind: 'SCRIPT_TAG',
        consent_category: 'essential',
        enabled: true,
        channel_id: 1,
      }),
    });

    await fetch(`https://api.bigcommerce.com/stores/${storehash}/v3/content/scripts`, {
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

    const storeInfo = await fetch(`https://api.bigcommerce.com/stores/${storehash}/v2/store`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': session.access_token,
        accept: 'application/json',
      },
    }).then((res) => res.json());

    const hostname = storeInfo.secure_url;

    const storeSetupResponse = await fetch(`https://translation-cloud-functions.vercel.app/store/setup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        storehash,
      },
      body: JSON.stringify({ storeSetupData: { hostname, status: 'active' } }),
    }).then((res) => res.json());

    console.log('storeSetupResponse', storeSetupResponse);

    res.redirect(302, `/?context=${encodedContext}`);
  } catch (error) {
    const { message, response } = error;
    res.status(response?.status || 500).json({ message });
  }
}
