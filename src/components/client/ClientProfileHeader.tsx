import React from "react";
import { User } from "@/services/types/authTypes";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Mail } from "lucide-react";

interface ClientProfileHeaderProps {
  user: User;
}

const ClientProfileHeader: React.FC<ClientProfileHeaderProps> = ({ user }) => {
  const initials = user.username
    ? user.username.slice(0, 2).toUpperCase()
    : user.email.slice(0, 2).toUpperCase();

  const displayName = user.username || user.email.split("@")[0];

  return (
    <Card className="border border-border shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <Avatar className="h-14 w-14 border-2 border-primary/15 flex-shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
              {initials}
            </AvatarFallback>
          </Avatar>

          {/* Info */}
          <div className="min-w-0 space-y-1">
            <p className="font-semibold text-base leading-tight truncate">
              {displayName}
            </p>

            {user.email && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
            )}

            {user.clientStage && (
              <div className="pt-0.5">
                <Badge
                  variant="secondary"
                  className="text-xs font-normal px-2 py-0.5"
                >
                  Этап: {user.clientStage}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientProfileHeader;
