import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, Database } from '@/lib/supabase';
import { useAuth } from './AuthContext';

type Wine = Database['public']['Tables']['wines']['Row'];
type SavedWine = Database['public']['Tables']['saved_wines']['Row'] & {
  wine: Wine;
};

interface WineContextType {
  wines: Wine[];
  savedWines: SavedWine[];
  loading: boolean;
  refreshWines: () => Promise<void>;
  refreshSavedWines: () => Promise<void>;
  saveWine: (wineId: string, data: { rating?: number; date_tried?: string; location?: string; user_notes?: string }) => Promise<{ error?: string }>;
  unsaveWine: (wineId: string) => Promise<{ error?: string }>;
  isWineSaved: (wineId: string) => boolean;
}

const WineContext = createContext<WineContextType | undefined>(undefined);

export function WineProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [wines, setWines] = useState<Wine[]>([]);
  const [savedWines, setSavedWines] = useState<SavedWine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refreshWines();
  }, []);

  useEffect(() => {
    if (user) {
      refreshSavedWines();
    } else {
      setSavedWines([]);
    }
  }, [user]);

  const refreshWines = async () => {
    try {
      const { data, error } = await supabase
        .from('wines')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching wines:', error);
      } else {
        setWines(data || []);
      }
    } catch (error) {
      console.error('Error fetching wines:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshSavedWines = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('saved_wines')
        .select(`
          *,
          wine:wines(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching saved wines:', error);
      } else {
        setSavedWines(data as SavedWine[] || []);
      }
    } catch (error) {
      console.error('Error fetching saved wines:', error);
    }
  };

  const saveWine = async (wineId: string, data: { rating?: number; date_tried?: string; location?: string; user_notes?: string }) => {
    if (!user) {
      return { error: 'You must be logged in to save wines' };
    }

    try {
      const { error } = await supabase
        .from('saved_wines')
        .upsert([
          {
            user_id: user.id,
            wine_id: wineId,
            ...data,
          }
        ]);

      if (error) {
        return { error: error.message };
      }

      await refreshSavedWines();
      return {};
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  };

  const unsaveWine = async (wineId: string) => {
    if (!user) {
      return { error: 'You must be logged in to unsave wines' };
    }

    try {
      const { error } = await supabase
        .from('saved_wines')
        .delete()
        .eq('user_id', user.id)
        .eq('wine_id', wineId);

      if (error) {
        return { error: error.message };
      }

      await refreshSavedWines();
      return {};
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  };

  const isWineSaved = (wineId: string) => {
    return savedWines.some(saved => saved.wine_id === wineId);
  };

  const value = {
    wines,
    savedWines,
    loading,
    refreshWines,
    refreshSavedWines,
    saveWine,
    unsaveWine,
    isWineSaved,
  };

  return <WineContext.Provider value={value}>{children}</WineContext.Provider>;
}

export function useWine() {
  const context = useContext(WineContext);
  if (context === undefined) {
    throw new Error('useWine must be used within a WineProvider');
  }
  return context;
}