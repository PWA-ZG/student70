import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Only POST requests allowed' });
      }
    
      try {
        const { auth0Id, subscription } = req.body;
        const user = await prisma.user.update({
          where: { auth0Id: auth0Id },
          data: { name: JSON.stringify(subscription) },
        });
        res.status(200).json({ success: true, user });
      } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
      }
    }
