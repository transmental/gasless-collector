import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3000;
  if (process.env.ENV === 'local') {
    app.enableCors({
      origin: ['http://localhost:3000'],
      methods: 'GET,POST,PUT,DELETE',
      allowedHeaders: 'Content-Type,Authorization,Access-Control-Allow-Origin',
      credentials: true,
    });
  } else {
    app.enableCors({
      origin: [
        'https://collector-frontend-dev.up.railway.app',
        'https://collect.foundnone.xyz',
      ],
      methods: 'GET,POST,PUT,DELETE',
      allowedHeaders: 'Content-Type,Authorization,Access-Control-Allow-Origin',
      credentials: true,
    });
  }
  await app.listen(port);
}
bootstrap();
