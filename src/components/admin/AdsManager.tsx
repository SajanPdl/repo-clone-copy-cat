import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdCampaignManager from './AdCampaignManager';
import AdvertisementManager from './AdvertisementManager';
import AdsLayoutBuilder from './AdsLayoutBuilder';

const AdsManager: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Advertisement Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="builder">
            <TabsList>
              <TabsTrigger value="builder">Layout Builder</TabsTrigger>
              <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
              <TabsTrigger value="legacy">Legacy Ads</TabsTrigger>
            </TabsList>
            <TabsContent value="builder" className="mt-4">
              <AdsLayoutBuilder />
            </TabsContent>
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


