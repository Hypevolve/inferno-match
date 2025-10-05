



import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { UserProfile, Screen, FilterSettings } from './types';
import AgeGate from './components/AgeGate';
import OnboardingWelcomeScreen from './components/OnboardingWelcomeScreen';
import ProfileCreator from './components/ProfileCreator';
import SwipeScreen from './components/SwipeScreen';
import ChatScreen from './components/ChatScreen';
import MatchesScreen from './components/MatchesScreen';
import UserProfileScreen from './components/UserProfileScreen';
import ItsAMatchScreen from './components/ItsAMatchScreen';
import VideoCallScreen from './components/VideoCallScreen';
import BottomNav from './components/BottomNav';
import SideNav from './components/SideNav';
import LikesYouScreen from './components/LikesYouScreen';
import FilterScreen from './components/FilterScreen';
import ProductPlanScreen from './components/ProductPlanScreen';
import VerificationScreen from './components/VerificationScreen';
import SafetyCenterScreen from './components/SafetyCenterScreen';
import SpotlightScreen from './components/SpotlightScreen';
import { generateMatches } from './services/matchService';
import { haversineDistance } from './helpers/geolocation';
import { MatchesIcon } from './components/Icons';

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

  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        if(Math.random() < 0.15) {
          const newRequester = generateMatches(1)[0];
          setVaultRequests(prev => [newRequester, ...prev]);
        }
    }, 7000);
    return () => clearInterval(interval);
  }, [userProfile]);

  const handleAgeVerified = () => {
    setIsAgeVerified(true);
    setCurrentScreen(Screen.ONBOARDING_WELCOME);
  };
  
  const handleStartOnboarding = () => {
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
    console.log(`User ${userProfile.id} requested vault access for ${profileId}`);
    alert(`Vault access requested!`);
  };

  const handleGrantVaultAccess = (requesterId: string) => {
    if (!userProfile) return;
    const updateUserInQueues = (profile: UserProfile) => {
      if (profile.id === requesterId) {
        return { ...profile, vaultAccessGrantedTo: [...profile.vaultAccessGrantedTo, userProfile.id] };
      }
      return profile;
    };
    setMatchQueue(prev => prev.map(updateUserInQueues));
    setSpotlightQueue(prev => prev.map(updateUserInQueues));
    setMatches(prev => prev.map(updateUserInQueues));
    setLikers(prev => prev.map(updateUserInQueues));
    setVaultRequests(prev => prev.filter(p => p.id !== requesterId));
  };

  const handleLogout = () => {
    setUserProfile(null);
    setMatches([]);
    setLikers([]);
    setMatchQueue([]);
    setCurrentScreen(Screen.ONBOARDING_WELCOME);
  };
  
  const handleAddMedia = (album: 'public' | 'private', dataUri: string) => {
      if (!userProfile) return;
      if (album === 'public') {
          setUserProfile(prev => prev ? ({ ...prev, publicAlbum: [...prev.publicAlbum, dataUri] }) : null);
      } else {
          setUserProfile(prev => prev ? ({ ...prev, privateVault: [...prev.privateVault, dataUri] }) : null);
      }
  };

  const handleRemoveMedia = (album: 'public' | 'private', urlToRemove: string) => {
      if (!userProfile) return;
      if (album === 'public') {
          if (userProfile.imageUrl === urlToRemove) {
              alert("You can't remove your main profile picture. You can change it by editing your profile.");
              return;
          }
          setUserProfile(prev => prev ? ({ ...prev, publicAlbum: prev.publicAlbum.filter(url => url !== urlToRemove) }) : null);
      } else {
           setUserProfile(prev => prev ? ({ ...prev, privateVault: prev.privateVault.filter(url => url !== urlToRemove) }) : null);
      }
  };


  const handleNavigate = (screen: Screen) => {
    if (screen === Screen.LIKES_YOU) setNewLikesCount(0);
    
    if (isDesktop && screen !== Screen.MATCHES && screen !== Screen.CHAT) {
        setActiveChatMatch(null);
    }
    setCurrentScreen(screen);
  };

  const handleStartChat = (match: UserProfile) => {
    setActiveChatMatch(match);
    if (!isDesktop) {
      setCurrentScreen(Screen.CHAT);
    } else {
      setCurrentScreen(Screen.MATCHES);
    }
  };
  
  const handleEndChat = () => {
      setActiveChatMatch(null);
      if(!isDesktop) {
        setCurrentScreen(Screen.MATCHES);
      }
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
    switch (currentScreen) {
      case Screen.ONBOARDING_WELCOME:
      case Screen.LOGGED_OUT:
        return <OnboardingWelcomeScreen onStart={handleStartOnboarding} />;
      case Screen.PROFILE_CREATOR: 
        return <ProfileCreator onProfileCreated={handleProfileCreated} profileToEdit={userProfile} />;
    }
    
    if (!userProfile) {
      return <OnboardingWelcomeScreen onStart={handleStartOnboarding} />;
    }
    
    switch (currentScreen) {
      case Screen.SWIPE: return <SwipeScreen 
            currentProfile={filteredMatchQueue[0]}
            isLoading={isQueueLoading && filteredMatchQueue.length === 0}
            onLike={handleLike} onPass={handlePass} onSuperLike={handleSuperLike} onRewind={handleRewind}
            canRewind={!!lastPassedProfile && !lastPassedProfile.isSpotlight}
            onBoost={handleBoost} isBoostActive={isBoostActive} boostEndTime={boostEndTime}
            onOpenFilters={() => setCurrentScreen(Screen.FILTER)} areFiltersActive={areFiltersActive}
            onRequestVaultAccess={handleRequestVaultAccess}
        />;
      case Screen.MATCHES: return <MatchesScreen matches={matches} onChat={handleStartChat} activeChatId={activeChatMatch?.id} />;
      case Screen.PROFILE: return <UserProfileScreen 
            userProfile={userProfile} onEditProfile={handleEditProfile} onVerifyProfile={handleStartVerification}
            onOpenSafetyCenter={() => setCurrentScreen(Screen.SAFETY_CENTER)} isIncognito={isIncognito}
            onToggleIncognito={() => setIsIncognito(p => !p)} onGoPremium={() => setCurrentScreen(Screen.PRODUCT_PLAN)}
            onLogout={handleLogout} onAddMedia={handleAddMedia} onRemoveMedia={handleRemoveMedia}
        />;
      case Screen.CHAT: return activeChatMatch && <ChatScreen 
            userProfile={userProfile} matchProfile={activeChatMatch} onEndChat={handleEndChat} onStartVideoCall={handleStartVideoCall} isDesktop={isDesktop}
        />;
      case Screen.VIDEO_CALL: return activeVideoCallMatch && <VideoCallScreen
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
      case Screen.SPOTLIGHT: return <SpotlightScreen 
            profiles={spotlightQueue} onSuperLike={handleSuperLike}
            onPass={handlePass} onRequestVaultAccess={handleRequestVaultAccess}
        />;
      default: return <SwipeScreen 
            currentProfile={filteredMatchQueue[0]}
            isLoading={isQueueLoading && filteredMatchQueue.length === 0}
            onLike={handleLike} onPass={handlePass} onSuperLike={handleSuperLike} onRewind={handleRewind}
            canRewind={!!lastPassedProfile && !lastPassedProfile.isSpotlight}
            onBoost={handleBoost} isBoostActive={isBoostActive} boostEndTime={boostEndTime}
            onOpenFilters={() => setCurrentScreen(Screen.FILTER)} areFiltersActive={areFiltersActive}
            onRequestVaultAccess={handleRequestVaultAccess}
        />;
    }
  };
  
  const showNav = userProfile && [Screen.SWIPE, Screen.MATCHES, Screen.PROFILE, Screen.LIKES_YOU, Screen.SPOTLIGHT, Screen.CHAT].includes(currentScreen);
  const isChatView = isDesktop && (currentScreen === Screen.MATCHES || (currentScreen === Screen.CHAT && activeChatMatch));

  if (!isAgeVerified) {
    return <AgeGate onVerified={handleAgeVerified} />;
  }

  return (
    <div className="h-[100dvh] w-screen flex flex-col md:flex-row bg-brand-bg overflow-hidden text-brand-text-light">
      {showNav && <SideNav activeScreen={currentScreen} onNavigate={handleNavigate} newLikesCount={newLikesCount} />}

      {isChatView ? (
        <>
            <div className="w-full md:w-1/3 md:max-w-sm border-r border-brand-surface-light flex flex-col shrink-0">
                {userProfile && <MatchesScreen matches={matches} onChat={handleStartChat} activeChatId={activeChatMatch?.id} />}
            </div>
            <main className="hidden md:flex flex-grow flex-col">
                {activeChatMatch && userProfile ? (
                    <ChatScreen userProfile={userProfile} matchProfile={activeChatMatch} onEndChat={handleEndChat} onStartVideoCall={handleStartVideoCall} isDesktop={isDesktop} />
                ) : (
                    <div className="flex w-full h-full items-center justify-center bg-brand-bg">
                        <div className="text-center text-brand-text-dark">
                            <MatchesIcon className="h-16 w-16 mx-auto mb-4"/>
                            <h2 className="text-xl font-bold text-white">Select a match</h2>
                            <p>Choose a conversation to see your messages.</p>
                        </div>
                    </div>
                )}
            </main>
        </>
      ) : (
        <main className={`flex-grow flex flex-col min-h-0 ${currentScreen !== Screen.SWIPE ? 'md:items-center md:justify-center' : ''}`}>
            <div className={`w-full h-full flex flex-col bg-brand-bg ${currentScreen !== Screen.SWIPE ? 'shadow-2xl overflow-hidden md:max-w-md md:h-[95vh] md:max-h-[900px] md:rounded-2xl' : ''}`}>
              <div className="flex-grow flex flex-col min-h-0">
                {renderScreen()}
              </div>
              {![Screen.ONBOARDING_WELCOME, Screen.PROFILE_CREATOR].includes(currentScreen) && showNav && <BottomNav activeScreen={currentScreen} onNavigate={handleNavigate} newLikesCount={newLikesCount} />}
            </div>
        </main>
      )}

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