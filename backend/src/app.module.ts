import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ClaimsModule } from './claims/claims.module';

@Module({
  imports: [

    //Loading environment variables globally
    ConfigModule.forRoot({
      isGlobal: true
    }),

    //Database connection with Mongoose
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'), 
      }),
      inject: [ConfigService],
    }),

    //Custom module registration
    ClaimsModule, 
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
