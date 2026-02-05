import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { readFileSync } from 'fs';
import { join } from 'path';
import { TeamMember, TeamMemberDocument } from './schemas/team.schema';
import Logger from '../utils/Logger';

@Injectable()
export class TeamInitService implements OnModuleInit {
  constructor(
    @InjectModel(TeamMember.name) private teamModel: Model<TeamMemberDocument>,
  ) {}

  async onModuleInit() {
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const existingCount = await this.teamModel.countDocuments();
      
      if (existingCount === 0) {
        await this.seedTeamMembers();
      }
    } catch (error) {
      Logger.error(`Error initializing team data: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async seedTeamMembers() {
    const possiblePaths = [
      join(__dirname, '../data/team.json'),
      join(process.cwd(), 'apps/clinic-backend/src/data/team.json'),
      join(__dirname, '../../data/team.json'),
    ];

    let fileContent: string | null = null;

    for (const path of possiblePaths) {
      try {
        fileContent = readFileSync(path, 'utf-8');
        break;
      } catch (err) {
        continue;
      }
    }

    if (!fileContent) {
      throw new Error(`Could not find team.json file`);
    }

    const teamData = JSON.parse(fileContent);
    await this.teamModel.insertMany(teamData);
  }
}
