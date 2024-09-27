import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const userId = req.query.userId as string;

    const images = await prisma.image.findMany({
      include: {
        likes: true,
        user: true, 
      },
    });

    const imagesWithLikes = images.map((image) => {
      const likesCount = image.likes.length;
      const likedByUser = image.likes.some((like) => like.userId === Number(userId));
      return {
        ...image,
        likesCount,
        likedByUser,
      };
    });

    res.status(200).json(imagesWithLikes);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
