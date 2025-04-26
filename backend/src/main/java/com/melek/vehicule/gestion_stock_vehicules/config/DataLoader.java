package com.melek.vehicule.gestion_stock_vehicules.config;

import com.melek.vehicule.gestion_stock_vehicules.model.TypeMouvement;
import com.melek.vehicule.gestion_stock_vehicules.repository.TypeMouvementRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataLoader implements CommandLineRunner {

    private final TypeMouvementRepository typeMouvementRepository;

    public DataLoader(TypeMouvementRepository typeMouvementRepository) {
        this.typeMouvementRepository = typeMouvementRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        List<String> mouvements = List.of("RC", "T", "BL");

        for (String libel : mouvements) {
            if (!typeMouvementRepository.findByLibelTransact(libel).isPresent()) {
                TypeMouvement mouvement = new TypeMouvement();
                mouvement.setLibelTransact(libel);
                typeMouvementRepository.save(mouvement);
            }
        }
    }
}

