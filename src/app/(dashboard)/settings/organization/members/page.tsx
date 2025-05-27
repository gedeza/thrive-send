"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useOrganization } from "@clerk/nextjs";
import { Loader2, UserPlus, UserMinus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OrganizationMembershipResource } from "@clerk/types";

type MemberRole = "admin" | "member";

interface Member {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  role: MemberRole;
}

export default function MembersSettingsPage() {
  const { organization, isLoaded } = useOrganization();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<MemberRole>("member");

  useEffect(() => {
    if (organization) {
      // Load organization members
      const loadMembers = async () => {
        try {
          const memberships = await organization.getMemberships();
          const membersList = memberships.data.map((membership: OrganizationMembershipResource) => ({
            id: membership.publicUserData?.userId || "",
            firstName: membership.publicUserData?.firstName,
            lastName: membership.publicUserData?.lastName,
            email: membership.publicUserData?.identifier || "",
            role: membership.role as MemberRole,
          }));
          setMembers(membersList);
        } catch (error) {
          console.error("Error loading members:", error);
          toast({
            title: "Error",
            description: "Failed to load organization members",
            variant: "destructive",
          });
        }
      };
      loadMembers();
    }
  }, [organization, toast]);

  const handleInvite = async () => {
    if (!organization) return;

    setIsSubmitting(true);
    try {
      await organization.inviteMember({
        emailAddress: inviteEmail,
        role: inviteRole,
      });

      toast({
        title: "Success",
        description: "Invitation sent successfully",
      });

      // Reset form
      setInviteEmail("");
      setInviteRole("member");
    } catch (error) {
      console.error("Error inviting member:", error);
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!organization) return;

    setIsSubmitting(true);
    try {
      await organization.removeMember(memberId);

      // Update members list
      setMembers(members.filter((member) => member.id !== memberId));

      toast({
        title: "Success",
        description: "Member removed successfully",
      });
    } catch (error) {
      console.error("Error removing member:", error);
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: MemberRole) => {
    if (!organization) return;

    setIsSubmitting(true);
    try {
      const memberships = await organization.getMemberships();
      const membership = memberships.data.find((m) => m.publicUserData?.userId === memberId);
      
      if (membership) {
        await membership.update({ role: newRole });

        // Update members list
        setMembers(
          members.map((member) =>
            member.id === memberId ? { ...member, role: newRole } : member
          )
        );

        toast({
          title: "Success",
          description: "Member role updated successfully",
        });
      }
    } catch (error) {
      console.error("Error updating member role:", error);
      toast({
        title: "Error",
        description: "Failed to update member role",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Invite Members</CardTitle>
          <CardDescription>
            Invite new members to your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="member@example.com"
                disabled={isSubmitting}
              />
            </div>
            <div className="w-48 space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={inviteRole}
                onValueChange={(value: MemberRole) => setInviteRole(value)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleInvite}
                disabled={isSubmitting || !inviteEmail}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Invite
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
          <CardDescription>
            Manage your organization members and their roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    {member.firstName} {member.lastName}
                  </TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>
                    <Select
                      value={member.role}
                      onValueChange={(value: MemberRole) =>
                        handleUpdateRole(member.id, value)
                      }
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveMember(member.id)}
                      disabled={isSubmitting}
                    >
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 