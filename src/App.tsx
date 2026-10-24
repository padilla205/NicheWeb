import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { AppLayout } from '@/components/AppLayout'
import { RequireAuth } from '@/components/RequireAuth'
import { ChatPage } from '@/pages/chat/ChatPage'
import { ClosetPage } from '@/pages/closet/ClosetPage'
import { ItemPage } from '@/pages/closet/ItemPage'
import { FeedPage } from '@/pages/feed/FeedPage'
import { PostPage } from '@/pages/feed/PostPage'
import { LoginPage } from '@/pages/login/LoginPage'
import { ListingDetailPage } from '@/pages/marketplace/ListingDetailPage'
import { MarketplacePage } from '@/pages/marketplace/MarketplacePage'
import { OutfitPage } from '@/pages/outfits/OutfitPage'
import { OutfitsPage } from '@/pages/outfits/OutfitsPage'
import { ProfilePage } from '@/pages/profile/ProfilePage'
import { SearchPage } from '@/pages/search/SearchPage'
import { UserProfilePage } from '@/pages/profile/UserProfilePage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="login" element={<LoginPage />} />
        {/* La pagina de una venta se puede ver sin cuenta, para que funcionen los links compartidos */}
        <Route element={<AppLayout />}>
          <Route path="marketplace/:id" element={<ListingDetailPage />} />
          <Route path="o/:id" element={<OutfitPage />} />
        </Route>
        <Route element={<RequireAuth />}>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/closet" replace />} />
            <Route path="closet" element={<ClosetPage />} />
            <Route path="outfits" element={<OutfitsPage />} />
            <Route path="feed" element={<FeedPage />} />
            <Route path="marketplace" element={<MarketplacePage />} />
            <Route path="chat/:id?" element={<ChatPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="u/:username" element={<UserProfilePage />} />
            <Route path="buscar" element={<SearchPage />} />
            <Route path="p/:id" element={<PostPage />} />
            <Route path="prenda/:id" element={<ItemPage />} />
            <Route path="*" element={<Navigate to="/closet" replace />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
