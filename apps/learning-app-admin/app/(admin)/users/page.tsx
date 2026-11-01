import { prisma } from "@lazariways/database/client"
import { Badge } from "@lazariways/ui/components/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@lazariways/ui/components/table"
import { Users } from "lucide-react"
import { headers } from "next/headers"

import { auth } from "@/lib/auth.server"

import { DeleteUserButton } from "./delete-user-button"
import { InviteUserDialog } from "./invite-user-dialog"
import { ResetPasswordButton } from "./reset-password-button"

const dateFormatter = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" })

export default async function AdminUsers() {
  const session = await auth.api.getSession({ headers: await headers() })
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      disabledAt: true,
      createdAt: true,
      _count: { select: { userExamCompletions: true } },
      accounts: { where: { providerId: "credential" }, select: { id: true } },
    },
  })

  return (
    <div className="px-4 py-8 md:px-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground">
            {users.length} {users.length === 1 ? "account" : "accounts"}
          </p>
        </div>
        <InviteUserDialog />
      </div>

      {users.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-16 text-center">
          <Users className="size-8 text-muted-foreground" aria-hidden />
          <p className="font-medium">No users yet</p>
          <p className="text-sm text-muted-foreground">Invite a learner to get started.</p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Exams completed</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const isInvited = user.accounts.length === 0

                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === "ADMIN" ? "default" : "outline"}>
                        {user.role === "ADMIN" ? "Admin" : "Learner"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.disabledAt ? (
                        <Badge variant="destructive">Disabled</Badge>
                      ) : isInvited ? (
                        <Badge variant="outline">Invited</Badge>
                      ) : (
                        <Badge variant="secondary">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {user._count.userExamCompletions}
                    </TableCell>
                    <TableCell className="text-muted-foreground tabular-nums">
                      {dateFormatter.format(user.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <ResetPasswordButton
                          userId={user.id}
                          email={user.email}
                          disabled={user.disabledAt !== null}
                          invited={isInvited}
                        />
                        <DeleteUserButton
                          userId={user.id}
                          email={user.email}
                          disabled={user.id === session?.user.id}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
