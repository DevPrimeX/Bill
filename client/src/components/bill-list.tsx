import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Check, Edit, Trash2, ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { BillForm } from "./bill-form";
import { formatCurrency, formatDate, getBillStatusInfo, getCategoryIcon } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import type { Bill } from "@shared/schema";

interface BillListProps {
  bills: Bill[];
  isLoading: boolean;
}

export function BillList({ bills, isLoading }: BillListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const markAsPaidMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: 'paid' | 'unpaid' }) => {
      await apiRequest('PATCH', `/api/bills/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bills'] });
      toast({
        title: "Success",
        description: "Bill status updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update bill status",
        variant: "destructive",
      });
    },
  });

  const deleteBillMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/bills/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bills'] });
      toast({
        title: "Success",
        description: "Bill deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete bill",
        variant: "destructive",
      });
    },
  });

  const filteredBills = bills.filter((bill) => {
    const matchesSearch = bill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (bill.company && bill.company.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !selectedCategory || selectedCategory === 'all' || bill.category === selectedCategory;
    const billStatusInfo = getBillStatusInfo(bill);
    const matchesStatus = !selectedStatus || selectedStatus === 'all' || 
                         (selectedStatus === 'paid' && bill.status === 'paid') ||
                         (selectedStatus === 'unpaid' && bill.status === 'unpaid') ||
                         (selectedStatus === 'overdue' && billStatusInfo.status === 'overdue');
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleEditClick = (bill: Bill) => {
    setEditingBill(bill);
    setIsEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setEditingBill(null);
  };

  if (isLoading) {
    return (
      <Card className="shadow-material overflow-hidden">
        <CardContent className="p-6 border-b border-gray-200">
          <Skeleton className="h-6 w-24 mb-4" />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <Skeleton className="h-10 w-64" />
            <div className="flex space-x-4">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </CardContent>
        <div className="p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="shadow-material overflow-hidden">
      <CardContent className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <h2 className="text-xl font-semibold text-gray-900">All Bills</h2>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search bills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="utilities">Utilities</SelectItem>
                <SelectItem value="rent">Rent</SelectItem>
                <SelectItem value="credit_cards">Credit Cards</SelectItem>
                <SelectItem value="insurance">Insurance</SelectItem>
                <SelectItem value="subscriptions">Subscriptions</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>

      <div className="overflow-x-auto">
        {/* Desktop Table View */}
        <div className="hidden lg:block">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bill Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBills.map((bill) => {
                const statusInfo = getBillStatusInfo(bill);
                return (
                  <tr key={bill.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg mr-3 ${statusInfo.iconClassName === 'text-primary' ? 'bg-blue-100' : statusInfo.iconClassName === 'text-warning' ? 'bg-orange-100' : statusInfo.iconClassName === 'text-error' ? 'bg-red-100' : 'bg-green-100'}`}>
                          <span className="text-sm">{getCategoryIcon(bill.category)}</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{bill.name}</div>
                          {bill.company && (
                            <div className="text-sm text-gray-500">{bill.company}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatCurrency(bill.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(bill.dueDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="secondary" className="capitalize">
                        {bill.category.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={statusInfo.className}>
                        {statusInfo.label}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsPaidMutation.mutate({ 
                            id: bill.id, 
                            status: bill.status === 'paid' ? 'unpaid' : 'paid' 
                          })}
                          disabled={markAsPaidMutation.isPending}
                          className={bill.status === 'paid' ? 'text-gray-400' : 'text-success hover:text-green-700'}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditClick(bill)}
                          className="text-primary hover:text-blue-700"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteBillMutation.mutate(bill.id)}
                          disabled={deleteBillMutation.isPending}
                          className="text-error hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden p-4 space-y-4">
          {filteredBills.map((bill) => {
            const statusInfo = getBillStatusInfo(bill);
            return (
              <Card key={bill.id} className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${statusInfo.iconClassName === 'text-primary' ? 'bg-blue-100' : statusInfo.iconClassName === 'text-warning' ? 'bg-orange-100' : statusInfo.iconClassName === 'text-error' ? 'bg-red-100' : 'bg-green-100'}`}>
                        <span className="text-sm">{getCategoryIcon(bill.category)}</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{bill.name}</h3>
                        {bill.company && (
                          <p className="text-sm text-gray-500">{bill.company}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(bill.amount)}</p>
                      <p className="text-sm text-gray-500">{formatDate(bill.dueDate)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="capitalize">
                        {bill.category.replace('_', ' ')}
                      </Badge>
                      <Badge className={statusInfo.className}>
                        {statusInfo.label}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsPaidMutation.mutate({ 
                          id: bill.id, 
                          status: bill.status === 'paid' ? 'unpaid' : 'paid' 
                        })}
                        disabled={markAsPaidMutation.isPending}
                        className={bill.status === 'paid' ? 'text-gray-400' : 'text-success hover:text-green-700'}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(bill)}
                        className="text-primary hover:text-blue-700"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteBillMutation.mutate(bill.id)}
                        disabled={deleteBillMutation.isPending}
                        className="text-error hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredBills.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-500">No bills found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          {editingBill && (
            <BillForm 
              bill={editingBill} 
              onSuccess={handleEditSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
