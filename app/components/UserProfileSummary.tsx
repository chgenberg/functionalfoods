"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { FiUser, FiActivity, FiHeart, FiTrendingUp } from 'react-icons/fi';

interface UserProfileSummaryProps {
  compact?: boolean;
}

interface UserData {
  quizResults?: {
    healthScore: number;
    energyScore: number;
    sleepScore: number;
    stressScore: number;
    dietScore: number;
    exerciseScore: number;
    createdAt: string;
  };
  healthProfile?: {
    age?: number;
    gender?: string;
    activityLevel?: string;
  };
  symptomAnalysesCount: number;
  coursesCount: number;
}

export default function UserProfileSummary({ compact = false }: UserProfileSummaryProps) {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('/api/user/profile-summary', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        }
      } catch (error) {
        console.error('Failed to fetch user profile summary:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  if (!user || loading) {
    return null;
  }

  if (!userData) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
        <div className="flex items-center space-x-2 text-blue-700">
          <FiUser className="w-5 h-5" />
          <span className="font-medium">Välkommen {user.name || user.email}!</span>
        </div>
        <p className="text-blue-600 text-sm mt-1">
          Gör vårt hälsoquiz för att få personaliserade råd i chatten.
        </p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="bg-background border border-border rounded-xl p-3 mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FiUser className="w-4 h-4 text-primary" />
            <span className="text-secondary font-medium text-sm">{user.name || user.email}</span>
          </div>
          {userData.quizResults && (
            <div className="flex items-center space-x-1 text-secondary">
              <FiHeart className="w-4 h-4" />
              <span className="text-sm font-medium">{userData.quizResults.healthScore}/100</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-border rounded-xl p-4 mb-4">
      <div className="flex items-center space-x-2 mb-3">
        <FiUser className="w-5 h-5 text-primary" />
        <span className="font-semibold text-secondary">Din Hälsoprofil</span>
      </div>

      {userData.quizResults ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Total Hälsopoäng</span>
            <div className="flex items-center space-x-2">
              <FiTrendingUp className="w-4 h-4 text-primary" />
              <span className="font-bold text-secondary">{userData.quizResults.healthScore}/100</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">Energi:</span>
              <span className="font-medium">{userData.quizResults.energyScore}/10</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Sömn:</span>
              <span className="font-medium">{userData.quizResults.sleepScore}/10</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Stress:</span>
              <span className="font-medium">{userData.quizResults.stressScore}/10</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Kost:</span>
              <span className="font-medium">{userData.quizResults.dietScore}/10</span>
            </div>
          </div>

          <div className="text-xs text-gray-500 mt-2">
            Senaste quiz: {new Date(userData.quizResults.createdAt).toLocaleDateString('sv-SE')}
          </div>
        </div>
      ) : (
        <p className="text-blue-600 text-sm">
          Gör vårt hälsoquiz för att få personaliserade råd!
        </p>
      )}

      {(userData.symptomAnalysesCount > 0 || userData.coursesCount > 0) && (
        <div className="flex items-center space-x-4 mt-3 pt-3 border-t border-border">
          {userData.symptomAnalysesCount > 0 && (
            <div className="flex items-center space-x-1 text-blue-600">
              <FiActivity className="w-4 h-4" />
              <span className="text-xs">{userData.symptomAnalysesCount} analyser</span>
            </div>
          )}
          {userData.coursesCount > 0 && (
            <div className="flex items-center space-x-1 text-purple-600">
              <FiHeart className="w-4 h-4" />
              <span className="text-xs">{userData.coursesCount} kurser</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 