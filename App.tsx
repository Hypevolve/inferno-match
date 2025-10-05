
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { UserProfile, Screen, FilterSettings } from './types';
import AgeGate from './components/AgeGate';
import ProfileCreator from './components/ProfileCreator';
import SwipeScreen from './components/SwipeScreen';
import ChatScreen from './components/ChatScreen';
import MatchesScreen from './components/MatchesScreen';
import UserProfileScreen from './components/UserProfileScreen';
import ItsAMatchScreen from './components/ItsAMatchScreen';
import VideoCallScreen from './components/VideoCallScreen';
import BottomNav from './components/BottomNav';
import LikesYouScreen from './components/LikesYouScreen';
import FilterScreen from './components/FilterScreen';
import ProductPlanScreen from './components/ProductPlanScreen';
import VerificationScreen from './components/VerificationScreen';
import SafetyCenterScreen from './components/SafetyCenterScreen';
import SpotlightScreen from './components/SpotlightScreen';
import { generateMatches } from './services/matchService';
import { haversineDistance } from './helpers/geolocation';

const App: React.FC = () => {
  const [isAgeVerified, setIsAgeVerified] = useState<boolean>(false);
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.AGE_GATE);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  const [matchQueue, setMatchQueue] = useState<UserProfile[]>([]);
  const [spotlightQueue, setSpotlightQueue] = useState<UserProfile[]>([]);
  const [isQueueLoading, setIsQueueLoading] = useState<boolean>(true);
  const [matches, setMatches] = useState<UserProfile[]>([]);
  const [likers, setLikers] = useState<UserProfile[]>([]);
  const [vaultRequests, setVaultRequests] = useState<UserProfile[]>([]);
  const [newLikesCount, setNewLikesCount] = useState<number>(0);
  
  const [activeChatMatch, setActiveChatMatch] = useState<UserProfile | null>(null);
  const [activeVideoCallMatch, setActiveVideoCallMatch] = useState<UserProfile | null>(null);
  const [pendingMatch, setPendingMatch] = useState<UserProfile | null>(null);
  const [lastMatchWasSuperLike, setLastMatchWasSuperLike] = useState<boolean>(false);

  const [lastPassedProfile, setLastPassedProfile] = useState<UserProfile | null>(null);
  const [isBoostActive, setIsBoostActive] = useState<boolean>(false);
  const [boostEndTime, setBoostEndTime] = useState<number | null>(null);

  const [filterSettings, setFilterSettings] = useState<FilterSettings>({
    ageRange: { min: 18, max: 99 },
    distance: 250, // 250km for 'Global'
    heightRange: { min: 120, max: 250 },
    relationshipTypes: [],
    lookingFor: [],
    kinks: [],
    roles: [],
    verifiedOnly: false,
    dealbreakers: { distance: false, ageRange: false, heightRange: false, relationshipTypes: false },
  });
  const [isIncognito, setIsIncognito] = useState<boolean>(false);

  const filteredMatchQueue = useMemo(() => {
    if (!userProfile) return [];
    return matchQueue.filter(profile => {
      const { ageRange, lookingFor, kinks, roles, verifiedOnly, distance, heightRange, relationshipTypes, dealbreakers } = filterSettings;
      
      if (profile.age < ageRange.min || profile.age > ageRange.max) {
        if (dealbreakers.ageRange) return false;
      }
      
      if (verifiedOnly && !profile.isVerified) return false;
      
      if (distance < 250) {
        const dist = haversineDistance(userProfile.location, profile.location);
        if (dist > distance) {
          if (dealbreakers.distance) return false;
        }
      }
      
      if (profile.height < heightRange.min || profile.height > heightRange.max) {
         if (dealbreakers.heightRange) return false;
      }

      if (relationshipTypes.length > 0 && !relationshipTypes.includes(profile.relationshipType)) {
        if (dealbreakers.relationshipTypes) return false;
      }

      if (lookingFor.length > 0 && !lookingFor.some(tag => profile.lookingFor.includes(tag))) return false;
      if (roles.length > 0 && !roles.some(role => profile.roles.includes(role))) return false;
      if (kinks.length > 0 && !kinks.some(kinkFilter => profile.kinks.some(k => k.name === kinkFilter))) return false;

      return true;
    });
  }, [matchQueue, filterSettings, userProfile]);
  
  const areFiltersActive = useMemo(() => {
    return (
      filterSettings.ageRange.min !== 18 || filterSettings.ageRange.max !== 99 ||
      filterSettings.distance !== 250 ||
      filterSettings.heightRange.min !== 120 || filterSettings.heightRange.max !== 250 ||
      filterSettings.relationshipTypes.length > 0 ||
      filterSettings.lookingFor.length > 0 || filterSettings.kinks.length > 0 ||
      filterSettings.roles.length > 0 || filterSettings.verifiedOnly
    );
  }, [filterSettings]);

  const loadMoreMatches = useCallback(() => {
    setIsQueueLoading(true);
    setTimeout(() => {
        const newProfiles = generateMatches(20);
        const newSpotlight = newProfiles.filter(p => p.isSpotlight);
        const newRegular = newProfiles.filter(p => !p.isSpotlight);
        
        setMatchQueue(prev => [...prev, ...newRegular]);
        setSpotlightQueue(prev => [...prev, ...newSpotlight]);

        setIsQueueLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    if (userProfile && matchQueue.length < 5) {
      loadMoreMatches();
    }
  }, [userProfile, matchQueue.length, loadMoreMatches]);

  useEffect(() => {
    if (!userProfile) return;
    const interval = setInterval(() => {
        if(Math.random() < 0.3) {
            const newLiker = generateMatches(1)[0];
            setLikers(prev => [newLiker, ...prev]);
            setNewLikesCount(prev => prev + 1);
        }
        // Simulate vault requests
        if(Math.random() < 0.15) {
          const newRequester = generateMatches(1)[0];
          setVaultRequests(prev => [newRequester, ...prev]);
        }
    }, 7000);
    return () => clearInterval(interval);
  }, [userProfile]);

  const handleAgeVerified = () => {
    setIsAgeVerified(true);
    setCurrentScreen(Screen.PROFILE_CREATOR);
  };

  const handleProfileCreated = (profile: UserProfile) => {
    setUserProfile({ ...profile, location: { lat: 37.7749, lon: -122.4194 } });
    setCurrentScreen(Screen.SWIPE);
  };
  
  const nextProfile = (queue: 'match' | 'spotlight', profileId: string) => {
    if (queue === 'match') {
      setIsQueueLoading(true);
      setMatchQueue(prev => prev.filter(p => p.id !== profileId));
      setTimeout(() => setIsQueueLoading(false), 300);
    } else {
      setSpotlightQueue(prev => prev.filter(p => p.id !== profileId));
    }
  };

  const handleLike = (likedProfile: UserProfile) => {
    if (Math.random() < 0.25) {
        setMatches(prev => [likedProfile, ...prev]);
        setPendingMatch(likedProfile);
        setLastMatchWasSuperLike(false);
    }
    nextProfile('match', likedProfile.id);
  };
  
  const handleSuperLike = (likedProfile: UserProfile) => {
    if (Math.random() < 0.75) {
        setMatches(prev => [likedProfile, ...prev]);
        setPendingMatch(likedProfile);
        setLastMatchWasSuperLike(true);
    }
    const queueType = likedProfile.isSpotlight ? 'spotlight' : 'match';
    nextProfile(queueType, likedProfile.id);
  };

  const handlePass = (passedProfile: UserProfile) => {
    setLastPassedProfile(passedProfile);
    const queueType = passedProfile.isSpotlight ? 'spotlight' : 'match';
    nextProfile(queueType, passedProfile.id);
  };

  const handleRewind = () => {
    if (lastPassedProfile && !lastPassedProfile.isSpotlight) {
      setMatchQueue(prev => [lastPassedProfile, ...prev]);
      setLastPassedProfile(null);
    }
  };
  
  const handleBoost = () => {
      setIsBoostActive(true);
      setBoostEndTime(Date.now() + 30 * 60 * 1000);
      setTimeout(() => setIsBoostActive(false), 30 * 60 * 1000);
  };
  
  const handleInstantMatch = (likerProfile: UserProfile) => {
      setMatches(prev => [likerProfile, ...prev]);
      setLikers(prev => prev.filter(p => p.id !== likerProfile.id));
      setPendingMatch(likerProfile);
      setLastMatchWasSuperLike(false);
      setCurrentScreen(Screen.SWIPE);
  };

  const handleRequestVaultAccess = (profileId: string) => {
    if (!userProfile) return;
    // In a real app, this would be a network request. Here, we just log it.
    console.log(`User ${userProfile.id} requested vault access for ${profileId}`);
    alert(`Vault access requested!`);
  };

  const handleGrantVaultAccess = (requesterId: string) => {
    if (!userProfile) return;
    // Add our user's ID to the requester's 'vaultAccessGrantedTo' list
    // This is a simulation. In a real app, you'd update a central DB.
    // For this demo, we'll update our local copies of the profiles.
    const updateUserInQueues = (profile: UserProfile) => {
      if (profile.id === requesterId) {
        return {
          ...profile,
          vaultAccessGrantedTo: [...profile.vaultAccessGrantedTo, userProfile.id]
        };
      }
      return profile;
    };
    setMatchQueue(prev => prev.map(updateUserInQueues));
    setSpotlightQueue(prev => prev.map(updateUserInQueues));
    setMatches(prev => prev.map(updateUserInQueues));
    setLikers(prev => prev.map(updateUserInQueues));
    setVaultRequests(prev => prev.filter(p => p.id !== requesterId));
  };


  const handleNavigate = (screen: Screen) => {
    if (screen === Screen.LIKES_YOU) setNewLikesCount(0);
    setCurrentScreen(screen);
  };

  const handleStartChat = (match: UserProfile) => {
    setActiveChatMatch(match);
    setCurrentScreen(Screen.CHAT);
  };
  
  const handleEndChat = () => {
      setActiveChatMatch(null);
      setCurrentScreen(Screen.MATCHES);
  }
  
  const handleStartVideoCall = () => {
      if(activeChatMatch){
          setActiveVideoCallMatch(activeChatMatch);
          setCurrentScreen(Screen.VIDEO_CALL);
      }
  }
  
  const handleEndVideoCall = () => {
      setActiveVideoCallMatch(null);
      setCurrentScreen(Screen.CHAT);
  }

  const handleEditProfile = () => setCurrentScreen(Screen.PROFILE_CREATOR);
  const handleStartVerification = () => setCurrentScreen(Screen.VERIFICATION);

  const handleVerificationComplete = () => {
      if(userProfile) setUserProfile({...userProfile, isVerified: true});
      setCurrentScreen(Screen.PROFILE);
  };

  const handleSaveFilters = (newSettings: FilterSettings) => {
    setFilterSettings(newSettings);
    setCurrentScreen(Screen.SWIPE);
  };
  
  const renderScreen = () => {
    if (!isAgeVerified) return <AgeGate onVerified={handleAgeVerified} />;
    
    switch (currentScreen) {
      case Screen.PROFILE_CREATOR: return <ProfileCreator onProfileCreated={handleProfileCreated} profileToEdit={userProfile} />;
      case Screen.SWIPE: return userProfile && <SwipeScreen 
            userProfile={userProfile}
            currentProfile={filteredMatchQueue[0]}
            isLoading={isQueueLoading && filteredMatchQueue.length === 0}
            onLike={handleLike} onPass={handlePass} onSuperLike={handleSuperLike} onRewind={handleRewind}
            canRewind={!!lastPassedProfile && !lastPassedProfile.isSpotlight}
            onBoost={handleBoost} isBoostActive={isBoostActive} boostEndTime={boostEndTime}
            onOpenFilters={() => setCurrentScreen(Screen.FILTER)} areFiltersActive={areFiltersActive}
            onRequestVaultAccess={handleRequestVaultAccess}
        />;
      case Screen.MATCHES: return <MatchesScreen matches={matches} onChat={handleStartChat} />;
      case Screen.PROFILE: return userProfile && <UserProfileScreen 
            userProfile={userProfile} onEditProfile={handleEditProfile} onVerifyProfile={handleStartVerification}
            onOpenSafetyCenter={() => setCurrentScreen(Screen.SAFETY_CENTER)} isIncognito={isIncognito}
            onToggleIncognito={() => setIsIncognito(p => !p)} onGoPremium={() => setCurrentScreen(Screen.PRODUCT_PLAN)}
        />;
      case Screen.CHAT: return userProfile && activeChatMatch && <ChatScreen 
            userProfile={userProfile} matchProfile={activeChatMatch} onEndChat={handleEndChat} onStartVideoCall={handleStartVideoCall}
        />;
      case Screen.VIDEO_CALL: return userProfile && activeVideoCallMatch && <VideoCallScreen
            userProfile={userProfile} matchProfile={activeVideoCallMatch} onEndCall={handleEndVideoCall}
        />;
      case Screen.LIKES_YOU: return <LikesYouScreen 
            likers={likers} vaultRequests={vaultRequests} onInstantMatch={handleInstantMatch}
            onGrantVaultAccess={handleGrantVaultAccess} onGoPremium={() => setCurrentScreen(Screen.PRODUCT_PLAN)} 
        />;
      case Screen.FILTER: return <FilterScreen currentSettings={filterSettings} onSave={handleSaveFilters} onBack={() => setCurrentScreen(Screen.SWIPE)} />;
      case Screen.PRODUCT_PLAN: return <ProductPlanScreen onBack={() => setCurrentScreen(Screen.PROFILE)} />;
      case Screen.VERIFICATION: return <VerificationScreen onComplete={handleVerificationComplete} onBack={() => setCurrentScreen(Screen.PROFILE)} />;
      case Screen.SAFETY_CENTER: return <SafetyCenterScreen onBack={() => setCurrentScreen(Screen.PROFILE)} />;
      case Screen.SPOTLIGHT: return userProfile && <SpotlightScreen 
            profiles={spotlightQueue} onSuperLike={handleSuperLike}
            onPass={handlePass} onRequestVaultAccess={handleRequestVaultAccess}
        />;
      default: return <ProfileCreator onProfileCreated={handleProfileCreated} profileToEdit={userProfile} />;
    }
  };
  
  const showNav = userProfile && [Screen.SWIPE, Screen.MATCHES, Screen.PROFILE, Screen.LIKES_YOU, Screen.SPOTLIGHT].includes(currentScreen);

  return (
    <div className="h-[100dvh] w-screen max-w-md mx-auto flex flex-col bg-brand-bg shadow-2xl overflow-hidden">
      <div className="flex-grow flex flex-col min-h-0">
        {renderScreen()}
      </div>
      {showNav && <BottomNav activeScreen={currentScreen} onNavigate={handleNavigate} newLikesCount={newLikesCount} />}
      {pendingMatch && userProfile && (
        <ItsAMatchScreen 
            userProfile={userProfile} matchProfile={pendingMatch} isSuperLike={lastMatchWasSuperLike}
            onSendMessage={() => { handleStartChat(pendingMatch); setPendingMatch(null); }}
            onKeepSwiping={() => setPendingMatch(null)}
        />
      )}
    </div>
  );
};

export default App;
