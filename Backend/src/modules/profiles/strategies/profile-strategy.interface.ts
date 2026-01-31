import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProfileDto } from '../../../dto/user.dto';

export interface ProfileStrategy {
  createProfile(data: any, userId: string): Promise<any>;
  getProfile(userId: string): Promise<any>;
  updateProfile(data: UpdateProfileDto, userId: string): Promise<any>;
  getAvatarId(userId: string): Promise<string | null>;
  updateAvatarId(userId: string, avatarId: string): Promise<void>;
  clearAvatarId(userId: string): Promise<void>;
}
