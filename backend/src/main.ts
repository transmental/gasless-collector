import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { OriginCheckGuard } from './guards/origin-check.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3000;
  app.useGlobalGuards(new OriginCheckGuard());
  app.enableCors({
    origin: ['https://collector-frontend-dev.up.railway.app'],
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type,Authorization,Access-Control-Allow-Origin',
    credentials: true,
  });
  await app.listen(port);
}
bootstrap();
