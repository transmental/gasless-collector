import { Controller, Get } from '@nestjs/common';
import { CollectibleService } from './collectible.service';

@Controller('/collectibles')
export class CollectibleController {
  constructor(private readonly collectibleService: CollectibleService) {}
  @Get('')
  async getCollectibles(): Promise<any> {
    const collectibles = await this.collectibleService.getCollectibles();
    return { status: true, collectibles };
  }
}
