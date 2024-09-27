import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@auth0/nextjs-auth0/client';
import styles from '../styles/HomePage.module.css'; 

interface Image {
  id: number;
  data: string;
  likesCount: number;
  likedByUser: boolean;
}

const HomePage = () => {
  const { user } = useUser();
  const [images, setImages] = useState<Image[]>([]);

  useEffect(() => {
    fetch('/api/getImages')
      .then(response => response.json())
      .then(data => setImages(data))
      .catch(error => console.error('Error fetching images:', error));
  }, []);

  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
  
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
  

const subscribeToNotifications = async () => {
  if(user) {
    const sw = await navigator.serviceWorker.ready;
    if(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
      const convertedVapidKey = urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY);
      const subscription = await sw.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });
    
      await fetch('/api/subscribe', {
        method: 'POST',
        body: JSON.stringify({ auth0Id: user.sub, subscription }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
  }
};

  const addUserToDatabase = async () => {
    if (user) {
      const response = await fetch('/api/addUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auth0Id: user.sub,
          email: user.email,
          name: user.name,
        }),
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log(data);
      } else if (response.status === 409) {
        console.log('User already exists in the database');
      } else {
        console.error('Failed to add user to the database');
      }
    }
  };  

  const handleLike = async (imageId: number) => {
    if (user) {
      const response = await fetch('/api/likeImage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageId: imageId,
          userId: user.sub, 
        }),
      });

      if (response.ok) {
        setImages(prevImages => prevImages.map(image => {
          if (image.id === imageId) {
            return {
              ...image,
              likedByUser: true,
              likesCount: image.likesCount + 1,
            };
          }
          return image;
        }));
      } else {
        console.error('Failed to like the image');
      }
    }
  };

  const handleUnlike = async (imageId: number) => {
    if (user) {
      const response = await fetch('/api/unlikeImage', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageId: imageId,
          userId: user.sub, 
        }),
      });

      if (response.ok) {
        setImages(prevImages => prevImages.map(image => {
          if (image.id === imageId) {
            return {
              ...image,
              likedByUser: false,
              likesCount: image.likesCount - 1,
            };
          }
          return image;
        }));
      } else {
        console.error('Failed to unlike the image');
      }
    }
  };

  useEffect(() => {
    if (navigator.onLine) {
      addUserToDatabase();
    }
  }, [user]);

  return (
    <div className={styles.background}>
        <div className={styles.titleContainer}>
            Dobrodošli na početnu stranicu!
        </div>
        <div className={styles.topRightButtons}>
            {user ? (
                <>
                    <Link href="/camera">
                        <button className={styles.button}>Kamera</button>
                    </Link>
                    <button onClick={subscribeToNotifications} className={styles.button}>
                        Subscribe
                    </button>
                    <button onClick={() => window.location.href = '/api/auth/logout'} className={styles.button}>
                        Logout
                    </button>
                </>
            ) : (
                <button onClick={() => window.location.href = '/login'} className={styles.button}>
                    Login
                </button>
            )}
        </div>
        <div className={styles.container}>
        {images.map((image) => (
            <div key={image.id} className={styles.imageContainer}>
              <img src={`data:image/png;base64,${Buffer.from(image.data).toString('base64')}`} alt="Published" className={styles.imageElement} />
              {user && (
                <div className={styles.likeContainer}>
                  <button 
                    className={styles.likeButton} 
                    onClick={() => image.likedByUser ? handleUnlike(image.id) : handleLike(image.id)}>
                    {image.likedByUser ? 'Unlike' : 'Like'}
                  </button>
                  <span className={styles.likesCount}>{image.likesCount} likes</span>
                </div>
              )}
            </div>
          ))}
        </div>
    </div>
);

};

export default HomePage;