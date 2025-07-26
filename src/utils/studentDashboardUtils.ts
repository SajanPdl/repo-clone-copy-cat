import { supabase } from "@/supabase";
import { StudentActivity, StudentProfile } from "@/types";

export const fetchStudentProfile = async (userId: string): Promise<StudentProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching student profile:', error);
      return null;
    }

    return {
      ...data,
      achievements: Array.isArray(data.achievements) ? data.achievements : []
    } as StudentProfile;
  } catch (error) {
    console.error('Unexpected error:', error);
    return null;
  }
};

export const fetchStudentActivity = async (userId: string): Promise<StudentActivity[]> => {
  try {
    const { data, error } = await supabase
      .from('student_activity')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching student activity:', error);
      return [];
    }

    return data.map(activity => ({
      ...activity,
      activity_type: activity.activity_type as "download" | "upload" | "sale" | "bookmark" | "share"
    }));
  } catch (error) {
    console.error('Unexpected error:', error);
    return [];
  }
};

export const updateStudentProfile = async (userId: string, updates: Partial<StudentProfile>): Promise<StudentProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('student_profiles')
      .update(updates)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating student profile:', error);
      return null;
    }

    return data as StudentProfile;
  } catch (error) {
    console.error('Unexpected error:', error);
    return null;
  }
};

export const trackStudentActivity = async (userId: string, activityType: StudentActivity['activity_type'], details: any): Promise<StudentActivity | null> => {
  try {
    const { data, error } = await supabase
      .from('student_activity')
      .insert([
        {
          user_id: userId,
          activity_type: activityType,
          details: details,
        },
      ])
      .select('*')
      .single();

    if (error) {
      console.error('Error tracking student activity:', error);
      return null;
    }

    return data as StudentActivity;
  } catch (error) {
    console.error('Unexpected error:', error);
    return null;
  }
};
