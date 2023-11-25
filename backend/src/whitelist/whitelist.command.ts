// whitelist.command.ts
import { Command, Positional } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { WhitelistService } from './whitelist.service';

@Injectable()
export class WhitelistCommand {
  constructor(private readonly whitelistService: WhitelistService) {}

  @Command({
    command: 'populate:whitelist <contract>',
    describe: 'Populates the whitelist',
  })
  async populate(
    @Positional({
      name: 'contract',
      describe: 'The contract address to populate the whitelist for',
      type: 'string',
    })
    contract: string,
  ) {
    await this.whitelistService.populateWhitelist(contract);
  }
}
