import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { AppLayout } from '@/components/AppLayout'
import { ChatPage } from '@/pages/chat/ChatPage'
import { ClosetPage } from '@/pages/closet/ClosetPage'
import { FeedPage } from '@/pages/feed/FeedPage'
import { ListingDetailPage } from '@/pages/marketplace/ListingDetailPage'
import { MarketplacePage } from '@/pages/marketplace/MarketplacePage'
import { OutfitsPage } from '@/pages/outfits/OutfitsPage'
import { ProfilePage } from '@/pages/profile/ProfilePage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/closet" replace />} />
          <Route path="closet" element={<ClosetPage />} />
          <Route path="outfits" element={<OutfitsPage />} />
          <Route path="feed" element={<FeedPage />} />
          <Route path="marketplace" element={<MarketplacePage />} />
          <Route path="marketplace/:id" element={<ListingDetailPage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/closet" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
