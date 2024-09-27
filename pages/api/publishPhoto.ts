import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';
import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:your-email@example.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { imageDataUrl, userId } = req.body;
  const imageBuffer = Buffer.from(imageDataUrl.split(',')[1], 'base64');

  try {
    const user = await prisma.user.findUnique({ where: { auth0Id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const newImage = await prisma.image.create({
      data: {
        data: imageBuffer,
        user: { connect: { id: user.id } },
      },
    });

    console.log("newImage:", newImage);

    if (newImage) {
      console.log("in if")
      sendPushNotifications();
    }

    return res.status(200).json(newImage);
  } catch (error: any) {
    console.error('Error saving image:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function sendPushNotifications() {
  const users = await prisma.user.findMany({
    where: {
      name: {
        not: null,
        notIn: [''] 
      }
    }
  });

  users.forEach(user => {
    try {
      if (user.name && isJSON(user.name)) {
        console.log("Uslo u if");
        const subscription = JSON.parse(user.name);
        const payload = JSON.stringify({
          title: 'Nova fotografija objavljena!',
          body: `Korisnik s emailom ${user.email} je objavio novu fotografiju`,
          icon: '/smiley_192x192.png',
          url: '/'
        });

        webpush.sendNotification(subscription, payload)
        .then((response: any) => {
          console.log('Notification sent successfully:', response);
        })
        .catch((error: any) => {
          console.error('Error sending notification:', error);
        });
      
      }
    } catch (parseError) {
      console.error('Error parsing subscription data:', parseError);
    }
  });
}

function isJSON(str: string) {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}
