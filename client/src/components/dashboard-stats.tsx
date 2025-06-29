import { useMemo } from "react";
import { FileText, Clock, AlertTriangle, DollarSign, Plus, Check, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, getBillStatusInfo } from "@/lib/utils";
import type { Bill } from "@shared/schema";

interface DashboardStatsProps {
  bills: Bill[];
  isLoading: boolean;
}

export function DashboardStats({ bills, isLoading }: DashboardStatsProps) {
  const stats = useMemo(() => {
    if (!bills.length) {
      return {
        totalBills: 0,
        dueThisWeek: 0,
        overdue: 0,
        monthlyTotal: 0,
        upcomingBills: [],
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekFromNow = new Date(today);
    weekFromNow.setDate(weekFromNow.getDate() + 7);

    let dueThisWeek = 0;
    let overdue = 0;
    let monthlyTotal = 0;
    const upcomingBills: Bill[] = [];

    bills.forEach((bill) => {
      const dueDate = new Date(bill.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      const amount = parseFloat(bill.amount);

      monthlyTotal += amount;

      if (bill.status !== 'paid') {
        if (dueDate < today) {
          overdue++;
        } else if (dueDate <= weekFromNow) {
          dueThisWeek++;
        }

        if (dueDate <= weekFromNow) {
          upcomingBills.push(bill);
        }
      }
    });

    return {
      totalBills: bills.length,
      dueThisWeek,
      overdue,
      monthlyTotal,
      upcomingBills: upcomingBills.slice(0, 3),
    };
  }, [bills]);

  if (isLoading) {
    return (
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="shadow-material">
              <CardContent className="p-6">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-10 w-10 rounded-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="shadow-material">
            <CardContent className="p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-material">
            <CardContent className="p-6">
              <Skeleton className="h-6 w-24 mb-4" />
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="shadow-material hover:shadow-material-hover transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bills</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBills}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <FileText className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-material hover:shadow-material-hover transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Due This Week</p>
                <p className="text-2xl font-bold text-warning">{stats.dueThisWeek}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <Clock className="h-5 w-5 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-material hover:shadow-material-hover transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-error">{stats.overdue}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <AlertTriangle className="h-5 w-5 text-error" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-material hover:shadow-material-hover transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Total</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.monthlyTotal)}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <DollarSign className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card className="shadow-material">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button variant="ghost" className="w-full justify-start p-3 h-auto">
                <div className="bg-primary p-2 rounded-lg mr-3">
                  <Plus className="h-4 w-4 text-white" />
                </div>
                <span className="font-medium text-gray-700">Add New Bill</span>
              </Button>
              <Button variant="ghost" className="w-full justify-start p-3 h-auto">
                <div className="bg-success p-2 rounded-lg mr-3">
                  <Check className="h-4 w-4 text-white" />
                </div>
                <span className="font-medium text-gray-700">Mark Bills as Paid</span>
              </Button>
              <Button variant="ghost" className="w-full justify-start p-3 h-auto">
                <div className="bg-warning p-2 rounded-lg mr-3">
                  <Search className="h-4 w-4 text-white" />
                </div>
                <span className="font-medium text-gray-700">Search Bills</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-material">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Due Soon</h3>
            <div className="space-y-4">
              {stats.upcomingBills.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No upcoming bills</p>
              ) : (
                stats.upcomingBills.map((bill) => {
                  const statusInfo = getBillStatusInfo(bill);
                  return (
                    <div 
                      key={bill.id} 
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        statusInfo.status === 'overdue' ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${statusInfo.status === 'overdue' ? 'bg-error' : 'bg-warning'}`}>
                          <span className="text-white text-sm">
                            {bill.category === 'utilities' && '⚡'}
                            {bill.category === 'credit_cards' && '💳'}
                            {bill.category === 'rent' && '🏠'}
                            {bill.category === 'insurance' && '🛡️'}
                            {bill.category === 'subscriptions' && '📱'}
                            {bill.category === 'other' && '📄'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{bill.name}</p>
                          <p className={`text-sm ${statusInfo.status === 'overdue' ? 'text-error' : 'text-gray-600'}`}>
                            {statusInfo.status === 'overdue' ? 'Overdue: ' : 'Due: '}
                            {new Date(bill.dueDate).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>
                      <span className="font-semibold text-gray-900">{formatCurrency(bill.amount)}</span>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
