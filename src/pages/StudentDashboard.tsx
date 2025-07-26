
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  FileText, 
  Download, 
  User, 
  Settings,
  TrendingUp,
  Calendar,
  Award,
  Clock
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AnimatedWrapper from '@/components/ui/animated-wrapper';
import { useToast } from '@/hooks/use-toast';

interface StudentStats {
  totalDownloads: number;
  studyMaterials: number;
  pastPapers: number;
  recentActivity: any[];
}

const StudentDashboard = () => {
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  // Fetch student statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['studentStats', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const [studyMaterialsRes, pastPapersRes] = await Promise.all([
        supabase.from('study_materials').select('*'),
        supabase.from('past_papers').select('*')
      ]);

      return {
        totalDownloads: 0, // This would need to be tracked separately
        studyMaterials: studyMaterialsRes.data?.length || 0,
        pastPapers: pastPapersRes.data?.length || 0,
        recentActivity: []
      };
    },
    enabled: !!user
  });

  // Fetch recent downloads/activity
  const { data: recentMaterials } = useQuery({
    queryKey: ['recentMaterials'],
    queryFn: async () => {
      const { data } = await supabase
        .from('study_materials')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      return data || [];
    }
  });

  const { data: recentPapers } = useQuery({
    queryKey: ['recentPapers'],
    queryFn: async () => {
      const { data } = await supabase
        .from('past_papers')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      return data || [];
    }
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please log in to access your dashboard</h2>
          <Button onClick={() => window.location.href = '/login'}>Go to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome back, {user?.user_metadata?.name || user?.email}!
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Track your learning progress and access your materials
              </p>
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </motion.div>

          {/* Stats Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <AnimatedWrapper animation="slideUp" delay={0.1} hover>
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100">Study Materials</p>
                      <p className="text-2xl font-bold">{stats?.studyMaterials || 0}</p>
                    </div>
                    <BookOpen className="h-8 w-8 text-blue-200" />
                  </div>
                </CardContent>
              </Card>
            </AnimatedWrapper>

            <AnimatedWrapper animation="slideUp" delay={0.2} hover>
              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100">Past Papers</p>
                      <p className="text-2xl font-bold">{stats?.pastPapers || 0}</p>
                    </div>
                    <FileText className="h-8 w-8 text-green-200" />
                  </div>
                </CardContent>
              </Card>
            </AnimatedWrapper>

            <AnimatedWrapper animation="slideUp" delay={0.3} hover>
              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100">Downloads</p>
                      <p className="text-2xl font-bold">{stats?.totalDownloads || 0}</p>
                    </div>
                    <Download className="h-8 w-8 text-purple-200" />
                  </div>
                </CardContent>
              </Card>
            </AnimatedWrapper>

            <AnimatedWrapper animation="slideUp" delay={0.4} hover>
              <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100">Achievements</p>
                      <p className="text-2xl font-bold">0</p>
                    </div>
                    <Award className="h-8 w-8 text-orange-200" />
                  </div>
                </CardContent>
              </Card>
            </AnimatedWrapper>
          </motion.div>

          {/* Main Content */}
          <motion.div variants={itemVariants}>
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="materials">Study Materials</TabsTrigger>
                <TabsTrigger value="papers">Past Papers</TabsTrigger>
                <TabsTrigger value="profile">Profile</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Study Materials */}
                  <AnimatedWrapper animation="slideLeft" delay={0.1}>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BookOpen className="h-5 w-5" />
                          Recent Study Materials
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {recentMaterials?.map((material, index) => (
                          <motion.div
                            key={material.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                          >
                            <div>
                              <h4 className="font-medium">{material.title}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                {material.subject} • {material.grade}
                              </p>
                            </div>
                            <Badge variant="outline">{material.category}</Badge>
                          </motion.div>
                        ))}
                      </CardContent>
                    </Card>
                  </AnimatedWrapper>

                  {/* Recent Past Papers */}
                  <AnimatedWrapper animation="slideRight" delay={0.1}>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Recent Past Papers
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {recentPapers?.map((paper, index) => (
                          <motion.div
                            key={paper.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                          >
                            <div>
                              <h4 className="font-medium">{paper.title}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                {paper.subject} • {paper.grade} • {paper.year}
                              </p>
                            </div>
                            <Badge variant="outline">{paper.board}</Badge>
                          </motion.div>
                        ))}
                      </CardContent>
                    </Card>
                  </AnimatedWrapper>
                </div>
              </TabsContent>

              <TabsContent value="materials">
                <AnimatedWrapper animation="fadeIn">
                  <Card>
                    <CardHeader>
                      <CardTitle>Your Study Materials</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>Study materials management interface would go here...</p>
                    </CardContent>
                  </Card>
                </AnimatedWrapper>
              </TabsContent>

              <TabsContent value="papers">
                <AnimatedWrapper animation="fadeIn">
                  <Card>
                    <CardHeader>
                      <CardTitle>Your Past Papers</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>Past papers management interface would go here...</p>
                    </CardContent>
                  </Card>
                </AnimatedWrapper>
              </TabsContent>

              <TabsContent value="profile">
                <AnimatedWrapper animation="fadeIn">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Profile Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Email</label>
                          <p className="text-gray-600 dark:text-gray-300">{user?.email}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Member Since</label>
                          <p className="text-gray-600 dark:text-gray-300">
                            {new Date(user?.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedWrapper>
              </TabsContent>
            </Tabs>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentDashboard;
