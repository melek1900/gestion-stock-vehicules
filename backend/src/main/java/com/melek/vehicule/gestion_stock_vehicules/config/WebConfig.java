package com.melek.vehicule.gestion_stock_vehicules.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("*") // ✅ important : remplace allowedOrigins
                .allowedMethods("*")
                .allowedHeaders("*")
                .allowCredentials(true);
    }

}