// Online Channel interface
export interface OnlineChannel {
  id: number;
  marketing_channel_id: number;
  platform: string | null;
  main_goal: string | null;
  pages: string | null;
  type_of_content: string | null;
  seo: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Offline Channel interface
export interface OfflineChannel {
  id: number;
  marketing_channel_id: number;
  type: string | null;
  location: string | null;
  agency: string | null;
  street: string | null;
  type_of_content: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Influencer interface
export interface Influencer {
  id: number;
  marketing_channel_id: number;
  name: string | null;
  platform: string | null;
  domain: string | null;
  followers: string | null;
  story_views: string | null;
  post_likes: string | null;
  content_type: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Marketing Channel interface
export interface MarketingChannel {
  id: number;
  pda_document_id: number;
  channel_type: string;
  name: string;
  details: string[];
  created_at: string;
  updated_at: string;
  pda_document?: {
    id: number;
    contract_id: number;
    customer_id: number;
    created_by: number;
    status: string;
    notes: string | null;
    created_at: string;
    updated_at: string;
  };
  online_channels?: OnlineChannel[];
  offline_channels?: OfflineChannel[];
  influencers?: Influencer[];
}

// API Response Types
export interface MarketingChannelsResponse {
  success: boolean;
  data: {
    marketing_channels: MarketingChannel[];
  };
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface MarketingChannelDetailsResponse {
  success: boolean;
  data: MarketingChannel;
  message: string;
}

// Request Types for Creating/Updating Marketing Channels
export interface CreateMarketingChannelRequest {
  pda_document_id: string | number;
  channel_type: string;
  name: string;
  details: string[];
}

export interface UpdateMarketingChannelRequest {
  pda_document_id?: string | number;
  channel_type?: string;
  name?: string;
  details?: string[];
}

// Filter Types
export interface MarketingChannelFilters {
  pda_document_id?: number;
  channel_type?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

// Channel Type Options
export const CHANNEL_TYPE_OPTIONS = [
  { value: 'online', label: 'Online' },
  { value: 'offline', label: 'Offline' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'direct_mail', label: 'Direct Mail' },
  { value: 'telemarketing', label: 'Telemarketing' },
  { value: 'other', label: 'Other' }
];

// Request Types for Online Channels
export interface CreateOnlineChannelRequest {
  platform: string;
  main_goal: string;
}

export interface UpdateOnlineChannelRequest {
  platform?: string;
  main_goal?: string;
  pages?: string;
  type_of_content?: string;
  seo?: string;
  notes?: string;
}

// Request Types for Offline Channels
export interface CreateOfflineChannelRequest {
  type: string;
  location: string;
}

export interface UpdateOfflineChannelRequest {
  type?: string;
  location?: string;
  agency?: string;
  street?: string;
  type_of_content?: string;
  notes?: string;
}

// Request Types for Influencers
export interface CreateInfluencerRequest {
  name: string;
  platform: string;
}

export interface UpdateInfluencerRequest {
  name?: string;
  platform?: string;
  domain?: string;
  followers?: string;
  story_views?: string;
  post_likes?: string;
  content_type?: string;
  notes?: string;
}

