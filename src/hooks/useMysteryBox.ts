import { useState, useCallback } from 'react';

interface MysteryBoxReward {
  type: 'coins' | 'profile_unlock' | 'vip_feature';
  amount?: number;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const possibleRewards: MysteryBoxReward[] = [
  // Common rewards (60% chance)
  { type: 'coins', amount: 5, description: '5 Coins', rarity: 'common' },
  { type: 'coins', amount: 10, description: '10 Coins', rarity: 'common' },
  { type: 'coins', amount: 15, description: '15 Coins', rarity: 'common' },
  
  // Rare rewards (25% chance)
  { type: 'coins', amount: 25, description: '25 Coins', rarity: 'rare' },
  { type: 'coins', amount: 35, description: '35 Coins', rarity: 'rare' },
  { type: 'profile_unlock', amount: 1, description: 'Profile Unlock Token', rarity: 'rare' },
  
  // Epic rewards (12% chance)
  { type: 'coins', amount: 50, description: '50 Coins', rarity: 'epic' },
  { type: 'vip_feature', amount: 1, description: '1 Hour VIP Access', rarity: 'epic' },
  { type: 'profile_unlock', amount: 3, description: '3 Profile Unlock Tokens', rarity: 'epic' },
  
  // Legendary rewards (3% chance)
  { type: 'coins', amount: 100, description: '100 Coins', rarity: 'legendary' },
  { type: 'vip_feature', amount: 24, description: '24 Hour VIP Access', rarity: 'legendary' },
];

export function useMysteryBox() {
  const [showMysteryBox, setShowMysteryBox] = useState(false);
  const [currentReward, setCurrentReward] = useState<MysteryBoxReward | null>(null);

  const shouldShowMysteryBox = useCallback(() => {
    // 15% chance to show mystery box after chat
    return Math.random() < 0.15;
  }, []);

  const generateReward = useCallback((): MysteryBoxReward => {
    const random = Math.random();
    let selectedRewards: MysteryBoxReward[];

    if (random < 0.03) {
      // 3% chance for legendary
      selectedRewards = possibleRewards.filter(r => r.rarity === 'legendary');
    } else if (random < 0.15) {
      // 12% chance for epic
      selectedRewards = possibleRewards.filter(r => r.rarity === 'epic');
    } else if (random < 0.40) {
      // 25% chance for rare
      selectedRewards = possibleRewards.filter(r => r.rarity === 'rare');
    } else {
      // 60% chance for common
      selectedRewards = possibleRewards.filter(r => r.rarity === 'common');
    }

    return selectedRewards[Math.floor(Math.random() * selectedRewards.length)];
  }, []);

  const triggerMysteryBox = useCallback(() => {
    if (shouldShowMysteryBox()) {
      setShowMysteryBox(true);
      setCurrentReward(null);
    }
  }, [shouldShowMysteryBox]);

  const openMysteryBox = useCallback(() => {
    const reward = generateReward();
    setCurrentReward(reward);
  }, [generateReward]);

  const closeMysteryBox = useCallback(() => {
    setShowMysteryBox(false);
    setCurrentReward(null);
  }, []);

  return {
    showMysteryBox,
    currentReward,
    triggerMysteryBox,
    openMysteryBox,
    closeMysteryBox
  };
}