import { NextApiRequest, NextApiResponse } from 'next';
import { bigcommerceClient, getSession } from '../../../lib/auth';

export default async function getStoreInfo(req: NextApiRequest, res: NextApiResponse) {
    const {
        method,
    } = req;

    try {
        const { accessToken, storeHash } = await getSession(req);
        const bigcommerce = bigcommerceClient(accessToken, storeHash, 'v2');

        switch (method) {
            case 'GET': {
                const response = await bigcommerce.get(`/store`);
                res.status(200).json(response || {} );

                break;
            }
        
            default: {
                res.setHeader('Allow', ['GET']);
                res.status(405).end(`Method ${method} Not Allowed`);
            }
        }
        
    } catch (error) {
        const { message, response } = error;
        res.status(response?.status || 500).json({ message });
    }
}
