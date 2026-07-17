import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { truncateAddress, useApp } from "@/lib/app-context";
import { LogOut, Wallet } from "lucide-react";
import { toast } from "sonner";

export function WalletButton() {
  const { address, wallet, setModalOpen, disconnect } = useApp();

  if (!address) {
    return (
      <Button onClick={() => setModalOpen(true)} className="bg-teal text-teal-foreground hover:bg-teal/90">
        <Wallet className="mr-2 h-4 w-4" /> Connect Wallet
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="font-mono">
          <span className="mr-2 inline-block h-2 w-2 rounded-full bg-teal" />
          {truncateAddress(address)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Connected with {wallet}</span>
            <span className="font-mono text-sm">{truncateAddress(address)}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            disconnect();
            toast("Wallet disconnected");
          }}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" /> Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
