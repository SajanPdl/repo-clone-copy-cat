
import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import StudyAssistant from '@/components/ai/StudyAssistant';
import { useNotificationTrigger } from '@/hooks/useNotificationTrigger';

const StudyAssistantPage = () => {
  const { user } = useAuth();
  const { notifyAchievementUnlocked } = useNotificationTrigger();

  useEffect(() => {
    if (user) {
      // Show study assistant welcome notification
      notifyAchievementUnlocked('AI Study Assistant', 15);
    }
  }, [user, notifyAchievementUnlocked]);

  return (
    <div className="h-screen">
      <StudyAssistant />
    </div>
  );
};

export default StudyAssistantPage;
