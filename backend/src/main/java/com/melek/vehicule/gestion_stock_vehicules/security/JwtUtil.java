package com.melek.vehicule.gestion_stock_vehicules.security;

import com.melek.vehicule.gestion_stock_vehicules.model.Utilisateur;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;
@Component
public class JwtUtil {

    private SecretKey secretKey;

    @Value("${jwt.secret-key}")
    private String secretKeyString;
    @Value("${jwt.expiration}")
    private long expiration;

    @PostConstruct
    public void init() {
        if (secretKeyString == null || secretKeyString.isBlank()) {
            throw new IllegalArgumentException("La clé secrète JWT ne peut pas être vide.");
        }
        this.secretKey = Keys.hmacShaKeyFor(secretKeyString.getBytes());
    }

    public String generateToken(Authentication authentication) {
        Utilisateur utilisateur = (Utilisateur) authentication.getPrincipal();

        Claims claims = Jwts.claims().setSubject(utilisateur.getEmail());
        claims.put("prenom", utilisateur.getPrenom());
        claims.put("nom", utilisateur.getNom());
        claims.put("role", utilisateur.getRole().name());
        claims.put("authorities", authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList()));

        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);

        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(secretKey, SignatureAlgorithm.HS512)
                .compact();
    }

    public String getUsernameFromToken(String token) {
        try {
            return getClaimsFromToken(token).getSubject(); // Récupère le "sub" du JWT
        } catch (Exception e) {
            return null;
        }
    }

    public List<GrantedAuthority> getAuthorities(String token) {
        try {
            Claims claims = getClaimsFromToken(token);
            List<?> authoritiesList = claims.get("authorities", List.class);

            if (authoritiesList == null || authoritiesList.isEmpty()) {
                return List.of();
            }

            return authoritiesList.stream()
                    .filter(String.class::isInstance)
                    .map(String.class::cast)
                    .map(SimpleGrantedAuthority::new)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            return List.of();
        }
    }

    private Claims getClaimsFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public boolean isTokenValid(String token) {
        try {
            return !getClaimsFromToken(token).getExpiration().before(new Date());
        } catch (Exception e) {
            return false;
        }
    }

    public String getTokenFromRequest(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }
}
