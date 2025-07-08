import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

export interface Goal {
  id: string;
  title: string;
  description?: string;
  category: 'weekly' | 'health' | 'nutrition' | 'exercise' | 'general';
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  progress: number;
  targetDate?: string;
  completedAt?: string;
  weekNumber?: number;
  courseId?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGoalData {
  title: string;
  description?: string;
  category?: Goal['category'];
  priority?: Goal['priority'];
  targetDate?: string;
  weekNumber?: number;
  courseId?: string;
}

export interface UpdateGoalData {
  id: string;
  title?: string;
  description?: string;
  category?: Goal['category'];
  priority?: Goal['priority'];
  status?: Goal['status'];
  progress?: number;
  targetDate?: string;
  completedAt?: string;
}

export function useGoals(weekNumber?: number, category?: string, status?: string) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }, []);

  const fetchGoals = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (weekNumber) params.append('weekNumber', weekNumber.toString());
      if (category) params.append('category', category);
      if (status) params.append('status', status);

      const response = await fetch(`/api/goals?${params.toString()}`, {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch goals');
      }

      const data = await response.json();
      setGoals(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch goals');
    } finally {
      setLoading(false);
    }
  }, [user, weekNumber, category, status, getAuthHeaders]);

  const createGoal = useCallback(async (goalData: CreateGoalData): Promise<Goal | null> => {
    if (!user) return null;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(goalData)
      });

      if (!response.ok) {
        throw new Error('Failed to create goal');
      }

      const newGoal = await response.json();
      setGoals(prev => [...prev, newGoal]);
      return newGoal;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create goal');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, getAuthHeaders]);

  const updateGoal = useCallback(async (updateData: UpdateGoalData): Promise<Goal | null> => {
    if (!user) return null;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/goals', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error('Failed to update goal');
      }

      const updatedGoal = await response.json();
      setGoals(prev => prev.map(goal => 
        goal.id === updatedGoal.id ? updatedGoal : goal
      ));
      return updatedGoal;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update goal');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, getAuthHeaders]);

  const deleteGoal = useCallback(async (id: string): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/goals?id=${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to delete goal');
      }

      setGoals(prev => prev.filter(goal => goal.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete goal');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, getAuthHeaders]);

  const toggleGoalStatus = useCallback(async (id: string): Promise<void> => {
    const goal = goals.find(g => g.id === id);
    if (!goal) return;

    const newStatus = goal.status === 'completed' ? 'active' : 'completed';
    await updateGoal({
      id,
      status: newStatus,
      progress: newStatus === 'completed' ? 100 : goal.progress
    });
  }, [goals, updateGoal]);

  const updateProgress = useCallback(async (id: string, progress: number): Promise<void> => {
    const status = progress >= 100 ? 'completed' : 'active';
    await updateGoal({
      id,
      progress,
      status
    });
  }, [updateGoal]);

  // Statistik och hjälpfunktioner
  const getGoalStats = useCallback(() => {
    const total = goals.length;
    const completed = goals.filter(g => g.status === 'completed').length;
    const active = goals.filter(g => g.status === 'active').length;
    const overdue = goals.filter(g => 
      g.targetDate && new Date(g.targetDate) < new Date() && g.status !== 'completed'
    ).length;

    return {
      total,
      completed,
      active,
      overdue,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }, [goals]);

  const getGoalsByCategory = useCallback(() => {
    return goals.reduce((acc, goal) => {
      if (!acc[goal.category]) {
        acc[goal.category] = [];
      }
      acc[goal.category].push(goal);
      return acc;
    }, {} as Record<string, Goal[]>);
  }, [goals]);

  const getGoalsByPriority = useCallback(() => {
    return goals.reduce((acc, goal) => {
      if (!acc[goal.priority]) {
        acc[goal.priority] = [];
      }
      acc[goal.priority].push(goal);
      return acc;
    }, {} as Record<string, Goal[]>);
  }, [goals]);

  // Automatisk laddning av mål
  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  return {
    goals,
    loading,
    error,
    fetchGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    toggleGoalStatus,
    updateProgress,
    getGoalStats,
    getGoalsByCategory,
    getGoalsByPriority
  };
} 