
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
import { generateMatches } from './services/matchService';
import { getGeminiCompatibilityScore } from './services/geminiService';

const App: React.FC = () => {
  const [isAgeVerified, setIsAgeVerified] = useState<boolean>(false);
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.AGE_GATE);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  const [matchQueue, setMatchQueue] = useState<UserProfile[]>([]);
  const [isQueueLoading, setIsQueueLoading] = useState<boolean>(true);
  const [matches, setMatches] = useState<UserProfile[]>([]);
  const [likers, setLikers] = useState<UserProfile[]>([]);
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
    lookingFor: [],
    kinks: [],
    roles: [],
    verifiedOnly: false,
  });
  const [isIncognito, setIsIncognito] = useState<boolean>(false);

  const filteredMatchQueue = useMemo(() => {
    return matchQueue.filter(profile => {
      const { ageRange, lookingFor, kinks, roles, verifiedOnly } = filterSettings;
      if (profile.age < ageRange.min || profile.age > ageRange.max) return false;
      if (verifiedOnly && !profile.isVerified) return false;
      if (lookingFor.length > 0 && !lookingFor.some(tag => profile.lookingFor.includes(tag))) return false;
      if (roles.length > 0 && !roles.some(role => profile.roles.includes(role))) return false;
      if (kinks.length > 0 && !kinks.some(kinkFilter => profile.kinks.some(k => k.name === kinkFilter))) return false;
      return true;
    });
  }, [matchQueue, filterSettings]);
  
  const areFiltersActive = useMemo(() => {
    return (
      filterSettings.ageRange.min !== 18 ||
      filterSettings.ageRange.max !== 99 ||
      filterSettings.lookingFor.length > 0 ||
      filterSettings.kinks.length > 0 ||
      filterSettings.roles.length > 0 ||
      filterSettings.verifiedOnly
    );
  }, [filterSettings]);

  const calculateAndSetCompatibilityScores = useCallback((newMatches: UserProfile[]) => {
    if (!userProfile) return;
    newMatches.forEach(async (match) => {
        try {
            const scoreData = await getGeminiCompatibilityScore(userProfile, match);
            if (scoreData) {
                setMatchQueue(prevQueue => 
                    prevQueue.map(p => p.id === match.id ? { ...p, compatibilityScore: scoreData } : p)
                );
            }
        } catch (error) {
            console.error(`Failed to calculate score for match ${match.id}`, error);
        }
    });
  }, [userProfile]);

  const loadMoreMatches = useCallback(() => {
    setIsQueueLoading(true);
    // Simulate network delay
    setTimeout(() => {
        const newMatches = generateMatches();
        setMatchQueue(prev => [...prev, ...newMatches]);
        setIsQueueLoading(false);
         // Start calculating scores in the background
        if (userProfile) {
          calculateAndSetCompatibilityScores(newMatches);
        }
    }, 500);
  }, [userProfile, calculateAndSetCompatibilityScores]);

  useEffect(() => {
    if (userProfile && matchQueue.length < 5) {
      loadMoreMatches();
    }
  }, [userProfile, matchQueue.length, loadMoreMatches]);

  // Simulate receiving likes
  useEffect(() => {
    if (!userProfile) return;
    const interval = setInterval(() => {
        if(Math.random() < 0.3) { // 30% chance to get a new like every 5 seconds
            const newLiker = generateMatches(1)[0];
            setLikers(prev => [newLiker, ...prev]);
            setNewLikesCount(prev => prev + 1);
        }
    }, 5000);
    return () => clearInterval(interval);
  }, [userProfile]);


  const handleAgeVerified = () => {
    setIsAgeVerified(true);
    setCurrentScreen(Screen.PROFILE_CREATOR);
  };

  const handleProfileCreated = (profile: UserProfile) => {
    setUserProfile(profile);
    setCurrentScreen(Screen.SWIPE);
  };
  
  const nextProfile = () => {
    setIsQueueLoading(true);
    setMatchQueue(prev => prev.slice(1));
    // Simulate loading the next profile card
    setTimeout(() => setIsQueueLoading(false), 300);
  };

  const handleLike = (likedProfile: UserProfile) => {
    if (Math.random() < 0.25) {
        setMatches(prev => [likedProfile, ...prev]);
        setPendingMatch(likedProfile);
        setLastMatchWasSuperLike(false);
    }
    nextProfile();
  };
  
  const handleSuperLike = (likedProfile: UserProfile) => {
    if (Math.random() < 0.75) {
        setMatches(prev => [likedProfile, ...prev]);
        setPendingMatch(likedProfile);
        setLastMatchWasSuperLike(true);
    }
    nextProfile();
  };

  const handlePass = (passedProfile: UserProfile) => {
    setLastPassedProfile(passedProfile);
    nextProfile();
  };

  const handleRewind = () => {
    if (lastPassedProfile) {
      setMatchQueue(prev => [lastPassedProfile, ...prev]);
      setLastPassedProfile(null);
    }
  };
  
  const handleBoost = () => {
      setIsBoostActive(true);
      setBoostEndTime(Date.now() + 30 * 60 * 1000); // 30 minutes
      setTimeout(() => {
          setIsBoostActive(false);
          setBoostEndTime(null);
      }, 30 * 60 * 1000);
  };
  
  const handleInstantMatch = (likerProfile: UserProfile) => {
      setMatches(prev => [likerProfile, ...prev]);
      setLikers(prev => prev.filter(p => p.id !== likerProfile.id));
      setPendingMatch(likerProfile);
      setLastMatchWasSuperLike(false);
      setCurrentScreen(Screen.SWIPE); // Navigate back to swipe screen to see the match modal
  };

  const handleNavigate = (screen: Screen) => {
    if (screen === Screen.LIKES_YOU) {
        setNewLikesCount(0);
    }
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
      setCurrentScreen(Screen.CHAT); // Go back to chat
  }

  const handleEditProfile = () => {
    setCurrentScreen(Screen.PROFILE_CREATOR);
  };
  
  const handleVerifyProfile = () => {
      if(userProfile) {
        setUserProfile({...userProfile, isVerified: true});
      }
  };

  const handleSaveFilters = (newSettings: FilterSettings) => {
    setFilterSettings(newSettings);
    setCurrentScreen(Screen.SWIPE);
  };
  
  const renderScreen = () => {
    if (!isAgeVerified) return <AgeGate onVerified={handleAgeVerified} />;
    
    switch (currentScreen) {
      case Screen.PROFILE_CREATOR:
        return <ProfileCreator onProfileCreated={handleProfileCreated} profileToEdit={userProfile} />;
      case Screen.SWIPE:
        return userProfile && <SwipeScreen 
            userProfile={userProfile}
            currentProfile={filteredMatchQueue[0]}
            isLoading={isQueueLoading}
            onLike={handleLike}
            onPass={handlePass}
            onSuperLike={handleSuperLike}
            onRewind={handleRewind}
            canRewind={!!lastPassedProfile}
            onBoost={handleBoost}
            isBoostActive={isBoostActive}
            boostEndTime={boostEndTime}
            onOpenFilters={() => setCurrentScreen(Screen.FILTER)}
            areFiltersActive={areFiltersActive}
        />;
      case Screen.MATCHES:
        return <MatchesScreen matches={matches} onChat={handleStartChat} />;
      case Screen.PROFILE:
        return userProfile && <UserProfileScreen 
            userProfile={userProfile} 
            onEditProfile={handleEditProfile}
            onVerifyProfile={handleVerifyProfile}
            isIncognito={isIncognito}
            onToggleIncognito={() => setIsIncognito(p => !p)}
            onGoPremium={() => setCurrentScreen(Screen.PRODUCT_PLAN)}
        />;
      case Screen.CHAT:
        return userProfile && activeChatMatch && <ChatScreen 
            userProfile={userProfile} 
            matchProfile={activeChatMatch} 
            onEndChat={handleEndChat}
            onStartVideoCall={handleStartVideoCall}
        />;
      case Screen.VIDEO_CALL:
        return userProfile && activeVideoCallMatch && <VideoCallScreen
            userProfile={userProfile}
            matchProfile={activeVideoCallMatch}
            onEndCall={handleEndVideoCall}
        />;
      case Screen.LIKES_YOU:
        return <LikesYouScreen likers={likers} onInstantMatch={handleInstantMatch} onGoPremium={() => setCurrentScreen(Screen.PRODUCT_PLAN)} />;
      case Screen.FILTER:
        return <FilterScreen 
            currentSettings={filterSettings}
            onSave={handleSaveFilters}
            onBack={() => setCurrentScreen(Screen.SWIPE)}
        />
      case Screen.PRODUCT_PLAN:
        return <ProductPlanScreen onBack={() => setCurrentScreen(Screen.PROFILE)} />
      default:
        return <ProfileCreator onProfileCreated={handleProfileCreated} profileToEdit={userProfile} />;
    }
  };
  
  const showNav = userProfile && [Screen.SWIPE, Screen.MATCHES, Screen.PROFILE, Screen.LIKES_YOU].includes(currentScreen);

  return (
    <div className="h-[100dvh] w-screen max-w-md mx-auto flex flex-col bg-brand-bg shadow-2xl overflow-hidden">
      <div className="flex-grow flex flex-col min-h-0">
        {renderScreen()}
      </div>
      
      {showNav && (
        <BottomNav 
            activeScreen={currentScreen} 
            onNavigate={handleNavigate}
            newLikesCount={newLikesCount}
        />
      )}
      
      {pendingMatch && userProfile && (
        <ItsAMatchScreen 
            userProfile={userProfile}
            matchProfile={pendingMatch}
            isSuperLike={lastMatchWasSuperLike}
            onSendMessage={() => {
                handleStartChat(pendingMatch);
                setPendingMatch(null);
            }}
            onKeepSwiping={() => setPendingMatch(null)}
        />
      )}
    </div>
  );
};

export default App;
