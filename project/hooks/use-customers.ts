'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface Customer {
  id: string;
  name: string;
  email: string;
  company?: string;
  status: string;
  totalPurchases: number;
  createdAt: string;
}

export function useCustomers(search: string) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/customers?search=${search}`);
        setCustomers(response.data.customers);
        setError(null);
      } catch (err) {
        setError('Failed to fetch customers');
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(() => {
      fetchCustomers();
    }, 300);

    return () => clearTimeout(debounce);
  }, [search]);

  return { customers, isLoading, error };
}