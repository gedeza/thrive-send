"use client"

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Define role types
type Role = "owner" | "admin" | "member" | "viewer";

interface Member {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "active" | "invited";
  joinedAt: string;
}

const inviteSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "member", "viewer"]),
});

const defaultMembers: Member[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    role: "owner",
    status: "active",
    joinedAt: "2024-01-01",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "admin",
    status: "active",
    joinedAt: "2024-01-02",
  },
];

export function OrganizationMembers() {
  const { toast } = useToast();
  const [members, setMembers] = useState<Member[]>(defaultMembers);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  const inviteForm = useForm({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: "",
      role: "member" as Role,
    },
  });

  const handleInvite = async (data: z.infer<typeof inviteSchema>) => {
    try {
      // TODO: Add API call to send invitation
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
      
      const newMember: Member = {
        id: Math.random().toString(),
        name: data.email.split("@")[0],
        email: data.email,
        role: data.role,
        status: "invited",
        joinedAt: new Date().toISOString(),
      };

      setMembers([...members, newMember]);
      setIsInviteDialogOpen(false);
      inviteForm.reset();

      toast({
        title: "Invitation Sent",
        description: `Invitation sent to ${data.email}`,
      });
    } catch (_error) {
      console.error("", _error);
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive",
      });
    }
  };

  const handleRoleChange = async (memberId: string, newRole: Role) => {
    try {
      // TODO: Add API call to update role
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
      
      setMembers(members.map(member => 
        member.id === memberId ? { ...member, role: newRole } : member
      ));

      toast({
        title: "Role Updated",
        description: "Member role has been updated successfully",
      });
    } catch (_error) {
      console.error("", _error);
      toast({
        title: "Error",
        description: "Failed to update member role",
        variant: "destructive",
      });
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      // TODO: Add API call to remove member
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
      
      setMembers(members.filter(member => member.id !== memberId));

      toast({
        title: "Member Removed",
        description: "Member has been removed from the organization",
      });
    } catch (_error) {
      console.error("", _error);
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Members & Roles</CardTitle>
            <CardDescription>
              Manage your organization members and their roles.
            </CardDescription>
          </div>
          <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button>Invite Member</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite New Member</DialogTitle>
                <DialogDescription>
                  Send an invitation to join your organization.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={inviteForm.handleSubmit(handleInvite)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    {...inviteForm.register("email")}
                    placeholder="member@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    onValueChange={(value) => inviteForm.setValue("role", value as Role)}
                    defaultValue={inviteForm.getValues("role")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button type="submit">Send Invitation</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>{member.name}</TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>
                  <Select
                    defaultValue={member.role}
                    onValueChange={(value) => handleRoleChange(member.id, value as Role)}
                    disabled={member.role === "owner"}
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="owner">Owner</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Badge variant={member.status === "active" ? "default" : "secondary"}>
                    {member.status}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(member.joinedAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  {member.role !== "owner" && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      Remove
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
} 