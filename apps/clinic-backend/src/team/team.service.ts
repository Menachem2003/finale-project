import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { readFileSync } from 'fs';
import { join } from 'path';
import { TeamMember, TeamMemberDocument } from './schemas/team.schema';
import { CreateTeamMemberDto } from './dto/create-team-member.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';

@Injectable()
export class TeamService {
  constructor(
    @InjectModel(TeamMember.name) private teamModel: Model<TeamMemberDocument>,
  ) {}

  async findAll() {
    return this.teamModel.find().sort({ createdAt: -1 });
  }

  async findOne(id: string) {
    const member = await this.teamModel.findById(id);
    if (!member) {
      throw new NotFoundException('Team member not found');
    }
    return member;
  }

  async create(createTeamMemberDto: CreateTeamMemberDto) {
    try {
      const { name, img, description } = createTeamMemberDto;

      if (!name || !name.trim()) {
        throw new BadRequestException('Name is required');
      }

      const member = new this.teamModel({
        name: name.trim(),
        img: img?.trim(),
        description: description?.trim(),
      });

      return await member.save();
    } catch (err: any) {
      if (err instanceof BadRequestException) {
        throw err;
      }
      console.error('Create team member error:', err);
      throw new BadRequestException('Failed to create team member. Please try again.');
    }
  }

  async update(id: string, updateTeamMemberDto: UpdateTeamMemberDto) {
    try {
      const member = await this.teamModel.findById(id);
      if (!member) {
        throw new NotFoundException('Team member not found');
      }

      const { name, img, description } = updateTeamMemberDto;

      if (name !== undefined) {
        member.name = name.trim();
      }
      if (img !== undefined) {
        member.img = img?.trim();
      }
      if (description !== undefined) {
        member.description = description?.trim();
      }

      return await member.save();
    } catch (err: any) {
      if (
        err instanceof NotFoundException ||
        err instanceof BadRequestException
      ) {
        throw err;
      }
      console.error('Update team member error:', err);
      throw new BadRequestException('Failed to update team member. Please try again.');
    }
  }

  async remove(id: string) {
    const member = await this.teamModel.findByIdAndDelete(id);
    if (!member) {
      throw new NotFoundException('Team member not found');
    }
    return { message: 'Team member deleted successfully' };
  }

  async seedTeamMembers() {
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
      throw new BadRequestException('Could not find team.json file');
    }

    const teamData = JSON.parse(fileContent);
    await this.teamModel.deleteMany({});
    const members = await this.teamModel.insertMany(teamData);

    return {
      message: `Successfully seeded ${members.length} team members`,
      count: members.length,
      members,
    };
  }
}
