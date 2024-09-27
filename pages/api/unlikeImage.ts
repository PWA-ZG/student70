import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'DELETE') {
    const { imageId, userId } = req.body;
    const user = await prisma.user.findUnique({ where: { auth0Id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await prisma.like.deleteMany({
      where: {
        imageId,
        userId: user.id,
      },
    });

    res.status(200).json({ message: 'Like removed' });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
