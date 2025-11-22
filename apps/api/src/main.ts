import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        bodyParser: false, // Disable default to configure custom limits
    });

    // Increase body size limit for image uploads (10MB)
    // Get the underlying Express instance
    const expressApp = app.getHttpAdapter().getInstance();
    
    // Use body-parser to configure increased limits
    const bodyParser = require('body-parser');
    
    // Configure body parser with increased limits
    expressApp.use(bodyParser.json({ limit: '10mb' }));
    expressApp.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

    // Global prefix
    app.setGlobalPrefix('api/v1');

    // CORS
    app.enableCors({
        origin: process.env.CORS_ORIGIN || '*',
        credentials: true,
    });

    // Global validation pipe
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: true,
        })
    );

    // Global exception filter
    app.useGlobalFilters(new HttpExceptionFilter());

    // Global response transformer
    app.useGlobalInterceptors(new TransformInterceptor());

    const port = process.env.API_PORT || 3001;
    await app.listen(port);

    console.log(`🚀 API server running on http://localhost:${port}/api/v1`);
}

bootstrap();
