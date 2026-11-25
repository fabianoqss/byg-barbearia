package br.com.byg.barbearia.barbeiro.repositories;

import br.com.byg.barbearia.barbeiro.entities.Barbeiro;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BarbeiroRepository extends JpaRepository<Barbeiro, Long> {

}
