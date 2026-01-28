'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api-client';
import { Search, UserPlus, UserMinus, History } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  studentId?: string;
  branch?: string;
  picture?: string;
  createdAt: string;
  updatedAt: string;
}

interface AdminRoleHistory {
  id: string;
  userId: string;
  role: string;
  grantedBy: string;
  grantedAt: string;
  revokedAt?: string;
  revokedBy?: string;
  isActive: boolean;
  remarks?: string;
  user: {
    id: string;
    name: string;
    email: string;
    studentId?: string;
  };
  grantor: {
    id: string;
    name: string;
    email: string;
  };
  revoker?: {
    id: string;
    name: string;
    email: string;
  };
}

export default function RoleManagement() {
  const { toast } = useToast();
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AdminUser[]>([]);
  const [roleHistory, setRoleHistory] = useState<AdminRoleHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  // Dialog states
  const [grantDialogOpen, setGrantDialogOpen] = useState(false);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [selectedRole, setSelectedRole] = useState<'SPT' | 'JPT'>('JPT');
  const [remarks, setRemarks] = useState('');

  const fetchAdminUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/roles');
      setAdminUsers(response.data.users || []);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load admin users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchRoleHistory = useCallback(async () => {
    try {
      const response = await api.get('/admin/roles/history');
      setRoleHistory(response.data.history || []);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load role history',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const searchUsers = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      try {
        setSearching(true);
        const response = await api.get(`/admin/roles/search?q=${encodeURIComponent(query)}`);
        setSearchResults(response.data.users || []);
      } catch {
        toast({
          title: 'Error',
          description: 'Failed to search users',
          variant: 'destructive',
        });
      } finally {
        setSearching(false);
      }
    },
    [toast],
  );

  useEffect(() => {
    fetchAdminUsers();
    fetchRoleHistory();
  }, [fetchAdminUsers, fetchRoleHistory]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (searchQuery) {
        searchUsers(searchQuery);
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery, searchUsers]);

  const handleGrantRole = async () => {
    if (!selectedUser) return;

    try {
      await api.post('/admin/roles/grant', {
        userId: selectedUser.id,
        role: selectedRole,
        remarks: remarks.trim() || undefined,
      });

      toast({
        title: 'Success',
        description: `${selectedRole} role granted to ${selectedUser.name}`,
      });

      setGrantDialogOpen(false);
      setSelectedUser(null);
      setRemarks('');
      fetchAdminUsers();
      fetchRoleHistory();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.error || 'Failed to grant role',
        variant: 'destructive',
      });
    }
  };

  const handleRevokeRole = async () => {
    if (!selectedUser) return;

    try {
      await api.post('/admin/roles/revoke', {
        userId: selectedUser.id,
        remarks: remarks.trim() || undefined,
      });

      toast({
        title: 'Success',
        description: `Role revoked from ${selectedUser.name}`,
      });

      setRevokeDialogOpen(false);
      setSelectedUser(null);
      setRemarks('');
      fetchAdminUsers();
      fetchRoleHistory();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.error || 'Failed to revoke role',
        variant: 'destructive',
      });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'SPT':
        return 'bg-purple-500 hover:bg-purple-600';
      case 'JPT':
        return 'bg-blue-500 hover:bg-blue-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Admin Users</TabsTrigger>
          <TabsTrigger value="grant">Grant Role</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Admin Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Current Admin Users</h3>
            <Button onClick={fetchAdminUsers} variant="outline" size="sm">
              Refresh
            </Button>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adminUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.studentId || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(user.role)}>{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      {user.role !== 'SPT' && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setRevokeDialogOpen(true);
                          }}
                        >
                          <UserMinus className="h-4 w-4 mr-1" />
                          Revoke
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        {/* Grant Role Tab */}
        <TabsContent value="grant" className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label>Search Users</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or student ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {searching && <p>Searching...</p>}

            {searchResults.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Current Role</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {searchResults.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.studentId || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeColor(user.role)}>{user.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setGrantDialogOpen(true);
                          }}
                          disabled={['SPT', 'JPT'].includes(user.role)}
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          Grant Role
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Role Grant/Revoke History</h3>
            <Button onClick={fetchRoleHistory} variant="outline" size="sm">
              <History className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Granted By</TableHead>
                <TableHead>Granted At</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roleHistory.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{record.user.name}</p>
                      <p className="text-sm text-muted-foreground">{record.user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getRoleBadgeColor(record.role)}>{record.role}</Badge>
                  </TableCell>
                  <TableCell>{record.grantor.name}</TableCell>
                  <TableCell>{new Date(record.grantedAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {record.isActive ? (
                      <Badge className="bg-green-500">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Revoked</Badge>
                    )}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{record.remarks || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>

      {/* Grant Role Dialog */}
      <Dialog open={grantDialogOpen} onOpenChange={setGrantDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Grant Admin Role</DialogTitle>
            <DialogDescription>
              Grant administrative privileges to {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Select Role</Label>
              <Select
                value={selectedRole}
                onValueChange={(value) => setSelectedRole(value as 'SPT' | 'JPT')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SPT">
                    SPT (Senior Placement Team) - Full Administrative Control
                  </SelectItem>
                  <SelectItem value="JPT">
                    JPT (Junior Placement Team) - Attendance Management Only
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Remarks (Optional)</Label>
              <Textarea
                placeholder="Add notes about why this role is being granted..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setGrantDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleGrantRole}>Grant {selectedRole} Role</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Role Dialog */}
      <Dialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke Admin Role</DialogTitle>
            <DialogDescription>
              Remove administrative privileges from {selectedUser?.name}? They will become a regular
              user.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Remarks (Optional)</Label>
              <Textarea
                placeholder="Add notes about why this role is being revoked..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRevokeDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRevokeRole}>
              Revoke Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
