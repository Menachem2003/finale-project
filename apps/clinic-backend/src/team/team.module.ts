import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';
import { TeamInitService } from './team-init.service';
import { TeamMember, TeamMemberSchema } from './schemas/team.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TeamMember.name, schema: TeamMemberSchema },
    ]),
  ],
  controllers: [TeamController],
  providers: [TeamService, TeamInitService],
  exports: [TeamService],
})
export class TeamModule {}
