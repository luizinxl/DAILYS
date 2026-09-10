import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/config/supabase';

export interface ShoppingListItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  checked: boolean;
  estimated_price: number | null;
  price_source: string | null;
  price_updated_at: string | null;
  created_at: string;
}

export function useShoppingList() {
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lookingUp, setLookingUp] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from('shopping_list_items')
      .select('*')
      .order('created_at', { ascending: false });
    if (fetchError) {
      setError(fetchError.message);
    } else {
      setItems((data as ShoppingListItem[]) || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const addItem = async (name: string, quantity: number = 1, unit: string = 'un') => {
    if (!name.trim()) return;
    const { error: insertError } = await supabase
      .from('shopping_list_items')
      .insert({ name: name.trim(), quantity, unit, checked: false });
    if (insertError) {
      setError(insertError.message);
      return;
    }
    await fetchItems();
  };

  const toggleChecked = async (id: string, checked: boolean) => {
    const { error: updateError } = await supabase
      .from('shopping_list_items')
      .update({ checked })
      .eq('id', id);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    await fetchItems();
  };

  const deleteItem = async (id: string) => {
    const { error: deleteError } = await supabase
      .from('shopping_list_items')
      .delete()
      .eq('id', id);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    await fetchItems();
  };

  const lookupPrice = async (id: string, name: string) => {
    setLookingUp(id);
    setError(null);
    try {
      const baseUrl = import.meta.env.VITE_SUPABASE_URL as string;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
      const url = `${baseUrl}/functions/v1/atacadao-price?q=${encodeURIComponent(name)}`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${anonKey}`,
          apikey: anonKey,
        },
      });
      const data = await res.json();
      if (data?.found) {
        const { error: updateError } = await supabase
          .from('shopping_list_items')
          .update({
            estimated_price: data.price,
            price_source: 'Atacadão',
            price_updated_at: new Date().toISOString(),
          })
          .eq('id', id);
        if (updateError) {
          setError(updateError.message);
        } else {
          await fetchItems();
        }
      } else {
        setError(`Preço não encontrado para "${name}" no Atacadão.`);
      }
    } catch (e) {
      setError('Erro ao consultar o preço. Tente novamente.');
    } finally {
      setLookingUp(null);
    }
  };

  const totalEstimated = items.reduce(
    (sum, item) => sum + (item.estimated_price || 0) * item.quantity,
    0
  );

  return {
    items,
    loading,
    error,
    lookingUp,
    totalEstimated,
    addItem,
    toggleChecked,
    deleteItem,
    lookupPrice,
    refresh: fetchItems,
  };
}
