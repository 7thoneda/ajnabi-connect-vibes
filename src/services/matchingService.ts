// Matching service to handle gender-based matching logic
export interface MatchingPreferences {
  userGender: 'male' | 'female' | 'other';
  preferredGender: 'anyone' | 'men' | 'women';
  isPremium: boolean;
  userId: string;
}

export interface MatchCandidate {
  id: string;
  gender: 'male' | 'female' | 'other';
  isOnline: boolean;
  lastActive: Date;
  preferences: {
    preferredGender: 'anyone' | 'men' | 'women';
    isPremium: boolean;
  };
}

export class MatchingService {
  private static instance: MatchingService;
  private onlineUsers: Map<string, MatchCandidate> = new Map();

  static getInstance(): MatchingService {
    if (!MatchingService.instance) {
      MatchingService.instance = new MatchingService();
    }
    return MatchingService.instance;
  }

  // Add user to online pool
  addUserToPool(user: MatchCandidate): void {
    this.onlineUsers.set(user.id, {
      ...user,
      isOnline: true,
      lastActive: new Date()
    });
  }

  // Remove user from online pool
  removeUserFromPool(userId: string): void {
    this.onlineUsers.delete(userId);
  }

  // Find a match based on preferences
  findMatch(userPreferences: MatchingPreferences): MatchCandidate | null {
    const availableUsers = Array.from(this.onlineUsers.values())
      .filter(candidate => 
        candidate.id !== userPreferences.userId && 
        candidate.isOnline &&
        this.isCompatibleMatch(userPreferences, candidate)
      );

    if (availableUsers.length === 0) {
      return null;
    }

    // For premium users, prioritize their preferences
    if (userPreferences.isPremium) {
      return this.findPremiumMatch(userPreferences, availableUsers);
    } else {
      // For free users, return random match regardless of gender
      return this.findRandomMatch(availableUsers);
    }
  }

  private isCompatibleMatch(userPrefs: MatchingPreferences, candidate: MatchCandidate): boolean {
    // Check if the candidate would accept this user
    const candidateWouldAccept = this.wouldAcceptUser(candidate.preferences, userPrefs.userGender);
    
    // For free users, they accept anyone, so we only check if candidate accepts them
    if (!userPrefs.isPremium) {
      return candidateWouldAccept;
    }

    // For premium users, check both directions
    const userWouldAccept = this.wouldAcceptUser(
      { preferredGender: userPrefs.preferredGender, isPremium: userPrefs.isPremium },
      candidate.gender
    );

    return userWouldAccept && candidateWouldAccept;
  }

  private wouldAcceptUser(preferences: { preferredGender: string; isPremium: boolean }, userGender: string): boolean {
    // Free users accept anyone
    if (!preferences.isPremium) {
      return true;
    }

    // Premium users follow their preferences
    switch (preferences.preferredGender) {
      case 'men':
        return userGender === 'male';
      case 'women':
        return userGender === 'female';
      case 'anyone':
      default:
        return true;
    }
  }

  private findPremiumMatch(userPrefs: MatchingPreferences, candidates: MatchCandidate[]): MatchCandidate {
    // Filter candidates based on user's gender preference
    let filteredCandidates = candidates;

    if (userPrefs.preferredGender === 'men') {
      filteredCandidates = candidates.filter(c => c.gender === 'male');
    } else if (userPrefs.preferredGender === 'women') {
      filteredCandidates = candidates.filter(c => c.gender === 'female');
    }

    // If no matches found with preference, fall back to anyone
    if (filteredCandidates.length === 0) {
      filteredCandidates = candidates;
    }

    // Return random from filtered candidates
    return filteredCandidates[Math.floor(Math.random() * filteredCandidates.length)];
  }

  private findRandomMatch(candidates: MatchCandidate[]): MatchCandidate {
    // Return completely random match for free users
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  // Get matching statistics
  getMatchingStats(): {
    totalOnline: number;
    maleUsers: number;
    femaleUsers: number;
    otherUsers: number;
    premiumUsers: number;
    freeUsers: number;
  } {
    const users = Array.from(this.onlineUsers.values());
    
    return {
      totalOnline: users.length,
      maleUsers: users.filter(u => u.gender === 'male').length,
      femaleUsers: users.filter(u => u.gender === 'female').length,
      otherUsers: users.filter(u => u.gender === 'other').length,
      premiumUsers: users.filter(u => u.preferences.isPremium).length,
      freeUsers: users.filter(u => !u.preferences.isPremium).length,
    };
  }

  // Simulate finding a match (for demo purposes)
  simulateMatch(userPrefs: MatchingPreferences): {
    success: boolean;
    matchType: 'targeted' | 'random';
    partnerGender: 'male' | 'female' | 'other';
    message: string;
  } {
    const genders: ('male' | 'female' | 'other')[] = ['male', 'female', 'other'];
    
    if (userPrefs.isPremium) {
      // Premium users get their preferred gender (if specified)
      let targetGender: 'male' | 'female' | 'other';
      
      if (userPrefs.preferredGender === 'men') {
        targetGender = 'male';
      } else if (userPrefs.preferredGender === 'women') {
        targetGender = 'female';
      } else {
        targetGender = genders[Math.floor(Math.random() * genders.length)];
      }

      return {
        success: true,
        matchType: 'targeted',
        partnerGender: targetGender,
        message: `Found a ${targetGender} user matching your preferences!`
      };
    } else {
      // Free users get random gender
      const randomGender = genders[Math.floor(Math.random() * genders.length)];
      
      return {
        success: true,
        matchType: 'random',
        partnerGender: randomGender,
        message: `Connected with a random ${randomGender} user!`
      };
    }
  }
}

export const matchingService = MatchingService.getInstance();