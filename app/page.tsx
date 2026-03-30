// ホーム画面！！！！カテゴリーを選択して詳細ページに進むよ！

"use client";
import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

// --- Supabaseの設定（おなじみの合体！） ---
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const [categories, setCategories] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  // --- 1. カテゴリ一覧をSupabaseから取ってくる ---
  const fetchCategories = async () => {
    // itemsテーブルから、category列のデータだけを全部持ってくる
    const { data, error } = await supabase
      .from('items')
      .select('category');

    if (error) {
      console.error("エラー:", error);
    } else {
      // 重複を消して、きれいなリストにする（Setを使うよ！）
      const uniqueCats = Array.from(new Set(data.map(item => item.category).filter(Boolean)));
      setCategories(uniqueCats as string[]);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen p-8 bg-[#fdf6e3] font-sans">
      <header className="mb-12 border-b-8 border-black pb-4">
        <h1 className="text-8xl font-black text-black italic tracking-tighter">MY LIST</h1>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* --- カテゴリ一覧の表示 --- */}
        {categories.map((cat, index) => (
          <Link href={`/category/${encodeURIComponent(cat)}`} key={index}>
            <div className="bg-white border-4 border-black p-8 hover:bg-yellow-300 transition-colors cursor-pointer shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none">
              <h2 className="text-4xl font-black text-black uppercase">{cat}</h2>
            </div>
          </Link>
        ))}

        {/* --- 新規作成ボタン（タイルとして表示） --- */}
        <div 
          onClick={() => setIsModalOpen(true)}
          className="bg-black text-white p-8 flex items-center justify-center cursor-pointer hover:bg-gray-800 transition-colors shadow-[12px_12px_0px_0px_rgba(200,200,200,1)]"
        >
          <Plus size={64} />
        </div>
      </main>

      {/* --- カテゴリ追加モーダル --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white border-8 border-black p-10 w-full max-w-md relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-black"><X size={32} /></button>
            <h3 className="text-3xl font-black mb-6 text-black uppercase">NEW CATEGORY</h3>
            <input 
              type="text" 
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="w-full border-4 border-black p-4 text-2xl font-bold mb-6 outline-none text-black"
              placeholder="食材 / 調味料 / お菓子"
            />
            {/* 新しいカテゴリを作る時は、まずはそのカテゴリ名で「空のデータ」を一個入れるか、
              そのまま詳細ページに飛ばしちゃいましょう！ 
            */}
            <Link href={`/category/${encodeURIComponent(newCategory)}`}>
              <button className="w-full bg-black text-white py-4 text-2xl font-black hover:bg-yellow-400 hover:text-black transition-colors">
                GO!
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}