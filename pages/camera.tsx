import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/CameraPage.module.css';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/router';
import { getSession } from '@auth0/nextjs-auth0';

interface CameraPageProps {
  auth0Id: string;
}

const CameraPage: React.FC<CameraPageProps> = ({ auth0Id }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const photoRef = useRef<HTMLImageElement>(null);
  const { user } = useUser();
  const router = useRouter();
  const [isPublished, setIsPublished] = useState(false);
  const [cameraAvailable, setCameraAvailable] = useState<boolean>(true);

  useEffect(() => {
    if (!auth0Id && navigator.onLine) {
      router.push('/'); 
    }

    navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    }).catch(() => {
      // Ako kamera nije dostupna
      setCameraAvailable(false);
    });
  }, [user, router]);

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        let video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          video.play();
        }
      })
      .catch(err => console.error("error:", err));
  };

  const takePhoto = () => {
    const video = videoRef.current;
    if (video) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (context) {
        const width = video.videoWidth;
        const height = video.videoHeight;
        canvas.width = width;
        canvas.height = height;
        context.drawImage(video, 0, 0, width, height);
        const imageData = canvas.toDataURL('image/png');
        setImageDataUrl(imageData);
        setIsPublished(false); 
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageDataUrl(reader.result as string);
        setIsPublished(false); 
      };
      reader.readAsDataURL(file);
    }
  };

  const goHome = async () => {
    router.push('/');
  }

  const publishPhoto = async () => {
    if (imageDataUrl && !isPublished && user) {
      setIsPublished(true); 
      try {
        const response = await fetch('/api/publishPhoto', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageDataUrl: imageDataUrl,
            userId: user.sub,
          }),
        });
        if (response.ok) {
          router.push('/');
        } else {
          console.error('Failed to publish photo');
          setIsPublished(false); 
        }
      } catch (error) {
        console.error('Error publishing photo:', error);
        setIsPublished(false); 
      }
    }
  };

  return (
    <div className={styles.background}>
    <div className={`${styles.cameraContainer} ${!cameraAvailable ? 'noCamera' : ''}`}>
        <h1 className={styles.homeHeading}>Objava fotografije</h1>
        <div className={styles.buttonContainer}>
          {cameraAvailable ? (
            <>
              <video ref={videoRef} className={styles.videoElement} autoPlay />
              <button onClick={takePhoto} className={styles.button}>Snimi Fotografiju</button>
              <label className={styles.button}>
                Odaberi datoteku
                <input type="file" accept="image/*" onChange={handleFileUpload} className={styles.hiddenInput} />
              </label>
            </>
          ) : (
            <>
              <label className={styles.button}>
                Odaberi datoteku
                <input type="file" accept="image/*" onChange={handleFileUpload} className={styles.hiddenInput} />
              </label>
            </>
          )}
          {imageDataUrl && !isPublished && user && (
            <button onClick={publishPhoto} className={styles.button}>Objavi</button>
          )}
          <button onClick={goHome} className={styles.button}>Nazad</button>
        </div>
        {imageDataUrl && (
          <img ref={photoRef} src={imageDataUrl} alt="Captured" className={styles.imageElement} />
        )}
      </div>
    </div>
  );
};

export default CameraPage;

export async function getServerSideProps(context: { req: any; res: any; }) {
  const session = await getSession(context.req, context.res);

  if (!session || !session.user) {
    return {
      redirect: {
        destination: '/api/auth/login',
        permanent: false,
      },
    };
  }

  return {
    props: {
      auth0Id: session.user.sub,
    },
  };
}