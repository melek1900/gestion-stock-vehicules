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
import org.springframework.security.core.userdetails.UserDetails;
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
        this.secretKey = Keys.hmacShaKeyFor(java.util.Base64.getDecoder().decode(secretKeyString));
    }

    public String generateToken(Authentication authentication, String parcNom, List<String> parcsAcces, List<String> marquesAcces) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();

        System.out.println("🛠️ Génération du token...");
        System.out.println("🔹 Utilisateur : " + userDetails.getUsername());
        System.out.println("🔹 Parc attribué : " + parcNom);
        System.out.println("🔹 Parcs accessibles : " + parcsAcces);
        System.out.println("🔹 Marques accessibles : " + marquesAcces);

        return Jwts.builder()
                .setSubject(userDetails.getUsername())
                .claim("role", userDetails.getAuthorities().iterator().next().getAuthority().startsWith("ROLE_") ?
                        userDetails.getAuthorities().iterator().next().getAuthority() :
                        "ROLE_" + userDetails.getAuthorities().iterator().next().getAuthority())
                .claim("parcNom", parcNom)
                .claim("parcsAcces", parcsAcces)
                .claim("marquesAccessibles", marquesAcces)  // ✅ Correction ici
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
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
            String role = claims.get("role", String.class);
            System.out.println("🎟️ Rôles extraits depuis le token : " + role);

            if (role == null || role.isBlank()) {
                return List.of();
            }

            if (!role.startsWith("ROLE_")) {
                role = "ROLE_" + role;
            }

            return List.of(new SimpleGrantedAuthority(role));
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
