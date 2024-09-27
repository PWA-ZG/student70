import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { imageId, userId } = req.body;
    const user = await prisma.user.findUnique({ where: { auth0Id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const like = await prisma.like.create({
      data: {
        image: { connect: { id: imageId } },
        user: { connect: { id: user.id } },
      },
    });

    res.status(200).json(like);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
