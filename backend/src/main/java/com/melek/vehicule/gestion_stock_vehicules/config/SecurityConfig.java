package com.melek.vehicule.gestion_stock_vehicules.config;

import com.melek.vehicule.gestion_stock_vehicules.security.JwtFilter;
import com.melek.vehicule.gestion_stock_vehicules.service.UtilisateurService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    private final JwtFilter jwtFilter;
    private final UtilisateurService utilisateurService;

    public SecurityConfig(JwtFilter jwtFilter, UtilisateurService utilisateurService) {
        this.jwtFilter = jwtFilter;
        this.utilisateurService = utilisateurService;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .headers(headers -> headers.contentSecurityPolicy(csp -> csp.policyDirectives(
                        "default-src 'self'; font-src 'self' https://fonts.gstatic.com; style-src 'self' https://fonts.googleapis.com 'unsafe-inline';"
                )))
                .cors(cors -> cors.configurationSource(request -> {
                    var corsConfiguration = new org.springframework.web.cors.CorsConfiguration();
                    corsConfiguration.addAllowedOrigin("http://localhost:4200");
                    corsConfiguration.addAllowedMethod("*");
                    corsConfiguration.addAllowedHeader("*");
                    corsConfiguration.setAllowCredentials(true);
                    return corsConfiguration;
                }))
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(authz -> authz
                        .requestMatchers("/auth/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/vehicules/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_GESTIONNAIRE_STOCK")
                        .requestMatchers(HttpMethod.POST, "/api/vehicules/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_GESTIONNAIRE_STOCK")
                        .requestMatchers(HttpMethod.PUT, "/api/vehicules/**").permitAll() // 🔥 TEMPORAIREMENT pour tester
                        .requestMatchers(HttpMethod.DELETE, "/api/vehicules/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_GESTIONNAIRE_STOCK")
                        .requestMatchers(HttpMethod.GET, "/api/transferts/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_GESTIONNAIRE_STOCK")
                        .requestMatchers(HttpMethod.PUT, "/api/transferts/recevoir/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_GESTIONNAIRE_STOCK")
                        .requestMatchers(HttpMethod.POST, "/api/transferts/initier").hasAnyAuthority("ROLE_ADMIN", "ROLE_GESTIONNAIRE_STOCK")// ✅ Ajout de GESTIONNAIRE_STOCK
                        .requestMatchers(HttpMethod.PUT, "/api/transferts/receptionner/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_GESTIONNAIRE_STOCK")
                        .anyRequest().authenticated()

                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }
}
