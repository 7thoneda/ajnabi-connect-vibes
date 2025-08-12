import { useState, useEffect } from 'react';

interface LoginStreakData {
  currentStreak: number;
  lastLoginDate: string;
  claimedDays: number[];
  totalLogins: number;
}

export function useLoginStreak() {
  const [streakData, setStreakData] = useState<LoginStreakData>({
    currentStreak: 0,
    lastLoginDate: '',
    claimedDays: [],
    totalLogins: 0
  });

  useEffect(() => {
    // Load streak data from localStorage
    const savedData = localStorage.getItem('loginStreak');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setStreakData(parsed);
    }

    // Check if user logged in today
    checkDailyLogin();
  }, []);

  const checkDailyLogin = () => {
    const today = new Date().toDateString();
    const savedData = localStorage.getItem('loginStreak');
    
    if (savedData) {
      const parsed: LoginStreakData = JSON.parse(savedData);
      const lastLogin = new Date(parsed.lastLoginDate);
      const todayDate = new Date(today);
      const yesterday = new Date(todayDate);
      yesterday.setDate(yesterday.getDate() - 1);

      if (parsed.lastLoginDate === today) {
        // Already logged in today
        setStreakData(parsed);
        return;
      }

      let newStreak = parsed.currentStreak;
      
      if (lastLogin.toDateString() === yesterday.toDateString()) {
        // Consecutive day login
        newStreak += 1;
      } else if (lastLogin.toDateString() !== today) {
        // Streak broken
        newStreak = 1;
      }

      const newData: LoginStreakData = {
        currentStreak: newStreak,
        lastLoginDate: today,
        claimedDays: lastLogin.toDateString() === yesterday.toDateString() ? parsed.claimedDays : [],
        totalLogins: parsed.totalLogins + 1
      };

      setStreakData(newData);
      localStorage.setItem('loginStreak', JSON.stringify(newData));
    } else {
      // First time login
      const newData: LoginStreakData = {
        currentStreak: 1,
        lastLoginDate: today,
        claimedDays: [],
        totalLogins: 1
      };

      setStreakData(newData);
      localStorage.setItem('loginStreak', JSON.stringify(newData));
    }
  };

  const claimReward = (day: number) => {
    const newData = {
      ...streakData,
      claimedDays: [...streakData.claimedDays, day]
    };
    
    setStreakData(newData);
    localStorage.setItem('loginStreak', JSON.stringify(newData));
  };

  return {
    streakData,
    claimReward,
    checkDailyLogin
  };
}