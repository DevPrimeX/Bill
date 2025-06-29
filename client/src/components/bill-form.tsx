import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Upload, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertBillSchema, type InsertBill, type Bill } from "@shared/schema";

interface BillFormProps {
  bill?: Bill;
  onSuccess: () => void;
}

export function BillForm({ bill, onSuccess }: BillFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!bill;
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(bill?.imageUrl || null);

  const form = useForm<InsertBill>({
    resolver: zodResolver(insertBillSchema),
    defaultValues: {
      name: bill?.name || "",
      amount: bill?.amount || "",
      dueDate: bill?.dueDate || "",
      category: bill?.category || "",
      company: bill?.company || "",
      notes: bill?.notes || "",
      status: (bill?.status as any) || "unpaid",
      recurring: bill?.recurring || false,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertBill) => {
      let billResult;
      if (isEditing) {
        billResult = await apiRequest('PUT', `/api/bills/${bill.id}`, data);
      } else {
        billResult = await apiRequest('POST', '/api/bills', data);
      }

      // Handle file upload if a file is selected
      if (selectedFile && billResult.id) {
        const formData = new FormData();
        formData.append('image', selectedFile);
        await apiRequest('POST', `/api/bills/${billResult.id}/image`, formData);
      }

      return billResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bills'] });
      toast({
        title: "Success",
        description: `Bill ${isEditing ? 'updated' : 'created'} successfully`,
      });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || `Failed to ${isEditing ? 'update' : 'create'} bill`,
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: InsertBill) => {
    mutation.mutate(data);
  };

  return (
    <div className="flex flex-col h-full max-h-[80vh]">
      <DialogHeader className="pb-4 flex-shrink-0">
        <DialogTitle>
          {isEditing ? 'Edit Bill' : 'Add New Bill'}
        </DialogTitle>
      </DialogHeader>
      
      <div className="flex-1 overflow-y-auto pr-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" id="bill-form">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bill Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Electric Bill, Rent, Credit Card" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01" 
                      placeholder="0.00" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="utilities">⚡ Utilities</SelectItem>
                      <SelectItem value="rent">🏠 Rent</SelectItem>
                      <SelectItem value="credit_cards">💳 Credit Cards</SelectItem>
                      <SelectItem value="insurance">🛡️ Insurance</SelectItem>
                      <SelectItem value="subscriptions">📱 Subscriptions</SelectItem>
                      <SelectItem value="other">📄 Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company/Payee (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., ConEd, Chase Bank" 
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add any additional notes..."
                      rows={3}
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="recurring"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value || false}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>This is a recurring bill</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            {/* Image Upload Section */}
            <FormItem>
              <FormLabel>Bill Receipt/Image (Optional)</FormLabel>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="bill-image"
                  />
                  <label
                    htmlFor="bill-image"
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Choose Image</span>
                  </label>
                  {selectedFile && (
                    <span className="text-sm text-gray-600">
                      {selectedFile.name}
                    </span>
                  )}
                </div>
                
                {imagePreview && (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Bill preview"
                      className="max-w-full h-32 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setImagePreview(null);
                        setSelectedFile(null);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </FormItem>
          </form>
        </Form>
      </div>
      
      <div className="flex-shrink-0 pt-4 border-t">
        <div className="flex space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={onSuccess}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="bill-form"
            disabled={mutation.isPending}
            className="flex-1"
          >
            {mutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                {isEditing ? 'Updating...' : 'Adding...'}
              </>
            ) : (
              isEditing ? 'Update Bill' : 'Add Bill'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}