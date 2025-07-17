
import { useState } from 'react';
import { 
  Search, 
  UserCog, 
  Shield, 
  ShieldAlert, 
  Mail, 
  UserX, 
  Eye, 
  Trash2, 
  Clock, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Filter,
  Download,
  MessageSquare
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
  role: 'student' | 'teacher' | 'contributor' | 'admin';
  status: 'active' | 'suspended' | 'pending';
  verified: boolean;
  joinDate: string;
  lastLogin: string;
  downloads: number;
  comments: number;
  reports: number;
}

const usersMockData: User[] = [
  {
    id: 1,
    name: 'Rahul Sharma',
    email: 'rahul.s@example.com',
    avatar: '/placeholder.svg',
    role: 'student',
    status: 'active',
    verified: true,
    joinDate: '2023-04-15',
    lastLogin: '2023-07-10T08:30:45',
    downloads: 42,
    comments: 12,
    reports: 0
  },
  {
    id: 2,
    name: 'Priya Patel',
    email: 'priya.p@example.com',
    avatar: '/placeholder.svg',
    role: 'teacher',
    status: 'active',
    verified: true,
    joinDate: '2023-03-22',
    lastLogin: '2023-07-11T14:20:10',
    downloads: 87,
    comments: 34,
    reports: 0
  },
  {
    id: 3,
    name: 'Ajay Kumar',
    email: 'ajay.k@example.com',
    avatar: '/placeholder.svg',
    role: 'student',
    status: 'suspended',
    verified: true,
    joinDate: '2023-05-30',
    lastLogin: '2023-06-28T10:15:22',
    downloads: 7,
    comments: 3,
    reports: 2
  },
  {
    id: 4,
    name: 'Neha Gupta',
    email: 'neha.g@example.com',
    avatar: '/placeholder.svg',
    role: 'contributor',
    status: 'active',
    verified: true,
    joinDate: '2023-02-18',
    lastLogin: '2023-07-12T09:45:33',
    downloads: 124,
    comments: 56,
    reports: 0
  },
  {
    id: 5,
    name: 'Vikram Singh',
    email: 'vikram.s@example.com',
    avatar: '/placeholder.svg',
    role: 'student',
    status: 'pending',
    verified: false,
    joinDate: '2023-07-05',
    lastLogin: '2023-07-05T16:40:12',
    downloads: 3,
    comments: 0,
    reports: 0
  }
];

interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
  role: 'student' | 'teacher' | 'contributor' | 'admin';
  status: 'active' | 'suspended' | 'pending';
  verified: boolean;
  joinDate: string;
  lastLogin: string;
  downloads: number;
  comments: number;
  reports: number;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>(usersMockData);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = 
      activeTab === 'all' ||
      (activeTab === 'verified' && user.verified) ||
      (activeTab === 'unverified' && !user.verified) ||
      (activeTab === 'suspended' && user.status === 'suspended') ||
      (activeTab === 'pending' && user.status === 'pending');
    
    return matchesSearch && matchesTab;
  });
  
  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsUserDialogOpen(true);
  };
  
  const handleStatusChange = (userId: number, newStatus: 'active' | 'suspended' | 'pending') => {
    setUsers(users.map(user => 
      user.id === userId ? {...user, status: newStatus} : user
    ));
    
    const actionText = 
      newStatus === 'active' ? 'activated' :
      newStatus === 'suspended' ? 'suspended' : 'set to pending';
    
    toast.success(`User account ${actionText}`);
    
    if (selectedUser && selectedUser.id === userId) {
      setSelectedUser({...selectedUser, status: newStatus});
    }
  };
  
  const handleVerifyUser = (userId: number) => {
    setUsers(users.map(user => 
      user.id === userId ? {...user, verified: true} : user
    ));
    
    toast.success('User verified successfully');
    
    if (selectedUser && selectedUser.id === userId) {
      setSelectedUser({...selectedUser, verified: true});
    }
  };
  
  const handleDeleteUser = (userId: number) => {
    setUsers(users.filter(user => user.id !== userId));
    toast.success('User deleted successfully');
    
    if (selectedUser && selectedUser.id === userId) {
      setIsUserDialogOpen(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
  };
  
  const getTimeAgo = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 30) {
      return formatDate(dateTimeString);
    } else if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMins > 0) {
      return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };
  
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'teacher': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'contributor': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'student': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };
  
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'suspended': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">User Management</h2>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 w-full sm:w-auto min-w-[200px]"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-10 w-10">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setActiveTab('all')}>
                All Users
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab('verified')}>
                Verified Users
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab('unverified')}>
                Unverified Users
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setActiveTab('suspended')}>
                Suspended Users
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab('pending')}>
                Pending Users
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {users.filter(u => u.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Pending Verification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {users.filter(u => !u.verified).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Suspended Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {users.filter(u => u.status === 'suspended').length}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableCaption>
              {
                activeTab !== 'all' && (
                  <span className="font-medium">
                    Showing {
                      activeTab === 'verified' ? 'verified' :
                      activeTab === 'unverified' ? 'unverified' :
                      activeTab === 'suspended' ? 'suspended' : 'pending'
                    } users
                  </span>
                )
              }
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white flex items-center">
                            {user.name}
                            {user.verified && (
                              <CheckCircle className="h-3.5 w-3.5 text-green-500 ml-1" />
                            )}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getRoleBadgeColor(user.role)}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusBadgeColor(user.status)}>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="h-3.5 w-3.5 text-gray-400 mr-1" />
                        <span className="text-sm">{formatDate(user.joinDate)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center" title={formatDateTime(user.lastLogin)}>
                        <Clock className="h-3.5 w-3.5 text-gray-400 mr-1" />
                        <span className="text-sm">{getTimeAgo(user.lastLogin)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleViewUser(user)}
                        >
                          <Eye className="h-4 w-4 text-gray-500" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <UserCog className="h-4 w-4 text-gray-500" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {!user.verified && (
                              <DropdownMenuItem
                                onClick={() => handleVerifyUser(user.id)}
                              >
                                <Shield className="h-4 w-4 mr-2 text-green-500" />
                                <span>Verify User</span>
                              </DropdownMenuItem>
                            )}
                            
                            {user.status !== 'active' && (
                              <DropdownMenuItem 
                                onClick={() => handleStatusChange(user.id, 'active')}
                              >
                                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                                <span>Activate Account</span>
                              </DropdownMenuItem>
                            )}
                            
                            {user.status !== 'suspended' && (
                              <DropdownMenuItem 
                                onClick={() => handleStatusChange(user.id, 'suspended')}
                              >
                                <ShieldAlert className="h-4 w-4 mr-2 text-red-500" />
                                <span>Suspend Account</span>
                              </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuItem>
                              <Mail className="h-4 w-4 mr-2 text-blue-500" />
                              <span>Email User</span>
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 dark:text-red-400"
                            >
                              <UserX className="h-4 w-4 mr-2" />
                              <span>Delete Account</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {/* User Details Dialog */}
      {selectedUser && (
        <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
              <DialogDescription>
                View and manage user information
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="profile" className="mt-4">
              <TabsList>
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile" className="space-y-4 pt-4">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/3 flex flex-col items-center">
                    <Avatar className="h-24 w-24 mb-4">
                      <AvatarImage src={selectedUser.avatar} />
                      <AvatarFallback className="text-2xl">{selectedUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    
                    <div className="text-center mb-4">
                      <h3 className="text-xl font-bold">{selectedUser.name}</h3>
                      <p className="text-gray-500 dark:text-gray-400">{selectedUser.email}</p>
                    </div>
                    
                    <div className="space-y-2 w-full">
                      <Badge variant="outline" className={`w-full justify-center py-1 ${getRoleBadgeColor(selectedUser.role)}`}>
                        {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
                      </Badge>
                      
                      <Badge variant="outline" className={`w-full justify-center py-1 ${getStatusBadgeColor(selectedUser.status)}`}>
                        {selectedUser.status.charAt(0).toUpperCase() + selectedUser.status.slice(1)}
                      </Badge>
                      
                      <Badge variant="outline" className={`w-full justify-center py-1 ${
                        selectedUser.verified 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                      }`}>
                        {selectedUser.verified ? 'Verified' : 'Not Verified'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="md:w-2/3">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Join Date
                          </label>
                          <p className="text-gray-900 dark:text-white">
                            {formatDate(selectedUser.joinDate)}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Last Active
                          </label>
                          <p className="text-gray-900 dark:text-white">
                            {formatDateTime(selectedUser.lastLogin)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Downloads
                          </label>
                          <p className="text-gray-900 dark:text-white">
                            {selectedUser.downloads.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Comments
                          </label>
                          <p className="text-gray-900 dark:text-white">
                            {selectedUser.comments.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Reports
                          </label>
                          <p className={`font-medium ${
                            selectedUser.reports > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'
                          }`}>
                            {selectedUser.reports.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="pt-4 space-y-2">
                        <h4 className="font-medium">Actions</h4>
                        <div className="flex flex-wrap gap-2">
                          {!selectedUser.verified && (
                            <Button 
                              variant="outline" 
                              className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                              onClick={() => handleVerifyUser(selectedUser.id)}
                            >
                              <Shield className="h-4 w-4 mr-2" />
                              Verify User
                            </Button>
                          )}
                          
                          {selectedUser.status !== 'active' && (
                            <Button 
                              variant="outline"
                              className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                              onClick={() => handleStatusChange(selectedUser.id, 'active')}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Activate Account
                            </Button>
                          )}
                          
                          {selectedUser.status !== 'suspended' && (
                            <Button 
                              variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                              onClick={() => handleStatusChange(selectedUser.id, 'suspended')}
                            >
                              <ShieldAlert className="h-4 w-4 mr-2" />
                              Suspend Account
                            </Button>
                          )}
                          
                          <Button variant="outline">
                            <Mail className="h-4 w-4 mr-2" />
                            Email User
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="activity" className="pt-4">
                <div className="space-y-4">
                  <h3 className="font-medium">Recent Activity</h3>
                  
                  <div className="space-y-4">
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center">
                          <Download className="h-4 w-4 mr-2 text-blue-500" />
                          <span className="font-medium">Downloaded Materials</span>
                        </div>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                          {selectedUser.downloads} downloads
                        </Badge>
                      </div>
                      
                      {selectedUser.downloads > 0 ? (
                        <div className="space-y-2">
                          <div className="text-sm bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                            <div className="font-medium">Mathematics for Grade 10</div>
                            <div className="flex justify-between text-gray-500 dark:text-gray-400 text-xs mt-1">
                              <span>2 days ago</span>
                              <span>PDF Document</span>
                            </div>
                          </div>
                          
                          <div className="text-sm bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                            <div className="font-medium">Physics Notes - Mechanics</div>
                            <div className="flex justify-between text-gray-500 dark:text-gray-400 text-xs mt-1">
                              <span>5 days ago</span>
                              <span>PDF Document</span>
                            </div>
                          </div>
                          
                          {selectedUser.downloads > 2 && (
                            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                              <Button variant="link" size="sm" className="h-auto p-0">
                                View all downloads
                              </Button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          User hasn't downloaded any materials yet
                        </div>
                      )}
                    </div>
                    
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center">
                          <MessageSquare className="h-4 w-4 mr-2 text-purple-500" />
                          <span className="font-medium">Comments</span>
                        </div>
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400">
                          {selectedUser.comments} comments
                        </Badge>
                      </div>
                      
                      {selectedUser.comments > 0 ? (
                        <div className="space-y-2">
                          <div className="text-sm bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                            <div className="italic">"These notes are excellent! They helped me prepare for my final exams."</div>
                            <div className="flex justify-between text-gray-500 dark:text-gray-400 text-xs mt-1">
                              <span>On: Mathematics for Grade 10</span>
                              <span>3 days ago</span>
                            </div>
                          </div>
                          
                          {selectedUser.comments > 1 && (
                            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                              <Button variant="link" size="sm" className="h-auto p-0">
                                View all comments
                              </Button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          User hasn't posted any comments yet
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="security" className="pt-4">
                <div className="space-y-4">
                  <h3 className="font-medium">Security & Permissions</h3>
                  
                  <div className="space-y-4">
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="mb-4">
                        <h4 className="font-medium">Account Status</h4>
                        <div className="flex items-center mt-2">
                          <div className={`h-3 w-3 rounded-full mr-2 ${
                            selectedUser.status === 'active' ? 'bg-green-500' :
                            selectedUser.status === 'suspended' ? 'bg-red-500' : 'bg-yellow-500'
                          }`}></div>
                          <span className="text-gray-700 dark:text-gray-300">
                            {selectedUser.status === 'active' ? 'Active Account' :
                             selectedUser.status === 'suspended' ? 'Suspended Account' : 'Pending Account'}
                          </span>
                        </div>
                        
                        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                          {selectedUser.status === 'active' ? (
                            'Account is active and in good standing'
                          ) : selectedUser.status === 'suspended' ? (
                            'Account has been suspended due to policy violations'
                          ) : (
                            'Account is pending verification or review'
                          )}
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <h4 className="font-medium">Verification</h4>
                        <div className="flex items-center mt-2">
                          {selectedUser.verified ? (
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                          ) : (
                            <XCircle className="h-5 w-5 text-yellow-500 mr-2" />
                          )}
                          <span className="text-gray-700 dark:text-gray-300">
                            {selectedUser.verified ? 'Verified Account' : 'Not Verified'}
                          </span>
                        </div>
                        
                        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                          {selectedUser.verified ? (
                            'Email has been verified and account is confirmed'
                          ) : (
                            'Email verification is pending'
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium">Danger Zone</h4>
                        <div className="mt-2 space-y-2">
                          <Button 
                            variant="destructive" 
                            onClick={() => {
                              handleDeleteUser(selectedUser.id);
                              setIsUserDialogOpen(false);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Account
                          </Button>
                          
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            This action is permanent and can't be undone. All user data will be erased.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUserDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default UserManagement;
