export interface Collectible {
  collectedBy: string[];
  supply: number;
  minted: number;
  metadata: Metadata;
}

export type Metadata = {
  name: string;
  image: string;
  image_url: string;
  created_by: string;
  external_url: string;
  description: string;
  attributes: Attribute[];
};

export type Attribute = {
  trait_type: string;
  value: string;
};
