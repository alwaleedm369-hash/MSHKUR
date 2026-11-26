import { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from '@shared/components/Layout';
import { PhotoStudio } from '@apps/photo-studio/PhotoStudio';
import { AdStudio } from '@apps/ad-studio/AdStudio';
import { DealerPortal } from '@apps/dealer-portal/DealerPortal';
import { AIAssistant } from '@apps/ai-assistant/AIAssistant';
import { AdminBrowser } from '@apps/admin-browser/AdminBrowser';
import { NotFound } from '@shared/components/NotFound';
import { LoadingScreen } from '@shared/components/LoadingScreen';

const App = () => {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<PhotoStudio />} />
          <Route path="photo-studio" element={<PhotoStudio />} />
          <Route path="ad-studio" element={<AdStudio />} />
          <Route path="dealer-portal" element={<DealerPortal />} />
          <Route path="ai-assistant" element={<AIAssistant />} />
          <Route path="admin/*" element={<AdminBrowser />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default App;
