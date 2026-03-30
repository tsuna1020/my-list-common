'use client'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function Home() { // 名前は Home でも Page でも大丈夫！
  const supabase = createClientComponentClient()

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // ログインが終わったあとに戻ってくる場所
        redirectTo: `${location.origin}/auth/callback`,
      },
    })
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-24 bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center gap-6">
        <h1 className="text-3xl font-bold text-gray-800">My List App</h1>
        <p className="text-gray-500 text-center">
          自分専用のリストを作るには<br />ログインしてください
        </p>
        
        {/* Googleログインボタン */}
        <button
          onClick={handleGoogleLogin}
          className="flex items-center gap-3 px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-full shadow-md hover:shadow-lg transition-all font-medium"
        >
          <img src="https://www.google.com/favicon.ico" alt="google" className="w-5 h-5" />
          Googleでログイン
        </button>
      </div>
    </main>
  )
}