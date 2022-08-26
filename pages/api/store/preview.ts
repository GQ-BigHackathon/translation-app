import { NextApiRequest, NextApiResponse } from 'next';

export default async function getStoreInfo(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  try {
    switch (method) {
      case 'POST': {
        const url = req.body.storeUrl as string;
        const response = await fetch(url, { method: 'GET' }).then((res) => res.text());
        res.status(200).json(response || '');

        break;
      }

      default: {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${method} Not Allowed`);
      }
    }
  } catch (error) {
    const { message, response } = error;
    res.status(response?.status || 500).json({ message });
  }
}
