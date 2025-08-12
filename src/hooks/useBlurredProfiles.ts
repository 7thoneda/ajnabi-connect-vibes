import { useState, useEffect } from 'react';
import { BlurredProfile } from '@/components/Profile/BlurredProfilesScreen';

// Mock data for demonstration
const mockBlurredProfiles: BlurredProfile[] = [
  {
    id: "1",
    blurredPhoto: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400&blur=10",
    originalPhoto: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg",
    username: "Sarah",
    age: 24,
    distance: "2 km away",
    actionType: "liked",
    timeAgo: "2 hours ago",
    unlockCost: 15,
    isUnlocked: false
  },
  {
    id: "2",
    blurredPhoto: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400&blur=10",
    originalPhoto: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg",
    username: "Emma",
    age: 22,
    distance: "1.5 km away",
    actionType: "viewed",
    timeAgo: "5 hours ago",
    unlockCost: 10,
    isUnlocked: false
  },
  {
    id: "3",
    blurredPhoto: "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=400&blur=10",
    originalPhoto: "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg",
    username: "Jessica",
    age: 26,
    distance: "3 km away",
    actionType: "liked",
    timeAgo: "1 day ago",
    unlockCost: 15,
    isUnlocked: false
  },
  {
    id: "4",
    blurredPhoto: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400&blur=10",
    originalPhoto: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg",
    username: "Maya",
    age: 23,
    distance: "4 km away",
    actionType: "viewed",
    timeAgo: "3 hours ago",
    unlockCost: 10,
    isUnlocked: false
  },
  {
    id: "5",
    blurredPhoto: "https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg?auto=compress&cs=tinysrgb&w=400&blur=10",
    originalPhoto: "https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg",
    username: "Aria",
    age: 25,
    distance: "2.5 km away",
    actionType: "liked",
    timeAgo: "6 hours ago",
    unlockCost: 15,
    isUnlocked: false
  }
];

export function useBlurredProfiles() {
  const [profiles, setProfiles] = useState<BlurredProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading profiles
    const timer = setTimeout(() => {
      setProfiles(mockBlurredProfiles);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const unlockProfile = (profileId: string) => {
    setProfiles(prev => 
      prev.map(profile => 
        profile.id === profileId 
          ? { ...profile, isUnlocked: true }
          : profile
      )
    );
  };

  const addNewProfile = (profile: BlurredProfile) => {
    setProfiles(prev => [profile, ...prev]);
  };

  const getUnlockedProfiles = () => {
    return profiles.filter(profile => profile.isUnlocked);
  };

  const getLikedProfiles = () => {
    return profiles.filter(profile => profile.actionType === "liked");
  };

  const getViewedProfiles = () => {
    return profiles.filter(profile => profile.actionType === "viewed");
  };

  return {
    profiles,
    loading,
    unlockProfile,
    addNewProfile,
    getUnlockedProfiles,
    getLikedProfiles,
    getViewedProfiles
  };
}