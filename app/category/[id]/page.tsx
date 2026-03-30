"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Trash2, Plus, X, Pencil, ArrowUpDown } from 'lucide-react'; 
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CategoryPage() {
  const params = useParams();
  const rawId = params.id as string;
  const decodedId = decodeURIComponent(rawId);

  const [items, setItems] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  
  const [isSortMode, setIsSortMode] = useState(false);

  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [editingField, setEditingField] = useState<string | null>(null);

  const [newItemName, setNewItemName] = useState("");
  const [newDeadline, setNewDeadline] = useState("");
  const [newPurchaseDate, setNewPurchaseDate] = useState("");
  const [newShop, setNewShop] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newMemo, setNewMemo] = useState("");

  useEffect(() => {
    const savedSort = localStorage.getItem('isSortMode');
    if (savedSort === 'true') {
      setIsSortMode(true);
    }
    loadData();
  }, [decodedId]);

  const toggleSortMode = () => {
    const nextMode = !isSortMode;
    setIsSortMode(nextMode);
    localStorage.setItem('isSortMode', nextMode.toString());
  };

  const loadData = async () => {
    const { data, error } = await supabase.from('items').select('*').eq('category', decodedId);
    if (!error) setItems(data || []);
  };

  const getSortedItems = () => {
    if (!isSortMode) return items;
    return [...items].sort((a, b) => {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });
  };

  const updateItemDetail = async (id: string, field: string, value: string) => {
    const { error } = await supabase.from('items').update({ [field]: value }).eq('id', id);
    if (!error) { setEditingField(null); loadData(); setSelectedItem((prev: any) => ({ ...prev, [field]: value })); }
  };

  const handleSave = async () => {
    if (!newItemName) return alert("名前は必須だよ！");

    const insertData: any = {
      name: newItemName,
      category: decodedId,
    };

    if (newDeadline) insertData.deadline = newDeadline;
    if (newPurchaseDate) insertData.purchase_date = newPurchaseDate;
    if (newShop) insertData.shop = newShop;
    if (newPrice) insertData.price = newPrice;
    if (newMemo) insertData.memo = newMemo;

    const { error } = await supabase.from('items').insert([insertData]);

    if (error) {
      console.error("保存エラー:", error);
      alert(`エラー：${error.message}`);
    } else {
      setIsModalOpen(false);
      setNewItemName(""); 
      setNewDeadline(""); 
      setNewPurchaseDate(""); 
      setNewShop(""); 
      setNewPrice(""); 
      setNewMemo("");
      loadData();
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm(`削除してもいい？`)) return;
    const { error } = await supabase.from('items').delete().eq('id', id);
    if (!error) setItems(items.filter(item => item.id !== id));
  };

  const EditableRow = ({ label, field, value }: any) => (
    <div className="bg-white border-4 border-black p-4 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between gap-4">
      <div className="flex-grow overflow-hidden">
        <p className="text-[10px] font-black text-gray-400 uppercase italic leading-none mb-1">{label}</p>
        {editingField === field ? (
          <input autoFocus className="w-full text-xl font-bold outline-none bg-yellow-50 px-2" value={value || ""} onChange={(e) => setSelectedItem({...selectedItem, [field]: e.target.value})} onBlur={() => updateItemDetail(selectedItem.id, field, selectedItem[field])} onKeyDown={(e) => e.key === 'Enter' && updateItemDetail(selectedItem.id, field, selectedItem[field])} />
        ) : (
          <p className="text-xl font-black truncate">{value || "---"}</p>
        )}
      </div>
      <button onClick={() => setEditingField(field)} className="p-2 text-gray-400"><Pencil size={24} /></button>
    </div>
  );

  // 共通のinputスタイル（日付用）
  const dateInputStyle = "block w-full box-border appearance-none p-4 bg-gray-100 rounded-xl font-bold outline-none border-2 border-black focus:ring-0 min-h-[58px]";
  // 共通のinputスタイル（テキスト用）
  const textInputStyle = "block w-full box-border p-4 bg-gray-100 rounded-xl font-bold outline-none border-2 border-black focus:ring-0 min-h-[58px]";

  return (
    <div className="min-h-screen p-6 md:p-10 font-sans relative" style={{ backgroundColor: '#e6f4ea', backgroundImage: 'url("https://www.transparenttextures.com/patterns/absurdity.png")' }} onClick={() => { setIsDeleteMode(false); setSelectedItem(null); }}>
      
      <header className="mb-12 border-b-4 border-gray-300 pb-2 flex justify-between items-center relative">
        <h1 className="text-4xl md:text-6xl font-extrabold text-black uppercase tracking-tighter">
          {decodedId}
        </h1>

        <div className="flex flex-col items-end gap-1">
          <p className="text-[8px] font-black text-gray-400 italic uppercase mr-1">Display Mode</p>
          {isSortMode ? (
            <div className="bg-black text-yellow-400 px-4 py-2 rounded-xl font-black text-[10px] italic tracking-widest border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
              SORTED BY DEADLINE
            </div>
          ) : (
            <div className="bg-white text-black px-4 py-2 rounded-xl font-black text-[10px] italic tracking-widest border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
              ORDER BY ADDED
            </div>
          )}
        </div>
      </header>

      <main className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-black">
        {getSortedItems().map((item) => (
          <div key={item.id} onClick={(e) => { e.stopPropagation(); if (!isDeleteMode) setSelectedItem(item); }} className={`w-full h-52 rounded-3xl p-5 flex flex-col justify-between shadow-sm border-2 relative transition-all cursor-pointer active:scale-95 ${isDeleteMode ? 'border-red-400 bg-red-50 animate-pulse cursor-default' : 'border-black/5 bg-neutral-100 hover:bg-white'}`}>
            {isDeleteMode && (
              <button onClick={(e) => handleDelete(e, item.id)} className="absolute -top-2 -right-2 p-2 bg-red-500 text-white rounded-full shadow-lg z-10"><X size={20} /></button>
            )}
            <div className="flex-grow flex items-center justify-center text-center">
              <span className="text-xl md:text-2xl font-black italic leading-tight break-words line-clamp-3">{item.name}</span>
            </div>

            <div className="mt-2 pt-3 border-t border-black/5 flex flex-col items-center gap-1">
              {(() => {
                if (!item.deadline) return null;
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const deadlineDate = new Date(item.deadline);
                deadlineDate.setHours(0, 0, 0, 0);
                const diffTime = deadlineDate.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                let statusText = "";
                if (diffDays < 0) statusText = "期限切れ！";
                else if (diffDays === 0) statusText = "今日まで！";
                else if (diffDays <= 7) statusText = `あと${diffDays}日！`;
                else if (diffDays <= 14) statusText = "あと2週間";

                return statusText ? (
                  <span className="text-[10px] font-black text-red-500 italic animate-pulse">{statusText}</span>
                ) : <div className="h-[15px]"></div>;
              })()}
              <span className="text-[10px] font-mono font-bold bg-white px-2 py-1 rounded-full shadow-inner text-gray-400">
                {item.deadline}
              </span>
            </div>
          </div>
        ))}
      </main>

      {/* 詳細モーダル */}
      {selectedItem && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl" onClick={() => setSelectedItem(null)}>
          <div className="relative bg-[#fdf6e3] w-full max-w-lg rounded-[3.5rem] p-6 md:p-10 shadow-2xl text-black border-[10px] border-black overflow-y-auto max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedItem(null)} className="absolute top-6 right-6 text-black"><X size={40} strokeWidth={4} /></button>
            <div className="mb-8 pr-12">
              <p className="text-xs font-black text-gray-500 italic uppercase">Editing</p>
              <h2 className="text-4xl font-black italic uppercase leading-none break-words">{selectedItem.name}</h2>
            </div>
            <div className="space-y-4">
              <EditableRow label="Deadline" field="deadline" value={selectedItem.deadline} />
              <EditableRow label="Purchase Date" field="purchase_date" value={selectedItem.purchase_date} />
              <EditableRow label="Shop" field="shop" value={selectedItem.shop} />
              <EditableRow label="Price" field="price" value={selectedItem.price} />
              <div className="bg-white border-4 border-black p-4 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-2">
                <div className="flex justify-between items-center"><p className="text-[10px] font-black text-gray-400 uppercase italic">Memo</p><button onClick={() => setEditingField('memo')}><Pencil size={18} className="text-gray-400" /></button></div>
                {editingField === 'memo' ? <textarea autoFocus className="w-full text-lg font-bold outline-none bg-yellow-50 h-24" value={selectedItem.memo || ""} onChange={(e) => setSelectedItem({...selectedItem, memo: e.target.value})} onBlur={() => updateItemDetail(selectedItem.id, 'memo', selectedItem.memo)} /> : <p className="text-lg font-bold leading-tight min-h-[1.5rem]">{selectedItem.memo || "..."}</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 追加モーダル：レスポンシブ & 枠幅固定版 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)}>
          <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] p-6 md:p-8 shadow-2xl text-black border-4 border-black max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-gray-400"><X size={32} /></button>
            <h2 className="text-2xl md:text-3xl font-black mb-6 italic uppercase text-center underline decoration-yellow-400 underline-offset-8">Add New Item</h2>
            
            <div className="space-y-4">
              {/* 名前 */}
              <div className="space-y-1">
                <label className="text-xs font-black italic ml-2">NAME *</label>
                <input type="text" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} className={textInputStyle} placeholder="例: たまご" />
              </div>

              {/* 期限と購入日 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black italic ml-2">DEADLINE</label>
                  <input type="date" value={newDeadline} onChange={(e) => setNewDeadline(e.target.value)} className={dateInputStyle} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black italic ml-2">BUY DATE</label>
                  <input type="date" value={newPurchaseDate} onChange={(e) => setNewPurchaseDate(e.target.value)} className={dateInputStyle} />
                </div>
              </div>

              {/* 店と価格 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black italic ml-2">SHOP</label>
                  <input type="text" value={newShop} onChange={(e) => setNewShop(e.target.value)} className={textInputStyle} placeholder="例: ライフ" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black italic ml-2">PRICE</label>
                  <input type="text" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} className={textInputStyle} placeholder="例: 200" />
                </div>
              </div>

              {/* メモ */}
              <div className="space-y-1">
                <label className="text-xs font-black italic ml-2">MEMO</label>
                <textarea value={newMemo} onChange={(e) => setNewMemo(e.target.value)} className="block w-full box-border p-4 bg-gray-100 rounded-xl font-bold outline-none border-2 border-black focus:ring-0 h-24" placeholder="..." />
              </div>

              <button className="w-full py-5 bg-black text-white font-black rounded-2xl text-xl md:text-2xl active:scale-95 italic shadow-[0_10px_0_0_rgba(0,0,0,0.2)]" onClick={handleSave}>COMPLETE!</button>
            </div>
          </div>
        </div>
      )}

      {/* メニューバー */}
      <footer className="fixed bottom-10 right-10 z-[5000] flex flex-col items-end gap-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex gap-4 p-3 bg-white/90 backdrop-blur-md rounded-full shadow-2xl border-4 border-black">
          <Link href="/" className="p-4 text-black active:scale-75 transition-transform"><ArrowLeft size={36} strokeWidth={3} /></Link>
          <button onClick={toggleSortMode} className={`p-4 rounded-full transition-all active:scale-75 ${isSortMode ? 'bg-black text-yellow-400' : 'text-black hover:bg-gray-200'}`}><ArrowUpDown size={36} strokeWidth={3} /></button>
          <button onClick={() => setIsDeleteMode(!isDeleteMode)} className={`p-4 rounded-full transition-all active:scale-75 ${isDeleteMode ? 'bg-red-500 text-white' : 'text-black hover:bg-gray-200'}`}>{isDeleteMode ? <X size={36} strokeWidth={3} /> : <Trash2 size={36} strokeWidth={3} />}</button>
          <button onClick={() => setIsModalOpen(true)} className="p-4 bg-black text-white rounded-full shadow-lg active:scale-75 transition-transform"><Plus size={36} strokeWidth={3} /></button>
        </div>
      </footer>
    </div>
  );
}