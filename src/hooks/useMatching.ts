import { useState, useCallback } from 'react';
import { matchingService, MatchingPreferences } from '@/services/matchingService';
import { useToast } from '@/hooks/use-toast';

interface UseMatchingProps {
  userGender: 'male' | 'female' | 'other';
  userId: string;
  isPremium: boolean;
}

export function useMatching({ userGender, userId, isPremium }: UseMatchingProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [currentMatch, setCurrentMatch] = useState<any>(null);
  const { toast } = useToast();

  const startMatching = useCallback(async (preferredGender: 'anyone' | 'men' | 'women') => {
    setIsSearching(true);
    
    try {
      // Simulate matching delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const matchPrefs: MatchingPreferences = {
        userGender,
        preferredGender,
        isPremium,
        userId
      };

      const matchResult = matchingService.simulateMatch(matchPrefs);
      
      if (matchResult.success) {
        setCurrentMatch({
          id: 'match-' + Date.now(),
          gender: matchResult.partnerGender,
          matchType: matchResult.matchType
        });

        // Show appropriate toast based on user type
        if (isPremium) {
          toast({
            title: "Premium Match Found! 👑",
            description: matchResult.message,
          });
        } else {
          toast({
            title: "Random Match Found! 🎲",
            description: matchResult.message,
          });
        }

        return matchResult;
      } else {
        throw new Error('No matches found');
      }
    } catch (error) {
      toast({
        title: "No matches found",
        description: "Try again in a few moments.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsSearching(false);
    }
  }, [userGender, userId, isPremium, toast]);

  const endMatch = useCallback(() => {
    setCurrentMatch(null);
  }, []);

  const getMatchingExplanation = useCallback(() => {
    if (isPremium) {
      return {
        title: "Premium Matching",
        description: "You can choose to match with specific genders or everyone. Your preferences will be respected.",
        features: [
          "Choose your preferred gender",
          "Higher match success rate",
          "Priority in matching queue",
          "Advanced filtering options"
        ]
      };
    } else {
      return {
        title: "Free Random Matching",
        description: "You'll be matched with random users of any gender for diverse conversations.",
        features: [
          "Random gender matching",
          "Meet diverse people",
          "No gender restrictions",
          "Upgrade for preferences"
        ]
      };
    }
  }, [isPremium]);

  return {
    isSearching,
    currentMatch,
    startMatching,
    endMatch,
    getMatchingExplanation
  };
}