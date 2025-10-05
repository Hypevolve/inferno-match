
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, Kink, ProfilePrompt, AudioPrompt } from '../types';
import { DEFAULT_PERSONA_BIO, LOOKING_FOR_OPTIONS, RELATIONSHIP_TYPE_OPTIONS } from '../constants';
import PersonaCustomizer from './PersonaCustomizer';

interface ProfileCreatorProps {
  onProfileCreated: (profile: UserProfile) => void;
  profileToEdit: UserProfile | null;
}

const fileToDataUri = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const processImage = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let { width, height } = img;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Could not get canvas context'));
        }
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const processedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(processedFile);
            } else {
              reject(new Error('Canvas to Blob conversion failed'));
            }
          },
          'image/jpeg',
          0.8
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};


const ProfileCreator: React.FC<ProfileCreatorProps> = ({ onProfileCreated, profileToEdit }) => {
  const [name, setName] = useState('You');
  const [age, setAge] = useState(25);
  const [bio, setBio] = useState(DEFAULT_PERSONA_BIO);
  const [height, setHeight] = useState(175);
  const [relationshipType, setRelationshipType] = useState(RELATIONSHIP_TYPE_OPTIONS[0]);
  const [selectedLookingFor, setSelectedLookingFor] = useState<string[]>(['#Casual']);
  
  const [kinks, setKinks] = useState<Kink[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [textPrompts, setTextPrompts] = useState<ProfilePrompt[]>([]);
  const [audioPrompts, setAudioPrompts] = useState<AudioPrompt[]>([]);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profileToEdit) {
      setName(profileToEdit.name);
      setAge(profileToEdit.age);
      setBio(profileToEdit.bio);
      setHeight(profileToEdit.height);
      setRelationshipType(profileToEdit.relationshipType);
      setSelectedLookingFor(profileToEdit.lookingFor);
      setImagePreview(profileToEdit.imageUrl);
      setVideoPreview(profileToEdit.videoUrl || null);
      setKinks(profileToEdit.kinks);
      setRoles(profileToEdit.roles);
      setTextPrompts(profileToEdit.textPrompts);
      setAudioPrompts(profileToEdit.audioPrompts);
    } else {
      setImagePreview(`https://i.pravatar.cc/400?u=user-default`);
    }
  }, [profileToEdit]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      try {
        if (file.type.startsWith('image/')) {
            const processedFile = await processImage(file);
            setSelectedFile(processedFile);
            const previewUrl = URL.createObjectURL(processedFile);
            setImagePreview(previewUrl);
            setVideoPreview(null);
        } else if (file.type.startsWith('video/')) {
            setSelectedFile(file);
            const previewUrl = URL.createObjectURL(file);
            setVideoPreview(previewUrl);
            const canvas = document.createElement('canvas');
            const video = document.createElement('video');
            video.src = previewUrl;
            video.onloadeddata = () => {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                canvas.getContext('2d')?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                setImagePreview(canvas.toDataURL('image/jpeg'));
            }
        } else {
            alert("Unsupported file type. Please upload an image or video.");
        }
      } catch (error) {
        console.error("Error processing file:", error);
        alert("There was an error processing your file. Please try another one.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleLookingForToggle = (tag: string) => {
    setSelectedLookingFor(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePreview) {
        alert("Please select a profile picture.");
        return;
    }
    
    let imageUrl = profileToEdit?.imageUrl || `https://i.pravatar.cc/400?u=user-${Date.now()}`;
    let videoUrl = profileToEdit?.videoUrl;

    if (selectedFile) {
        const dataUri = await fileToDataUri(selectedFile);
        if (selectedFile.type.startsWith('video/')) {
            videoUrl = dataUri;
            imageUrl = imagePreview;
        } else {
            imageUrl = dataUri;
            videoUrl = undefined;
        }
    }

    const newProfile: UserProfile = {
      id: profileToEdit?.id || `user-${Date.now()}`,
      name,
      age,
      bio,
      height,
      relationshipType,
      kinks,
      roles,
      lookingFor: selectedLookingFor,
      imageUrl,
      videoUrl,
      textPrompts,
      audioPrompts,
      isVerified: profileToEdit?.isVerified || false,
      badges: profileToEdit?.badges || [],
      lastActive: Date.now(),
      location: profileToEdit?.location || { lat: 37.7749, lon: -122.4194 } // Default location
    };
    onProfileCreated(newProfile);
  };

  return (
    <div className="flex-grow flex flex-col p-4 bg-brand-bg overflow-y-auto no-scrollbar" style={{ scrollbarWidth: 'none' }}>
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-brand-text-light">{profileToEdit ? 'Edit Your Profile' : 'Create Your Profile'}</h1>
        <p className="text-brand-text-dark">This is how you'll appear to your matches.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center">
            <div className="relative">
                {videoPreview ? (
                    <video src={videoPreview} autoPlay muted loop playsInline className="w-32 h-32 rounded-full object-cover border-4 border-brand-primary" />
                ) : (
                    <img src={imagePreview || ''} alt="Profile Preview" className="w-32 h-32 rounded-full object-cover border-4 border-brand-surface-light" />
                )}

                 {isProcessing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                        <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,video/*" disabled={isProcessing}/>
                 <button type="button" onClick={() => !isProcessing && fileInputRef.current?.click()} disabled={isProcessing} className="absolute bottom-0 right-0 bg-brand-primary p-2 rounded-full text-white hover:bg-brand-accent-hover disabled:opacity-50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                </button>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-brand-text-light mb-1">Name</label>
              <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="block w-full bg-brand-surface-light border-brand-surface rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm p-3 text-white" required/>
            </div>
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-brand-text-light mb-1">Age</label>
              <input type="number" id="age" value={age} onChange={(e) => setAge(parseInt(e.target.value, 10))} className="block w-full bg-brand-surface-light border-brand-surface rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm p-3 text-white" min="18" max="99" required/>
            </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="height" className="block text-sm font-medium text-brand-text-light mb-1">Height (cm)</label>
              <input type="number" id="height" value={height} onChange={(e) => setHeight(parseInt(e.target.value, 10))} className="block w-full bg-brand-surface-light border-brand-surface rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm p-3 text-white" min="120" max="250" required/>
            </div>
             <div>
              <label htmlFor="relationshipType" className="block text-sm font-medium text-brand-text-light mb-1">Relationship Type</label>
              <select id="relationshipType" value={relationshipType} onChange={e => setRelationshipType(e.target.value)} className="block w-full bg-brand-surface-light border-brand-surface rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm p-3 text-white">
                {RELATIONSHIP_TYPE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-brand-text-light mb-1">Bio</label>
          <textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={4} className="block w-full bg-brand-surface-light border-brand-surface rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm p-3 text-white" required/>
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-text-light mb-2">I'm looking for...</label>
          <div className="flex flex-wrap gap-2">
            {LOOKING_FOR_OPTIONS.map(tag => (
              <button type="button" key={tag} onClick={() => handleLookingForToggle(tag)}
                className={`px-3 py-1.5 text-sm rounded-full transition-all duration-200 font-semibold ${selectedLookingFor.includes(tag) ? 'bg-brand-gradient text-white shadow-md' : 'bg-brand-surface-light text-brand-text-dark hover:bg-brand-surface'}`}>
                {tag}
              </button>
            ))}
          </div>
        </div>
        
        <PersonaCustomizer 
            kinks={kinks} setKinks={setKinks}
            roles={roles} setRoles={setRoles}
            textPrompts={textPrompts} setTextPrompts={setTextPrompts}
            audioPrompts={audioPrompts} setAudioPrompts={setAudioPrompts}
        />
        
        <div className="pt-4 pb-4">
            <button type="submit" disabled={isProcessing} className="w-full bg-brand-gradient text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 hover:shadow-lg disabled:opacity-75 disabled:cursor-wait">
              {isProcessing ? 'Processing...' : (profileToEdit ? 'Save Profile' : 'Start Swiping')}
            </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileCreator;
