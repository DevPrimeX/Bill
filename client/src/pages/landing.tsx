import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt, Smartphone, Upload, Users } from "lucide-react";

export default function Landing() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Show login form for non-authenticated users
  const handleLogin = () => {
    window.location.href = "/auth";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-primary text-white w-10 h-10 rounded-lg flex items-center justify-center">
                <Receipt className="h-5 w-5" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">BillTracker</h1>
            </div>
            <Button onClick={handleLogin}>
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Track Your Bills with Ease
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Never miss a payment again. Organize, track, and manage all your bills in one place 
            with multi-device access and receipt photo storage.
          </p>
          <Button 
            size="lg" 
            className="px-8 py-3 text-lg"
            onClick={handleLogin}
          >
            Get Started Free
          </Button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="shadow-material hover:shadow-material-hover transition-shadow duration-200">
            <CardHeader className="text-center">
              <div className="bg-blue-100 p-3 rounded-full w-12 h-12 mx-auto mb-4">
                <Receipt className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Bill Organization</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Organize bills by category, due date, and payment status. 
                Get dashboard insights on your monthly expenses.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-material hover:shadow-material-hover transition-shadow duration-200">
            <CardHeader className="text-center">
              <div className="bg-green-100 p-3 rounded-full w-12 h-12 mx-auto mb-4">
                <Smartphone className="h-6 w-6 text-success" />
              </div>
              <CardTitle>Multi-Device Access</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Access your bills from any device - phone, tablet, or computer. 
                Stay synchronized across all your devices.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-material hover:shadow-material-hover transition-shadow duration-200">
            <CardHeader className="text-center">
              <div className="bg-orange-100 p-3 rounded-full w-12 h-12 mx-auto mb-4">
                <Upload className="h-6 w-6 text-warning" />
              </div>
              <CardTitle>Receipt Photos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Upload and store photos of your bills and receipts. 
                Keep digital copies for easy reference and record keeping.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white rounded-lg shadow-material p-8">
          <Users className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Join Thousands of Users
          </h2>
          <p className="text-gray-600 mb-6">
            Start managing your bills more effectively today.
          </p>
          <Button 
            size="lg" 
            className="px-8 py-3"
            onClick={handleLogin}
          >
            Sign In to Continue
          </Button>
        </div>
      </div>
    </div>
  );
}