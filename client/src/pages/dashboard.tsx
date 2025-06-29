import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Receipt, Plus, LogOut, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { DashboardStats } from "@/components/dashboard-stats";
import { BillList } from "@/components/bill-list";
import { BillForm } from "@/components/bill-form";
import type { Bill } from "@shared/schema";

export default function Dashboard() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const { data: bills = [], isLoading } = useQuery<Bill[]>({
    queryKey: ["/api/bills"],
    retry: false,
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-primary text-white w-10 h-10 rounded-lg flex items-center justify-center">
                <Receipt className="h-5 w-5" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">BillTracker</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Add Bill</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <BillForm onSuccess={() => setIsAddDialogOpen(false)} />
                </DialogContent>
              </Dialog>
              
              {/* Multi-device indicator */}
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-blue-50 rounded-full">
                <Smartphone className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-600 font-medium">Multi-Device</span>
              </div>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.profileImageUrl || ""} alt={user?.firstName || "User"} />
                      <AvatarFallback>
                        {user?.firstName?.charAt(0) || user?.email?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline text-sm font-medium">
                      {user?.firstName || user?.email || "User"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem className="flex items-center space-x-2">
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {user?.firstName && user?.lastName 
                          ? `${user.firstName} ${user.lastName}` 
                          : user?.firstName || "User"}
                      </span>
                      <span className="text-sm text-gray-500">{user?.email}</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="flex items-center space-x-2 text-red-600"
                    onClick={() => window.location.href = "/api/logout"}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h2>
          <DashboardStats bills={bills} isLoading={isLoading} />
        </div>

        {/* Bills Section */}
        <BillList bills={bills} isLoading={isLoading} />
      </div>
    </div>
  );
}
