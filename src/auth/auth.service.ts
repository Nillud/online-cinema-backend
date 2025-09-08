import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from 'nestjs-typegoose';
import { UserModel } from 'src/user/user.model';
import { ModelType } from '@typegoose/typegoose/lib/types';
import { AuthDto } from './dto/auth.dto';
import { hash, getSalt, compare, genSalt } from 'bcryptjs'

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(UserModel) private readonly UserModel: ModelType<UserModel>
  ) { }

  async login(dto: AuthDto) {
    return this.validateUser(dto)
  }

  async register(dto: AuthDto) {
    const oldUser = await this.UserModel.findOne({ email: dto.email })
    if (oldUser) throw new BadRequestException('User is alreay in system')

    const salt = await genSalt(10)
    const newUser = new this.UserModel({
      email: dto.email,
      password: await hash(dto.password, salt)
    })
    return newUser.save()
  }

  async validateUser(dto: AuthDto): Promise<UserModel> {
    const user = await this.UserModel.findOne({ email: dto.email })
    if (!user) throw new UnauthorizedException('User not found')

    const isValidPassword = await compare(dto.password, user.password)
    if (!isValidPassword) throw new UnauthorizedException('Invalid password')

    return user
  }
}
