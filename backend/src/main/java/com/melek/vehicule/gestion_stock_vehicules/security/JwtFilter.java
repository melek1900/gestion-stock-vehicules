package com.melek.vehicule.gestion_stock_vehicules.security;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public JwtFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }



    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain chain)
            throws ServletException, IOException{


        final String token = jwtUtil.getTokenFromRequest(request); // Récupérer le token JWT
        System.out.println("🔍 Token reçu : " + token);
        if (token != null && jwtUtil.isTokenValid(token)) {
            // Extraire l'email et les rôles du token
            String email = jwtUtil.getUsernameFromToken(token);
            List<GrantedAuthority> authorities = jwtUtil.getAuthorities(token);
            System.out.println("🔍 Utilisateur extrait : " + email);
            System.out.println("🔍 Rôles attribués : " + authorities);
            // Créer un objet Authentication avec l'email et les rôles
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    email, null, authorities);  // Associer les rôles (authorities)

            // Ajouter les détails d'authentification pour Spring Security
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            System.out.println("🔍 Token reçu : " + token);
            System.out.println("🔍 Utilisateur extrait : " + email);
            System.out.println("🔍 Rôles attribués : " + authorities);
            System.out.println("🔎 Final context auth avant set : " + SecurityContextHolder.getContext().getAuthentication());

            // Placer l'authentification dans le contexte de sécurité
            SecurityContextHolder.getContext().setAuthentication(authentication);
            System.out.println("✅ Authentification injectée dans le contexte Spring Security pour : " + email);
            System.out.println("🔍 Token reçu : " + token);
            System.out.println("🔍 Rôles extraits du token : " + authorities);
        }
        System.out.println("📌 Token reçu : " + token);
        System.out.println("📌 Rôles extraits : " + jwtUtil.getAuthorities(token));
        System.out.println("🔎 Final context auth : " + SecurityContextHolder.getContext().getAuthentication());

        // Passer au filtre suivant
        chain.doFilter(request, response);

    }
    }





