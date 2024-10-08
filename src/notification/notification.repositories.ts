import { DataSource, EntityManager, Repository } from 'typeorm';
import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { Notification } from './entities/notification.entity';

@Injectable()
export class UsersRepository extends Repository<Notification> {
  constructor(dataSource: DataSource) {
    super(Notification, new EntityManager(dataSource));
  }

  async createUser(authCredentialsDto: AuthCredentialsDto): Promise<void> {
    const { email, password } = authCredentialsDto;

    const salt = await bcrypt.genSalt();

    const hashedPassword = await bcrypt.hash(password, salt);

    const user = this.create({
      email,
      password: hashedPassword,
    });

    try {
      await this.save(user);
    } catch (error) {
      if (error.code == 23505) {
        // duplicate username
        throw new ConflictException('Username already exists.');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }
}
