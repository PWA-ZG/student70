import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { name, email, auth0Id } = req.body; 

    if (!auth0Id) {
      return res.status(400).json({ error: 'auth0Id is missing in the request body' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { auth0Id },
    });

    if (!existingUser) {
      const newUser = await prisma.user.create({
        data: {
          auth0Id,
          email
        },
      });
      return res.status(200).json(newUser);
    } else {
      return res.status(200).json(existingUser); 
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
