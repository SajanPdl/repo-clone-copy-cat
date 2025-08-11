import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdCampaignManager from './AdCampaignManager';
import AdvertisementManager from './AdvertisementManager';

const AdsManager: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Advertisement Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="campaigns">
            <TabsList>
              <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
              <TabsTrigger value="legacy">Legacy Ads</TabsTrigger>
            </TabsList>
            <TabsContent value="campaigns" className="mt-4">
              <AdCampaignManager />
            </TabsContent>
            <TabsContent value="legacy" className="mt-4">
              <AdvertisementManager />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdsManager;


