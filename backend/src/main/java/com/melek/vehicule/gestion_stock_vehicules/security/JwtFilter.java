package com.melek.vehicule.gestion_stock_vehicules.security;

import com.melek.vehicule.gestion_stock_vehicules.repository.SessionRepository;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
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
    private final SessionRepository sessionRepository;

    public JwtFilter(JwtUtil jwtUtil, SessionRepository sessionRepository) {
        this.jwtUtil = jwtUtil;
        this.sessionRepository = sessionRepository;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response,
                                    @NonNull FilterChain chain) throws ServletException, IOException {

        String path = request.getRequestURI();

        // ✅ Ne pas filtrer les routes publiques
        if (path.startsWith("/auth") || path.startsWith("/photos") || path.equals("/error")) {
            chain.doFilter(request, response);
            return;
        }

        final String token = jwtUtil.getTokenFromRequest(request);

        if (token != null && jwtUtil.isTokenValid(token)) {
            var sessionOpt = sessionRepository.findByToken(token);
            if (sessionOpt.isEmpty() || !sessionOpt.get().isActive()) {
                System.out.println("⛔ Session expirée ou invalide pour ce token");
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("Session expirée ou désactivée.");
                return;
            }

            String email = jwtUtil.getUsernameFromToken(token);
            List<GrantedAuthority> authorities = jwtUtil.getAuthorities(token);

            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    email, null, authorities);
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authentication);

            System.out.println("✅ Session valide - Authentification injectée pour : " + email);
        }

        chain.doFilter(request, response);
    }

}





