



import React, { useState, useEffect, useRef, useMemo } from 'react';
import { UserProfile, Kink, ProfilePrompt, AudioPrompt } from '../types';
import { DEFAULT_PERSONA_BIO, LOOKING_FOR_OPTIONS, RELATIONSHIP_TYPE_OPTIONS } from '../constants';
import PersonaCustomizer from './PersonaCustomizer';
import { ChevronLeftIcon } from './Icons';
import { fileToDataUri, processImage } from '../helpers/imageProcessing';

interface ProfileCreatorProps {
  onProfileCreated: (profile: UserProfile) => void;
  profileToEdit: UserProfile | null;
  onBack?: () => void;
}

const TOTAL_STEPS = 5;

const ProfileCreator: React.FC<ProfileCreatorProps> = ({ onProfileCreated, profileToEdit, onBack }) => {
  const [step, setStep] = useState(1);

  const [name, setName] = useState('');
  const [age, setAge] = useState(25);
  const [bio, setBio] = useState('');
  const [height, setHeight] = useState(175);
  const [relationshipType, setRelationshipType] = useState(RELATIONSHIP_TYPE_OPTIONS[0]);
  const [selectedLookingFor, setSelectedLookingFor] = useState<string[]>([]);
  
  const [kinks, setKinks] = useState<Kink[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [textPrompts, setTextPrompts] = useState<ProfilePrompt[]>([]);
  const [audioPrompts, setAudioPrompts] = useState<AudioPrompt[]>([]);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = useMemo(() => !!profileToEdit, [profileToEdit]);

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
  
  const handleRemoveMedia = () => {
      // In edit mode, don't revert to default, revert to original profile pic
      if(isEditing && profileToEdit) {
          setImagePreview(profileToEdit.imageUrl);
          setVideoPreview(profileToEdit.videoUrl || null);
      } else {
          setImagePreview(`https://i.pravatar.cc/400?u=user-default`);
          setVideoPreview(null);
      }
      setSelectedFile(null);
      if(fileInputRef.current) fileInputRef.current.value = "";
  }

  const handleLookingForToggle = (tag: string) => {
    setSelectedLookingFor(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
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
      publicAlbum: profileToEdit?.publicAlbum.includes(imageUrl) ? profileToEdit.publicAlbum : [imageUrl, ...(profileToEdit?.publicAlbum || [])],
      privateVault: profileToEdit?.privateVault || [],
      vaultAccessRequestsFrom: profileToEdit?.vaultAccessRequestsFrom || [],
      vaultAccessGrantedTo: profileToEdit?.vaultAccessGrantedTo || [],
      videoUrl,
      textPrompts,
      audioPrompts,
      isVerified: profileToEdit?.isVerified || false,
      badges: profileToEdit?.badges || [],
      lastActive: Date.now(),
      location: profileToEdit?.location || { lat: 37.7749, lon: -122.4194 }
    };
    onProfileCreated(newProfile);
  };
  
  const nextStep = () => setStep(s => Math.min(s + 1, TOTAL_STEPS));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));
  
  const isProfileValid = useMemo(() => {
    return name.trim().length > 1 &&
           age >= 18 &&
           (imagePreview !== `https://i.pravatar.cc/400?u=user-default` && imagePreview !== null) &&
           bio.trim().length > 10 &&
           roles.length > 0 &&
           kinks.length > 0;
  }, [name, age, imagePreview, bio, roles, kinks]);

  const canGoNextOnboarding = useMemo(() => {
    switch(step) {
        case 1: return name.trim().length > 1 && age >= 18;
        case 2: return imagePreview !== `https://i.pravatar.cc/400?u=user-default` && imagePreview !== null;
        case 3: return bio.trim().length > 10;
        case 4: return roles.length > 0 && kinks.length > 0;
        case 5: return true;
        default: return false;
    }
  }, [step, name, age, imagePreview, bio, roles, kinks]);
  
    if(isEditing) {
        return (
            <div className="flex-grow flex flex-col h-full bg-brand-bg">
                <div className="p-4">
                    <div className="flex items-center justify-between mb-6 relative">
                        <button onClick={onBack} className="p-2 absolute left-0 -ml-2 text-brand-text-dark hover:text-white">
                            <ChevronLeftIcon className="h-6 w-6" />
                        </button>
                        <h1 className="text-2xl font-bold text-center w-full text-brand-text-light">Edit Profile</h1>
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto no-scrollbar px-4" style={{ scrollbarWidth: 'none' }}>
                    <div className="space-y-8">
                        {/* Basics */}
                         <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-center text-brand-text-dark">The Basics</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                <label htmlFor="name" className="block text-sm font-medium text-brand-text-light mb-1">Name</label>
                                <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="block w-full bg-brand-surface-light border-brand-surface rounded-md shadow-sm p-3 text-white" required/>
                                </div>
                                <div>
                                <label htmlFor="age" className="block text-sm font-medium text-brand-text-light mb-1">Age</label>
                                <input type="number" id="age" value={age} onChange={(e) => setAge(parseInt(e.target.value, 10))} className="block w-full bg-brand-surface-light border-brand-surface rounded-md shadow-sm p-3 text-white" min="18" max="99" required/>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                <label htmlFor="height" className="block text-sm font-medium text-brand-text-light mb-1">Height (cm)</label>
                                <input type="number" id="height" value={height} onChange={(e) => setHeight(parseInt(e.target.value, 10))} className="block w-full bg-brand-surface-light border-brand-surface rounded-md shadow-sm p-3 text-white" min="120" max="250" required/>
                                </div>
                                <div>
                                <label htmlFor="relationshipType" className="block text-sm font-medium text-brand-text-light mb-1">Relationship Type</label>
                                <select id="relationshipType" value={relationshipType} onChange={e => setRelationshipType(e.target.value)} className="block w-full bg-brand-surface-light border-brand-surface rounded-md shadow-sm p-3 text-white">
                                    {RELATIONSHIP_TYPE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                                </div>
                            </div>
                        </div>

                        {/* Media */}
                        <div className="space-y-6 text-center">
                            <h2 className="text-xl font-semibold text-brand-text-dark">Your Profile Media</h2>
                            <div className="flex justify-center">
                                <div className="relative w-64 h-64">
                                    {videoPreview ? (
                                        <video src={videoPreview} autoPlay muted loop playsInline className="w-full h-full rounded-2xl object-cover border-4 border-brand-primary" />
                                    ) : (
                                        <img src={imagePreview || ''} alt="Profile Preview" className="w-full h-full rounded-2xl object-cover border-4 border-brand-surface-light" />
                                    )}
                                    {isProcessing && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl">
                                            <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    )}
                                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,video/*" disabled={isProcessing}/>
                                </div>
                            </div>
                            <div className="flex gap-4 justify-center">
                                <button type="button" onClick={() => !isProcessing && fileInputRef.current?.click()} disabled={isProcessing} className="px-6 py-3 bg-brand-surface-light text-white font-bold rounded-lg transition-colors duration-300 hover:bg-brand-surface disabled:opacity-50">
                                    Change Photo/Video
                                </button>
                                <button type="button" onClick={handleRemoveMedia} disabled={isProcessing} className="px-6 py-3 bg-brand-surface-light text-brand-text-dark font-bold rounded-lg transition-colors duration-300 hover:bg-brand-surface disabled:opacity-50">
                                    Remove
                                </button>
                            </div>
                        </div>

                        {/* Bio & Vibe */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-center text-brand-text-dark">Craft Your Vibe</h2>
                            <div>
                                <label htmlFor="bio" className="block text-sm font-medium text-brand-text-light mb-1">Bio</label>
                                <textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={5} placeholder={DEFAULT_PERSONA_BIO} className="block w-full bg-brand-surface-light border-brand-surface rounded-md shadow-sm p-3 text-white" required/>
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
                        </div>

                        {/* Desires */}
                        <div>
                             <h2 className="text-xl font-semibold text-center text-brand-text-dark mb-4">Define Your Desires</h2>
                              <PersonaCustomizer 
                                kinks={kinks} setKinks={setKinks}
                                roles={roles} setRoles={setRoles}
                                textPrompts={textPrompts} setTextPrompts={setTextPrompts}
                                audioPrompts={audioPrompts} setAudioPrompts={setAudioPrompts}
                            />
                        </div>
                    </div>
                </div>

                <div className="p-4 mt-auto">
                    <button onClick={handleSubmit} disabled={isProcessing || !isProfileValid} className="w-full bg-brand-gradient text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 hover:shadow-lg disabled:opacity-75 disabled:cursor-wait">
                        {isProcessing ? 'Processing...' : 'Save Profile'}
                    </button>
                </div>
            </div>
        )
    }

  return (
    <div className="flex-grow flex flex-col p-4 bg-brand-bg overflow-y-auto no-scrollbar" style={{ scrollbarWidth: 'none' }}>
        <div className="mb-6">
             <div className="flex items-center gap-4">
                {step > 1 && (
                    <button onClick={prevStep} className="p-2 text-brand-text-dark hover:text-white">
                        <ChevronLeftIcon className="h-6 w-6"/>
                    </button>
                )}
                <div className="w-full bg-brand-surface-light rounded-full h-2.5">
                    <div className="bg-brand-primary h-2.5 rounded-full transition-all duration-500" style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}></div>
                </div>
            </div>
            <h1 className="text-2xl font-bold text-brand-text-light mt-4 text-center">Create Your Profile</h1>
        </div>
      
      <div className="flex-grow">
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
                <h2 className="text-xl font-semibold text-center text-brand-text-dark">The Basics</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-brand-text-light mb-1">Name</label>
                      <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="block w-full bg-brand-surface-light border-brand-surface rounded-md shadow-sm p-3 text-white" required/>
                    </div>
                    <div>
                      <label htmlFor="age" className="block text-sm font-medium text-brand-text-light mb-1">Age</label>
                      <input type="number" id="age" value={age} onChange={(e) => setAge(parseInt(e.target.value, 10))} className="block w-full bg-brand-surface-light border-brand-surface rounded-md shadow-sm p-3 text-white" min="18" max="99" required/>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="height" className="block text-sm font-medium text-brand-text-light mb-1">Height (cm)</label>
                      <input type="number" id="height" value={height} onChange={(e) => setHeight(parseInt(e.target.value, 10))} className="block w-full bg-brand-surface-light border-brand-surface rounded-md shadow-sm p-3 text-white" min="120" max="250" required/>
                    </div>
                     <div>
                      <label htmlFor="relationshipType" className="block text-sm font-medium text-brand-text-light mb-1">Relationship Type</label>
                      <select id="relationshipType" value={relationshipType} onChange={e => setRelationshipType(e.target.value)} className="block w-full bg-brand-surface-light border-brand-surface rounded-md shadow-sm p-3 text-white">
                        {RELATIONSHIP_TYPE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                </div>
            </div>
          )}
           {step === 2 && (
             <div className="space-y-6 text-center animate-fade-in">
                <h2 className="text-xl font-semibold text-brand-text-dark">Your Profile Media</h2>
                <p className="text-sm text-brand-text-dark">Add a photo or a video. A great first photo is key!</p>
                <div className="flex justify-center">
                    <div className="relative w-64 h-64">
                        {videoPreview ? (
                            <video src={videoPreview} autoPlay muted loop playsInline className="w-full h-full rounded-2xl object-cover border-4 border-brand-primary" />
                        ) : (
                            <img src={imagePreview || ''} alt="Profile Preview" className="w-full h-full rounded-2xl object-cover border-4 border-brand-surface-light" />
                        )}
                        {isProcessing && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl">
                                <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,video/*" disabled={isProcessing}/>
                    </div>
                </div>
                 <div className="flex gap-4 justify-center">
                    <button type="button" onClick={() => !isProcessing && fileInputRef.current?.click()} disabled={isProcessing} className="px-6 py-3 bg-brand-surface-light text-white font-bold rounded-lg transition-colors duration-300 hover:bg-brand-surface disabled:opacity-50">
                        Change Photo/Video
                    </button>
                    <button type="button" onClick={handleRemoveMedia} disabled={isProcessing} className="px-6 py-3 bg-brand-surface-light text-brand-text-dark font-bold rounded-lg transition-colors duration-300 hover:bg-brand-surface disabled:opacity-50">
                        Remove
                    </button>
                </div>
            </div>
          )}
          {step === 3 && (
             <div className="space-y-6 animate-fade-in">
                 <h2 className="text-xl font-semibold text-center text-brand-text-dark">Craft Your Vibe</h2>
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-brand-text-light mb-1">Bio</label>
                  <textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={5} placeholder={DEFAULT_PERSONA_BIO} className="block w-full bg-brand-surface-light border-brand-surface rounded-md shadow-sm p-3 text-white" required/>
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
            </div>
          )}
          {(step === 4 || step === 5) && (
              <div className="animate-fade-in">
                  <h2 className="text-xl font-semibold text-center text-brand-text-dark mb-4">Define Your Desires</h2>
                  <PersonaCustomizer 
                    kinks={kinks} setKinks={setKinks}
                    roles={roles} setRoles={setRoles}
                    textPrompts={textPrompts} setTextPrompts={setTextPrompts}
                    audioPrompts={audioPrompts} setAudioPrompts={setAudioPrompts}
                 />
              </div>
          )}
      </div>
      
      <div className="pt-4 pb-4 mt-auto">
          {step < TOTAL_STEPS ? (
            <button onClick={nextStep} disabled={!canGoNextOnboarding || isProcessing} className="w-full bg-brand-gradient text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 hover:shadow-lg disabled:opacity-50">
              Next
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={isProcessing || !isProfileValid} className="w-full bg-brand-gradient text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 hover:shadow-lg disabled:opacity-75 disabled:cursor-wait">
              {isProcessing ? 'Processing...' : 'Start Swiping'}
            </button>
          )}
        </div>
    </div>
  );
};

export default ProfileCreator;