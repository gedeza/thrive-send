"use client"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Plus, X, Eye, Calendar, DollarSign, FileText, Trash2 } from 'lucide-react';

interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  receipt?: string;
}

interface ExpensesModalProps {
  budgetId: string;
  clientId: string;
}

export function ExpensesModal({ budgetId, clientId }: ExpensesModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: 'OTHER',
  });

  const fetchExpenses = async () => {
    if (!isOpen) return;
    
    setLoading(true);
    try {
      // Temporary: Use mock data until API is working
      const mockExpenses: Expense[] = [
        {
          id: '1',
          description: 'Office Supplies',
          amount: 150.00,
          date: '2025-01-20',
          category: 'OPERATIONS'
        },
        {
          id: '2', 
          description: 'Marketing Materials',
          amount: 500.00,
          date: '2025-01-18',
          category: 'MARKETING'
        }
      ];
      
      setExpenses(mockExpenses);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Temporarily add to local state until API is working
      const newExpense: Expense = {
        id: Date.now().toString(),
        description: formData.description,
        amount: parseFloat(formData.amount),
        date: formData.date,
        category: formData.category,
      };
      
      setExpenses(prev => [newExpense, ...prev]);
      
      setFormData({
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category: 'OTHER',
      });
      setShowAddForm(false);
      
      // Show success message
      console.log('Expense added:', newExpense);
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const deleteExpense = async (expenseId: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    
    try {
      // Temporarily remove from local state until API is working
      setExpenses(prev => prev.filter(expense => expense.id !== expenseId));
      console.log('Expense deleted:', expenseId);
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [isOpen]);

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <>
      <Button variant="link" size="sm" onClick={() => setIsOpen(true)}>
        <Eye className="mr-2 h-4 w-4" />
        View All Expenses
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-100 shadow-2xl border border-gray-300 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-300 bg-gray-100">
              <h2 className="text-xl font-semibold">Budget Expenses</h2>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto bg-gray-100">
              {/* Summary */}
              <div className="bg-gray-100 p-4 rounded-lg mb-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Expenses</p>
                    <p className="text-2xl font-bold">{formatCurrency(totalExpenses)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddForm(!showAddForm)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Expense
                    </Button>
                  </div>
                </div>
              </div>

              {/* Add Expense Form */}
              {showAddForm && (
                <div className="bg-blue-100 p-4 rounded-lg mb-6 border border-blue-200">
                  <h3 className="font-medium mb-3">Add New Expense</h3>
                  <form onSubmit={addExpense} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="description">Description *</Label>
                        <Input
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Expense description"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="amount">Amount *</Label>
                        <Input
                          id="amount"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.amount}
                          onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                          placeholder="0.00"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="date">Date *</Label>
                        <Input
                          id="date"
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MARKETING">Marketing</SelectItem>
                            <SelectItem value="DEVELOPMENT">Development</SelectItem>
                            <SelectItem value="OPERATIONS">Operations</SelectItem>
                            <SelectItem value="TRAVEL">Travel</SelectItem>
                            <SelectItem value="EQUIPMENT">Equipment</SelectItem>
                            <SelectItem value="OTHER">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowAddForm(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" size="sm">Add Expense</Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Expenses List */}
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading expenses...</p>
                </div>
              ) : expenses.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No expenses recorded yet</p>
                  <p className="text-sm text-gray-500">Add your first expense to start tracking</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {expenses.map((expense) => (
                    <div key={expense.id} className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 border border-blue-200 rounded-full">
                              <DollarSign className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-medium">{expense.description}</h4>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(expense.date)}
                                </span>
                                <span className="px-2 py-1 bg-gray-200 border border-gray-300 rounded text-xs font-medium">
                                  {expense.category}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="font-semibold">{formatCurrency(expense.amount)}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteExpense(expense.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-gray-300 p-6 bg-gray-100">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">{expenses.length} expenses tracked</p>
                <Button onClick={() => setIsOpen(false)}>Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}