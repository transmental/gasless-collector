export interface Collectible {
    _id: string;
    collectedBy: string[];
    supply: number;
    minted: number;
    metadata: Metadata;
  }
  
  export type Metadata = {
    name: string;
    image: string;
    image_url?: string;
    created_by: string;
    external_url: string;
    description: string;
    attributes: Attribute[];
    animation_url?: string
  };

  export type Attribute = {
    trait_type: string;
    value: string;
  }