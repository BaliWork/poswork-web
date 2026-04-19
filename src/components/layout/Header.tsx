import { useAuth } from "@/context/AuthContext";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
      >
        <Menu />
      </Button>
      <div className="flex-1" />
      <div className="flex items-center gap-2 text-sm">
        <span className="hidden text-muted-foreground sm:inline">
          {user?.email}
        </span>
      </div>
    </header>
  );
}
