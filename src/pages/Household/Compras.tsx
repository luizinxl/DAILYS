import { useState } from 'react';
import { Trash2, Search, Plus, CheckCircle2, Circle } from 'lucide-react';
import Card from '@/components/common/Card';
import { useShoppingList } from '@/hooks/useShoppingList';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function Compras() {
  const {
    items,
    loading,
    error,
    lookingUp,
    totalEstimated,
    addItem,
    toggleChecked,
    deleteItem,
    lookupPrice,
  } = useShoppingList();

  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState(1);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    addItem(newItemName, newItemQty);
    setNewItemName('');
    setNewItemQty(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Compras</h1>
        <p className="text-[#8E95A5] text-sm mt-1">
          Gerencie sua lista de compras com integração de preços do Atacadão.
        </p>
      </div>

      <Card variant="household" className="max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Lista de itens</h2>
          {totalEstimated > 0 && (
            <span className="text-sm text-[#8E95A5]">
              Estimado: <span className="text-white font-semibold">{formatCurrency(totalEstimated)}</span>
            </span>
          )}
        </div>

        <form onSubmit={handleAddItem} className="flex gap-2 mb-4">
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Novo item (ex: arroz)..."
            className="flex-1 bg-[#000000] border border-[#232735] rounded-lg px-3 py-2 text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-[#7C5CFC]"
          />
          <input
            type="number"
            min={1}
            value={newItemQty}
            onChange={(e) => setNewItemQty(Number(e.target.value) || 1)}
            className="w-16 bg-[#000000] border border-[#232735] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#7C5CFC]"
          />
          <button
            type="submit"
            className="flex items-center justify-center gap-1 bg-[#7C5CFC] hover:bg-[#6B4CE0] text-white text-sm font-semibold rounded-lg px-4 py-2 transition-colors"
          >
            <Plus size={16} />
          </button>
        </form>

        {error && <p className="text-[#F43F5E] text-sm mb-3">{error}</p>}

        {loading ? (
          <p className="text-[#8E95A5] text-sm">Carregando...</p>
        ) : items.length === 0 ? (
          <p className="text-[#8E95A5] text-sm">Lista de compras vazia.</p>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className={`flex items-center gap-3 bg-[#1D2029] border border-[#232735] rounded-lg px-3 py-2 ${
                  item.checked ? 'opacity-60' : ''
                }`}
              >
                <button
                  onClick={() => toggleChecked(item.id, !item.checked)}
                  className={item.checked ? 'text-[#2ECC71]' : 'text-[#8E95A5] hover:text-[#2ECC71]'}
                >
                  {item.checked ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                </button>
                <div className="flex-1">
                  <p className={`text-sm text-white ${item.checked ? 'line-through' : ''}`}>
                    {item.name}{' '}
                    <span className="text-[#64748B]">
                      ({item.quantity} {item.unit})
                    </span>
                  </p>
                  {item.estimated_price != null && (
                    <p className="text-xs text-[#818CF8]">
                      {formatCurrency(item.estimated_price)} · {item.price_source}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => lookupPrice(item.id, item.name)}
                  disabled={lookingUp === item.id}
                  title="Buscar preço no Atacadão"
                  className="text-[#64748B] hover:text-[#7C5CFC] disabled:opacity-40"
                >
                  <Search size={16} className={lookingUp === item.id ? 'animate-pulse' : ''} />
                </button>
                <button onClick={() => deleteItem(item.id)} className="text-[#64748B] hover:text-[#F43F5E]">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
